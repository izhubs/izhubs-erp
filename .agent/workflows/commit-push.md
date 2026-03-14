---
description: revert to a previous working state
---
// turbo
1. Run: git log --oneline -10 → show recent commits for user to choose from
2. Ask: "Which commit do you want to roll back to?"
3. Ask: "Hard reset (lose uncommitted changes) or soft reset (keep changes staged)?"
// turbo
4. Run chosen command:
   - Soft: git reset --soft [commit-hash]
   - Hard: git reset --hard [commit-hash]
   - Revert (safer for pushed commits): git revert [commit-hash]
// turbo
5. Update .agent/memory.md → log what was rolled back and why
