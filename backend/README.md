# InvoIQ FastAPI Skeleton

This is a minimal FastAPI skeleton with SQLAlchemy, JWT auth (register/login), and tests.

## Quick start

1. Create and activate a virtualenv (optional)
2. Install dependencies
3. Run tests

### Install
```
pip install -r requirements.txt
```

### Run tests
```
pytest
```

### Run API server
```
uvicorn app.main:app --reload
```

Environment variables:
- `DATABASE_URL` (default: sqlite:///./test.db)
- `SECRET_KEY` (default: dev-secret-key)

#### Supabase Postgres

When using a Supabase Postgres instance, SSL is required. Use a connection URL like:

`postgresql://<user>:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`

This project also auto-normalizes Postgres URLs at runtime to add `sslmode=require` for `*.supabase.co` hosts and selects an available driver (psycopg/psycopg2). You can keep your `.env` simple and the app will enforce SSL when it detects Supabase.
