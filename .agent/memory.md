# izhubs ERP — Project Memory

## Current Status

**Phase**: v0.1 Foundation MVP in progress
**Last updated**: 2026-03-16 (session 7 — Pivot: Vertical-first + Ship Fast)
**Health**: ✅ TypeScript clean, 34 contract tests passing
**Last commit (app)**: `8911273` feat(agent): conductor methodology + changelog systemboard

### 🎯 Target Persona (confirmed 2026-03-16)
**Agency owner / Freelancer** — runs agency hoặc freelance, 1-5 người, tech-savvy vibe coder. Đang dùng **Airtable, Notion, hoặc Google Sheets** để track clients/deals nhưng đã outgrown. Found izhubs trên GitHub/Show HN. Phải self-serve hoàn toàn. Sẵn sàng trả $29 cho template tốt.

**Critical UX rule:** Every action ≤ 5 seconds. Self-explanatory. Zero onboarding needed.

### 🚀 Strategic Pivot (2026-03-16)
- **Vertical-first**: Agency/Freelancer vertical trước. KHÔNG mở rộng vertical mới cho đến khi $5K MRR
- **Native Import**: Airtable / Notion / Google Sheets import là GO-TO-MARKET, không phải optional
- **Monetize NOW**: Templates trên Gumroad ($29 each) TRƯỚC community launch
- **MCP Server sớm**: Move từ v0.3 lên v0.2 — demo "chat với ERP data" = viral moment
- **Bỏ Redis cho dev**: Remove Redis dependency khỏi docker-compose.yml dev (chỉ giữ cho prod khi cần BullMQ)

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
- **`GET /api/health`**: check DB + Redis TCP, return 200/503 (no extra package needed)
- **`npm run db:migrate`**: migration runner `scripts/migrate.js` with `schema_migrations` tracking
- **docker-compose.yml**: REDIS_URL + DATABASE_URL env, healthchecks for app + redis services
- **`feature-cycle.md`**: Phase 5 memory.md update steps explicit
- **Pipeline Kanban board** (`components/kanban/`): KanbanBoard, KanbanColumn, DealCard, DealFormModal.
  Optimistic drag-drop, stage moves via PATCH `/api/v1/deals/:id`, board stats ($pipeline/$won/count), New Deal modal.
  `deals/page.tsx` Server Component fetches from engine directly.
- **Contacts list page** (`components/contacts/`): ContactsTable (search, avatar, edit/delete), ContactFormModal.
  PATCH alias on contacts/[id]/route.ts.
- **Dashboard home** (`app/(dashboard)/page.tsx`): real KPIs (contacts/deals/pipeline/won), pipeline bar chart, recent contacts.
- **3 critical bugfixes** (commit `5ae7153`): middleware.ts Edge Runtime (use jose directly), auth/users.ts (no deleted_at), rbac.ts (cookie auth fallback for browser FE).

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

### Session 5 — 2026-03-16 (Strategic Brief + Pipeline Kanban Track)
- **Strategic brief**: confirmed target persona as vibe business owners/solopreneurs, community-led GTM
- **Persona rule**: product must self-serve — demo data, no onboarding help needed
- **Track started**: `pipeline-kanban` — SPEC.md written with 3-phase approach (API → UI → Tests)
- **Gap identified**: `/api/v1/deals/[id]` missing GET/PATCH/DELETE — Phase 1 of kanban track fixes this

### Session 6 — 2026-03-16 (Strategy, UX Specs, Structural Sprints)
- **Monetization model finalized**: WordPress analogy — Templates (themes) + Modules (plugins) + Managed hosting + Marketplace. See `master-plan.md` § Monetization.
- **JSON-first architecture decision**: Templates AND automation rules stored as JSON (like n8n). Portable, shareable, AI-generatable. NOT TypeScript files.
- **Bootstrapping strategy**: Gumroad before marketplace. First maker earns $100 → social proof → community self-grows.
- **Risk register**: 20 stuck points + solutions documented in brain/risk-register.md
- **UX specs written**: `docs/ux-contacts-page.md`, `docs/ux-deals-kanban.md`, `docs/ux-dashboard.md`, `docs/ux-page-template.md`
- **2 structural SPECs created** (foundation before community launch):
  - `json-template-format` → `.agent/tracks/2026-03-16-json-template-format/SPEC.md`
  - `automation-schema` → `.agent/tracks/2026-03-16-automation-schema/SPEC.md`
- **New tracks planned**: `pre-launch-hardening` (mobile/health/pool), `v0.2-platform-stability` (stages/import/PWA)
- **Key design decision**: `EnrichmentProvider` interface for community social data connectors (LinkedIn, Apollo) — defined in v0.3 Extension SDK

## Active Backlog (v0.1) — SHIP FIRST
> **Rule**: v0.1 must be done BEFORE anything else. No v0.2 work until v0.1 is complete.
1. **Demo seed** ← **BLOCKER #1** — `npm run seed:demo` với agency sample data (clients, deals, activities)
2. **Gumroad templates** ← **BLOCKER #2 (revenue)** — Agency Starter Pack $29, Freelancer OS $29 — ship before Show HN
3. **Migration 008: tenant_id** — Add `tenant_id` to all tables now (default=1), prevents breaking change at v1.0
4. **Docker dev simplify** — Remove Redis from docker-compose.yml (keep only postgres), add back when BullMQ needed
5. **Community launch** — README update + GIF demo + Show HN post

## Planned v0.2 — Import + MCP (1 month)
> **Theme**: Own the migration narrative. Make switching from Airtable/Notion = zero friction.
- 🏗️ **Airtable import** — CSV/API export → AI column mapper → contacts+deals+custom_fields
- 🏗️ **Notion import** — CSV export → same AI mapper
- 🏗️ **Google Sheets import** — Google Sheets API or CSV
- **MCP Server** (moved up from v0.3) — query ERP data with Claude/Cursor
- **Agency vertical polish** — staged pipeline, project tracking custom fields, retainer deal type
- 🏗️ **json-template-format** — migrate templates to JSON for Gumroad distribution

## Planned v0.3 — Managed Cloud (3 months)
- **tenant_id activated** — multi-tenant mode for managed hosting ($19/mo)
- **Automation schema** — Trigger→Condition→Action DB table + Zod
- **E2E Playwright tests** — protect core flows before managed cloud launch
- **2nd vertical** (Restaurant or Coworking) — only after Agency = $5K MRR

## Planned v0.4+ — Extension Platform
- Extension Marketplace (after community = 10+ extensions)
- AI chatbot on ERP data (needs enough user data)
- Automation visual builder


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
