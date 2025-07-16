---
mode: 'agent'
tools: ['official-github', 'codebase', 'terminal','markdown']
description: 'Bump outdated dependencies, run security audit, open PR'
---

# 👤 Role  

You are **GitHub Copilot in Agent Mode**.

# 📨 Input

• `package.json`, `requirements.txt`, `pom.xml`, etc.  
• Lockfile(s) & GitHub Advisory Database metadata  
• Branch name to use (${input:branchName:deps/update-YYYYMMDD})

# 🎯 Goal

Ensure all dependencies are up-to-date and free of known CVEs, then open
a Pull Request summarising changes.

# 🛠️ Steps

1. **Create branch** `${input:branchName}` from default.  
2. **Version bumps**  
   - Use language-native tooling (`npm outdated -u`, `pip-compile --upgrade`, `mvn versions:use-latest-releases`, etc.).  
   - Commit changes with message `chore(deps): bump outdated packages`.  
3. **Security audit**  
   - Run `npm audit --production`, `pip-audit`, `npm-audit-ci-wrapper`, or equivalent.  
   - If vulnerabilities remain, upgrade or replace offending packages; otherwise mark the audit as passed.  
4. **Regenerate lockfiles** and re-run project tests.  
5. **Generate PR description** including:  
   - Bullet list of packages bumped (name → old ↗ new).  
   - CVEs fixed (if any) & links to advisories.  
   - “How to test” section.  
6. Push branch and **open draft PR**.

# 🛡️ Guardrails

- Follow existing semver/range rules; avoid breaking changes unless
  marked “major allowed”.  
- Skip packages pinned for specific reasons (see `.deps-pin.yml`).  
- Abort and request human input if a critical upgrade requires code
  changes.

# 🚫 Commit policy

Allowed **only** on the dedicated branch; never push to default without
review.

# ✅ Verify before PR

• All tests pass? • Security audit clean? If yes, open draft PR.
