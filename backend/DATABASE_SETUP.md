# Database Setup Guide

## Supabase Connection Configuration

### Understanding Supabase Connection Modes

Supabase offers three types of connection URLs:

#### 1. **Transaction Mode Pooler** (RECOMMENDED for Applications)
- **Port:** `6543`
- **URL Format:** `postgresql://postgres.project:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`
- **Use Case:** Web applications, APIs, serverless functions
- **Benefits:**
  - High connection limit (supports many concurrent connections)
  - Automatic connection pooling
  - Best for FastAPI/production apps
- **Limitations:**
  - Some PostgreSQL features not available (prepared statements, etc.)

#### 2. **Session Mode Pooler** (NOT RECOMMENDED for Apps)
- **Port:** `5432`
- **URL Format:** `postgresql://postgres.project:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres`
- **Use Case:** Database admin tools (pgAdmin, Postico)
- **Limitations:**
  - **Very limited connections** (usually 3-15 depending on plan)
  - **ERROR:** "max clients reached" when limit exceeded
  - Should NOT be used for applications

#### 3. **Direct Connection** (For Migrations Only)
- **Port:** `5432`
- **URL Format:** `postgresql://postgres:[PASSWORD]@db.project.supabase.co:5432/postgres`
- **Use Case:** Database migrations, one-off scripts
- **Benefits:**
  - Full PostgreSQL feature support
- **Limitations:**
  - No pooling - exhausts connections quickly
  - Should not be used for running applications

### Getting Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection String** section
4. Select **URI** format
5. Choose **Transaction** mode from the dropdown
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

### Example Configuration

```bash
# .env file
DATABASE_URL=postgresql://postgres.abcdefghij:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

### Connection Pool Settings

The application is configured with the following pool settings:

```python
pool_size=5              # Max persistent connections
max_overflow=10          # Additional connections allowed
pool_timeout=30          # Seconds to wait for connection
pool_recycle=3600        # Recycle connections after 1 hour
pool_pre_ping=True       # Verify connections before use
```

These settings ensure:
- Maximum 15 concurrent connections (5 + 10)
- Connections are recycled to prevent stale connections
- Failed connections are detected before use

### Troubleshooting

#### Error: "max clients reached"
**Cause:** Using Session Mode (port 5432) instead of Transaction Mode (port 6543)

**Solution:**
1. Check your `DATABASE_URL` in `.env`
2. Ensure it uses port `6543` (Transaction Mode)
3. If using port `5432`, switch to Transaction Mode URL
4. Restart your application

#### Error: "too many connections"
**Cause:** Connection pool exhausted or connections not being closed

**Solutions:**
1. Reduce `pool_size` and `max_overflow` in `db/session.py`
2. Ensure all database sessions are properly closed
3. Check for connection leaks in your code
4. Consider upgrading Supabase plan for more connections

#### Slow Database Performance
**Cause:** Connection pool too small or connections being recycled too often

**Solutions:**
1. Increase `pool_size` (but stay under your Supabase limit)
2. Increase `pool_recycle` time
3. Enable `pool_pre_ping` to detect stale connections

### Local Development

For local development with SQLite:

```bash
# .env file
DATABASE_URL=sqlite:///./test.db
```

SQLite doesn't require connection pooling and works great for development.

### Production Checklist

- [ ] Using Transaction Mode pooler (port 6543)
- [ ] Password is secure and not committed to git
- [ ] `pool_size` + `max_overflow` < Supabase connection limit
- [ ] SSL mode enabled (add `?sslmode=require` if needed)
- [ ] Connection string stored in environment variables
- [ ] Tested connection with small load
- [ ] Monitored connection usage in Supabase dashboard

### Monitoring Connections

To monitor active connections in Supabase:

1. Go to **Database** → **Connection pooling** in Supabase dashboard
2. View active connections graph
3. Ensure connections don't exceed your plan limit

Or run this SQL query:

```sql
SELECT count(*) FROM pg_stat_activity 
WHERE datname = 'postgres';
```

### Need Help?

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool)
- [SQLAlchemy Pooling Guide](https://docs.sqlalchemy.org/en/20/core/pooling.html)
