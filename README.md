# Road Trip Bingo Generator

A customizable bingo card generator for road trips. Create, customize, and print bingo cards for your next adventure!

## Features

- Generate custom bingo cards with different grid sizes (3x3, 4x4, 5x5, 6x6)
- Create multiple card sets with unique content
- Upload custom icons
- PDF download with adjustable compression
- Multi-language support (English, German)
- Data backup and restore
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
│   │       ├── storage.js        # Storage system
│   │       ├── i18n.js           # Internationalization 
│   │       ├── imageUtils.js     # Image handling utilities
│   │       ├── cardGenerator.js  # Bingo card generation
│   │       ├── db.js             # Database layer
│   │       ├── languages.js      # Language definitions
│   │       └── pdfGenerator.js   # PDF generation
│   ├── css/              # CSS styles
│   │   └── styles.css    # Main stylesheet
│   └── index.html        # Main HTML file
├── public/               # Public assets
│   └── assets/           # Static assets
│       └── icons/        # Default icons
├── tests/                # Test files (mirrors src structure)
│   ├── js/modules/       # Module tests
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

ISC License
