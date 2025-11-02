"""
Migration script to add currency column to invoices table
and set all existing invoices to NGN (Nigerian Naira)
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from app.db.session import engine

def migrate():
    """Add currency column and set default values"""
    print("Starting migration: Add currency column to invoices table")
    
    try:
        # Check if column already exists (PostgreSQL compatible)
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='invoices' AND column_name='currency'
            """))
            exists = result.fetchone()
            
            if exists:
                print("✓ Currency column already exists. Skipping migration.")
                
                # Still check and update any NULL values
                with engine.connect() as conn:
                    result = conn.execute(text("""
                        UPDATE invoices 
                        SET currency = 'NGN' 
                        WHERE currency IS NULL OR currency = ''
                    """))
                    conn.commit()
                    print(f"✓ Ensured all invoices have currency set")
                    
                    # Get total count
                    result = conn.execute(text("SELECT COUNT(*) FROM invoices"))
                    total = result.fetchone()[0]
                    print(f"✓ Total invoices in database: {total}")
                return
        
        # Add currency column (PostgreSQL)
        print("Adding currency column...")
        with engine.connect() as conn:
            # Add column with default value
            conn.execute(text("""
                ALTER TABLE invoices 
                ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'NGN'
            """))
            conn.commit()
            print("✓ Currency column added successfully")
        
        # Update existing invoices to NGN (already done by default, but explicit)
        print("Ensuring all invoices have NGN currency...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                UPDATE invoices 
                SET currency = 'NGN' 
                WHERE currency IS NULL OR currency = ''
            """))
            conn.commit()
            
            # Get total count
            result = conn.execute(text("SELECT COUNT(*) FROM invoices"))
            total = result.fetchone()[0]
            print(f"✓ Total invoices in database: {total}")
        
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate()
