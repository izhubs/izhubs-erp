# izhubs ERP — Project Memory

## Current Status

**Phase**: v0.1 Foundation MVP in progress
**Last updated**: 2026-03-16 (session 4 — Conductor methodology + changelog system)
**Health**: ✅ TypeScript clean, 18 contract tests passing
**Last commit**: `d2a360a` feat(core): withTransaction + ErrorCodes registry

---

## ⚠️ AI Self-Check — Read Before Writing Any Code

Every session MUST verify these rules BEFORE writing or committing code.
Full details: `.agent/skills/clean-code-and-modularity.md` and `.agent/skills/database-safety.md`

### Architecture rules (non-negotiable)
| Rule | What to check |
|------|---------------|
| **No inline CSS** | Use SCSS classes from `app/styles/`. Only dynamic JS values may be inline. |
| **No direct DB access** | Only `core/engine/*.ts` may call `db.query()`. Routes must import from engine. |
| **ApiResponse factory** | All routes use `ApiResponse.success/error/validationError/serverError`. Never `NextResponse.json()` directly. |
| **Zod on DB output** | Every row from DB must be passed through `Schema.parse()` inside the engine before returning. |
| **Soft-delete only** | Never use `DELETE FROM`. Use `UPDATE SET deleted_at = NOW()`. |
| **withPermission() guard** | Every API route must be wrapped with `withPermission('resource:action', handler)`. |
| **No component > 150 lines** | Split if exceeded. |
| **Sequential migrations** | New migration = new file `00X_description.sql`. Never edit committed migrations. |

### Before every commit
```bash
npm run typecheck    # must be clean
npm run test:contracts  # all must pass
```

---


## What's Done

- Full project scaffold at `D:\Project\izhubs-erp`
- AI context layer: AGENTS.md, memory.md, 3 skills, 6 workflows (incl. feature-cycle)
- Core schema: entities, events, event-bus (typed Zod)
- DB migrations: 001 (init) → 005 (audit log)
- Extension SDK: ExtensionBase.ts
- Templates: agency, restaurant (+ 3 sub-templates), coworking, ecommerce + AI niche prompt
- SCSS: 5 themes (indigo, emerald, rose, amber, light) + full component system
- PWA: manifest.json + service worker
- App shell: login, setup wizard, dashboard layout, 12 page stubs
- Lib stubs: email, webhooks, messaging (Telegram/Slack/Zalo), GDPR, rate-limiter
- i18n: next-intl with EN/VI + auto English fallback for missing keys
- Antigravity workspace: junction at playground/izhubs-erp → D:\Project\izhubs-erp
- MCP config: ready for when mcp-server is implemented
- Auth: JWT login / register / refresh with `jose` (v0.1)
- Core API: Contacts and Deals CRUD endpoints with Zod validation (v0.1)
- RBAC: Permission matrix (superadmin/admin/member/viewer), `withPermission()` route guard (v0.1)
- Soft-delete: All entities use `deleted_at` flag — nothing is physically removed from DB (migration 006)
- Core engine layer: `core/engine/contacts.ts`, `core/engine/deals.ts` — only these may query the DB directly
- `ApiResponse` factory: `core/engine/response.ts` — ALL API routes must use this, never `NextResponse.json()` directly

### Session 4 — 2026-03-16 (Conductor Methodology + Changelog System)
- **7 new skills installed**: `conductor-new-track`, `conductor-status`, `conductor-manage`, `conductor-setup`, `conductor-validator`, `changelog-automation`, `context-driven-development`
- **AGENTS.md**: Added Project Management & Memory Skills section, updated session startup rules, added CHANGELOG.md reminder
- **`.agent/tracks/STATUS.md`**: Created — master board with 8 backlog items migrated from memory.md backlog
- **`.agent/tracks/archive/`**: Directory created for completed tracks
- **`CHANGELOG.md`**: Created — v0.1.0 documented from session history, `[Unreleased]` ready for next changes
- **`/morning-start` workflow**: Enhanced to 5 steps — loads memory + tracks + recent commits + TypeScript check + Morning Brief display. Now prompts conductor-new-track for any new feature request.
- **Decision**: Every new feature MUST have a SPEC.md via `conductor-new-track` before code is written

### Session 3 — 2026-03-16 (Skills, Architecture Cleanup, Event Bus)
- **12 new skills installed**: 7 from antigravity (nextjs-best-practices, nextjs-app-router-patterns, zod-validation-expert, postgres-best-practices, clean-code, typescript-expert, bullmq-specialist) + 5 ERP-specific (add-custom-field, create-module, create-extension, mcp-tool-design, event-bus-patterns)
- **AGENTS.md**: Anti-pattern Quick Reference table, 18 skills fully documented, memory.md path fixed
- **auth engine** (`core/engine/auth/users.ts`): `getUserByEmail`, `isEmailTaken`, `createUser` — Zod on all DB output
- **login/route.ts + register/route.ts**: Refactored — removed direct `db` import + `NextResponse.json()`, now use engine + `ApiResponse`
- **Event Bus**: `contacts.ts` emits `contact.created/updated/deleted`; `deals.ts` emits `deal.created/updated/stage_changed/won/lost/deleted` (with stage transition detection)
- **`db.withTransaction(fn)`**: Atomic multi-write helper added to `core/engine/db.ts`
- **`ErrorCodes` registry**: Machine-readable error codes added to `core/engine/response.ts`

### Session 2 — 2026-03-14 (Architecture, Infra & Docs)
- Port changed to **1303** (first commit memorial)
- Docker: `docker-compose.prod.yml`, `docker-compose.staging.yml`, bridge network `izhubs_network`
- Git workflow: `master` → `production` branch (Coolify auto-deploys from `production`)
- NPM aliases: `docker:dev`, `docker:staging`, `docker:prod`, `docker:down`, `verify`
- `scripts/verify.sh`: typecheck + lint + contract tests + build
- Golden Rules expanded to **8 rules** (incl. no direct DB, API-only, modular code)
- **11 awesome-skills** installed from antigravity-awesome-skills catalog into `.agent/skills/`
- `.agent/skills/clean-code-and-modularity.md` — Uncle Bob + GoF design patterns
- `.agent/skills/database-safety.md` — Zod enforcement, immutable migrations, API-only access
- `docs/public-api-and-webhooks.md` — API Key system + outbound webhook plan (v0.2)
- `docs/data-layer-architecture.md` — 3 data gates: Create, Import (4-stage clean pipeline), Sync
- `docs/product-vision.md` — core design principle: "Simple UX = More data"; 6 unsolved market gaps
- `docs/ui-design-language.md` — Linear/Notion/Vercel inspired; 1vh dashboard rule; table + chart anti-patterns
- `docs/knowledge-and-search.md` — Document Hub, AI chatbot (static + dynamic), global search, performance budget
- Automation decision: **No n8n embed** (too heavy). v0.3 = lightweight built-in automation engine.
- Community PR target: `master` branch (never `production`)

## Key Decisions

| Decision | Why |
|----------|-----|
| Next.js 14 App Router | Full-stack, file-based routing, RSC ready |
| PostgreSQL raw SQL | Control, performance, migration clarity |
| Zod for all types | Runtime validation + TypeScript types from one source |
| CSS Custom Properties for theming | Runtime theme switching without rebuild |
| SCSS for component organization | Nesting, mixins, partials for large CSS |
| next-intl for i18n | App Router native, auto fallback to EN |
| Engine layer pattern | Data safety — only `core/engine/` talks to DB |
| ApiResponse factory | Consistent response shape across all routes |
| Zod on DB output | Runtime contract enforcement — DB drift caught immediately |
| MIT license | Community first, no feature gating |

## Active Backlog (v0.1)
1. Pipeline Kanban view
2. Custom Fields UI

## Planned (v0.2)
- Global search ⌘K (title full-text)
- Import pipeline with Data Quality Report
- API Key system + `/api/public/v1/`
- Outbound webhook dispatcher

## Planned (v0.3)
- Document Hub (internal knowledge base)
- AI chatbot (static docs + dynamic SQL)
- Lightweight automation engine (Trigger → Condition → Action)
- Sync connectors (Google Contacts, Shopify...)

## Credentials (local dev)

```
DB:    postgresql://postgres:postgres@localhost:5432/izhubs_erp
Redis: redis://localhost:6379
App:   http://localhost:1303
```

## Git

```bash
cd D:\Project\izhubs-erp
git log --oneline -8
```

### Session 2026-03-14 commits (newest → oldest)
```
ce0e891 docs(memory): session notes
95845df docs: knowledge hub, ai chatbot, global search + performance budget
60340f8 docs(ui): 1vh rule, table/chart anti-patterns
30a7fa5 docs: ui-design-language.md
bd6947c docs: data-layer-architecture
be41d14 refactor(core): ApiResponse factory + Zod enforcement
a9f57ac docs(skill): clean-code + Uncle Bob + GoF patterns
9189da6 rule: Golden Rule #8 — clean code
fbf43b5 feat(skills): 11 awesome-skills installed
0258d09 rule: direct DB access banned
b95c568 docs: public-api-and-webhooks plan
b516dd6 docs: git-workflow.md
fed0b55 chore(ops): docker overrides + verify.sh
e923751 chore(docker): bridge network
8180047 chore: port 3000→1303
```

## Dev startup

```bash
docker compose up -d postgres redis   # start DB (first time or after reboot)
npm run dev                           # start app on :1303
```
