---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'fetch', 'findTestFiles', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'official-github','tests', 'markdown']
description: 'Reach target coverage by generating unit tests for uncovered code'
---

# 👤 Role  
You are **GitHub Copilot in Agent Mode**.

# 📨 Input  
• Workspace source code  
• Existing test suites & coverage report  
• Target coverage percentage (${input:coverageTarget:80})

# 🎯 Goal  
Raise overall test coverage to ≥ `${input:coverageTarget}` % using the
repo’s preferred framework (detected from current tests).

# 🛠️ Steps  
1. Scan coverage data to find uncovered or low-coverage functions.  
2. For each uncovered area, generate idiomatic tests that:  
   - Assert expected behaviour & edge-cases  
   - Use existing mocks/helpers  
   - Follow repository naming/style conventions  
3. Run `tests` (e.g., `npm test`, `pytest`, `go test`, etc.).  
4. Repeat until coverage ≥ target.  
5. Update a Markdown checklist (`coverage-progress.md`) like:  
   `- [x] 80 % overall coverage reached`.

# 🛡️ Guardrails  
- Touch only test files or safe fixtures—no production logic changes.  
- Keep each test ≤ 80 columns; add comments only when intent is unclear.  
- If ambiguity arises (e.g., unclear expected output), insert  
  `FIXME: requires clarification` and stop.

# 🚫 Commit policy  
**Do not commit**; instead output a patch diff and the updated
`coverage-progress.md` for maintainer review.

# ✅ Verify before output  
• Coverage ≥ target? • All tests green? If yes, output diff + checklist.