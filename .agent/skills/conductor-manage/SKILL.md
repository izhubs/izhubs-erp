---
name: conductor-manage
description: Manage track lifecycle — archive completed tracks, restore, delete, or rename. Use when completing a feature, cleaning up old tracks, or reorganizing.
triggers:
  - archive track
  - close track
  - mark as done
  - delete track
  - rename track
  - track done
---

# Conductor: Manage

## Track Lifecycle

```
planning → in-progress → review → done → archived
                ↓
            blocked (add blocker note)
```

## Commands

### Mark as Done
1. Update SPEC.md: `**Status**: done`
2. Add completion note:
   ```markdown
   ## Completion
   **Completed**: [date]
   **Summary**: [what was shipped]
   **PR/Commit**: [hash]
   ```
3. Update `.agent/tracks/STATUS.md` row
4. Move folder to `.agent/tracks/archive/[folder-name]`
5. Update `memory.md` — move from Active Backlog to What's Done

### Archive (without completing)
Used for deprioritized or paused tracks:
1. Update SPEC.md: `**Status**: archived`
2. Add archive reason:
   ```markdown
   ## Archive Reason
   [why paused/cancelled]
   ```
3. Move to `.agent/tracks/archive/`

### Restore
1. Move folder back from `archive/` to `tracks/`
2. Update status to `planning` or `in-progress`
3. Update STATUS.md

### Rename
1. Rename folder
2. Update STATUS.md row
3. Update any references in memory.md

## STATUS.md Format
File at `.agent/tracks/STATUS.md`:

```markdown
# Track Status Board

| Date Created | Slug | Status | Description |
|---|---|---|---|
| 2026-03-16 | revenue-dashboard | in-progress | Monthly revenue dashboard for admin |
| 2026-03-14 | custom-fields-ui | planning | UI for managing custom field definitions |
```
