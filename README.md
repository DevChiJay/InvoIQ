# InvoIQ

AI-powered invoice and client management system with automated extraction from chat screenshots.

## 📁 Project Structure

```
InvoIQ/
├── backend/          # FastAPI backend with AI extraction
└── frontend/         # Next.js frontend with React
```

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Configure your environment variables
uvicorn app.main:app --reload
```

**Tech Stack:** FastAPI, SQLAlchemy, PostgreSQL, OpenAI API

See [backend/README.md](./backend/README.md) for detailed setup and API documentation.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**Tech Stack:** Next.js 15, React, TypeScript, TailwindCSS, shadcn/ui

See [frontend/README.md](./frontend/README.md) for detailed setup and configuration.

## ✨ Key Features

- 🤖 **AI Extraction**: Extract invoice details from chat screenshots using OpenAI
- 📄 **Invoice Management**: Create, track, and manage invoices with PDF generation
- 👥 **Client Management**: Organize and maintain client records
- 💳 **Payment Integration**: Paystack and Stripe subscription management
- 🔐 **Authentication**: JWT-based secure user authentication
- 📧 **Email Reminders**: Automated payment reminder system
- 💰 **Multi-Currency**: Support for multiple currencies

## 🔗 API & Frontend

- **Backend API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`
- **Frontend**: `http://localhost:3000`

## 📝 License

MIT

---

For detailed documentation, please refer to the README files in each project folder.
