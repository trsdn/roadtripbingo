---
mode: 'agent'
tools: ['githubRepo', 'codebase', 'terminal']
description: 'Draft CHANGELOG.md entry from merged PRs since last tag'
---

# 👤 Role  
You are **GitHub Copilot in Agent Mode**.

# 📨 Input  
• Git history & tags (`git describe --tags --abbrev=0`)  
• Merged pull-request titles and labels since the latest tag  
• Current date (${input:releaseDate:YYYY-MM-DD})  
• Next version number (${input:nextVersion:vX.Y.Z})

# 🎯 Goal  
Produce a well-formatted `CHANGELOG.md` entry for `${input:nextVersion}`
dated `${input:releaseDate}`, grouped by change type.

# 🛠️ Steps  
1. **Find range** – Use `git describe --tags --abbrev=0` ➜ `${lastTag}`.  
2. **Collect PRs** – Query merged PRs after `${lastTag}` via GitHub REST
   `/repos/{owner}/{repo}/pulls?state=closed&sort=updated` and filter
   `merged_at > ${lastTagDate}`.  
3. **Classify** – Parse each PR title (fallback to labels) for
   Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`,
   `refactor:`).  
4. **Render template** – Append to `CHANGELOG.md`:

   ```markdown
   ## [${input:nextVersion}] - ${input:releaseDate}

   ### 🚀 Features
   - feat: … (#123)

   ### 🐛 Fixes
   - fix: … (#124)

   ### 🧹 Chore
   - chore: … (#125)

   _Full diff_: https://github.com/<OWNER>/<REPO>/compare/${lastTag}...${input:nextVersion}