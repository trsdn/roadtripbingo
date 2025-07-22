# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run dev` - Start Vite dev server with React HMR
- `npm run build` - Build for production (Vite)
- `npm run preview` - Preview production build locally
- `npm run server` - Start Fastify backend server
- `npm run server:dev` - Start Fastify with nodemon for auto-reload

### Database Management (Prisma)
- `npx prisma init` - Initialize Prisma in the project
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to database (development)
- `npx prisma migrate dev` - Create and apply migrations (development)
- `npx prisma migrate deploy` - Apply migrations (production)
- `npx prisma studio` - Open Prisma Studio (visual database browser)
- `npx prisma db seed` - Run database seed script

### Testing
- `npm test` - Run Vitest unit tests
- `npm run test:ui` - Run Vitest with UI dashboard
- `npm run test:watch` - Run Vitest in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:headed` - Run Playwright with browser UI
- `npm run test:e2e:debug` - Interactive debugging mode
- `npm run test:e2e:report` - View test results
- `npm run test:all` - Run all tests (unit + integration + E2E)

### Test Configuration
- **Unit tests**: Vitest with jsdom environment
  - Lightning fast with Vite integration
  - Native ESM support
  - Compatible with Jest API
  - Built-in TypeScript support
- **E2E tests**: Playwright with multi-browser support (Chrome, Firefox, Safari)
- **Integration tests**: API + database testing with real backend
- Coverage reports generated in `coverage/` directory
- Tests located in `tests/` directory
- Vitest config in `vite.config.js`

### Current Test Structure
```
tests/
├── setup.js                    # Test configuration and setup
├── e2e/                        # End-to-end tests (Playwright)
│   ├── ai-suggestions.spec.js  # AI feature workflows
│   ├── app.spec.js            # Main app functionality
│   ├── basic-functionality.spec.js # Core features
│   ├── pdf-generation.spec.js  # PDF export workflows
│   ├── storage.spec.js         # Data persistence
│   └── translation-modal.spec.js # Translation features
├── unit/                       # Unit tests (Vitest)
│   ├── components/
│   │   └── BingoCard.test.jsx  # React component tests
│   └── services/
│       └── aiService.test.jsx  # Service layer tests
└── integration/                # Integration tests
    └── (future API integration tests)
```

## Architecture Overview

### Storage System
The application uses a **modern SQLite-based storage system**:

- **Primary Storage**: SQLite database with Prisma ORM for type-safe database access
- **Database Access**: Prisma Client for all database operations with auto-generated types
- **Schema Management**: Prisma schema file (schema.prisma) defines models and relationships
- **Migrations**: Prisma Migrate for database schema versioning and migrations
- **Backup System**: JSON and SQL export/import via `backupManager.js`
- **Server API**: RESTful endpoints for all data operations (icons, settings, generations)

### Core Modules
- **Frontend (React)**:
  - **src/main.jsx**: React app entry point
  - **src/App.jsx**: Main app component with routing
  - **src/components/**: Reusable React components
  - **src/pages/**: Page-level components
  - **src/hooks/**: Custom React hooks
  - **src/context/**: React Context providers
  - **src/services/**: API client services
- **Backend (Fastify)**:
  - **server/index.js**: Fastify server entry point
  - **server/routes/**: API route definitions
  - **server/plugins/**: Fastify plugins
  - **prisma/**: Prisma configuration directory
    - **schema.prisma**: Database schema definition
    - **migrations/**: Database migration history
- **Shared Modules**:
  - **cardGenerator.js**: Bingo card generation logic
  - **pdfGenerator.js**: PDF generation
  - **i18n.js**: Internationalization
  - **imageUtils.js**: Image processing

### Data Structure
- **Icons**: Stored in SQLite with binary data, metadata, and compression
- **Settings**: Key-value pairs for user preferences
- **Card Generations**: Historical card generation records
- **Database**: SQLite with ACID compliance, versioning, and migrations

### Server Architecture
- **server.js**: Fastify server with RESTful API endpoints
  - High-performance web framework
  - Built-in schema validation
  - TypeScript support
  - Plugin ecosystem
- **API Features**:
  - Automatic request/response validation
  - Built-in logging with Pino
  - CORS support via @fastify/cors
  - Static file serving via @fastify/static
  - Swagger/OpenAPI documentation via @fastify/swagger
- **Database**: SQLite with Prisma ORM
  - Type-safe database queries
  - Automatic schema synchronization
  - Built-in connection pooling
- **Prisma Studio**: Visual database browser (run `npx prisma studio`)
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

### CSS Framework
- Use Tailwind CSS for all styling needs
- Prefer utility classes over custom CSS
- Use Tailwind's responsive modifiers (sm:, md:, lg:, etc.)
- Apply Tailwind's dark mode utilities when implementing dark mode features
- Configure Tailwind via tailwind.config.js for customizations

### JavaScript
- Frontend: React with Vite as build tool
  - Functional components with hooks
  - JSX for component templates
  - React Router for navigation
  - State management with Context API or Zustand
  - Hot Module Replacement (HMR) in development
  - React Icons for UI icons (tree-shakable, multiple icon sets)
- Backend: Node.js with Fastify framework
- Use template literals for string interpolation
- Destructuring for object/array manipulation
- Structured logging with context for errors
- Use async/await for asynchronous operations

### HTML/CSS
- Semantic HTML tags (`<header>`, `<main>`, `<section>`, etc.)
- Double-quoted attribute values
- Use Tailwind CSS for styling - utility-first approach
- Custom CSS only when necessary, placed in styles.css
- CSS variables in `:root` for shared values when not using Tailwind
- Avoid `!important`, use Tailwind's modifier system instead

### Testing
- Vitest for unit and integration tests
  - Faster than Jest with Vite integration
  - Same API as Jest for easy migration
  - Built-in mocking and spying
- Playwright for E2E tests (no Cypress)
- SQLite database mocking for tests
- Aim for ≥ 80% test coverage

### Key Testing Strategies
✅ **Unit tests** → test small pieces (components, functions, API handlers)
  - React components with React Testing Library
  - Pure functions and utilities
  - Individual API route handlers
  - Database queries with mocked Prisma client

✅ **Integration tests** → test system parts together (API + DB, UI + API)
  - API endpoints with real database (test DB)
  - React components with API mocks
  - Multiple components working together
  - Authentication and authorization flows

✅ **End-to-end (E2E) tests** → test from user perspective (frontend + backend + DB)
  - Complete user workflows
  - Real browser interactions with Playwright
  - Full stack running (React + Fastify + SQLite)
  - Critical user journeys (create bingo card, manage icons, export PDF)

## Project Structure

```
src/                          # Frontend (React + Vite)
├── main.jsx                  # React entry point
├── App.jsx                   # Main app component
├── components/               # Reusable components
│   ├── BingoCard.jsx
│   ├── IconManager.jsx
│   └── Navigation.jsx
├── pages/                    # Page components
│   ├── Generator.jsx
│   └── Icons.jsx
├── hooks/                    # Custom React hooks
├── context/                  # React Context providers
├── services/                 # API client services
└── assets/                   # Static assets

server/                       # Backend (Fastify)
├── index.js                  # Server entry point
├── routes/                   # API routes
│   ├── icons.js
│   ├── settings.js
│   └── generations.js
├── plugins/                  # Fastify plugins
└── utils/                    # Server utilities

prisma/                       # Database
├── schema.prisma            # Database schema
├── migrations/              # Migration history
└── seed.js                  # Database seeding

public/                      # Static files
tests/                       # Test files
├── unit/                    # Jest unit tests
└── e2e/                     # Playwright E2E tests
```

## Common Patterns

### React Icons Usage

Import only the icons you need:

```jsx
// Import specific icons from different libraries
import { FaHome, FaUser, FaCog } from 'react-icons/fa'; // Font Awesome
import { MdSettings, MdDelete } from 'react-icons/md'; // Material Design
import { IoMdAdd, IoMdClose } from 'react-icons/io'; // Ionicons
import { AiOutlineDownload } from 'react-icons/ai'; // Ant Design

// Use with Tailwind for styling
<FaDownload className="w-5 h-5 text-gray-600 hover:text-gray-800" />

// Common icons for Road Trip Bingo:
// FaPlus - Add icon
// FaTrash - Delete
// FaDownload - Download PDF
// FaPrint - Print
// FaCog - Settings
// FaRedo - Generate new card
// FaCamera - Upload image
// MdEdit - Edit
// IoMdClose - Close modal
```

### Test Writing Patterns

Follow the testing pyramid approach:

```javascript
// Unit Test Example (Vitest + React Testing Library)
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import BingoCard from './BingoCard';

describe('BingoCard', () => {
  it('renders correct grid size', () => {
    const { container } = render(<BingoCard gridSize={5} />);
    const cells = container.querySelectorAll('.bingo-cell');
    expect(cells).toHaveLength(25);
  });
});

// Integration Test Example (API + DB with Vitest)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../server/app';

describe('POST /api/icons', () => {
  let app;
  
  beforeAll(async () => {
    app = await build({ logger: false });
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('creates icon and stores in database', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/icons',
      payload: { name: 'Test Icon', data: 'base64...' }
    });
    
    expect(response.statusCode).toBe(201);
    const icon = await prisma.icon.findUnique({ 
      where: { id: response.json().id } 
    });
    expect(icon).toBeTruthy();
  });
});

// E2E Test Example (Playwright)
test('user can create and download bingo card', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#gridSize', '5');
  await page.fill('#title', 'My Bingo Card');
  await page.click('#generateBtn');
  
  await expect(page.locator('.bingo-card')).toBeVisible();
  
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#downloadPdfBtn')
  ]);
  expect(download.suggestedFilename()).toContain('.pdf');
});
```

### React Components

Follow modern React patterns:

```jsx
// Functional component with hooks and icons
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaDownload, FaCog } from 'react-icons/fa';
import { MdDelete, MdEdit } from 'react-icons/md';

function BingoCard({ gridSize, title }) {
  const [icons, setIcons] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchIcons();
  }, []);
  
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded">
          <FaPlus /> Add Icon
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded">
          <FaDownload /> Download PDF
        </button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {icons.map(icon => (
          <IconCell key={icon.id} icon={icon} />
        ))}
      </div>
    </div>
  );
}

// Custom hooks for shared logic
function useIcons() {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchIcons = async () => {
    setLoading(true);
    const data = await iconService.getAll();
    setIcons(data);
    setLoading(false);
  };
  
  return { icons, loading, fetchIcons };
}
```

### API Development (Fastify)

Use Fastify for all server endpoints:

```javascript
// Basic route with validation
fastify.route({
  method: 'GET',
  url: '/api/icons/:id',
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          data: { type: 'string' }
        }
      }
    }
  },
  handler: async (request, reply) => {
    const icon = await prisma.icon.findUnique({
      where: { id: request.params.id }
    });
    return icon;
  }
});

// Use plugins for common functionality
await fastify.register(require('@fastify/cors'));
await fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'dist')
});
```

### Storage Operations

Always use Prisma Client for database operations:

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Example operations
const icons = await prisma.icon.findMany();
await prisma.icon.create({ data: iconData });

// Always handle cleanup
await prisma.$disconnect();
```

For API-based operations, use the apiStorage module:

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

### Browser Debugging
- **Use Playwright MCP for direct browser access and console debugging**
- When debugging UI issues, checking browser console logs, or needing real browser interaction
- Playwright MCP provides direct access to browser developer tools and console output
- Standard Playwright tests are for automated testing; MCP is for interactive debugging

## Development Workflow

1. Work on feature branches (never commit directly to `main`)
2. **STRICTLY PROHIBITED: Creating temporary files in root directory**
   - All temporary files MUST go in `temp/` directory
   - Test scripts MUST go in `tests/` or `temp/` directory
   - Debug files, experimental code → `temp/` directory only
   - Root directory must remain clean per project structure charter
3. Run tests before committing
4. Use the built-in server for development: `npm start`
5. Clean up temporary files and dead code before merging

### File Organization Rules
- **NEVER create temporary files in root directory**
- Use `temp/` for: debug files, temporary test scripts, experimental code, quick prototypes
- Use `tests/` for: permanent test files that should be committed to repository
- Root directory is for: package.json, config files, documentation only

### When to Use Playwright MCP
Use Playwright MCP when you need direct browser access:
- Debugging UI rendering issues
- Checking browser console logs and errors
- Testing real browser behavior (drag & drop, file uploads)
- Inspecting DOM state and CSS styling
- Interactive debugging sessions

Example use cases:
- "Check if the icon upload is working in the browser"
- "Debug why the PDF generation modal isn't appearing"
- "Inspect console errors when loading icons"
