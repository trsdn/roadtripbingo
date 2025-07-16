# Road Trip Bingo Generator

A customizable bingo card generator for road trips. Create, customize, and print bingo cards for your next adventure!

## Features

- Generate custom bingo cards with different grid sizes (3x3, 4x4, 5x5, 6x6, 7x7, 8x8)
- Create multiple card sets with unique content
- Upload custom icons with intelligent compression
- **Center blank toggle**: Leave center cell blank for odd-sized grids (5x5, 7x7, 9x9)
- **Icon labels toggle**: Show/hide text labels on icons for cleaner cards
- **Multi-Hit Mode**: Add challenge with tiles requiring multiple hits to complete
  - Three difficulty levels: Light (20-30% tiles), Medium (40-50% tiles), Hard (60-70% tiles)
  - Smart hit count assignment (2-5 hits per multi-hit tile)
  - Visual counters in both preview and PDF output
- PDF download with adjustable compression
- Multi-language support (English, German)
- Data backup and restore
- SQLite database storage with robust data management
- RESTful API for data operations
- Automatic storage optimization and quota management
- Mobile-friendly responsive design

## Project Structure

The project has been restructured into a modern, modular architecture:

```
roadtripbingo/
├── config/               # Configuration files
│   ├── .babelrc          # Babel configuration
│   ├── jest.config.js    # Jest unit test configuration
│   ├── jest.setup.js     # Jest setup file
│   └── webpack.config.js # Webpack build configuration
├── data/                 # SQLite database and related files
│   ├── README.md         # Database schema documentation
│   ├── backups/          # Database backup files
│   └── migrations/       # Database migration scripts
├── src/                  # Source files
│   ├── js/               # JavaScript modules
│   │   ├── app.js        # Main application logic
│   │   └── modules/      # Modular components
│   │       ├── storage.js           # Legacy localStorage storage
│   │       ├── indexedDBStorage.js  # Legacy IndexedDB storage
│   │       ├── sqliteStorage.js     # Modern SQLite storage system
│   │       ├── indexedDBMigrator.js # Migration from IndexedDB to SQLite
│   │       ├── backupManager.js     # Backup and restore utilities
│   │       ├── i18n.js              # Internationalization 
│   │       ├── imageUtils.js        # Image handling & compression
│   │       ├── cardGenerator.js     # Bingo card generation
│   │       ├── db.js                # Database layer
│   │       ├── languages.js         # Language definitions
│   │       └── pdfGenerator.js      # PDF generation
│   ├── css/              # CSS styles
│   │   └── styles.css    # Main stylesheet
│   └── index.html        # Main HTML file
├── public/               # Public assets
│   └── assets/           # Static assets
│       └── icons/        # Default icons
├── tests/                # Test files (mirrors src structure)
│   ├── js/modules/       # Module tests
│   │   ├── indexedDBStorage.test.js # IndexedDB storage tests
│   │   └── ...           # Other module tests
│   ├── e2e/              # End-to-end tests (Playwright)
│   └── db.test.js        # Database tests
├── playwright.config.js  # Playwright configuration
├── server.js             # Simple development server
└── package.json          # Project dependencies and scripts
```

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
npm install
```

### Database Setup

The application uses SQLite for data storage. The database will be automatically initialized on first run. No additional setup is required.

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

Or use the simple HTTP server:

```bash
npm run start
```

### Build

Build for production:

```bash
npm run build
```

Build for development:

```bash
npm run build:dev
```

## Testing

### Unit Tests

Run Jest unit tests:

```bash
npm test              # Run tests once with coverage
npm run test:watch    # Run tests in watch mode
```

### E2E Tests

Run Playwright end-to-end tests:

```bash
npm run playwright:test         # Run all tests
npm run playwright:test:headed  # Run with browser UI
npm run playwright:test:debug   # Interactive debugging
npm run playwright:show-report  # View test results
```

Run all tests:

```bash
npm run test:all
```

## Storage System

The application uses **SQLite** for data storage, providing:

### Features

- **Robust Data Management**: SQLite database with ACID compliance and data integrity
- **RESTful API**: Server-side API endpoints for all data operations
- **Automatic Migration**: Seamlessly migrates data from legacy IndexedDB storage
- **Backup & Restore**: Built-in tools for data backup and restore (JSON and SQL formats)
- **Versioning Support**: Database schema versioning with forward/backward migration
- **Transaction Support**: Atomic operations with rollback capability

### API Endpoints

The server provides RESTful endpoints for data operations:

- **Icons**: `GET/POST/PUT/DELETE /api/icons`
- **Settings**: `GET/POST/PUT/DELETE /api/settings`
- **Card Generations**: `GET/POST/PUT/DELETE /api/generations`
- **Storage Info**: `GET /api/storage/info`
- **Export/Import**: `GET /api/export`, `POST /api/import`

### Migration from IndexedDB

Users with existing IndexedDB data will be automatically migrated to SQLite on first load. The migration process:

- Validates existing data integrity
- Transfers all icons, settings, and card generations
- Provides rollback capability if migration fails
- Maintains data consistency throughout the process

### Center Blank Feature
- **Toggle available**: Leave center cell blank for traditional bingo experience
- **Works with odd grids**: Only applies to 5x5, 7x7, and 9x9 grids
- **Smart calculation**: Automatically adjusts required icon count when enabled
- **Default enabled**: Center blank is enabled by default for new users

### Icon Labels Toggle
- **Show/hide labels**: Toggle text labels on icons for cleaner card appearance
- **Dynamic preview**: Changes are reflected immediately in card preview
- **Persistent setting**: Your preference is saved and restored across sessions

### Automatic Image Compression
- Images are automatically compressed when they exceed 200KB
- Maximum dimensions: 400x400 pixels
- JPEG quality: 70%, PNG quality: 80%
- Maintains visual quality while minimizing storage usage

## PDF Compression Options

The generator offers four levels of PDF compression:

- **None**: Highest quality, largest file size
- **Light**: Slight compression, good quality
- **Medium**: Balanced compression (recommended)
- **High**: Maximum compression, smallest file size

## Languages

Currently supported languages:
- English
- German

## License

MIT License
