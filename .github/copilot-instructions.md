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
* Store data in `localStorage` under a single namespace: `roadtripBingo`.
* PDF generation uses `html2pdf.js`; ensure imported via CDN in `index.html`.

## Testing

* Use Jest for unit tests; configure via a `jest.config.js` at project root.
* Place tests in a `tests/` directory mirroring `src/` structure; name files with `.test.js` suffix.
* Write tests using `describe` and `it` blocks; mock `localStorage` and the DOM as needed via `jsdom`.
* Aim for at least 80% code coverage; coverage reports should output to `coverage/`.
* Provide npm scripts:
  * `npm test`: runs tests once.
  * `npm run test:watch`: runs Jest in watch mode.
* Use Cypress for end-to-end testing:
  * Configure Cypress via a `cypress.config.js` at project root with `baseUrl` set to `http://localhost:3000`.
  * Organize spec files under `cypress/integration/` with `.spec.js` suffix.
  * Write tests using `describe`/`it` syntax and Cypress commands (`cy.visit()`, `cy.get()`, etc.).
  * Enable automatic screenshots on test failure and video recording via default Cypress settings.
  * Provide npm scripts:
    * `npm run cypress:open`: opens Cypress Test Runner in interactive mode.
    * `npm run cypress:run`: executes tests headlessly.

---

*This file is automatically included by VS Code when `github.copilot.chat.codeGeneration.useInstructionFiles` is enabled.*