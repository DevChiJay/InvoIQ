from decimal import Decimal
from typing import Optional

from app.core.config import settings


def create_payment_link(amount: Decimal, currency: str = "usd", reference: Optional[str] = None) -> str:
    """Create a Stripe payment link. If keys are missing, return a stub link.

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
    # Create a Payment Link with a single line item using "price_data"
    cents = int(Decimal(amount) * 100)
    pl = stripe.PaymentLink.create(
        line_items=[
            {
                "price_data": {
                    "currency": (currency or "usd").lower(),
                    "product_data": {"name": "Invoice Payment"},
                    "unit_amount": cents,
                },
                "quantity": 1,
            }
        ]
    )
    return pl.get("url") or ""
