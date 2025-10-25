from decimal import Decimal
from typing import Optional

from app.core.config import settings


def create_subscription_payment_link(amount: Decimal, currency: str = "usd", reference: Optional[str] = None) -> str:
    """Create a Stripe payment link for pro-tier subscription. If keys are missing, return a stub link.

    For simplicity we avoid creating Products/Prices and instead use the Payment Link API when available,
    otherwise we return a predictable dev URL. This is a placeholder and should be replaced with
    official stripe calls when STRIPE_SECRET_KEY is provided.
    """
    if not settings.STRIPE_SECRET_KEY:
        return f"https://stripe.test/pay/{reference or 'ref'}"

    try:
        import stripe  # type: ignore
    except Exception:
        # If stripe lib isn't installed, still return a stub
        return f"https://stripe.test/pay/{reference or 'ref'}"

    stripe.api_key = settings.STRIPE_SECRET_KEY
    # Create a Payment Link for pro subscription
    cents = int(Decimal(amount) * 100)
    pl = stripe.PaymentLink.create(
        line_items=[
            {
                "price_data": {
                    "currency": (currency or "usd").lower(),
                    "product_data": {"name": "Pro Subscription"},
                    "unit_amount": cents,
                    "recurring": {"interval": "month"}  # Monthly subscription
                },
                "quantity": 1,
            }
        ],
        metadata={
            "type": "pro_subscription",
            "reference": reference or "ref"
        }
    )
    return pl.get("url") or ""


def verify_payment(session_id: str) -> dict:
    """Verify a Stripe payment session."""
    if not settings.STRIPE_SECRET_KEY:
        return {"status": "complete", "payment_status": "paid"}
    
    try:
        import stripe  # type: ignore
        stripe.api_key = settings.STRIPE_SECRET_KEY
        session = stripe.checkout.Session.retrieve(session_id)
        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "subscription_id": session.subscription
        }
    except Exception:
        return {"status": "error", "payment_status": "failed"}
