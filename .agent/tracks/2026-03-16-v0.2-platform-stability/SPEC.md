# Track: v0.2-platform-stability

**Status:** planning  
**Phase:** v0.2  
**Priority:** First sprint after community launch  
**Risk refs:** risk-register.md #2, #3, #4, #7, #8

---

## Goal

After community launch, users will expose the platform's limits. This sprint hardens the platform to handle real data volumes, customizable pipelines, and production-scale usage.

---

## Scope

### #3 — Dynamic pipeline stages (Options API integration)
**Acceptance criteria:**
- [ ] `getOption('pipeline.stages')` returns array from DB, default = 7 current stages
- [ ] `DealStageSchema` validates dynamically from option value
- [ ] Settings UI allows adding/removing/reordering stages
- [ ] Existing deals with old stages gracefully handled

**Dependency:** Options API engine (`core/engine/options.ts`) must exist first.

---

### #2 — CSV import (async, non-blocking)
**Acceptance criteria:**
- [ ] Upload CSV → returns `jobId` immediately (< 1s)
- [ ] BullMQ processes rows in background
- [ ] `GET /api/v1/import/[jobId]` returns `{ progress, total, errors }`
- [ ] 1000 contacts import in < 60s
- [ ] Duplicate email detection with skip/merge option

---

### #4 — Demo mode isolation
**Acceptance criteria:**
- [ ] Demo org has `is_demo: true` in DB
- [ ] Analytics, reports exclude `is_demo` orgs
- [ ] Demo data resets every 24h via BullMQ scheduled job
- [ ] Demo login bypasses normal auth (pre-seeded credentials)

---

### #8 — PWA offline baseline
**Acceptance criteria:**
- [ ] App shell loads offline (contacts/deals list from cache)
- [ ] Offline edits queued locally, sync on reconnect
- [ ] Conflict resolution: server wins if `serverUpdatedAt > localUpdatedAt`
- [ ] Offline indicator UI when no connection

---

## Out of Scope
- Marketplace
- Custom modules
- Billing system

---

## Verification
```bash
# Dynamic stages
curl -X POST /api/v1/settings -d '{"pipeline.stages": ["lead","proposal","closed"]}'
curl /api/v1/deals?stage=lead  # must work

# Import
curl -X POST /api/v1/import/contacts -F file=@contacts.csv
# → { "jobId": "..." }
curl /api/v1/import/[jobId]     
# → { "progress": 850, "total": 1000, "errors": [] }
```
