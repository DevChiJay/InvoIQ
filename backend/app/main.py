from fastapi import FastAPI
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.clients import router as clients_router
from app.api.v1.invoices import router as invoices_router
from app.db.session import Base, engine

# Ensure models are imported so SQLAlchemy registers them with Base.metadata
# Routers import models already, but this import path makes the intent explicit.
from app.models import user as user_model  # noqa: F401
from app.models import client as client_model  # noqa: F401
from app.models import invoice as invoice_model  # noqa: F401
from app.models import payment as payment_model  # noqa: F401
from app.models import extraction as extraction_model  # noqa: F401

app = FastAPI(title="InvoIQ API", version="0.1.0")

app.include_router(auth_router, prefix="/v1/auth", tags=["auth"]) 
app.include_router(users_router, prefix="/v1", tags=["users"]) 
app.include_router(clients_router, prefix="/v1", tags=["clients"]) 
app.include_router(invoices_router, prefix="/v1", tags=["invoices"]) 


@app.on_event("startup")
def on_startup_create_tables() -> None:
	"""Create database tables if they do not exist."""
	Base.metadata.create_all(bind=engine)
