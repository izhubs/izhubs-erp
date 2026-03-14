---
description: safely commit and push changes to git
---
// turbo
1. Run: npm run test:contracts → STOP if any contract test fails, fix first
// turbo
2. Run: npm test → all tests must pass
// turbo
3. Run: npm run typecheck → no TypeScript errors
// turbo
4. Run: git diff --stat → review what changed
5. Write commit message following convention: "type(scope): description"
   Types: feat | fix | chore | docs | refactor | test
   Example: "feat(crm): add deal stage filtering"
// turbo
6. Run: git add -A && git commit -m "[message]"
7. Ask: "Push to main or create a new branch?"
// turbo (if main)
8. Run: git push origin main
// turbo
9. Update .agent/memory.md → log what was committed and any important notes
