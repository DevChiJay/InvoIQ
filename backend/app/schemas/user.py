from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    """Schema for updating user profile and business details"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_address: Optional[str] = None
    tax_id: Optional[str] = None
    website: Optional[str] = None

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserRead(UserBase):
    id: int
    is_active: bool
    is_pro: bool
    subscription_status: str | None = None
    subscription_provider: str | None = None
    subscription_start_date: datetime | None = None
    subscription_end_date: datetime | None = None
    
    # Business/Profile details
    avatar_url: str | None = None
    phone: str | None = None
    company_name: str | None = None
    company_logo_url: str | None = None
    company_address: str | None = None
    tax_id: str | None = None
    website: str | None = None

    class Config:
        from_attributes = True
