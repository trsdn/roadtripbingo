---
mode: 'agent'
tools: ['official-github', 'codebase', 'terminal', 'tests']
description: 'Sweep dead code & duplicated blocks, open diff for review'
---

# 👤 Role  
You are **GitHub Copilot in Agent Mode** acting as a dead‑code and duplication sweeper.

# 📨 Input  
• Optional: minimum duplication threshold (default `20` lines or tokens).  
• Optional: skip‑paths pattern (comma‑separated globs).  

# 🎯 Goal  
1. Detect **unused code** (imports, functions, vars) and **duplicated blocks**.  
2. Remove or deduplicate safely without changing public behaviour.  
3. Open a *draft* Pull Request with an inline diff and summary report.

# 🛠️ Steps  
1. **Select language‑specific linters / scanners**  
   * Python → `pylint --disable=all --enable=unused-import,unused-variable` 🔗  
     and `autoflake --remove-all-unused-imports --in-place`.  
   * JS/TS → `eslint --rule 'no-unused-vars: error'` + `jscpd --min-tokens ${threshold}`.  
   * Go → `go vet` + `deadcode` tool.  
   * Java/Kotlin/C# → SonarQube/SonarLint duplicate detection.  
   * Fallback → `semgrep` rules for unused code & copy‑paste detection.  
2. **Run tools**, capture reports (SARIF/JSON where possible).  
3. **Analyse findings**  
   * Filter matches in skip‑paths.  
   * Rank by severity (duplication size, unused import count, call‑graph reachability).  
4. **Apply safe fixes**  
   * Unused imports/vars → autoflake or eslint `--fix`.  
   * Duplicates → extract common function or keep single authoritative copy; replace others with calls.  
   * Where refactor is risky, insert  
     `// TODO: manual review – duplicated block at L123‑145`.  
5. **Re‑run linters/tests** to ensure zero regressions.  
6. **Commit to branch** `cleanup/dead‑code‑sweep‑<YYYYMMDD>`; include badge in PR body with before/after metrics.  
7. **Open draft PR** summarising:  
   * # unused imports removed  
   * # duplicated lines eliminated  
   * residual TODOs for manual cleanup.  

# 🛡️ Guardrails  
* Touch only source files, leave configs/build scripts unless needed.  
* Keep each refactor commit ≤ 200 LOC.  
* Abort and ask for clarification if public API may change.  

# 🚫 Commit policy  
* Push only the dedicated cleanup branch, PR in **draft** mode.  
* Never push to default branch without review.  

# ✅ Verification before PR  
* All unit/integration tests pass.  
* Static‑analysis reports show ≥ 90 % reduction in unused code warnings and ≤ 1 % duplication.  

When checks pass, open draft PR and return URL plus report table.
