from typing import List
from decimal import Decimal, ROUND_HALF_UP
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Sanitize pagination
    if limit <= 0:
        limit = 50
    limit = min(limit, 100)
    if offset < 0:
        offset = 0
    return (
        db.query(Invoice)
        .filter(Invoice.user_id == current_user.id)
        .limit(limit)
        .offset(offset)
        .all()
    )


@router.post("/invoices", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ensure client belongs to current user
    client = db.get(Client, payload.client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")

    invoice = Invoice(
        user_id=current_user.id,
        client_id=payload.client_id,
        number=payload.number,
        status=payload.status or "draft",
        issued_date=payload.issued_date,
        due_date=payload.due_date,
        subtotal=payload.subtotal,
        tax=payload.tax,
        total=payload.total,
    )
    db.add(invoice)
    db.flush()  # get invoice.id before adding items

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
