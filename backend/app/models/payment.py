from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    provider = Column(String, nullable=False, default="paystack")
    provider_ref = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending")  # pending, paid, failed
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payments")
