from datetime import date
from typing import List
from pydantic import BaseModel
from decimal import Decimal


class InvoiceItemBase(BaseModel):
    description: str
    quantity: Decimal = Decimal("1.00")
    unit_price: Decimal = Decimal("0.00")
    amount: Decimal | None = None


class InvoiceItemCreate(InvoiceItemBase):
    pass


class InvoiceItemOut(InvoiceItemBase):
    id: int

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    client_id: int
    number: str | None = None
    status: str | None = None
    issued_date: date | None = None
    due_date: date | None = None

    subtotal: Decimal | None = None
    tax: Decimal | None = None
    total: Decimal | None = None


class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] | None = None


class InvoiceUpdate(BaseModel):
    number: str | None = None
    status: str | None = None
    issued_date: date | None = None
    due_date: date | None = None
    subtotal: Decimal | None = None
    tax: Decimal | None = None
    total: Decimal | None = None
    items: List[InvoiceItemCreate] | None = None  # replace items if provided


class InvoiceOut(InvoiceBase):
    id: int
    items: List[InvoiceItemOut] = []

    class Config:
        from_attributes = True
