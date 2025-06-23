# Coding Style Guidelines for Road Trip Bingo

This file provides GitHub Copilot with the coding style and project conventions to follow when generating or suggesting code.

## General Principles

* Follow a consistent 2‑space indentation throughout HTML, CSS, and JavaScript.
* Use UNIX-style line endings (`\n`).
* Limit lines to a maximum of 100 characters.
* Write clear, self‑documenting code; add comments or JSDoc where helpful.

## JavaScript

* Use modern ES6+ features:

  * Declare variables with `const` and `let`; avoid `var`.
  * Prefer arrow functions (`() => {}`) for anonymous functions.
  * Use template literals (`` `Hello ${name}` ``) instead of string concatenation.
  * Use object and array destructuring where appropriate.
  * Prefer `async`/`await` over raw Promises.
* Always end statements with semicolons.
* Use `camelCase` for variables and functions; `PascalCase` for constructor or class names.
* Keep functions small (≤ 30 lines); one responsibility per function.

## HTML

* Include the `<!DOCTYPE html>` declaration and `lang="en"` attribute on `<html>`.
* Use 2‑space indentation.
* Use double quotes for attribute values.
* Keep semantic structure: `<header>`, `<main>`, `<footer>`, `<section>`, `<article>`.
* Link CSS and JS via external files; avoid inline `<style>` or `<script>`.

## CSS

* Use `kebab-case` for class names (e.g., `.icon-manager`, `.bingo-grid`).
* Use CSS variables for repeated values (colors, spacing):

  ```css
  :root {
    --primary-color: #4a90e2;
    --gap-size: 8px;
  }
  ```
* Organize rules in the order: Variables → Reset → Base → Layout → Components → Utilities.
* Limit selectors to a maximum specificity of 3.
* Avoid `!important`.

## Project Conventions

* All front‑end code is vanilla HTML, CSS, and JavaScript; do not introduce frameworks.
* Icons are managed via the Icon Manager; use descriptive `alt` attributes.
* **Data Storage**: Use IndexedDB via `indexedDBStorage.js` module for all persistent data:
  * Store images as binary Blobs (not base64 strings)
  * Use the storage module's methods for get/set/delete operations
  * Always handle storage quota errors gracefully
  * Legacy localStorage code exists in `storage.js` but is deprecated
* **PDF Generation**: Uses `html2pdf.js` with enhanced features:
  * Multiple layout options: one-per-page and two-per-page
  * Compression levels for file size optimization
  * Per-set unique identifiers displayed on every page
  * Support for showing/hiding icon labels
  * Proper aspect ratio preservation for icons
* **Card Generation Features**:
  * **Unique Set Identifiers**: Each bingo card set gets a unique alphanumeric ID
  * **Identical Cards Option**: Toggle to generate same card layout for all players
  * **Multi-Hit Mode**: Configurable difficulty levels for repeated icon marking
  * **Center Blank**: Option to leave center cell blank for odd-sized grids (5x5, 7x7, 9x9)
  * **Icon Distribution**: Same-icons vs different-icons modes for variety control
* **Internationalization**: Full i18n support via `i18n.js` and `languages.js`:
  * Currently supports English and German
  * All UI elements are localized including new features
  * Language selection persists across sessions
* Configuration files should be stored in `/config` directory (e.g., `jest.config.js`, `cypress.config.js`, `webpack.config.js`).

## Key Modules and Architecture

* **Core Modules** (located in `src/js/modules/`):
  * `cardGenerator.js`: Main card generation logic with support for all features
  * `pdfGenerator.js`: Enhanced PDF generation with multiple layouts and compression
  * `indexedDBStorage.js`: Modern storage solution for persistent data
  * `i18n.js`: Internationalization system for multi-language support
  * `languages.js`: Language definitions and translations
  * `imageUtils.js`: Image processing and optimization utilities
* **Feature Modules**:
  * Unique set identifiers: Implemented in `cardGenerator.js` via `generateSetIdentifier()`
  * Identical cards: Controlled by `sameCard` parameter in `generateBingoCards()`
  * Multi-hit mode: Configured through difficulty settings and `multiHitMode` parameter
  * Center blank: Handled by `leaveCenterBlank` parameter for odd-sized grids
* **UI State Management**: 
  * All settings persist via IndexedDB storage
  * UI updates handled through event listeners in `app.js`
  * Dynamic control visibility based on current settings

## Testing

* Use Jest for unit tests; configure via `config/jest.config.js`.
* Place tests in a `tests/` directory mirroring `src/` structure; name files with `.test.js` suffix.
* Write tests using `describe` and `it` blocks; mock IndexedDB and the DOM as needed via `jsdom`.
* For IndexedDB testing, use `fake-indexeddb` library to simulate browser storage.
* **Current Test Coverage**: 112 tests across 9 test suites covering:
  * Card generation logic (including sameCard, multiHit, centerBlank features)
  * PDF generation with all layout options
  * Storage operations (both legacy and IndexedDB)
  * Internationalization system
  * Image utilities and processing
  * Feature-specific test suites for new functionality
* Aim for at least 80% code coverage; coverage reports should output to `coverage/`.
* Provide npm scripts:
  * `npm test`: runs tests once.
  * `npm run test:watch`: runs Jest in watch mode.
* Use Cypress for end-to-end testing:
  * Configure Cypress via `config/cypress.config.js` with `baseUrl` set to `http://localhost:3000`.
  * Organize spec files under `cypress/e2e/` with `.cy.js` suffix.
  * Write tests using `describe`/`it` syntax and Cypress commands (`cy.visit()`, `cy.get()`, etc.).
  * Enable automatic screenshots on test failure and video recording via default Cypress settings.
  * Provide npm scripts:
    * `npm run cypress:open`: opens Cypress Test Runner in interactive mode.
    * `npm run cypress:run`: executes tests headlessly.

---

*This file is automatically included by VS Code when `github.copilot.chat.codeGeneration.useInstructionFiles` is enabled.*