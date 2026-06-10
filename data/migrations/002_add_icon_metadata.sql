-- Add category, tags and alt_text fields to icons table
-- Version: 1.1.0

-- Add new columns to icons table.
-- SQLite doesn't support ALTER TABLE ... ADD COLUMN IF NOT EXISTS, so if a
-- column already exists this migration throws "duplicate column name" and the
-- migration runner skips the file (see runMigrations in sqliteStorage.js).
ALTER TABLE icons ADD COLUMN category TEXT DEFAULT 'default';
ALTER TABLE icons ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE icons ADD COLUMN alt_text TEXT DEFAULT '';

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_icons_category ON icons(category);

-- Update database version
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '1.1.0');