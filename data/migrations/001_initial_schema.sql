-- Initial schema for Road Trip Bingo SQLite database
-- Version: 1.0.0

PRAGMA foreign_keys = ON;

-- Icons table to store image data and metadata
CREATE TABLE IF NOT EXISTS icons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data BLOB NOT NULL,
    type TEXT NOT NULL,
    size INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching icons by name
CREATE INDEX IF NOT EXISTS idx_icons_name ON icons(name);
CREATE INDEX IF NOT EXISTS idx_icons_created_at ON icons(created_at);

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for settings lookup
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- Card generations table for storing generation history
CREATE TABLE IF NOT EXISTS card_generations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    grid_size INTEGER NOT NULL,
    set_count INTEGER NOT NULL,
    cards_per_set INTEGER NOT NULL,
    config TEXT NOT NULL, -- JSON configuration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for card generations
CREATE INDEX IF NOT EXISTS idx_card_generations_created_at ON card_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_card_generations_grid_size ON card_generations(grid_size);

-- Database metadata table for versioning
CREATE TABLE IF NOT EXISTS db_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize database version
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '1.0.0');
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('created_at', datetime('now'));

-- Triggers to update updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_icons_timestamp 
    AFTER UPDATE ON icons
BEGIN
    UPDATE icons SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
    AFTER UPDATE ON settings
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
END;
