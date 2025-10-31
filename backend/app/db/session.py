from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import NullPool, QueuePool
from typing import Generator
import os
from dotenv import load_dotenv
load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Configure engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite: use check_same_thread=False
    engine = create_engine(
        DATABASE_URL, 
        echo=False, 
        future=True, 
        connect_args={"check_same_thread": False}
    )
elif DATABASE_URL.startswith("postgresql"):
    # PostgreSQL (Supabase): Configure connection pooling
    # Important: Use transaction mode pooler URL for Supabase
    # Format: postgresql://user:pass@aws-X-region.pooler.supabase.com:6543/postgres
    # Note: Port 6543 for transaction mode, port 5432 for session mode
    
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        future=True,
        pool_size=5,              # Max number of persistent connections
        max_overflow=10,          # Max number of connections that can be created beyond pool_size
        pool_timeout=30,          # Seconds to wait before giving up on getting a connection
        pool_recycle=3600,        # Recycle connections after 1 hour
        pool_pre_ping=True,       # Verify connections before using them
        poolclass=QueuePool,      # Use QueuePool for production
    )
else:
    # Other databases: default configuration
    engine = create_engine(DATABASE_URL, echo=False, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
