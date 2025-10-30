from typing import List
from decimal import Decimal, ROUND_HALF_UP
from datetime import date
import datetime as dt
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.client import Client
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.invoice import InvoiceCreate, InvoiceOut, InvoiceUpdate, InvoiceItemCreate


router = APIRouter()

TWO_PLACES = Decimal("0.01")


def _get_owned_invoice(db: Session, current_user: User, invoice_id: int) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if not invoice or invoice.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/invoices", response_model=List[InvoiceOut])
def list_invoices(
    limit: int = 50,
    offset: int = 0,
    status: str | None = None,
    client_id: int | None = None,
    due_from: date | None = None,
    due_to: date | None = None,
    cursor: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    response: Response = None,
):
    # Sanitize pagination
    if limit <= 0:
        limit = 50
    limit = min(limit, 100)
    if offset < 0:
        offset = 0
    q = db.query(Invoice).filter(Invoice.user_id == current_user.id)
    if status:
        q = q.filter(Invoice.status == status)
    if client_id:
        q = q.filter(Invoice.client_id == client_id)
    if due_from:
        q = q.filter(Invoice.due_date >= due_from)
    if due_to:
        q = q.filter(Invoice.due_date <= due_to)
    if cursor:
        q = q.filter(Invoice.id > cursor)

    q = q.order_by(Invoice.id.asc()).limit(limit).offset(offset)
    rows = q.all()

    # Expose a simple cursor in header if more results likely exist
    if rows:
        response.headers["X-Next-Cursor"] = str(rows[-1].id)
    return rows


@router.post("/invoices", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ensure client belongs to current user
    client = db.get(Client, payload.client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")

    # Generate invoice number if not provided
    number = payload.number
    if not number:
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
        client_id=payload.client_id,
        number=number,
        status=payload.status or "draft",
        issued_date=payload.issued_date,
        due_date=payload.due_date,
        subtotal=payload.subtotal,
        tax=payload.tax,
        total=payload.total,
    )
    
    try:
        db.add(invoice)
        db.flush()  # get invoice.id before adding items
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Invoice number '{number}' already exists. Please use a different number."
        )

    if payload.items:
        for item in payload.items:
            _add_item(db, invoice, item)

    db.commit()
    db.refresh(invoice)
    return invoice


def _quantize(value: Decimal | None) -> Decimal:
    if value is None:
        return Decimal("0.00")
    if not isinstance(value, Decimal):
        value = Decimal(value)
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def _add_item(db: Session, invoice: Invoice, item: InvoiceItemCreate) -> InvoiceItem:
    amount = item.amount
    if amount is None:
        amount = _quantize(item.quantity) * _quantize(item.unit_price)
        amount = _quantize(amount)
    inv_item = InvoiceItem(
        invoice_id=invoice.id,
        description=item.description,
        quantity=_quantize(item.quantity),
        unit_price=_quantize(item.unit_price),
        amount=_quantize(amount),
    )
    db.add(inv_item)
    return inv_item


@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_owned_invoice(db, current_user, invoice_id)


@router.put("/invoices/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = _get_owned_invoice(db, current_user, invoice_id)

    # Update scalar fields
    for field, value in payload.dict(exclude_unset=True, exclude={"items"}).items():
        setattr(invoice, field, value)

    # Replace items if provided
    if payload.items is not None:
        # Delete existing items
        for item in list(invoice.items):
            db.delete(item)
        db.flush()
        # Add new items
        for item in payload.items:
            _add_item(db, invoice, item)

    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/invoices/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = _get_owned_invoice(db, current_user, invoice_id)
    db.delete(invoice)
    db.commit()
    return None
