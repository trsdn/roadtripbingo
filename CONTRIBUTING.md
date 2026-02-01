# Contributing to Road Trip Bingo

Thank you for your interest in contributing to Road Trip Bingo! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/roadtripbingo.git
   cd roadtripbingo
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment** (if needed):
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the Project

```bash
# Development server with hot reload
npm run dev

# Simple HTTP server
npm start

# Build for production
npm run build
```

## Development Workflow

### Branching Strategy

1. **Never commit directly to `main`**
2. Create feature branches from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```
3. Use descriptive branch names:
   - `feature/multi-language-support`
   - `fix/pdf-generation-bug`
   - `docs/update-readme`

### Making Changes

1. **Make focused commits** - Each commit should address one logical change
2. **Write clear commit messages**:
   ```
   Short summary (50 chars or less)

   More detailed explanation if needed. Wrap at 72 characters.
   
   - Bullet points are okay
   - Reference issues: Fixes #123
   ```
3. **Test your changes** before committing
4. **Keep your branch up to date**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

## Coding Standards

### JavaScript

- **Use ES6+ features**: const/let, arrow functions, template literals, destructuring, async/await
- **Indentation**: 2 spaces (no tabs)
- **Line length**: Maximum 100 characters
- **Function length**: Aim for ≤ 30 lines per function
- **Naming conventions**:
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants
- **No frameworks**: Vanilla JavaScript only

### Code Organization

```javascript
// Good: Small, focused functions with JSDoc
/**
 * Validates an icon object for required fields
 * @param {Object} icon - The icon to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateIcon(icon) {
  if (!icon || !icon.name || !icon.imageData) {
    return false;
  }
  return true;
}

// Bad: Large function without documentation
function processIcon(icon) {
  // 50+ lines of code without documentation
}
```

### HTML/CSS

- **Semantic HTML**: Use `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`
- **Double-quoted attributes**: `class="my-class"` not `class='my-class'`
- **CSS class names**: kebab-case (`bingo-card`, not `bingoCard`)
- **CSS variables**: Define shared values in `:root`
- **Avoid `!important`**: Keep selector specificity ≤ 3

### Documentation

- **Add JSDoc comments** to all public functions
- **Update README.md** if adding features or changing behavior
- **Document complex logic** with inline comments
- **Keep CLAUDE.md updated** with development patterns

### Error Handling

```javascript
// Use structured logging with context
console.error('Storage operation failed:', { 
  operation: 'saveIcon', 
  error: error.message,
  iconId: icon.id 
});

// Provide user-friendly error messages
showError('Unable to save icon. Please try again.');
```

## Testing

### Running Tests

```bash
# Run all unit tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run playwright:test

# Run all tests
npm run test:all
```

### Writing Tests

- **Mirror source structure**: Tests in `tests/` should mirror `src/` structure
- **Test coverage**: Aim for ≥ 80% coverage
- **Unit tests**: Use Jest with jsdom environment
- **E2E tests**: Use Playwright (no Cypress)
- **Test one thing**: Each test should verify one behavior

```javascript
// Good test structure
describe('cardGenerator', () => {
  describe('generateCard', () => {
    test('should create card with correct grid size', () => {
      const card = generateCard(5, icons);
      expect(card.cells).toHaveLength(25);
    });

    test('should use unique icons', () => {
      const card = generateCard(5, icons);
      const iconIds = card.cells.map(c => c.iconId);
      const uniqueIds = new Set(iconIds);
      expect(uniqueIds.size).toBe(iconIds.length);
    });
  });
});
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Tests must pass before merging
- No skipped tests without justification

## Submitting Changes

### Before Submitting

1. **Run all tests**: `npm run test:all`
2. **Check for linting errors** (if configured)
3. **Build the project**: `npm run build`
4. **Test manually** in development mode
5. **Review your changes**:
   ```bash
   git diff main
   ```

### Pull Request Process

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Open a Pull Request** on GitHub
3. **Fill out the PR template** completely:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (for UI changes)
4. **Respond to review comments**
5. **Keep PR updated** with main branch

### PR Guidelines

- **Keep PRs focused** - One feature or fix per PR
- **Write clear descriptions** - Explain what and why, not just how
- **Include screenshots** for UI changes
- **Link related issues**: "Fixes #123" or "Closes #456"
- **Be responsive** to feedback
- **Squash commits** if requested before merging

## Reporting Bugs

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with latest version** to ensure bug still exists
3. **Gather information**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (browser, Node version, OS)
   - Screenshots or error messages

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g., Chrome 98, Firefox 97]
- Node Version: [e.g., 16.14.0]
- OS: [e.g., Windows 10, macOS 12.1]

**Additional context**
Any other relevant information.
```

## Feature Requests

### Proposing New Features

1. **Check existing issues** for similar requests
2. **Open a discussion** before implementing large features
3. **Explain the use case** - Why is this feature needed?
4. **Consider alternatives** - Are there other solutions?
5. **Be willing to implement** - Can you contribute the feature?

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How you envision the feature working.

**Alternatives Considered**
Other approaches you've considered.

**Additional Context**
Screenshots, mockups, or examples from other projects.
```

## Development Tips

### Temporary Files

- Place temporary files in `/temp/` directory
- They won't be committed (already in `.gitignore`)
- Clean up after yourself

### Database Testing

- Test database files go in `temp/` directory
- Use `sqliteStorage.js` for all data operations
- Clean up test databases in `afterEach` hooks

### Debugging

- Use browser DevTools for frontend debugging
- Check server logs for backend issues
- Test files in `tests/fixtures/` for manual testing

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Review**: Request review from maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Road Trip Bingo! 🚗🎉
