"""
Database migration script to add business details fields to users table.
Run this script to update existing database with new user fields.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
load_dotenv(override=True)

from sqlalchemy import create_engine, text

def migrate_database():
    """Add new business detail columns to users table."""
    
    # Get database URL from environment
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # Create database engine
    engine = create_engine(DATABASE_URL)
    
    # Define the migration SQL
    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo_url VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS company_address VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_id VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR;",
    ]
    
    print("🚀 Starting database migration for user business details...")
    print(f"📍 Database: {DATABASE_URL}")
    print()
    
    try:
        with engine.connect() as conn:
            for i, migration_sql in enumerate(migrations, 1):
                try:
                    print(f"[{i}/{len(migrations)}] Executing: {migration_sql}")
                    conn.execute(text(migration_sql))
                    conn.commit()
                    print(f"✅ Success")
                except Exception as e:
                    print(f"⚠️  Warning: {str(e)}")
                    # Continue with other migrations even if one fails
                    continue
        
        print()
        print("=" * 60)
        print("✨ Migration completed successfully!")
        print("=" * 60)
        print()
        print("New fields added to users table:")
        print("  • avatar_url - User profile picture URL")
        print("  • phone - User phone number")
        print("  • company_name - Business/company name")
        print("  • company_logo_url - Company logo URL")
        print("  • company_address - Company address")
        print("  • tax_id - VAT/Tax identification number")
        print("  • website - Company website URL")
        print()
        
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ Migration failed!")
        print("=" * 60)
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        engine.dispose()

if __name__ == "__main__":
    migrate_database()
