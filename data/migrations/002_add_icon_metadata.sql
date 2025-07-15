-- Add category and tags fields to icons table
-- Version: 1.1.0

-- Add new columns to icons table (safely handle if already exists)
-- SQLite doesn't support ALTER TABLE IF NOT EXISTS, so we'll check in the application

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_icons_category ON icons(category);

-- Update database version
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '1.1.0');