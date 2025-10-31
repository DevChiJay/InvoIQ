-- Migration: Update notes column from JSON to TEXT
-- This migration changes the notes column in the invoices table from JSON to TEXT type

-- For SQLite (used in development)
-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
-- However, since JSON and TEXT are both stored as TEXT in SQLite, no migration is needed for SQLite

-- For PostgreSQL (if used in production)
-- ALTER TABLE invoices ALTER COLUMN notes TYPE TEXT USING notes::TEXT;

-- Note: If you have existing data, you may need to convert JSON to plain text
-- This script assumes notes field is being used as a simple text field going forward
