# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run dev` - Start webpack dev server with hot reload on port 8080
- `npm run build` - Build for production (webpack)
- `npm run build:dev` - Build for development (webpack)
- `npm start` - Start simple HTTP server (server.js)

### Testing
- `npm test` - Run Jest unit tests with coverage
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run playwright:test` - Run Playwright E2E tests
- `npm run playwright:test:headed` - Run Playwright with browser UI
- `npm run playwright:test:debug` - Interactive debugging mode
- `npm run playwright:show-report` - View test results
- `npm run test:all` - Run all tests (unit + E2E)

### Test Configuration
- Unit tests: Jest with jsdom environment
- E2E tests: Playwright with multi-browser support (Chrome, Firefox, Safari)
- Coverage reports generated in `coverage/` directory
- Tests located in `tests/` directory mirroring `src/` structure

## Architecture Overview

### Storage System
The application uses a **modern SQLite-based storage system**:

- **Primary Storage**: SQLite database via `sqliteStorage.js` with RESTful API
- **Backup System**: JSON and SQL export/import via `backupManager.js`
- **Server API**: RESTful endpoints for all data operations (icons, settings, generations)

### Core Modules
- **app.js**: Main application entry point and UI coordination
- **apiStorage.js**: Primary storage interface (uses SQLite API)
- **sqliteStorage.js**: SQLite database operations and schema management
- **cardGenerator.js**: Bingo card generation logic with multi-hit support
- **pdfGenerator.js**: PDF generation using html2pdf.js
- **i18n.js**: Internationalization (English/German)
- **imageUtils.js**: Image compression and processing

### Data Structure
- **Icons**: Stored in SQLite with binary data, metadata, and compression
- **Settings**: Key-value pairs for user preferences
- **Card Generations**: Historical card generation records
- **Database**: SQLite with ACID compliance, versioning, and migrations

### Server Architecture
- **server.js**: HTTP server with RESTful API endpoints
- **Database**: SQLite with automatic initialization
- **File Serving**: Static file serving from `dist/` (production) or `src/` (development)

## Key Features

### Bingo Card Generation
- Multiple grid sizes (3x3 to 8x8)
- Multi-hit mode with difficulty levels
- Center blank option for odd-sized grids
- Icon label toggle
- PDF export with compression options

### Storage & Data Management
- Automatic IndexedDB to SQLite migration
- Backup/restore functionality
- Storage optimization
- RESTful API for all operations

## Code Style Guidelines

### General
- Use 2-space indentation
- Modern ES6+ features (const/let, arrow functions, async/await)
- CamelCase for variables/functions, PascalCase for classes
- Max 100 characters per line
- Functions should be ≤ 30 lines with JSDoc documentation

### JavaScript
- Vanilla JS only - no frameworks
- Use template literals for string interpolation
- Destructuring for object/array manipulation
- Structured logging with context for errors

### HTML/CSS
- Semantic HTML tags (`<header>`, `<main>`, `<section>`, etc.)
- Double-quoted attribute values
- Kebab-case for CSS classes
- CSS variables in `:root` for shared values
- Avoid `!important`, keep selector specificity ≤ 3

### Testing
- Jest for unit tests with jsdom environment
- Playwright for E2E tests (no Cypress)
- SQLite database mocking for tests
- Aim for ≥ 80% test coverage

## Project Structure

```
src/
├── js/
│   ├── app.js                  # Main application entry
│   └── modules/
│       ├── apiStorage.js       # Primary storage interface
│       ├── sqliteStorage.js    # SQLite storage implementation
│       ├── backupManager.js    # Backup/restore utilities
│       ├── cardGenerator.js    # Bingo card generation
│       ├── pdfGenerator.js     # PDF generation
│       ├── i18n.js            # Internationalization
│       └── imageUtils.js      # Image processing
├── css/
│   └── styles.css             # Main stylesheet
└── index.html                 # Main HTML template

data/
├── roadtripbingo.db          # SQLite database
├── backups/                  # Database backups
└── migrations/               # SQL migration scripts

tests/
├── js/modules/               # Unit tests (mirrors src structure)
└── e2e/                      # Playwright E2E tests
```

## Common Patterns

### Storage Operations
Always use the apiStorage module for data operations:
```javascript
import storage from './modules/apiStorage.js';
const icons = await storage.getAll();
await storage.save(iconData);
```

### Error Handling
Use structured logging with context:
```javascript
console.error('Storage operation failed:', { 
  operation: 'saveIcon', 
  error: error.message,
  iconId: icon.id 
});
```

### Internationalization
Use i18n module for all user-facing text:
```javascript
import { getTranslatedText } from './modules/i18n.js';
const text = getTranslatedText('key');
```

## Development Workflow

1. Work on feature branches (never commit directly to `main`)
2. Place temporary files in `temp/` directory
3. Run tests before committing
4. Use the built-in server for development: `npm start`
5. Clean up temporary files and dead code before merging