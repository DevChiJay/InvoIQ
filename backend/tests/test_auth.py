import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

# Use a separate SQLite DB for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_register_and_login_flow():
    # Register a new user
    r = client.post("/v1/auth/register", json={
        "email": "user@example.com",
        "full_name": "Test User",
        "password": "secret123"
    })
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["email"] == "user@example.com"
    assert "id" in data

    # Login with the same user
    r = client.post("/v1/auth/login", data={
        "username": "user@example.com",
        "password": "secret123"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    assert token

    # Access protected route
    r = client.get("/v1/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    me = r.json()
    assert me["email"] == "user@example.com"


def test_protected_requires_auth():
    r = client.get("/v1/me")
    assert r.status_code == 401
