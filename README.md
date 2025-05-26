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
├── src/                  # Source files
│   ├── js/               # JavaScript modules
│   │   ├── app.js        # Main application logic
│   │   └── modules/      # Modular components
│   │       ├── storage.js        # Storage system
│   │       ├── i18n.js           # Internationalization 
│   │       ├── imageUtils.js     # Image handling utilities
│   │       ├── cardGenerator.js  # Bingo card generation
│   │       └── pdfGenerator.js   # PDF generation
│   ├── css/              # CSS styles
│   │   └── styles.css    # Main stylesheet
│   ├── assets/           # Static assets
│   │   └── public/assets/icons/  # Default icons (if any)
│   └── index.html        # Main HTML file
├── dist/                 # Built files (generated)
├── cypress/              # E2E tests
│   └── e2e/              # Test specifications
├── webpack.config.js     # Webpack configuration
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

Run unit tests:

```bash
npm test
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
