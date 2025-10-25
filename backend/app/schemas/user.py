from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

class UserCreate(UserBase):
    password: str

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

    class Config:
        from_attributes = True
