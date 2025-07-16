---
mode: 'agent'
tools: ['official-github', 'codebase','markdown']
description: 'Draft or update a Project Charter markdown file'
---

# 🎯 Your Goal  

Create (or update) **/docs/project-charter.md** so that it complies with the template below and is fully populated with project-specific details.  
*If any placeholder data is missing or unclear, pause and ask follow-up questions before proceeding.*

## 📋 Step-by-step tasks  

- [ ] Scan the workspace for an existing `project-charter.md`; if found, load its contents.  
- [ ] Parse existing charter sections to understand current purpose, scope, and roles.  
- [ ] Insert or update the following sections in the exact order shown under **Template**.  
- [ ] For each “🔶 TODO” placeholder, attempt to infer the correct value from repository context; if uncertain, ask the user.  
- [ ] Run project tests (`npm test`, `pytest`, etc.) if the charter specifies deliverables that include code changes.  
- [ ] Save the updated file and show a diff.  
- [ ] Present a one-paragraph summary of changes and list any open “Clarify” items.  

## 🖋️ Template  

Replace every “🔶 TODO” with concrete information.

```markdown
# Project Charter – ${input:projectName:🔶 TODO Project Name}

## Purpose / Business Case  
🔶 TODO – one or two sentences explaining why this project exists.

## Objectives & Success Criteria  
- 🔶 TODO objective 1 (make SMART)  
- 🔶 TODO objective 2  

## Scope  
**In:**  
- 🔶 TODO high-level deliverables  

**Out:**  
- 🔶 TODO explicit exclusions  

## Stakeholders & Roles  
| Role | Name | Authority / Responsibility |  
|------|------|---------------------------|  
| Sponsor | 🔶 TODO | Signs charter |  
| Project Manager | 🔶 TODO | Executes charter |  
| Core Team | 🔶 TODO | Contributes work |  

## Milestone Schedule  
| Milestone | Target Date (YYYY-MM-DD) | Notes |  
|-----------|--------------------------|-------|  
| Kick-off | 🔶 TODO | charter approved |  
| Beta / MVP | 🔶 TODO | first usable release |  
| Final Release | 🔶 TODO | hand-off to ops |  

## Budget & Resources  
Estimated effort/cost: 🔶 TODO (e.g., 80 person-days / €50 k)  

## Risks, Assumptions, Constraints  
- 🔶 TODO risk 1 – mitigation  
- 🔶 TODO assumption  
- 🔶 TODO constraint  

## Approval  
I hereby authorize the project and commit the required resources.  

| Name | Title | Signature | Date |  
|------|-------|-----------|------|  
| 🔶 TODO | Project Sponsor |  |  |

⛔ Guardrails
- Do not modify files outside /docs/ unless explicitly asked.
- Keep each added line ≤ 80 chars where practical.
- Follow any repository coding-standards referenced in .github/copilot-instructions.md.
- If the charter deviates from these guardrails, surface a ⚠️ Clarify: task instead of guessing.
