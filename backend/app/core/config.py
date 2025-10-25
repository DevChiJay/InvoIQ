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

    class Config:
        arbitrary_types_allowed = True

settings = Settings()
