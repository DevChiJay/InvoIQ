from decimal import Decimal
from typing import Optional
import httpx
import hmac
import hashlib

from app.core.config import settings


def create_subscription_payment_link(
    amount: Decimal,
    email: str,
    reference: str,
    currency: str = "NGN",
    callback_url: Optional[str] = None,
    plan_code: Optional[str] = None,
) -> str:
    """Create a Paystack payment link for pro-tier subscription. If keys are missing, return a stub link for dev/tests."""
    if not settings.PAYSTACK_SECRET_KEY:
        return f"https://paystack.test/initialize/{reference}"

    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "amount": int(Decimal(amount) * 100),  # kobo
        "email": email,
        "reference": reference,
        "currency": currency or "NGN",
        "metadata": {
            "type": "pro_subscription",
            "user_email": email
        }
    }
    if callback_url:
        payload["callback_url"] = callback_url
    if plan_code:
        payload["plan"] = plan_code

    url = f"{settings.PAYSTACK_BASE_URL}/transaction/initialize"
    with httpx.Client(timeout=30) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", {}).get("authorization_url") or f"https://paystack.com/pay/{reference}"


def verify_payment(reference: str) -> dict:
    """Verify a Paystack payment using the reference."""
    if not settings.PAYSTACK_SECRET_KEY:
        return {"status": "success", "data": {"status": "success"}}
    
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
    }
    
    url = f"{settings.PAYSTACK_BASE_URL}/transaction/verify/{reference}"
    with httpx.Client(timeout=30) as client:
        resp = client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json()


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    """Verify Paystack webhook signature using HMAC-SHA512."""
    if not settings.PAYSTACK_SECRET_KEY:
        return True  # Allow for development/testing
    
    try:
        # Compute expected signature
        computed_signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
            body,
            hashlib.sha512
        ).hexdigest()
        
        # Compare signatures (time-safe comparison)
        return hmac.compare_digest(signature, computed_signature)
    except Exception:
        return False
