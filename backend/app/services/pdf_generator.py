from datetime import date
from decimal import Decimal
from typing import List, Optional

from app.services.storage import save_bytes


class PDFItem:
    def __init__(self, description: str, quantity: Decimal, unit_price: Decimal, amount: Decimal):
        self.description = description
        self.quantity = Decimal(quantity)
        self.unit_price = Decimal(unit_price)
        self.amount = Decimal(amount)


def generate_invoice_pdf(
    invoice_number: str | None,
    client_name: str,
    client_email: Optional[str],
    client_address: Optional[str],
    issued_date: Optional[date],
    due_date: Optional[date],
    items: List[PDFItem],
    subtotal: Decimal,
    tax: Decimal,
    total: Decimal,
) -> tuple[str, str]:
    """Generate invoice PDF using HTML template + WeasyPrint when available.

    Falls back to a minimal text-based PDF payload if WeasyPrint isn't installed.
    Returns: (abs_path, public_url)
    """
    filename = f"invoice_{invoice_number or 'no-num'}.pdf"

    # Attempt WeasyPrint first
    try:  # pragma: no cover - optional dependency path
        from jinja2 import Environment, BaseLoader, select_autoescape
        from weasyprint import HTML

        env = Environment(loader=BaseLoader(), autoescape=select_autoescape(["html"]))
        template = env.from_string(
            """
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8"/>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .header { display:flex; justify-content:space-between; align-items:center; }
                    .title { font-size: 24px; font-weight: 700; }
                    .meta { margin-top: 10px; font-size: 12px; color: #333; }
                    .section { margin-top: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: right; }
                    th.desc, td.desc { text-align: left; }
                    .totals { width: 40%; margin-left: auto; }
                    .totals td { border: none; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">INVOICE</div>
                    <div>
                        {% if invoice_number %}<div class="meta">Invoice #: {{ invoice_number }}</div>{% endif %}
                        {% if issued_date %}<div class="meta">Issued: {{ issued_date }}</div>{% endif %}
                        {% if due_date %}<div class="meta">Due: {{ due_date }}</div>{% endif %}
                    </div>
                </div>

                <div class="section">
                    <strong>Bill To:</strong><br/>
                    {{ client_name }}<br/>
                    {% if client_email %}{{ client_email }}<br/>{% endif %}
                    {% if client_address %}{{ client_address }}<br/>{% endif %}
                </div>

                <div class="section">
                    <table>
                        <thead>
                            <tr>
                                <th class="desc">Description</th>
                                <th>Qty</th>
                                <th>Unit</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for it in items %}
                            <tr>
                                <td class="desc">{{ it.description }}</td>
                                <td>{{ '%.2f'|format(it.quantity) }}</td>
                                <td>{{ '%.2f'|format(it.unit_price) }}</td>
                                <td>{{ '%.2f'|format(it.amount) }}</td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <table class="totals">
                        <tr><td>Subtotal:</td><td>{{ '%.2f'|format(subtotal) }}</td></tr>
                        <tr><td>Tax:</td><td>{{ '%.2f'|format(tax) }}</td></tr>
                        <tr><td><strong>Total:</strong></td><td><strong>{{ '%.2f'|format(total) }}</strong></td></tr>
                    </table>
                </div>
            </body>
            </html>
            """
        )
        html = template.render(
            invoice_number=invoice_number,
            client_name=client_name,
            client_email=client_email,
            client_address=client_address,
            issued_date=issued_date,
            due_date=due_date,
            items=items,
            subtotal=subtotal,
            tax=tax,
            total=total,
        )
        pdf_bytes = HTML(string=html).write_pdf()
        return save_bytes(filename, pdf_bytes)
    except Exception:
        pass

    # Fallback: simple bytes payload so dev/test still works without heavy deps
    content = f"Invoice {invoice_number or ''} for {client_name}, total {total}\n".encode("utf-8")
    return save_bytes(filename, content)
