# Road Trip Bingo Generator 2.0

A modern, AI-powered bingo card generator built with React. Create intelligent, customizable bingo cards for your next road trip adventure with advanced features like AI-powered icon suggestions, semantic search, and batch upload capabilities.

## 🚀 New in Version 2.0

### 🤖 AI-Powered Features
- **Smart Icon Analysis**: AI automatically suggests names, tags, and difficulty levels for uploaded images
- **Semantic Search**: Find icons using natural language and context understanding
- **Intelligent Suggestions**: Get alternative icon recommendations for balanced card generation

### 📱 Modern UI/UX
- **React 18 Architecture**: Built with modern React hooks and components
- **Drag & Drop Upload**: Batch upload multiple icons with progress tracking
- **Advanced Filtering**: Search and filter icons by difficulty, tags, and semantic similarity
- **Real-time Preview**: Instant feedback with loading states and progress indicators

### 🎯 Enhanced Functionality
- **Batch Operations**: Upload and process multiple icons simultaneously
- **Tag Management**: Comprehensive tagging system with AI-generated suggestions
- **Comprehensive Backup**: Full data backup and restore with selective import/export options
- **Error Boundaries**: Robust error handling with graceful fallbacks

## ✨ Features

### Core Functionality
- **Multiple Grid Sizes**: Generate cards from 3x3 to 8x8 grids
- **Center Blank Toggle**: Traditional bingo experience for odd-sized grids
- **Icon Labels**: Show/hide text labels for clean card appearance
- **Multi-Hit Mode**: Advanced challenge mode with 3 difficulty levels
- **PDF Generation**: High-quality PDF export with compression options
- **Multi-language Support**: English and German localization

### AI & Intelligence
- **Image Analysis**: Automatic content recognition and metadata generation
- **Smart Search**: Context-aware search with synonym recognition
- **Alternative Suggestions**: Intelligent icon recommendations for variety
- **Batch Processing**: AI-enhanced bulk icon management

### Data Management
- **SQLite Database**: Robust, ACID-compliant data storage
- **RESTful API**: Clean server-side architecture with Fastify
- **Prisma ORM**: Type-safe database operations
- **Automatic Migration**: Seamless upgrade from legacy storage systems
- **Comprehensive Backup**: JSON and SQL export/import capabilities

## 🏗️ Architecture

Built with modern web technologies:

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Fastify + Prisma ORM
- **Database**: SQLite with versioned migrations
- **Testing**: Vitest (unit) + Playwright (E2E)
- **AI Integration**: Modular service architecture ready for production APIs
- **Build Tools**: Vite with HMR and optimized production builds

### Project Structure

```
roadtripbingo/
├── src/                      # React application
│   ├── components/           # Reusable React components
│   │   ├── AiSuggestionsPanel.jsx    # AI-powered suggestions
│   │   ├── BatchIconUploadModal.jsx  # Batch upload interface
│   │   ├── DragDropUpload.jsx        # Drag & drop functionality
│   │   ├── IconSearch.jsx            # Advanced search & filtering
│   │   ├── BingoCard.jsx             # Card generation & preview
│   │   ├── Navigation.jsx            # App navigation
│   │   ├── ErrorBoundary.jsx         # Error handling
│   │   └── ...                       # Other components
│   ├── pages/                # Main application pages
│   │   ├── Generator.jsx             # Card generation interface
│   │   ├── Icons.jsx                 # Icon management
│   │   ├── Settings.jsx              # App configuration
│   │   └── Backup.jsx                # Data backup/restore
│   ├── services/             # Business logic services
│   │   ├── aiService.js              # AI integration & analysis
│   │   ├── iconService.js            # Icon CRUD operations
│   │   ├── settingsService.js        # Settings management
│   │   ├── backupService.js          # Backup/restore logic
│   │   ├── pdfGenerator.js           # PDF generation
│   │   └── imageUtils.js             # Image processing
│   ├── hooks/                # Custom React hooks
│   ├── context/              # React context providers
│   └── main.jsx              # Application entry point
├── server/                   # Fastify backend
│   ├── routes/               # API route handlers
│   ├── plugins/              # Fastify plugins
│   └── index.js              # Server entry point
├── prisma/                   # Database configuration
│   └── schema.prisma         # Database schema definition
├── tests/                    # Test suites
│   ├── unit/                 # Vitest unit tests
│   └── e2e/                  # Playwright E2E tests
└── data/                     # SQLite database storage
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/roadtripbingo.git
cd roadtripbingo

# Install dependencies
npm install

# Initialize the database
npx prisma generate
npx prisma db push
```

### Development Commands

```bash
# Start development server with HMR (port 3000)
npm run dev

# Start backend API server (port 8080)
npm run server

# Build for production
npm run build

# Build for development
npm run build:dev
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Apply schema changes
npx prisma db push

# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm test              # Run tests once with coverage
npm run test:watch    # Run tests in watch mode
npx vitest run        # Run Vitest directly
```

### E2E Tests (Playwright)

```bash
npm run playwright:test         # Run all E2E tests
npm run playwright:test:headed  # Run with browser UI
npm run playwright:test:debug   # Interactive debugging mode
npm run playwright:show-report  # View test results
```

### Run All Tests

```bash
npm run test:all      # Run both unit and E2E tests
```

## 🤖 AI Integration

The application includes a modular AI service architecture:

### Current Features
- **Mock AI Service**: Complete implementation for development and testing
- **Image Analysis**: Content recognition with confidence scoring
- **Semantic Search**: Context-aware icon discovery
- **Smart Suggestions**: Alternative icon recommendations

### Production Setup
To integrate with production AI services (OpenAI, Google Vision, etc.):

1. Update `src/services/aiService.js`
2. Add API keys to environment variables
3. Configure service endpoints
4. Enable production AI features in settings

### AI Service API

```javascript
// Analyze uploaded image
const analysis = await aiService.analyzeIcon(imageData);

// Enhanced search with semantic understanding
const results = await aiService.enhancedSearch(icons, query);

// Get alternative suggestions
const alternatives = await aiService.suggestAlternatives(currentIcons, allIcons);
```

## 📱 Usage

### Basic Workflow

1. **Upload Icons**: Use drag & drop or batch upload with AI suggestions
2. **Organize**: Tag and categorize icons with AI-generated metadata
3. **Generate Cards**: Create customized bingo cards with various options
4. **Export**: Download high-quality PDFs for printing

### Advanced Features

- **AI Suggestions**: Let AI analyze images and suggest names/tags
- **Semantic Search**: Find icons using natural language queries
- **Batch Processing**: Upload multiple icons with automated processing
- **Smart Alternatives**: Get AI-recommended icon variations for better gameplay

### Settings & Configuration

- **Generator Defaults**: Set preferred grid size, difficulty, and options
- **AI Features**: Enable/disable AI-powered suggestions and search
- **Backup/Restore**: Manage data with comprehensive backup tools
- **Language**: Switch between English and German interfaces

## 🔄 Migration from v1.x

Version 2.0 automatically migrates data from the legacy vanilla JavaScript version:

- **Automatic Detection**: Identifies existing IndexedDB or localStorage data
- **Seamless Transfer**: Migrates all icons, settings, and card generations
- **Data Validation**: Ensures data integrity throughout migration
- **Backup Creation**: Creates backup of original data before migration

No manual action required - just start the application and migration happens automatically.

## 🌐 API Endpoints

The Fastify backend provides RESTful APIs:

### Icons
- `GET /api/icons` - List all icons
- `POST /api/icons` - Create new icon
- `PUT /api/icons/:id` - Update icon
- `DELETE /api/icons/:id` - Delete icon

### Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings (batch)
- `PUT /api/settings/:key` - Update single setting

### Backup/Export
- `GET /api/backup` - Export all data
- `POST /api/backup/import` - Import backup data
- `GET /api/storage/info` - Get storage statistics

## 🎨 Styling & Theming

The application uses Tailwind CSS with a custom design system:

- **Component Classes**: Pre-defined classes for buttons, cards, inputs
- **Color Scheme**: Custom primary/secondary color palette
- **Responsive Design**: Mobile-first responsive breakpoints
- **Dark Mode Ready**: Architecture supports future dark mode implementation

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`

**Database Issues**
- Regenerate Prisma client: `npx prisma generate`
- Reset database: `rm data/roadtripbingo.db && npx prisma db push`

**Development Server**
- Check port availability (3000 for frontend, 8080 for backend)
- Ensure both servers are running for full functionality

### Getting Help

- Check the [Issues](https://github.com/yourusername/roadtripbingo/issues) page
- Review the test files for usage examples
- Examine the `CLAUDE.md` file for development guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm run test:all`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

MIT License - see the [LICENSE](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- AI integration architecture inspired by modern AI/ML workflows
- PDF generation powered by html2pdf.js
- Database management with Prisma ORM
- Testing with Vitest and Playwright

---

**Road Trip Bingo Generator 2.0** - Making road trips more fun with AI-powered customization! 🚗✨