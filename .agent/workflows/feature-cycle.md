---
description: Start, build, and ship a complete feature cycle
---

# Feature Cycle Workflow

> Replaces time-boxed sprints. A cycle = one shippable feature, done completely before starting the next.
> AI builds fast — the constraint is quality and architecture, not time.

## When to use
Any time the user says:
- "I want to add [feature]"
- "Let's work on [module]"
- "Build [thing]"

---

## Phase 1 — Understand

1. Read `.agent/memory.md` — understand current state and backlog
2. Read `.agent/skills/erp-architecture.md` — confirm this feature fits the architecture
3. Ask ONE clarifying question if scope is unclear (don't ask multiple)
4. Define the feature in one sentence: *"This adds X so that users can Y"*

## Phase 2 — Plan (2 minutes, not 2 hours)

5. List files that will be created or modified (max 10 lines)
6. Identify which existing patterns to follow (entity? API route? module?)
7. Write the contract test FIRST (what should be true when done?)

## Phase 3 — Build

8. Follow the relevant skill guide:
   - New entity → `.agent/skills/add-entity.md`
   - DB change → `.agent/skills/migration-guide.md`
   - Architecture question → `.agent/skills/erp-architecture.md`
9. Write implementation
10. Run `npx tsc --noEmit` — must be clean before continuing

## Phase 4 — Test

11. Run contract tests: `npm run test:contracts`
12. Run unit tests for touched files: `npm run test:unit`
13. Do a quick manual review of the feature behavior

## Phase 5 — Ship

14. Use `@commit-push` workflow to commit and push
15. **Update `.agent/memory.md`** — required before closing the cycle:
    - Move feature from `Active Backlog` → `What's Done`
    - Update `Last updated` date and `Last commit` hash
    - Note any new decisions, constraints, or follow-up items in backlog
    - Keep file under 200 lines (archive old sessions if needed)

## Phase 6 — Reset

16. Confirm with user: *"Feature shipped. What's next?"*
17. Do NOT start the next feature without explicit confirmation — avoid feature creep

---

## Quality gates — never skip

- [ ] TypeScript clean (`tsc --noEmit`)
- [ ] Contract tests pass
- [ ] No direct DB access from extensions
- [ ] No breaking changes to Core API without version bump
- [ ] memory.md updated
