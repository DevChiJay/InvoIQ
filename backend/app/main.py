from fastapi import FastAPI
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.db.session import Base, engine

# Ensure models are imported so SQLAlchemy registers them with Base.metadata
# Routers import models already, but this import path makes the intent explicit.
from app.models import user as user_model  # noqa: F401

app = FastAPI(title="InvoIQ API", version="0.1.0")

app.include_router(auth_router, prefix="/v1/auth", tags=["auth"]) 
app.include_router(users_router, prefix="/v1", tags=["users"]) 


@app.on_event("startup")
def on_startup_create_tables() -> None:
	"""Create database tables if they do not exist."""
	Base.metadata.create_all(bind=engine)
