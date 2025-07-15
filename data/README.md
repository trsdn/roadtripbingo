# Data Directory

This directory contains the SQLite database and related data files for the Road Trip Bingo application.

## Structure

- `roadtripbingo.db` - Main SQLite database file
- `backups/` - Database backup files
- `migrations/` - SQL migration scripts

## Database Schema

The SQLite database contains the following tables:

### icons

- `id` (TEXT PRIMARY KEY) - Unique identifier for the icon
- `name` (TEXT NOT NULL) - Display name of the icon
- `data` (BLOB NOT NULL) - Binary image data
- `type` (TEXT NOT NULL) - MIME type of the image
- `size` (INTEGER) - File size in bytes
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### settings

- `key` (TEXT PRIMARY KEY) - Setting key
- `value` (TEXT NOT NULL) - Setting value (JSON encoded)
- `updated_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### card_generations

- `id` (TEXT PRIMARY KEY) - Unique identifier for the generation
- `title` (TEXT NOT NULL) - Card title
- `grid_size` (INTEGER NOT NULL) - Grid size (3x3, 4x4, etc.)
- `set_count` (INTEGER NOT NULL) - Number of sets generated
- `cards_per_set` (INTEGER NOT NULL) - Number of cards per set
- `config` (TEXT NOT NULL) - Generation configuration (JSON)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

## Permissions

The data directory should be writable by the application user. Ensure proper file permissions are set:

```bash
chmod 755 data/
chmod 644 data/*.db
```

## Backup

Database backups are automatically created in the `backups/` subdirectory. Manual backups can be created using the application's backup functionality.
