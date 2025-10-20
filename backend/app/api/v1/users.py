from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.schemas.user import UserOut
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
