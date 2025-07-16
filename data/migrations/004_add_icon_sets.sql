-- Add icon sets and translations support
-- Version: 1.3.0

-- Icon Sets table
CREATE TABLE IF NOT EXISTS icon_sets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between icons and sets
CREATE TABLE IF NOT EXISTS icon_set_members (
    icon_id TEXT,
    set_id TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (icon_id, set_id),
    FOREIGN KEY (icon_id) REFERENCES icons(id) ON DELETE CASCADE,
    FOREIGN KEY (set_id) REFERENCES icon_sets(id) ON DELETE CASCADE
);

-- Icon translations for multi-language support
CREATE TABLE IF NOT EXISTS icon_translations (
    icon_id TEXT,
    language_code TEXT,
    translated_name TEXT,
    PRIMARY KEY (icon_id, language_code),
    FOREIGN KEY (icon_id) REFERENCES icons(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_icon_sets_name ON icon_sets(name);
CREATE INDEX IF NOT EXISTS idx_icon_set_members_icon_id ON icon_set_members(icon_id);
CREATE INDEX IF NOT EXISTS idx_icon_set_members_set_id ON icon_set_members(set_id);
CREATE INDEX IF NOT EXISTS idx_icon_translations_icon_id ON icon_translations(icon_id);
CREATE INDEX IF NOT EXISTS idx_icon_translations_language ON icon_translations(language_code);

-- Create default "All Icons" set
INSERT OR IGNORE INTO icon_sets (id, name, description) 
VALUES ('all-icons', 'All Icons', 'Default set containing all icons');

-- Add all existing icons to the "All Icons" set
INSERT OR IGNORE INTO icon_set_members (icon_id, set_id)
SELECT id, 'all-icons' FROM icons;

-- Update database version
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '1.3.0');