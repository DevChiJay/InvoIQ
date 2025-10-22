import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db


@pytest.fixture()
def client_app():
    # Use a separate SQLite DB for tests with transaction rollback
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test_ci.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)

    connection = engine.connect()
    transaction = connection.begin()
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=connection)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
            db.flush()
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    try:
        yield client
    finally:
        transaction.rollback()
        connection.close()


def auth_headers(client: TestClient):
    # Register and login
    r = client.post("/v1/auth/register", json={
        "email": "ciuser@example.com",
        "full_name": "CI User",
        "password": "secret123",
    })
    assert r.status_code in (201, 400)  # allow already exists if reused within same test process
    r = client.post(
        "/v1/auth/login",
        data={"username": "ciuser@example.com", "password": "secret123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_clients_and_invoices_crud_flow(client_app: TestClient):
    headers = auth_headers(client_app)

    # Create client
    r = client_app.post(
        "/v1/clients",
        json={"name": "Acme Corp", "email": "billing@acme.test", "phone": "123", "address": "Road 1"},
        headers=headers,
    )
    assert r.status_code == 201, r.text
    client = r.json()
    assert client["name"] == "Acme Corp"
    client_id = client["id"]

    # List clients
    r = client_app.get("/v1/clients", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1

    # Create invoice
    inv_payload = {
        "client_id": client_id,
        "number": "INV-001",
        "status": "draft",
        "items": [
            {"description": "Design work", "quantity": 10, "unit_price": 50},
            {"description": "Hosting", "quantity": 12, "unit_price": 10},
        ],
        "subtotal": 0,
        "tax": 0,
        "total": 0,
    }
    r = client_app.post("/v1/invoices", json=inv_payload, headers=headers)
    assert r.status_code == 201, r.text
    invoice = r.json()
    assert invoice["number"] == "INV-001"
    assert len(invoice["items"]) == 2

    # Get invoice
    invoice_id = invoice["id"]
    r = client_app.get(f"/v1/invoices/{invoice_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["id"] == invoice_id

    # List invoices
    r = client_app.get("/v1/invoices", headers=headers)
    assert r.status_code == 200
    assert any(inv["id"] == invoice_id for inv in r.json())


def test_requires_auth(client_app: TestClient):
    # No auth should be 401
    r = client_app.get("/v1/clients")
    assert r.status_code == 401
    r = client_app.get("/v1/invoices")
    assert r.status_code == 401
