# InvoIQ Backend API

AI-powered invoice and client management system backend built with FastAPI, SQLAlchemy, and PostgreSQL.

## 🚀 Features

- **Authentication**: JWT-based user registration and login
- **Client Management**: CRUD operations for client records
- **Invoice Management**: Create, update, delete, and track invoices with items
- **AI Extraction**: Extract job details from chat screenshots or text using OpenAI
- **PDF Generation**: Generate professional invoice PDFs
- **Payment Integration**: Paystack and Stripe subscription management
- **Pro Features**: Subscription-based premium features
- **Reminders**: Send invoice payment reminders

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL (or SQLite for development)
- OpenAI API key (for extraction features)
- Paystack/Stripe API keys (for payment features)

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables** (see Environment Variables section)

6. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Core Settings
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./test.db
APP_BASE_URL=http://localhost:8000
```

### AI Extraction
```env
EXTRACTOR_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
```

### Storage
```env
STORAGE_PROVIDER=local
STORAGE_LOCAL_DIR=./generated
```

### Payment Providers
```env
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_BASE_URL=https://api.paystack.co
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Production Database (Supabase)
```env
DATABASE_URL=postgresql://user:password@db.project.supabase.co:5432/postgres?sslmode=require
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/auth/register` | Register new user | No |
| POST | `/v1/auth/login` | Login user | No |
| GET | `/v1/me` | Get current user | Yes |

### Client Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/clients` | List all clients | Yes |
| POST | `/v1/clients` | Create new client | Yes |
| GET | `/v1/clients/{id}` | Get client details | Yes |
| PUT | `/v1/clients/{id}` | Update client | Yes |
| DELETE | `/v1/clients/{id}` | Delete client | Yes |

### Invoice Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/invoices` | List invoices with filters | Yes |
| POST | `/v1/invoices` | Create invoice manually | Yes |
| GET | `/v1/invoices/{id}` | Get invoice details | Yes |
| PUT | `/v1/invoices/{id}` | Update invoice | Yes |
| DELETE | `/v1/invoices/{id}` | Delete invoice | Yes |

### AI Extraction

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/extract-job-details` | Extract data from text/image | No |

### Payments & Subscriptions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/payments/subscription/create` | Create subscription | Yes |
| POST | `/v1/payments/subscription/verify` | Verify subscription | Yes |
| GET | `/v1/payments/subscription/status` | Get subscription status | Yes |
| POST | `/v1/payments/webhook/paystack` | Paystack webhook | No |
| POST | `/v1/payments/webhook/stripe` | Stripe webhook | No |

### Reminders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/send-reminder` | Send invoice reminder | Yes |

## 🗃️ Database Models

### User
- `id`, `email`, `hashed_password`, `full_name`, `is_active`
- Pro subscription fields: `is_pro`, `subscription_status`, etc.

### Client
- `id`, `user_id`, `name`, `email`, `phone`, `address`

### Invoice
- `id`, `user_id`, `client_id`, `number`, `status`, `due_date`
- `items` (JSON), `subtotal`, `tax`, `total`, `pdf_url`, `payment_link`

### Extraction
- `id`, `user_id`, `source_type`, `raw_text`, `parsed_data`, `confidence`

### Payment
- `id`, `invoice_id`, `amount`, `provider`, `provider_ref`, `status`

## 🧪 Testing

Run the test suite:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app
```

Run specific test file:
```bash
pytest tests/test_auth.py
```

## 🚀 Deployment

### Using Docker
```bash
# Build image
docker build -t invoiq-backend .

# Run container
docker run -p 8000:8000 --env-file .env invoiq-backend
```

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Production Considerations

1. **Database**: Use PostgreSQL instead of SQLite
2. **Secret Key**: Generate a secure random secret key
3. **CORS**: Configure `allow_origins` restrictively
4. **SSL**: Enable HTTPS and secure cookie settings
5. **Rate Limiting**: Configure rate limiting for API endpoints
6. **Monitoring**: Add logging and health check endpoints

## 📝 API Response Examples

### Authentication
```json
// POST /v1/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}

// Response
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_pro": false
}
```

### Invoice Creation
```json
// POST /v1/invoices
{
  "client_id": 1,
  "number": "INV-001",
  "due_date": "2024-01-15",
  "items": [
    {
      "description": "Web Development",
      "quantity": 1,
      "unit_price": 1500.00
    }
  ],
  "notes": "Payment due within 30 days"
}
```

### Extraction
```json
// POST /v1/extract-job-details
{
  "text": "I need a website built by January 15th. Budget is $1500."
}

// Response
{
  "extraction_id": 123,
  "parsed_data": {
    "jobs": ["Website development"],
    "deadline": "2024-01-15",
    "amount": 1500.00,
    "currency": "USD"
  },
  "confidence": 0.85
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related

- [Frontend Repository](../frontend) - Next.js frontend application
- [Documentation](../docs) - Detailed API documentation
- [Deployment Guide](../docs/deployment.md) - Production deployment guide
