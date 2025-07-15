-- Add difficulty rating to icons table
-- Version: 1.2.0

-- Add difficulty column to icons table
-- Difficulty levels: 1=Very Easy, 2=Easy, 3=Medium, 4=Hard, 5=Very Hard
-- Default to 3 (Medium) for existing icons
ALTER TABLE icons ADD COLUMN difficulty INTEGER DEFAULT 3;

-- Create indexes for difficulty-based queries
CREATE INDEX IF NOT EXISTS idx_icons_difficulty ON icons(difficulty);

-- Update database version
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '1.2.0');