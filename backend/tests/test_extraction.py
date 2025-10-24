import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db


@pytest.fixture()
def client_app():
    # Use a separate SQLite DB for tests with transaction rollback
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test_extract.db"
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
        "email": "ext@example.com",
        "full_name": "Extractor User",
        "password": "secret123",
    })
    assert r.status_code in (201, 400)
    r = client.post(
        "/v1/auth/login",
        data={"username": "ext@example.com", "password": "secret123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_extract_text_minimal_flow(client_app: TestClient, monkeypatch):
    # Monkeypatch the extractor factory to return a stub
    from app.api.v1 import extraction as extraction_module

    class StubExtractor:
        def extract_from_text(self, text: str):
            return {
                "jobs": ["Logo design"],
                "deadlines": ["2025-10-30"],
                "payment_terms": "50% upfront",
                "amount": 500,
                "currency": "USD",
                "confidence": 88,
            }

    monkeypatch.setattr(extraction_module, "get_extractor", lambda provider=None: StubExtractor())

    headers = auth_headers(client_app)
    r = client_app.post(
        "/v1/extract-job-details",
        data={"text": "Please do a logo design for $500 by Oct 30, 50% upfront."},
        headers=headers,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "extraction_id" in body
    assert body["parsed"]["amount"] == 500
    assert body["parsed"]["currency"] == "USD"
