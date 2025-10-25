from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Numeric, JSON, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        # Enforce per-user unique invoice number when provided
        UniqueConstraint("user_id", "number", name="uq_user_invoice_number"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    number = Column(String, nullable=True, index=True)
    status = Column(String, nullable=False, default="draft")  # draft, sent, paid, overdue, cancelled
    issued_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)

    subtotal = Column(Numeric(12, 2), nullable=True)
    tax = Column(Numeric(12, 2), nullable=True)
    total = Column(Numeric(12, 2), nullable=True)

    pdf_url = Column(String, nullable=True)
    payment_link = Column(String, nullable=True)
    notes = Column(JSON, nullable=True)  # renamed from metadata to avoid SQLAlchemy conflict

    # Relationships
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False, default=1.0)
    unit_price = Column(Numeric(12, 2), nullable=False, default=0.0)
    amount = Column(Numeric(12, 2), nullable=True)  # optional cached amount (qty * unit_price)

    invoice = relationship("Invoice", back_populates="items")
