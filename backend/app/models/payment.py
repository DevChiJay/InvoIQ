from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    payment_type = Column(String, nullable=False, default="subscription")  # subscription, one-time
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String, nullable=False, default="USD")
    provider = Column(String, nullable=False, default="paystack")  # paystack, stripe
    provider_ref = Column(String, nullable=True)
    provider_subscription_id = Column(String, nullable=True)  # for recurring payments
    status = Column(String, nullable=False, default="pending")  # pending, paid, failed, cancelled
    description = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True, default=datetime.utcnow)

    # Relationship to user instead of invoice
    user = relationship("User", foreign_keys=[user_id])
