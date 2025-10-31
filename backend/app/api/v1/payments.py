from datetime import datetime, timedelta
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.services.paystack import create_subscription_payment_link as paystack_link, verify_payment as paystack_verify
from app.services.stripe import create_subscription_payment_link as stripe_link, verify_payment as stripe_verify
from app.schemas.user import UserRead
from pydantic import BaseModel

router = APIRouter()


class CreateSubscriptionRequest(BaseModel):
    provider: Literal["paystack", "stripe"] = "paystack"
    currency: str = "USD"
    callback_url: str | None = None


class SubscriptionResponse(BaseModel):
    payment_url: str
    reference: str


class VerifyPaymentRequest(BaseModel):
    reference: str
    provider: Literal["paystack", "stripe"] = "paystack"


@router.post("/subscription/create", response_model=SubscriptionResponse)
def create_pro_subscription(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a payment link for pro-tier subscription."""
    if current_user.is_pro and current_user.subscription_status == "active":
        raise HTTPException(status_code=400, detail="User already has an active pro subscription")
    
    # Define subscription pricing (you can make this configurable)
    amount = Decimal("29.99") if request.currency.upper() == "USD" else Decimal("12000")  # $29.99 or ₦12,000
    
    # Generate reference
    reference = f"pro_sub_{current_user.id}_{int(datetime.utcnow().timestamp())}"
    
    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        payment_type="subscription",
        amount=amount,
        currency=request.currency.upper(),
        provider=request.provider,
        provider_ref=reference,
        status="pending",
        description="Pro Subscription Payment"
    )
    db.add(payment)
    db.commit()
    
    # Create payment link
    if request.provider == "paystack":
        payment_url = paystack_link(
            amount=amount,
            email=current_user.email,
            reference=reference,
            currency="NGN" if request.currency.upper() == "NGN" else "USD",
            callback_url=request.callback_url
        )
    else:
        payment_url = stripe_link(
            amount=amount,
            currency=request.currency.lower(),
            reference=reference
        )
    
    return SubscriptionResponse(payment_url=payment_url, reference=reference)


@router.post("/subscription/verify")
def verify_subscription_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify subscription payment and activate pro tier."""
    # Find payment record
    payment = db.query(Payment).filter(
        Payment.provider_ref == request.reference,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verify with provider
    if request.provider == "paystack":
        result = paystack_verify(request.reference)
        success = result.get("data", {}).get("status") == "success"
    else:
        result = stripe_verify(request.reference)
        success = result.get("payment_status") == "paid"
    
    if success:
        # Update payment status
        payment.status = "paid"
        payment.updated_at = datetime.utcnow()
        
        # Update user subscription
        current_user.is_pro = True
        current_user.subscription_status = "active"
        current_user.subscription_provider = request.provider
        current_user.subscription_provider_id = result.get("subscription_id") or request.reference
        current_user.subscription_start_date = datetime.utcnow()
        current_user.subscription_end_date = datetime.utcnow() + timedelta(days=30)  # Monthly
        current_user.subscription_updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "Subscription activated successfully", "is_pro": True}
    else:
        payment.status = "failed"
        payment.updated_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed")


@router.get("/subscription/status")
def get_subscription_status(
    current_user: User = Depends(get_current_user)
):
    """Get current user's subscription status."""
    return {
        "is_pro": current_user.is_pro,
        "subscription_status": current_user.subscription_status,
        "subscription_provider": current_user.subscription_provider,
        "subscription_start_date": current_user.subscription_start_date,
        "subscription_end_date": current_user.subscription_end_date,
        "days_remaining": (current_user.subscription_end_date - datetime.utcnow()).days if current_user.subscription_end_date else None
    }


@router.get("/history")
def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get user's payment history."""
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).limit(limit).offset(offset).all()
    
    return [
        {
            "id": p.id,
            "payment_type": p.payment_type,
            "amount": float(p.amount),
            "currency": p.currency,
            "provider": p.provider,
            "provider_ref": p.provider_ref,
            "status": p.status,
            "description": p.description,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        }
        for p in payments
    ]


@router.post("/webhook/paystack")
def paystack_webhook(payload: dict):
    """Handle Paystack webhook notifications."""
    # Verify webhook signature (implement according to Paystack docs)
    # For now, this is a placeholder
    event = payload.get("event")
    data = payload.get("data", {})
    
    if event == "charge.success":
        reference = data.get("reference")
        # Handle successful payment
        # You would update the payment and subscription status here
        pass
    
    return {"status": "received"}


@router.post("/webhook/stripe")
def stripe_webhook(payload: dict):
    """Handle Stripe webhook notifications."""
    # Verify webhook signature (implement according to Stripe docs)
    # For now, this is a placeholder
    event_type = payload.get("type")
    data = payload.get("data", {})
    
    if event_type == "checkout.session.completed":
        # Handle successful subscription
        pass
    
    return {"status": "received"}