from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.invoice import Invoice

router = APIRouter()


@router.post("/send-reminder")
def send_reminder(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inv = db.get(Invoice, invoice_id)
    if not inv or inv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # For now, just set status to 'sent' if draft, and return a stub result.
    if inv.status == "draft":
        inv.status = "sent"
        db.add(inv)
        db.commit()
        db.refresh(inv)

    return {"status": "queued", "invoice_id": inv.id}
