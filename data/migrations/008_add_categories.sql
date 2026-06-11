-- Migration 008: User-manageable categories
-- Categories become first-class records instead of free-text values on icons.

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seed with the default set used across the app
INSERT OR IGNORE INTO categories (name) VALUES
  ('Uncategorized'),
  ('Transport'),
  ('Animals'),
  ('Buildings'),
  ('Nature'),
  ('People'),
  ('Signs'),
  ('Food'),
  ('Objects'),
  ('Weather'),
  ('Technology');

-- Adopt any category names already present on icons
INSERT OR IGNORE INTO categories (name)
SELECT DISTINCT category FROM icons
WHERE category IS NOT NULL AND TRIM(category) != '';
