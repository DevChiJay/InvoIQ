from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.client import Client
from app.models.extraction import Extraction
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.generate import GenerateInvoiceRequest
from app.schemas.invoice import InvoiceOut, InvoiceItemCreate

router = APIRouter()


def _quant(value: Optional[Decimal]) -> Decimal:
    return Decimal(value or 0).quantize(Decimal("0.01"))


def _parse_due_date(maybe_dates: Optional[List[str]]) -> Optional[date]:
    if not maybe_dates:
        return None
    import datetime as dt
    for raw in maybe_dates:
        try:
            return dt.date.fromisoformat(raw[:10])
        except Exception:
            continue
    return None


def _build_items_from_extraction(parsed: dict) -> List[InvoiceItemCreate]:
    jobs = parsed.get("jobs") or []
    amount = parsed.get("amount")
    items: List[InvoiceItemCreate] = []
    if jobs:
        # Distribute amount across jobs if amount provided, else 0 unit price
        unit = Decimal(0)
        if amount:
            unit = _quant(Decimal(amount) / max(len(jobs), 1))
        for j in jobs:
            items.append(InvoiceItemCreate(description=str(j)[:200], quantity=1, unit_price=unit, amount=None))
    elif amount:
        items.append(InvoiceItemCreate(description="Services", quantity=1, unit_price=_quant(Decimal(amount)), amount=None))
    return items


@router.post("/generate-invoice", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def generate_invoice(
    payload: GenerateInvoiceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate client ownership
    client = db.get(Client, payload.client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")

    # Build base invoice data
    items: List[InvoiceItemCreate] = list(payload.items or [])
    issued_date = payload.issued_date
    due_date = payload.due_date
    currency = (payload.currency or "").upper() or ("NGN" if payload.payment_provider == "paystack" else "USD")

    if payload.extraction_id is not None:
        ext = db.get(Extraction, payload.extraction_id)
        if not ext or ext.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Extraction not found")
        parsed = ext.parsed or {}
        if not items:
            items = _build_items_from_extraction(parsed)
        if issued_date is None:
            issued_date = date.today()
        if due_date is None:
            due_date = _parse_due_date(parsed.get("deadlines"))

    # Compute totals if needed
    subtotal = payload.subtotal
    tax = payload.tax or Decimal(0)
    total = payload.total

    if items and (subtotal is None or total is None):
        # Sum amounts (prefer explicit amount else qty*unit)
        s = Decimal(0)
        for it in items:
            amt = it.amount
            if amt is None:
                amt = _quant(Decimal(it.quantity) * Decimal(it.unit_price))
            s += _quant(amt)
        subtotal = _quant(s)
        total = _quant(subtotal + _quant(tax))

    # Validation: if all provided, ensure subtotal + tax == total (with 2dp quantization)
    if subtotal is not None and tax is not None and total is not None:
        if _quant(subtotal) + _quant(tax) != _quant(total):
            raise HTTPException(status_code=400, detail="subtotal + tax must equal total")

    # Create invoice
    # Generate invoice number if not provided
    number = payload.number
    if not number:
        import datetime as dt
        today = dt.date.today()
        # Count existing invoices issued today for sequence
        count_today = (
            db.query(Invoice)
            .filter(Invoice.user_id == current_user.id, Invoice.issued_date == today)
            .count()
        )
        number = f"INV-{today:%Y%m%d}-{count_today + 1:03d}"

    # Check for existing invoice with same number
    existing_invoice = (
        db.query(Invoice)
        .filter(Invoice.user_id == current_user.id, Invoice.number == number)
        .first()
    )
    if existing_invoice:
        raise HTTPException(
            status_code=400, 
            detail=f"Invoice number '{number}' already exists. Please use a different number."
        )

    invoice = Invoice(
        user_id=current_user.id,
        client_id=client.id,
        number=number,
        status="draft",
        issued_date=issued_date,
        due_date=due_date,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )
    
    try:
        db.add(invoice)
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Invoice number '{number}' already exists. Please use a different number."
        )

    # Add items
    for it in items:
        db.add(
            InvoiceItem(
                invoice_id=invoice.id,
                description=it.description,
                quantity=_quant(Decimal(it.quantity)),
                unit_price=_quant(Decimal(it.unit_price)),
                amount=_quant(Decimal(it.amount)) if it.amount is not None else None,
            )
        )

    # Set payment_link if provided by user
    if payload.payment_link:
        invoice.payment_link = payload.payment_link

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return invoice
