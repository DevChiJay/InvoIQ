from decimal import Decimal
from typing import Optional
import httpx

from app.core.config import settings


def create_payment_link(
    amount: Decimal,
    email: str,
    reference: str,
    currency: str = "NGN",
    callback_url: Optional[str] = None,
) -> str:
    """Create a Paystack payment link. If keys are missing, return a stub link for dev/tests."""
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
    }
    if callback_url:
        payload["callback_url"] = callback_url

    url = f"{settings.PAYSTACK_BASE_URL}/transaction/initialize"
    with httpx.Client(timeout=30) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", {}).get("authorization_url") or f"https://paystack.com/pay/{reference}"
