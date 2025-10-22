from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientOut, ClientUpdate


router = APIRouter()


@router.get("/clients", response_model=List[ClientOut])
def list_clients(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if limit <= 0:
        limit = 50
    limit = min(limit, 100)
    if offset < 0:
        offset = 0
    return (
        db.query(Client)
        .filter(Client.user_id == current_user.id)
        .limit(limit)
        .offset(offset)
        .all()
    )


@router.post("/clients", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = Client(user_id=current_user.id, **payload.dict())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/clients/{client_id}", response_model=ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.get(Client, client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/clients/{client_id}", response_model=ClientOut)
def update_client(client_id: int, payload: ClientUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.get(Client, client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(client, field, value)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.get(Client, client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return None
