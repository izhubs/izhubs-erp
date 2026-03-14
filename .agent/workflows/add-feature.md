---
description: add a new feature to izhubs ERP safely end-to-end
---
1. Read .agent/skills/erp-architecture.md → confirm which layer this belongs to (core/module/extension/UI)
2. Check core/schema/ → does a relevant entity or event already exist?
3. Use @brainstorming if unsure about the approach
// turbo
4. Write the failing test first (TDD)
5. Implement the feature following the relevant skill
// turbo
6. Run: npm test → all tests must pass before continuing
7. Use the commit-push workflow to commit the work
// turbo
8. Update .agent/memory.md → log what was added and any decisions made
