from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal


class UserBusinessInfo(BaseModel):
    """Subset of user business details for invoice display"""
    full_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_address: Optional[str] = None
    tax_id: Optional[str] = None
    website: Optional[str] = None
    
    class Config:
        from_attributes = True


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

    currency: str = "NGN"  # ISO 4217 currency code (default: Nigerian Naira)
    subtotal: Decimal | None = None
    tax: Decimal | None = None
    total: Decimal | None = None
    notes: str | None = None


class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] | None = None


class InvoiceUpdate(BaseModel):
    number: str | None = None
    status: str | None = None
    issued_date: date | None = None
    due_date: date | None = None
    currency: str | None = None  # Allow currency updates
    subtotal: Decimal | None = None
    tax: Decimal | None = None
    total: Decimal | None = None
    notes: str | None = None
    items: List[InvoiceItemCreate] | None = None  # replace items if provided


class InvoiceOut(InvoiceBase):
    id: int
    items: List[InvoiceItemOut] = []
    pdf_url: str | None = None
    payment_link: str | None = None  # Optional user-provided payment link
    user_business_info: Optional[UserBusinessInfo] = None  # Business details for invoice display
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
