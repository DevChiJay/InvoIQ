from datetime import date
from decimal import Decimal
from typing import List, Literal, Optional
from pydantic import BaseModel

from app.schemas.invoice import InvoiceItemCreate


class GenerateInvoiceRequest(BaseModel):
    # Source
    extraction_id: Optional[int] = None

    # Required selection by user
    client_id: int

    # Optional overrides
    number: Optional[str] = None
    issued_date: Optional[date] = None
    due_date: Optional[date] = None
    items: Optional[List[InvoiceItemCreate]] = None
    subtotal: Optional[Decimal] = None
    tax: Optional[Decimal] = None
    total: Optional[Decimal] = None
    currency: Optional[str] = None

    # Payments
    create_payment_link: Optional[bool] = False
    payment_provider: Optional[Literal["paystack", "stripe"]] = None
