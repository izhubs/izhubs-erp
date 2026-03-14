# izhubs ERP — Memory

> Living document. Updated after every significant work session.
> Last updated: 2026-03-14

---

## Current Status

> **Phase: Project Scaffold** — Initial structure created. No features implemented yet.

## What's been done
- [x] Project structure scaffolded at `D:\Project\izhubs-erp`
- [x] Root config: package.json, tsconfig.json, docker-compose.yml, .env.example
- [x] AI context layer: AGENTS.md, memory.md, skills (Phase 1), workflows
- [x] Core schema: entities.ts, events.ts, relations.ts
- [x] DB migration 001: initial schema (users, contacts, companies, deals, activities)
- [x] Extension SDK skeleton: ExtensionBase.ts, types.ts
- [x] App shell: layout, login page, dashboard shell

## In Progress
- [ ] Nothing in progress

## Next Up (Backlog)
- [ ] Implement Core Engine: entity-engine.ts, event-bus.ts, custom-fields.ts
- [ ] REST API v1: contacts, deals, companies, activities, users
- [ ] Auth: JWT middleware, login API route
- [ ] Dashboard UI: KPI cards, pipeline kanban
- [ ] CRM module: pipeline stages, lead scoring

---

## Key Decisions

| Decision | Reason | Date |
|----------|--------|------|
| PostgreSQL only, no ORM | Simplicity, full SQL control, no magic | 2026-03-14 |
| EventBus over direct calls | Extensions isolated from core, can't break it | 2026-03-14 |
| Zod for all validation | Runtime safety + TypeScript type inference | 2026-03-14 |
| Next.js App Router | Server components for performance, standard stack | 2026-03-14 |
| Custom fields via JSON column | Flexible without schema migrations per field | 2026-03-14 |

---

## Known Gotchas
- Docker postgres volume: migrations in `database/migrations/` auto-run on first init only
- Always run `npm run test:contracts` before push — contract tests are the hardest guardrail

---

## Credentials (Dev)
- App: http://localhost:3000
- DB: postgres:5432 / user: postgres / db: izhubs_erp
- Default admin: setup via /setup on first run
