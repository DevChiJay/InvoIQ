from pydantic import BaseModel
import os

class Settings(BaseModel):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    # Extraction settings
    EXTRACTOR_PROVIDER: str = os.getenv("EXTRACTOR_PROVIDER", "openai")  # openai only
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")

    class Config:
        arbitrary_types_allowed = True

settings = Settings()
