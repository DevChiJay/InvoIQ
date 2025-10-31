#!/usr/bin/env python3
"""
Database Connection Troubleshooting Script

This script helps diagnose Supabase connection issues and validates your configuration.
"""

import os
import sys
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

def check_database_url():
    """Check if DATABASE_URL is properly configured"""
    database_url = os.getenv("DATABASE_URL")
    
    print("=" * 60)
    print("DATABASE CONNECTION DIAGNOSTICS")
    print("=" * 60)
    print()
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        print("   Solution: Create a .env file with DATABASE_URL")
        return False
    
    print(f"✅ DATABASE_URL found")
    print()
    
    # Parse the URL
    try:
        parsed = urlparse(database_url)
        
        print("Connection Details:")
        print(f"  Database Type: {parsed.scheme}")
        print(f"  Host: {parsed.hostname}")
        print(f"  Port: {parsed.port}")
        print(f"  Database: {parsed.path.lstrip('/')}")
        print(f"  Username: {parsed.username}")
        print(f"  Password: {'*' * 8 if parsed.password else 'NOT SET'}")
        print()
        
        # Check if it's Supabase
        if parsed.hostname and 'supabase.com' in parsed.hostname:
            print("🔍 Supabase Connection Detected")
            print()
            
            # Check pooler mode
            if 'pooler.supabase.com' in parsed.hostname:
                print("✅ Using Supabase Pooler")
                
                if parsed.port == 6543:
                    print("✅ Transaction Mode (port 6543) - CORRECT!")
                    print("   This is the recommended mode for applications.")
                    print()
                    return True
                elif parsed.port == 5432:
                    print("⚠️  WARNING: Session Mode (port 5432) - NOT RECOMMENDED!")
                    print("   This mode has very limited connections and will cause")
                    print("   'max clients reached' errors.")
                    print()
                    print("   SOLUTION: Change port to 6543 for Transaction Mode")
                    print(f"   Current: {database_url}")
                    print(f"   Change to: {database_url.replace(':5432/', ':6543/')}")
                    print()
                    return False
                else:
                    print(f"⚠️  Unknown port: {parsed.port}")
                    print("   Expected: 6543 (Transaction) or 5432 (Session)")
                    print()
                    return False
            else:
                # Direct connection
                print("⚠️  Using Direct Connection (no pooler)")
                print("   This is OK for migrations but NOT recommended for apps.")
                print()
                print("   RECOMMENDATION: Use Transaction Mode pooler")
                print("   Format: postgresql://user:pass@aws-X-region.pooler.supabase.com:6543/postgres")
                print()
                return False
        
        elif parsed.scheme == 'sqlite':
            print("✅ SQLite Connection - Good for development")
            print("   No connection pooling needed.")
            print()
            return True
        
        elif parsed.scheme.startswith('postgresql'):
            print("✅ PostgreSQL Connection")
            print("   Make sure your connection pool settings are appropriate.")
            print()
            return True
        
        else:
            print(f"⚠️  Unknown database type: {parsed.scheme}")
            print()
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Failed to parse DATABASE_URL: {e}")
        return False


def check_pool_settings():
    """Display current connection pool settings"""
    print()
    print("=" * 60)
    print("CONNECTION POOL SETTINGS")
    print("=" * 60)
    print()
    print("Current settings in db/session.py:")
    print("  pool_size: 5 (max persistent connections)")
    print("  max_overflow: 10 (additional connections allowed)")
    print("  pool_timeout: 30 seconds")
    print("  pool_recycle: 3600 seconds (1 hour)")
    print("  pool_pre_ping: True (verify before use)")
    print()
    print("Total max connections: 15 (5 + 10)")
    print()
    
    # Recommendations
    database_url = os.getenv("DATABASE_URL", "")
    if 'supabase.com' in database_url:
        print("Supabase Free Tier Limits:")
        print("  Transaction Mode: ~1000 connections (pooled)")
        print("  Session Mode: ~3-15 connections (very limited)")
        print()
        print("Your app is configured for max 15 concurrent connections.")
        print("✅ This is well within Supabase limits for Transaction Mode.")
        print()


def test_connection():
    """Try to connect to the database"""
    print()
    print("=" * 60)
    print("CONNECTION TEST")
    print("=" * 60)
    print()
    
    try:
        from sqlalchemy import create_engine, text
        from app.db.session import DATABASE_URL, engine
        
        print("Attempting to connect...")
        
        # Try a simple query
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        
        print("✅ Connection successful!")
        print()
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Make sure SQLAlchemy is installed: pip install sqlalchemy")
        return False
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print()
        
        error_str = str(e).lower()
        
        if "max clients" in error_str or "maxclientsinsessionmode" in error_str:
            print("DIAGNOSIS: Too many clients in Session Mode")
            print()
            print("SOLUTION:")
            print("1. Change your DATABASE_URL to use Transaction Mode (port 6543)")
            print("2. Restart your application")
            print("3. Run this script again to verify")
            print()
            
        elif "could not connect" in error_str or "connection refused" in error_str:
            print("DIAGNOSIS: Cannot reach database server")
            print()
            print("SOLUTION:")
            print("1. Check your internet connection")
            print("2. Verify the hostname and port are correct")
            print("3. Check if Supabase project is paused")
            print()
            
        elif "password authentication failed" in error_str:
            print("DIAGNOSIS: Invalid credentials")
            print()
            print("SOLUTION:")
            print("1. Verify your database password in .env")
            print("2. Get the correct password from Supabase dashboard")
            print("3. Make sure there are no spaces or special characters issues")
            print()
            
        return False


def main():
    """Run all diagnostic checks"""
    
    # Check DATABASE_URL
    url_ok = check_database_url()
    
    # Show pool settings
    check_pool_settings()
    
    # Test connection
    if url_ok:
        connection_ok = test_connection()
    else:
        print("⚠️  Skipping connection test due to configuration issues.")
        print("   Fix the DATABASE_URL first, then run this script again.")
        connection_ok = False
    
    # Final summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print()
    
    if url_ok and connection_ok:
        print("✅ All checks passed!")
        print("   Your database connection is properly configured.")
    elif url_ok and not connection_ok:
        print("⚠️  Configuration looks OK but connection failed.")
        print("   Check the error messages above for solutions.")
    else:
        print("❌ Configuration issues detected.")
        print("   Fix the DATABASE_URL and try again.")
    
    print()
    print("For detailed help, see: DATABASE_SETUP.md")
    print()


if __name__ == "__main__":
    main()
