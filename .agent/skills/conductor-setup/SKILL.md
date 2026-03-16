---
name: conductor-setup
description: One-time setup to initialize the Conductor project management methodology. Run once to create the tracks directory, STATUS.md, and migrate existing backlog items into tracks.
triggers:
  - setup conductor
  - initialize tracks
  - conductor setup
---

# Conductor: Setup

## Purpose
Initialize the Conductor track system for izhubs-erp. Run this once.

## Steps

### 1. Create tracks directory structure
```
.agent/
  tracks/
    STATUS.md          ← master status board
    archive/           ← completed/paused tracks
    [date]-[slug]/
      SPEC.md          ← track specification
```

### 2. Create STATUS.md
```markdown
# Track Status Board
_Last updated: [date]_

| Date Created | Slug | Status | Description |
|---|---|---|---|
```

### 3. Migrate existing backlog
For each item in `memory.md → ## Active Backlog`, create a minimal track:
- Create folder `.agent/tracks/[today]-[slug]/`
- Create `SPEC.md` with status `planning` and brief description
- Add to STATUS.md

### 4. Update AGENTS.md
Add to skills section:
```markdown
- `conductor-new-track` — Create feature spec before coding
- `conductor-status` — View all active tracks
- `conductor-manage` — Archive/restore/complete tracks
- `conductor-validator` — Validate track artifacts
```

### 5. Verify
Run conductor-status to confirm everything looks correct.

## izhubs-erp Initial Backlog to Migrate
From memory.md:
- Pipeline Kanban view (high)
- Custom Fields UI (high)
- Global search ⌘K (v0.2)
- Import pipeline (v0.2)
- API Key system (v0.2)
- Document Hub (v0.3)
- AI chatbot (v0.3)
- Automation engine (v0.3)
