# Road Trip Bingo Generator

A customizable bingo card generator for road trips. Create, customize, and print bingo cards for your next adventure!

## Features

- Generate custom bingo cards with different grid sizes (3x3, 4x4, 5x5, 6x6, 7x7, 8x8)
- Create multiple card sets with unique content
- Upload custom icons with intelligent compression
- **Center blank toggle**: Leave center cell blank for odd-sized grids (5x5, 7x7, 9x9)
- **Icon labels toggle**: Show/hide text labels on icons for cleaner cards
- PDF download with adjustable compression
- Multi-language support (English, German)
- Data backup and restore
- IndexedDB storage with massive capacity (hundreds of MB to GB)
- Automatic storage optimization and quota management
- Mobile-friendly responsive design

## Project Structure

The project has been restructured into a modern, modular architecture:

```
roadtripbingo/
├── config/               # Configuration files
│   ├── .babelrc          # Babel configuration
│   ├── cypress.config.js # Cypress E2E test configuration
│   ├── jest.config.js    # Jest unit test configuration
│   ├── jest.setup.js     # Jest setup file
│   └── webpack.config.js # Webpack build configuration
├── src/                  # Source files
│   ├── js/               # JavaScript modules
│   │   ├── app.js        # Main application logic
│   │   └── modules/      # Modular components
│   │       ├── storage.js           # Legacy localStorage storage
│   │       ├── indexedDBStorage.js  # Modern IndexedDB storage system
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
│   └── db.test.js        # Database tests
├── docs/                 # Documentation
│   └── screenshots/      # Project screenshots
├── cypress/              # E2E tests
│   └── e2e/              # Test specifications
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

Run Cypress end-to-end tests:

```bash
npm run cypress:open  # Interactive mode
npm run cypress:run   # Headless mode
```

Run all tests:

```bash
npm run test:all
```

## Storage System

The application uses **IndexedDB** for data storage, providing:

### Features
- **Massive Storage Capacity**: Hundreds of MB to GB (vs localStorage's ~10MB limit)
- **Binary Image Storage**: Images stored as Blobs instead of base64 strings (30% more efficient)
- **Automatic Migration**: Seamlessly migrates data from legacy localStorage
- **Quota Management**: Real-time storage monitoring with color-coded status indicators
- **Storage Optimization**: Built-in tools to compress and clean up storage

### Storage Status Indicators
- 🟢 **Green**: Plenty of storage available
- 🟠 **Orange**: Storage getting full (>75% used)  
- 🔴 **Red**: Storage critically full or quota exceeded

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
