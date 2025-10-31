from pydantic import BaseModel
import os

class Settings(BaseModel):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    # Extraction settings
    EXTRACTOR_PROVIDER: str = os.getenv("EXTRACTOR_PROVIDER", "openai")  # openai only
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")

    # Storage settings
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")  # local | supabase (future)
    STORAGE_LOCAL_DIR: str = os.getenv("STORAGE_LOCAL_DIR", os.path.abspath(os.path.join(os.getcwd(), "generated")))

    # App base URL (used to build public-ish URLs in dev)
    APP_BASE_URL: str = os.getenv("APP_BASE_URL", "http://localhost:8000")

    # Payments
    PAYSTACK_SECRET_KEY: str | None = os.getenv("PAYSTACK_SECRET_KEY")
    PAYSTACK_BASE_URL: str = os.getenv("PAYSTACK_BASE_URL", "https://api.paystack.co")
    STRIPE_SECRET_KEY: str | None = os.getenv("STRIPE_SECRET_KEY")
    
    # Email/SMTP settings for email verification
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str | None = os.getenv("SMTP_USER")
    SMTP_PASSWORD: str | None = os.getenv("SMTP_PASSWORD")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USER", "noreply@invoiq.com"))
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "InvoIQ")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    
    # Frontend URL for email verification links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    class Config:
        arbitrary_types_allowed = True

settings = Settings()
