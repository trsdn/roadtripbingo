# Comprehensive Test Suite

This directory contains a comprehensive test suite for the Road Trip Bingo application, covering all aspects of functionality, performance, accessibility, and user experience.

## Test Structure

### 📁 Unit Tests (`tests/unit/`)
Tests for individual components, services, and utilities in isolation.

#### Components (`tests/unit/components/`)
- ✅ **BingoCard.test.jsx** - Bingo card rendering and interaction
- ✅ **Navigation.test.jsx** - Navigation component functionality
- ✅ **LoadingSpinner.test.jsx** - Loading state component
- ✅ **ErrorBoundary.test.jsx** - Error boundary error handling
- ✅ **IconGrid.test.jsx** - Icon grid display and selection

#### Pages (`tests/unit/pages/`)
- ✅ **Generator.test.jsx** - Main generator page with form handling
- ✅ **Icons.test.jsx** - Icon management page with CRUD operations
- ✅ **Settings.test.jsx** - Settings page with preference management
- ✅ **Backup.test.jsx** - Backup and restore functionality

#### Services (`tests/unit/services/`)
- ✅ **aiService.test.jsx** - AI-powered features and analysis
- ✅ **iconService.test.js** - Icon CRUD API operations
- ✅ **cardGenerator.test.js** - Bingo card generation logic
- ✅ **settingsService.test.js** - Settings persistence
- ✅ **imageUtils.test.js** - Image processing and optimization
- ✅ **pdfGenerator.test.js** - PDF generation and formatting
- ✅ **errorHandling.test.js** - Edge cases and error scenarios

#### Hooks (`tests/unit/hooks/`)
- ✅ **useIcons.test.js** - Icon management hook
- ✅ **useSettings.test.js** - Settings management hook

### 📁 Integration Tests (`tests/integration/`)
Tests for interactions between different parts of the system.

- ✅ **api.test.js** - Full API integration with Fastify server
  - Icon CRUD operations with database
  - Settings persistence
  - Error handling and validation

### 📁 End-to-End Tests (`tests/e2e/`)
Full user workflow testing with Playwright.

- ✅ **app.spec.js** - Main application functionality
- ✅ **basic-functionality.spec.js** - Core features
- ✅ **ai-suggestions.spec.js** - AI feature workflows
- ✅ **pdf-generation.spec.js** - PDF export workflows
- ✅ **storage.spec.js** - Data persistence
- ✅ **translation-modal.spec.js** - Translation features

### 📁 Performance Tests (`tests/performance/`)
Performance and stress testing for scalability.

- ✅ **stress.test.js** - High-load scenarios and resource management

### 📁 Accessibility Tests (`tests/accessibility/`)
WCAG compliance and assistive technology support.

- ✅ **a11y.test.jsx** - Comprehensive accessibility testing

### 📁 Test Utilities (`tests/utils/`)
Shared testing utilities and helpers.

- ✅ **testUtils.jsx** - React testing helpers with context providers

## Testing Technologies

### 🧪 **Vitest** - Unit & Integration Testing
- Lightning fast with Vite integration
- Jest-compatible API
- Native ESM support
- Built-in mocking and coverage

### 🎭 **Playwright** - E2E Testing
- Multi-browser support (Chrome, Firefox, Safari)
- Real browser automation
- Visual testing capabilities
- Network interception

### 🎯 **React Testing Library** - Component Testing
- User-centric testing approach
- Accessibility-focused queries
- Integration with jsdom

### ♿ **jest-axe** - Accessibility Testing
- Automated WCAG compliance checking
- Comprehensive a11y rule coverage

## Test Categories

### 🔧 **Functional Tests**
- Component rendering and behavior
- User interaction handling
- State management
- API integration
- Business logic validation

### 🚫 **Error Scenarios**
- Network failures and timeouts
- Invalid data handling
- Edge cases and boundary conditions
- Race conditions
- Memory constraints

### 🚀 **Performance Tests**
- Large dataset handling
- Concurrent operation processing
- Memory leak detection
- Response time validation
- Scalability testing

### ♿ **Accessibility Tests**
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Color contrast validation
- Motor impairment support

### 🔐 **Security Tests**
- Input validation
- Data sanitization
- XSS prevention
- CSRF protection

## Coverage Goals

- **Lines**: ≥ 85%
- **Functions**: ≥ 90%
- **Branches**: ≥ 80%
- **Statements**: ≥ 85%

## Test Quality Standards

### ✅ **Test Characteristics**
- **Independent**: Each test runs in isolation
- **Repeatable**: Consistent results across environments
- **Fast**: Unit tests < 100ms, integration tests < 1s
- **Clear**: Descriptive test names and assertions
- **Comprehensive**: Happy path + edge cases + error scenarios

### 📝 **Test Structure**
```javascript
describe('Component/Service Name', () => {
  describe('Feature Group', () => {
    it('should describe expected behavior', async () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = await performAction(input);
      
      // Assert
      expect(result).toBe(expectedOutcome);
    });
  });
});
```

### 🎯 **Testing Strategy**

#### **Unit Tests** (70% of tests)
- Test individual components in isolation
- Mock external dependencies
- Fast execution (< 100ms per test)
- Focus on business logic and edge cases

#### **Integration Tests** (20% of tests)
- Test component interactions
- Real API calls with test database
- Verify data flow between layers
- Test error propagation

#### **E2E Tests** (10% of tests)
- Test complete user workflows
- Real browser interactions
- Critical path validation
- Cross-browser compatibility

## Running Tests

### 🏃 **Quick Commands**
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all

# Watch mode for development
npm run test:watch

# UI mode for debugging
npm run test:ui
```

### 🎛️ **Advanced Options**
```bash
# Run specific test file
npm test -- tests/unit/components/BingoCard.test.jsx

# Run tests matching pattern
npm test -- --grep "error handling"

# Run tests with specific timeout
npm test -- --timeout 30000

# Generate coverage report
npm run test:coverage -- --coverage.reporter=lcov
```

## Continuous Integration

### 🔄 **Pre-commit Hooks**
- Lint code formatting
- Run affected unit tests
- Type checking
- Security scanning

### 🚀 **CI Pipeline**
1. **Fast Tests** - Unit tests (< 2 minutes)
2. **Integration Tests** - API and database tests (< 5 minutes)  
3. **E2E Tests** - Critical user flows (< 10 minutes)
4. **Performance Tests** - Load and stress tests (< 15 minutes)
5. **Accessibility Tests** - WCAG compliance (< 5 minutes)

### 📊 **Quality Gates**
- Test coverage ≥ 80%
- Zero failing tests
- Zero accessibility violations
- Performance budgets met
- Security scan passes

## Test Data Management

### 🗃️ **Mock Data**
- Realistic test fixtures
- Edge case scenarios
- Consistent across tests
- Isolated per test suite

### 🧹 **Cleanup**
- Database reset between integration tests
- File system cleanup
- Memory leak prevention
- Resource disposal

## Best Practices

### ✨ **Writing Good Tests**
1. **Arrange, Act, Assert** pattern
2. **Single responsibility** per test
3. **Descriptive names** that explain behavior
4. **Independent tests** with no shared state
5. **Mock external dependencies** in unit tests
6. **Test error conditions** not just happy paths

### 🚀 **Performance Tips**
1. **Parallel execution** where possible
2. **Selective test running** for development
3. **Efficient mocking** to reduce setup time
4. **Resource cleanup** to prevent memory leaks
5. **Test data optimization** for faster execution

### 🔧 **Maintenance**
1. **Regular test review** and refactoring
2. **Keep tests up-to-date** with code changes
3. **Remove obsolete tests** after refactoring
4. **Update dependencies** for security and features
5. **Monitor test performance** and optimize slow tests

## Debugging Tests

### 🐛 **Common Issues**
- **Async timing** - Use proper awaits and timeouts
- **DOM cleanup** - Ensure proper component unmounting
- **Mock persistence** - Clear mocks between tests
- **Context providers** - Wrap components properly
- **Network mocking** - Consistent mock responses

### 🔍 **Debugging Tools**
- **Vitest UI** - Interactive test debugging
- **React DevTools** - Component inspection
- **Playwright Inspector** - E2E test debugging
- **Coverage Reports** - Identify untested code
- **Performance Profiler** - Find slow tests

This comprehensive test suite ensures high code quality, reliability, and user experience across the entire Road Trip Bingo application.