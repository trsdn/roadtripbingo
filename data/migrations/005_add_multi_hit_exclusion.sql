-- Migration 005: Add multi-hit exclusion field to icons table
-- This field controls whether icons can be selected for multi-hit mode

ALTER TABLE icons ADD COLUMN exclude_from_multi_hit BOOLEAN DEFAULT FALSE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_icons_exclude_multi_hit ON icons(exclude_from_multi_hit);

-- Set default exclusions for common environmental icons that are always visible
UPDATE icons SET exclude_from_multi_hit = TRUE WHERE 
  name LIKE '%sky%' OR 
  name LIKE '%sun%' OR 
  name LIKE '%road%' OR 
  name LIKE '%horizon%' OR 
  name LIKE '%cloud%' OR
  category = 'environment';

-- Add comment for documentation
PRAGMA table_info(icons);