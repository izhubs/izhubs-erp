---
name: conductor-new-track
description: Create a new feature track with specification and phased implementation plan. Use when user describes a new feature/task in vague terms — this skill forces clarification before any code is written.
triggers:
  - new feature
  - new track
  - tôi muốn làm
  - tôi muốn có
  - add feature
  - implement
  - build
---

# Conductor: New Track

## Purpose
Before writing any code, create a **track spec** that clarifies *exactly* what will be built. This prevents scope creep and gives AI full context across sessions.

## When to Use
Whenever a user describes something to build — even vaguely. Examples:
- "Tôi muốn có dashboard báo cáo doanh thu tháng"
- "Add a customer import feature"
- "Build notification system"

## Process

### Step 1: Clarify the Idea
Ask the user these questions (only the ones not already answered):

**Mô tả chức năng:**
1. **Who** uses this? (Which user role: admin, member, viewer?)
2. **What** exactly do they see/do? (UI, flow, actions)
3. **When** is this triggered? (On demand, scheduled, event-driven?)
4. **Where** does data come from/go? (Which DB tables, APIs?)
5. **Why** is this needed? (Business value, pain point solved)

**Technical scope:**
6. Which existing modules does this touch?
7. Any new DB migrations needed?
8. Any new API endpoints?
9. Performance constraints? (Expected data volume)
10. Any edge cases or error states to handle?

### Step 2: Create Track Spec File
Create: `.agent/tracks/[YYYY-MM-DD]-[feature-slug]/SPEC.md`

```markdown
# Track: [Feature Name]
**Created**: [date]
**Status**: planning | in-progress | review | done | archived
**Priority**: high | medium | low

## Summary
[1-2 sentence description of what this does and why]

## User Stories
- As a [role], I want to [action] so that [benefit]
- ...

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- ...

## Technical Plan

### DB Changes
- New table: `table_name` (columns...)
- Modified table: `existing_table` (add column: `col_name`)
- Migration: `00X_description.sql`

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/... | withPermission('x:read') | ... |

### UI Components
- Page: `app/(dashboard)/[path]/page.tsx`
- Components: ...

### Engine Functions
- `core/engine/[module].ts`: new functions...

## Implementation Phases
- [ ] Phase 1: DB migration + engine layer
- [ ] Phase 2: API endpoints
- [ ] Phase 3: UI
- [ ] Phase 4: Tests

## Out of Scope
- [Explicitly list what is NOT included]

## Open Questions
- [ ] Question 1?
```

### Step 3: Update Conductor Status
Append to `.agent/tracks/STATUS.md`:
```markdown
| [date] | [feature-slug] | planning | [brief description] |
```

### Step 4: Add to memory.md
Under `## Active Backlog`, add the new track.

## Rules
- **Never write code without a SPEC.md first**
- Out of Scope section is mandatory — prevents scope creep
- Acceptance Criteria must be testable (binary: pass/fail)
- If user can't answer Step 1 questions, help them think through it before proceeding
