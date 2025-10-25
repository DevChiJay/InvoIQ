from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Pro-tier subscription fields
    is_pro = Column(Boolean, default=False)
    subscription_status = Column(String, nullable=True)  # active, cancelled, expired, pending
    subscription_provider = Column(String, nullable=True)  # paystack, stripe
    subscription_provider_id = Column(String, nullable=True)  # external subscription ID
    subscription_start_date = Column(DateTime, nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)
    subscription_updated_at = Column(DateTime, nullable=True, default=datetime.utcnow)
