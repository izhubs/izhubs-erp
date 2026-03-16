---
name: conductor-status
description: Display project status, active tracks, and next actions. Use at start of every session or when user asks "what's the status?" or "what are we working on?"
triggers:
  - project status
  - what are we working on
  - show tracks
  - status
  - morning start
---

# Conductor: Status

## Purpose
Give a complete snapshot of the project state — what's in progress, what's blocked, what's next.

## When to Use
- At the start of every work session (called by /morning-start)
- When user asks about project status
- Before planning a new feature

## Process

### Step 1: Read Status File
Read `.agent/tracks/STATUS.md` to get all tracks.

### Step 2: Scan Track SPECs
For each track with status `in-progress` or `planning`, read its `SPEC.md` and check which phases are done.

### Step 3: Display Dashboard

Format output as:

```
## 🎯 Project Status — [date]

**Phase**: [current phase from memory.md]
**Health**: [TypeScript / tests status]

### 🔥 Active Tracks
| Track | Status | Phase | Next Action |
|-------|--------|-------|-------------|
| [name] | in-progress | Phase 2/4 | [specific next step] |

### 📋 Backlog
| Track | Priority | Notes |
|-------|----------|-------|

### ✅ Recently Completed
| Track | Completed | Summary |
|-------|-----------|---------|
```

### Step 4: Suggest Next Action
Based on status, recommend:
- Which track to continue (highest priority in-progress)
- Any blocked items that need decisions
- Whether to start a new track

## Notes
- If `.agent/tracks/STATUS.md` doesn't exist, create it with headers only
- This skill is called automatically by /morning-start workflow
