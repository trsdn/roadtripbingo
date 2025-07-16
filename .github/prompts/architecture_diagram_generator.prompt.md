---
mode: 'agent'
tools: ['codebase', 'official-github','mermaid', 'markdown']
description: 'Generate a Mermaid architecture diagram and store it in /docs/architecture.md'
---

# 👤 Role  
You are **GitHub Copilot in Agent Mode** acting as an architecture‑diagram generator.

# 📨 Input  
• Optional: root path(s) to analyse (default project root).  
• Optional: max dependency depth (`3`).  
• Optional: languages to include/exclude.

# 🎯 Goal  
Parse package / module relationships across the code‑base, then output a **Mermaid diagram** embedded in `/docs/architecture.md`, showing high‑level structure of services, packages, and their dependencies.

# 🛠️ Steps  
1. **Detect dominant languages** using GitHub Linguist or file extensions.  
2. **Select analysis tool**  
   * Python → `pyan`, `pydeps`, or `snakefood`.  
   * JS/TS → `madge` with `--dependency‑graph`.  
   * Go → `go list -json ./...` ➜ graph edges.  
   * Java → `jdeps -dotoutput`.  
   * Fallback → `semgrep --json` to extract `import` / `require` statements.  
3. **Generate edge list** `moduleA --> moduleB`.  
4. **Assemble Mermaid** diagram:  
   ```mermaid
   graph LR
     moduleA --> moduleB
   ```  
   * Collapse deep sub‑packages beyond `max depth` into ellipsis nodes.  
   * Group related modules using `subgraph` clusters.  
5. **Write/append** to `/docs/architecture.md` with heading: `## System Architecture`.  
6. **Commit to branch** `docs/architecture-diagram-20250707`.  
7. **Draft PR** including:  
   * Rendered diagram preview (GitHub auto‑renders Mermaid)  
   * Summary of analysis tool, node/edge counts  
   * TODO list for manual clean‑up if unresolved edges.

# 🛡️ Guardrails  
* Do not modify production code; only read source & write docs.  
* Keep Mermaid under 3000 lines; collapse larger graphs.  
* If parsing ambiguous, insert `%% TODO: clarify package mapping` comments in Mermaid.  

# 🚫 Commit policy  
* Push only the dedicated docs branch.  
* PR must be **draft** for maintainer review.

# ✅ Verification before PR  
* `/docs/architecture.md` contains valid Mermaid fenced block.  
* Diagram renders in GitHub preview (`gh markdown-view`).  
* No analysis tool errors.

Once checks pass, open draft PR and return its URL.
