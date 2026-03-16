# Track: Demo Mode — Sample Data Seed

**Created**: 2026-03-16
**Status**: planning
**Priority**: critical (MVP Blocker #1)

## Summary

When a new user installs izhubs ERP and logs in for the first time, they see an empty pipeline, 0 contacts, and a blank dashboard. This is a conversion killer for community launch. This track seeds realistic sample data into the app so first-time users immediately see a working CRM — not a blank screen.

## Target Persona
Vibe business owner who just self-hosted izhubs from GitHub. Has never seen the product before. Must be impressed in the first 30 seconds or they leave.

---

## User Stories

- As a **first-time user**, I want to see realistic data in the app immediately after setup so I can understand what izhubs does without having to enter anything.
- As a **developer evaluating izhubs**, I want a `npm run seed:demo` command that populates the DB so I can demo the product locally.
- As an **admin**, I want to be able to wipe demo data and start fresh with real data without running migrations.

---

## Acceptance Criteria

- [ ] `npm run seed:demo` creates: 1 admin user + 20 contacts + 15 deals spread across all 7 stages
- [ ] Demo contacts have realistic Vietnamese/international business names, emails, phone numbers, and titles
- [ ] Deals have realistic names, values (VND range: 5M–500M), and varied stages so Kanban looks populated
- [ ] Each deal is linked to a contact (contactId FK)
- [ ] Dashboard KPIs show real numbers: total contacts, pipeline value, won amount
- [ ] Script is idempotent: running twice does NOT duplicate data (check by email / deal name)
- [ ] Script outputs a summary: `✅ Seeded: 1 user, 20 contacts, 15 deals`
- [ ] README.md documents `npm run seed:demo` in the Quick Start section

---

## Technical Plan

### No new DB migrations needed
Schema already supports all needed fields.

### New file: `scripts/seed-demo.js`
- Pure Node.js (no TypeScript compile step needed)
- Uses `pg` directly (same as migrate.js)
- Reads `DATABASE_URL` from env (`.env.local`)
- Idempotent: uses `INSERT ... ON CONFLICT DO NOTHING` on unique columns

### Data to seed

**1 Admin user**
```
name: "Isaac Vũ"
email: demo@izhubs.com
password: Demo@12345 (hashed)
role: admin
```

**20 Contacts** (realistic Vietnamese SME names)
- Mix of roles: CEO, founder, sales manager, freelancer
- Some with phone numbers, some without
- All with Vietnamese-style names but some international

**15 Deals** across all 7 stages
```
new:          2 deals
contacted:    3 deals
qualified:    3 deals
proposal:     2 deals
negotiation:  2 deals
won:          2 deals (with closed_at set)
lost:         1 deal  (with closed_at set)
```
Values range: 5,000,000 → 500,000,000 VND

### npm script (package.json)
```json
"seed:demo": "node scripts/seed-demo.js"
```

### README update
Add to Quick Start after `npm run db:migrate`:
```
npm run seed:demo    # load sample data (optional, recommended for first run)
```

---

## Implementation Phases

- [ ] Phase 1: Write `scripts/seed-demo.js` with idempotent inserts
- [ ] Phase 2: Add `seed:demo` to `package.json`
- [ ] Phase 3: Update `README.md` Quick Start section

---

## Out of Scope

- UI button to "Load Demo Data" (v0.2 — after launch)
- Demo isolation (separate org/schema) — v0.2
- Automatic seed on first login — v0.2
- Resetting / wiping demo data via UI — v0.2

---

## Open Questions

- [x] Password for demo user: `Demo@12345` (visible in README for evaluators)
- [x] Currency: VND only for now (deal value in raw number, formatted in UI)
