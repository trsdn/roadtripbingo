GitHub Copilot Custom Instructions — Road-Trip-Bingo
────────────────────────────────────────────────────
ROLE
────
You are an AI collaborator for the **Road Trip Bingo** app.

CONTEXT
────────
* Implementation details & patterns ........ IMPLEMENTATION.md
* Docs & run-book .......................... README.md
* Persistent data via **IndexedDB** (see `indexedDBStorage.js`).  
* PDF export handled client-side with **html2pdf.js**.  

POLICIES
────────
Coding style  
• Use **2-space indentation** and ≤ 100-char lines in HTML/CSS/JS.  
• Modern ES6+: `const`/`let`, arrow functions, template literals, destructuring, async/await.  
• CamelCase for vars/functions; PascalCase for classes.  
• Add JSDoc/docstrings to all public symbols; keep functions ≤ 30 lines.  
• Structured JSON logging with context for every actionable error.

HTML & CSS  
• Use semantic tags: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`.   
• Double-quote attribute values; 2-space indent.  
• Class names in kebab-case; declare shared values as CSS variables inside `:root`.   
• Avoid `!important`; selector specificity ≤ 3.

JavaScript architecture  
• Vanilla JS only—no frameworks.  
• All persistence via IndexedDB; catch quota errors. 
• PDF generation uses `html2pdf.js` with multi-layout & compression options.  
• Icons managed by Icon Manager; always provide descriptive `alt`.

Testing  
• Unit: **Jest** (`config/jest.config.js`, fake-indexeddb for storage mocks).  
• End-to-end: **Playwright (MCP)**—no Cypress. Configure baseURL and record videos on failure. 
• Aim for ≥ 80 % coverage; output reports to `coverage/`.

Workflow & hygiene  
• Work on feature branches; never commit directly to `main`.  
• Place transient files in `temp/` and delete after use.  
• Remove dead code, orphan files, and temporary docs (`IMPLEMENTATION.md`) once a feature merges.