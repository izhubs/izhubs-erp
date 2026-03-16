# Track: pre-launch-hardening

**Status:** planning  
**Phase:** v0.1  
**Priority:** Must complete before community launch  
**Risk refs:** risk-register.md #1, #5, #6, #7

---

## Goal

Fix technical risks that could cause embarrassment or silent failures during/after Show HN launch. These are NOT features — they are production stability fixes.

---

## Scope

### #1 — Mobile Kanban drag-drop (iOS Safari)
**Acceptance criteria:**
- [ ] Drag-drop works on iPhone 13+ Safari
- [ ] Drag-drop works on Android Chrome
- [ ] Fallback tested: if touch drag broken, long-press shows "Move to…" column picker

**Files:** `app/(dashboard)/deals/kanban/` (after Phase 2 ships)

---

### #5 — Additive Migration Policy documented
**Acceptance criteria:**
- [ ] `docs/contributing.md` has "Database Rules" section: only ADD, never DROP/RENAME
- [ ] Migration files have comment header explaining additive-only policy
- [ ] `README.md` mentions `npm run db:migrate` in self-host instructions

---

### #6 — Coolify deploy hardening
**Acceptance criteria:**
- [ ] `/api/health` route returns `{ status: "ok", db: boolean, redis: boolean }`
- [ ] `.env.example` has ALL required vars with comments
- [ ] Coolify setup guide in `docs/self-host.md` mentions "mark vars as persistent"
- [ ] `docker-compose.yml` has healthcheck on db and redis services

**New file:** `app/api/health/route.ts`

---

### #7 — PostgreSQL connection pool limit
**Acceptance criteria:**
- [ ] `core/engine/db.ts` pool max = 10 (not default 100)
- [ ] Pool settings logged on startup: `console.log('[db] pool max:', pool.options.max)`
- [ ] Connection error returns 503 with `ApiResponse.error('DB unavailable', 503)` not 500 crash

---

## Out of Scope
- BullMQ queue (v0.2)
- PWA offline sync (v0.2)
- Custom pipeline stages (v0.2)
- Any UI feature

---

## Verification
```bash
# Health check works
curl http://localhost:1303/api/health
# → { "status": "ok", "db": true, "redis": true }

# Mobile: manual test on iPhone Safari
# → kanban drag works OR fallback picker shown
```
