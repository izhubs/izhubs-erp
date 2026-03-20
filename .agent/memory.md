# izhubs ERP — Project Memory

## Current Status

**Phase**: v0.1 Foundation MVP — **Core foundation complete (RLS + TanStack Query + Radix UI + react-hook-form)**
**Last updated**: 2026-03-20 (Session 17 — Dashboard Bug Fix + TS Errors)
**Health**: ✅ TypeScript clean | ✅ 76/76 contract tests passing | ✅ DB migrated (migrations squash 001) | ✅ RLS enabled
**Last work**: Session 17 — Fixed critical dashboard blank content (infinite redirect loop in Next.js RedirectBoundary). Moved real dashboard content to `/dashboard/page.tsx`, root `/` now redirects to `/dashboard`. Fixed 10 TypeScript errors in `tenant.ts`, `rbac.ts`, `provision/route.ts`, `reset-demo-data/route.ts` and their tests. Replaced broken `/contracts` page (missing `getTenantId`) with polished Coming Soon placeholder. Added global `error.tsx` boundary to surface server component crashes.
**Remote**: `https://github.com/izhubs/izhubs-erp` (branch: master, head: a6172e6)

### 🎯 Target Persona (confirmed 2026-03-16)
**Agency owner / Freelancer** — runs agency hoặc freelance, 1-5 người, tech-savvy vibe coder. Đang dùng **Airtable, Notion, hoặc Google Sheets** để track clients/deals nhưng đã outgrown. Found izhubs trên GitHub/Show HN. Phải self-serve hoàn toàn. Sẵn sàng trả $29 cho template tốt.

**Critical UX rule:** Every action ≤ 5 seconds. Self-explanatory. Zero onboarding needed.

### 🚀 Strategic Pivot (2026-03-16)
- **Vertical-first**: Agency/Freelancer vertical trước. KHÔNG mở rộng vertical mới cho đến khi $5K MRR
- **Native Import**: Airtable / Notion / Google Sheets import là GO-TO-MARKET, không phải optional
- **Monetize NOW**: Templates trên Gumroad ($29 each) TRƯỚC community launch
- **MCP Server sớm**: Move từ v0.3 lên v0.2 — demo "chat với ERP data" = viral moment
- **Redis strategy**: Commented out trong docker-compose dev để đơn giản setup lần đầu. Package `redis` đã install. Uncomment khi cần BullMQ (CSV import lớn) hoặc Rate Limiting (Phase 1.1 refactor track).

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
| **Schema vs Seed separation** | `001_initial_schema.sql` = pure DDL only (CREATE TABLE + indexes). `002_seed_data.sql` = system defaults (default tenant, modules catalog). Industry seed data stays in `scripts/seeds/seed-[industry].js` — one file per industry. Never mix DDL and DML in the same migration file. |
| **Custom field labels/options = English** | All `customFields[].label` and `options[]` in templates and seed files MUST be in English. Keys (DB identifiers) may use Vietnamese `snake_case` (e.g. `goi_dich_vu`) but UI-facing labels and option values must be English by default. |
| **Automations = DB not hardcoded** | `automations[]` in template files are SEED DATA only — they must be inserted into `tenant_automations` DB table on tenant setup so users can edit them via Settings > Automation. Never treat template TS as live source of truth for automations. |
| **PowerShell: `;` not `&&`** | Shell is Windows PowerShell. Chain commands with `;`. Example: `git add -A; git commit -m "..."`. Using `&&` causes ParseError. |

### Before every commit
```powershell
# PowerShell (Windows) — use ; not &&
npm run typecheck; npm run test:contracts
```
- `typecheck` must be 0 errors
- `test:contracts` must be all pass

---


## ✅ What's Shipped (as of 2026-03-18 — Session 13)

### Infrastructure
- Full Next.js 14 App Router scaffold at `D:\Project\izhubs-erp`
- Docker Compose: postgres + redis (redis commented out for dev)
- Auth: JWT (access 15m + refresh 7d), httpOnly cookies, `withPermission()` RBAC guard
- DB: `001_initial_schema.sql` (DDL) + `002_seed_data.sql` (system INSERTs)
- Migrations 001–007 applied (latest: 007_rls.sql — Postgres RLS)
- Migration runner: `scripts/migrate.js` (sequential, tracked in `schema_migrations`)
- API contract tests: 58 tests across auth, contacts, deals, RBAC, modules
- Unit tests: **92/92 passing** (rbac 31 + api-response 16 + components 45)
- GitHub Actions CI: `.github/workflows/ci.yml`
- Docker OOM fix: `NODE_OPTIONS=--max-old-space-size=4096` in Dockerfile
- Backup script: `scripts/backup.sh` + `npm run backup`

### Security & Compliance
- Rate limiter: Redis-backed, fallback to memory (login 10/min, register 5/min, import 20/min)
- Security headers: X-Frame-Options, X-Content-Type, Referrer, Permissions-Policy
- **Postgres RLS** (`migration 007`): tenant isolation at DB level on 6 tables
- **GDPR Erasure**: `core/engine/gdpr.ts` + `DELETE /api/v1/user/:id` + migration 005

### Database Layer
- `core/engine/db.ts`: `queryAsTenant(tenantId, sql)` + `withTenantTransaction(tenantId, fn)`
- `migration 006_fts.sql`: FTS on contacts (name/email/title) + deals (name/stage)
  - immutable_unaccent wrapper for Vietnamese diacritics
  - GIN index + BEFORE INSERT/UPDATE trigger maintenance

### Data Fetching (TanStack Query)
- `@tanstack/react-query` + devtools installed
- `components/providers/QueryProvider.tsx`: staleTime 60s, gcTime 5min, retry 1
- `hooks/useContacts.ts`: useContacts, useCreateContact, useUpdateContact, useArchiveContact, usePrefetchContact
- `hooks/useDeals.ts`: useDeals, useCreateDeal, useMoveDeal (optimistic + rollback), useArchiveDeal
- `hooks/index.ts`: barrel export — `import { useContacts } from '@/hooks'`
- `AppLayout.tsx` wrapped in `QueryProvider`

### UI Primitives
- `react-hook-form` + `@hookform/resolvers` installed
- `@radix-ui/react-dialog` + `select` + `popover` + `toast` installed
- `components/ui/Dialog.tsx`: Radix Dialog abstraction (title, footer slot, locked mode)
- `components/ui/Dialog.module.scss`: dark overlay, slide-in animation
- `components/ui/CommandPalette.tsx` + `.module.scss`: Ctrl+K global palette
- `/api/v1/search`: ranked FTS + ILIKE fallback, prefix tsquery

### Features
- **CRM Pipeline**: Contacts + Deals CRUD, Kanban drag-drop, soft delete
- **Module Registry**: modules table, tenant_modules activation, `withModule()` guard, App Store UI
- **Multi-tenant**: all tables have `tenant_id`, default tenant = `00000000-...-0001`
- **Interactive Demo** (`/demo`): industry + role wizard → auto-login JWT → full dashboard, no signup
- **AI CSV Import** (`/import`): drag-drop wizard → AI column mapping → bulk ingest contacts/deals
- **Command Palette** (Ctrl+K): search contacts/deals, keyboard nav ↑↓ Enter Esc

### Seed Data & Templates
- 5 industries: `seed-agency.js`, `seed-freelancer.js`, `seed-coworking.js`, `seed-restaurant.js`, `seed-cafe.js`
- 5 Gumroad template packages: `dist/gumroad/{agency,restaurant,coworking,ecommerce,spa}-template.zip`
  - Listing copy: `docs/gumroad/agency-listing.md`, `docs/gumroad/coworking-listing.md`
  - Export script: `npm run export:gumroad:all`

### AI / Agent Layer
- `.agent/memory.md`, `STATUS.md`, 3 sprints of tracks (SPEC.md per track)
- **Multi-Agent Strategy**: Đã thiết lập `.agent/rules/*.mdc` cho 6 Personas (PM, Architecture, Backend, Frontend, QA, UI/UX). Bắt buộc sử dụng Artifacts (Implementation Plan, Walkthrough, Browser Recording). Khuyến khích sử dụng Agent Manager và chạy song song qua Duplicate Workspace.
- Skills: clean-code, conductor, typescript-expert, etc.
- Workflows: morning-start, feature-cycle, git-workflow, rollback, add-feature
- PWA: manifest.json + service worker
- App shell: login, setup wizard, dashboard layout, 12 page stubs
- Lib stubs: email, webhooks, messaging (Telegram/Slack/Zalo), GDPR, rate-limiter
- i18n: next-intl with EN/VI + auto English fallback for missing keys
- Antigravity workspace: junction at playground/izhubs-erp → D:\Project\izhubs-erp
- MCP config: ready for when mcp-server is implemented
- Auth: JWT login / register / refresh with `jose` (v0.1)
- Core API: Contacts and Deals CRUD endpoints with Zod validation (v0.1)
- RBAC: Permission matrix (superadmin/admin/member/viewer), `withPermission()` route guard (v0.1)
- Soft-delete: All entities use `deleted_at` flag — nothing is physically removed from DB (migration 004)
- Core engine layer: `core/engine/contacts.ts`, `core/engine/deals.ts` — only these may query the DB directly
- `ApiResponse` factory: `core/engine/response.ts` — ALL API routes must use this, never `NextResponse.json()` directly

### Session 17 — 2026-03-20 (Complete UI Overhaul to IzUI & UX Polish)
- **IzUI Refactoring Complete**: Refactored `DealSlideOver`, `ContactSlideOver`, `CustomFieldsManager`, and `NotesList` to strictly use `IzInput`, `IzButton`, and `IzSheet`. Removed all legacy Boostrap-like `.form-control` and `.btn` classes from the codebase.
- **Smooth Animations & Layout Fixes**: 
  - Created `IzSheet` component wrapping Radix Dialog for buttery smooth CSS slide-in animations.
  - Set `modal={false}` on SlideOvers and implemented `scrollbar-gutter: stable` + `[data-scroll-locked] { padding-right: 0 !important }` globally in `globals.scss` to structurally eliminate the "janky board layout shift" when opening panels.
- **Stitch Google Admin UX Design**: Redesigned SlideOvers based on Google Stitch MCP recommendations. Replaced chunky stacked Label/Input layouts with an elegant side-by-side (inline) property list featuring borderless inputs and subtle typography (`text-subtle`).
- **Metadata Info Boxes**: Upgraded the generic `Created At` / `Updated At` labels into a dedicated, aesthetic info-box placed at the bottom of sheets.
- **Test Suite Resolution**: Solved ESM errors (`jose`) and Next.js dynamic context errors (`next/headers`) by configuring Jest stubbing. The entire unit test suite (`npm run test`) passes 100%.

### Session 16 — 2026-03-19 (IzUI Component Library Finalization & Virtual Office Template)
- **IzUI Master Roadmap Completed**: All 13 phases of the component library are done natively with SCSS Modules and Radix UI primitives.
- **Data Visualization**: `IzLineChart`, `IzBarChart`, `IzPieChart`, `IzMetricCard` built on `recharts`.
- **ERP Widgets**: `IzAccordion` (FAQ), `IzActivityTimeline` (Audit logs), `IzFileUpload` (DND capacity check).
- **Kanban Layout**: `IzKanbanBoard` CSS structure provided for future `@dnd-kit` usage.
- **Documentation**: Established `docs/IzUI_Usage_Guide.md` (Strict encapsulation, no Tailwind permitted inside core components).
- **Virtual Office Template Checked**: `templates/industry/virtual-office.ts` verified complete (8 stages, fields, automations).

### Session 14 — 2026-03-19 (Core Foundation Hardening & Universal DB Architecture)
- **Database Squashing**: Thu gọn toàn bộ tệp migration từ 001 đến 010 vào `001_initial_schema.sql` và `002_seed_data.sql`
- **Universal DB Extensibility**: Thêm bảng `universal_records` và `record_links`
- **Advanced JSONB Indexing**: Áp dụng `GIN` với `jsonb_path_ops` trên biến `payload JSONB` theo chuẩn kỹ năng `antigravity-awesome-skills: postgres-best-practices`
- **Fat Module Logic**: Đưa logic `contacts.ts` và `deals.ts` vào thư mục `modules/crm/engine/` đúng chuẩn kiến trúc Fat Module
- **UI Accessibility**: Nâng cấp `ContactFormModal.tsx` và `DealFormModal.tsx` sang Radix UI `<Dialog>` framework.
- **Workflow Tools**: Thêm `scripts/db-reset.js` và `npm run db:reset`
- **Testing**: Cả 74 Contract Tests và npm run build passed 100%.

### Session 12 — 2026-03-18 (Refactor & Audit Master Plan)
- **Master Plan doc**: `brain/.../refactor_audit_master_plan.md` — 5 phases (Security, CI/CD, UI, Data Layer, Core Libs)
- **Conductor track**: `.agent/tracks/2026-03-18-refactor-audit-hardening/SPEC.md` — 6 phases với full acceptance criteria
- **5 izhubs-native skills** created (replace generic catalog):
  - `izhubs-api-route` — replace `api-design-principles`
  - `izhubs-database-engine` — replace `database-safety` + `postgres-best-practices`
  - `izhubs-module-development` — replace `create-module`
  - `izhubs-security` — replace `api-security-best-practices` + `security-auditor`
  - `izhubs-testing` — replace `test-driven-development`
- **AGENTS.md updated**: `⭐ izhubs-native Skills` section, skills count now 30+
- **Framework evaluations**: 10 UI components + 10 Core components evaluated (framework vs code-by-hand)
- **nextjs-v15-upgrade track**: `.agent/tracks/2026-03-18-nextjs-v15-upgrade/SPEC.md` — depends on Phase 2.3 tests
- **PostgreSQL RLS** added to Phase 1.5 — backstop tầng DB cho tenant isolation
- **Docker OOM fix** added to Phase 1.6 — `NODE_OPTIONS=--max-old-space-size=4096`
- **`redis` package installed** — awaiting activation in Phase 1.1
- **Key new decisions**:
  - Adopt `resend` for email (not nodemailer)
  - Adopt `pino` for structured logging (not console.log)
  - Adopt `sonner` for toast notifications
  - Adopt `@radix-ui/react-dialog` for modals (focus trap a11y)
  - Adopt `react-hook-form` + zodResolver for all forms
  - Keep raw SQL + Zod (no ORM)
  - Keep `jose` JWT (no NextAuth)

### Session 9 — 2026-03-17 (Module Registry + Modularization Architecture)
- **Module Registry system**: DB migrations 009+010 (modules + tenant_modules tables), 7 official modules seeded
- **Registry engine**: `core/engine/modules.ts` — CRUD + 60s in-memory cache for `isModuleActive()`
- **API routes**: `GET /api/v1/modules`, `POST/DELETE /api/v1/modules/[id]/install`
- **`withModule()` HOF**: Security guard in `rbac.ts` — blocks 403 if module not active for tenant (API-level protection)
- **App Store UI**: `modules/registry/components/` — AppStore + ModuleCard + useModules hook at `/settings/modules`
- **CRM module manifest**: `modules/crm/index.ts` implementing `IzhubsModule` interface
- **12 contract tests**: `tests/contracts/modules-api.test.ts` — all passing
- **`tenantId?`** added to JWT Claims for multi-tenant module checks
- **Key architecture decisions chốt**:
  - Fat Module pattern (mỗi module tự chứa engine + API + UI)
  - Feature Toggle via DB (code bundle sẵn, cài = flip is_active)
  - Community modules via npm packages (v0.4, NOT PR vào monorepo)
  - Community module data via JSONB `module_records` table (v0.4, NOT raw SQL)
- **Sprint notes saved**: `izhubs-erp-docs` brain artifacts — full pickup instructions
- **📁 Files created/modified in this session:**
  - DB: `database/migrations/009_modules.sql`, `database/migrations/010_tenant_modules.sql`
  - Core: `core/types/module.interface.ts`, `core/engine/modules.ts`
  - Core (modified): `core/engine/rbac.ts` (+withModule HOF), `core/engine/auth/jwt.ts` (+tenantId)
  - API: `app/api/v1/modules/route.ts`, `app/api/v1/modules/[id]/install/route.ts`
  - UI: `modules/registry/components/AppStore.tsx`, `modules/registry/components/AppStore.module.scss`
  - UI: `modules/registry/components/ModuleCard.tsx`, `modules/registry/components/ModuleCard.module.scss`
  - UI: `modules/registry/hooks/useModules.ts`
  - Page: `app/(dashboard)/settings/modules/page.tsx`
  - Manifest: `modules/crm/index.ts`
  - Tests: `tests/contracts/modules-api.test.ts` (12 tests)
- **⚠️ Chưa chạy migration**: Cần `npm run db:migrate` để tạo bảng modules + tenant_modules trước khi test UI
- **⚠️ Chưa move CRM code**: `core/engine/contacts.ts` + `deals.ts` vẫn ở core, chưa move vào `modules/crm/engine/` (v0.2)

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
1. **Gumroad templates** — ⬇️ **DEFERRED post-MVP** (2026-03-20): 5 ZIPs ready in `dist/gumroad/`. Resume when screenshots + listing upload are prioritized.
2. **README GIF demo** — screen recording showing import + pipeline in action
3. **Community launch** — Show HN post + GitHub release

> ⬇️ **DEFERRED post-MVP (2026-03-20)**: `onboarding-ui` (3-step wizard) and `gumroad-templates` (revenue upload) both moved to after core MVP is stable. See STATUS.md for details.

## Done in v0.1 (session 8)
- ✅ Migration 008: tenant_id on all tables (default=1, future multi-tenant ready)
- ✅ Docker dev simplify: Redis commented out, uncomment at v0.2 when BullMQ needed
- ✅ 5 industry seed scripts (agency, freelancer, coworking, restaurant, cafe) — 100% English
- ✅ seed.js runner: `npm run seed:agency/freelancer/coworking/restaurant/cafe/all`
- ✅ docs/multi-role-perspective.md: CEO/Manager/Rep/Ops views
- ✅ izhubs-erp-docs: build-philosophy.md + why-izhubs.md

## Planned v0.2 — Import, Demo + Sync (1 month)
> **Theme**: Own the migration narrative. Make switching from Airtable/Notion = zero friction.
- 🏗️ **Interactive Demo module** — `/demo` endpoint bypassing signup wrapper for the fastest "Aha moment" wedge.
- 🏗️ **Airtable import** — CSV/API export → AI column mapper → contacts+deals+custom_fields
- 🏗️ **Notion import** — CSV export → same AI mapper
- 🏗️ **Google Sheets import** — Google Sheets API or CSV
- 🏗️ **OpenAPI Auto-generation pipeline** — Auto export API definitions to JSON for `izhubs-erp-docs` ingestion in CI/CD.
- **MCP Server** (moved up from v0.3) — query ERP data with Claude/Cursor
- **Agency vertical polish** — staged pipeline, project tracking custom fields, retainer deal type
- 🏗️ **json-template-format** — migrate templates to JSON for Gumroad distribution
- 🏗️ **onboarding-ui** — 3-step setup wizard (Register, Industry Selection, Provisioning)
- 🏗️ **json-template-engine** — Complete Export/Import to `.izhubs.json` file for Gumroad package 
- 🏗️ **embeddable-lead-form** — Viral loop lead generation (Powered by IZhubs iframe form)

## Planned v0.3 — Managed Cloud (3 months)
- **tenant_id activated** — multi-tenant mode for managed hosting ($19/mo)
- **Automation schema** — Trigger→Condition→Action DB table + Zod
- **E2E Playwright tests** — protect core flows before managed cloud launch
- **2nd vertical** (Restaurant or Coworking) — only after Agency = $5K MRR

## Planned v0.4+ — Extension Platform
- Extension Marketplace (after community = 10+ extensions)
- AI chatbot on ERP data (needs enough user data)
- Automation visual builder

## 🗂️ Industry Seed Data — Backlog

### ✅ Tier 1 — Done (5 industries, 100% English)
`seed:agency` · `seed:freelancer` · `seed:coworking` · `seed:restaurant` · `seed:cafe`
Each = 15 contacts + 15 deals + custom fields. Runner: `node scripts/seed.js --industry=xxx`

### ⏳ Tier 2 — Pending (build after $5K MRR from Tier 1)
Photography Studio · Beauty Salon / Spa · Catering / Event · IT Consulting ·
Tutoring Center · Language School · Real Estate Agency

### 🔜 Tier 3 — Future
Fashion Boutique · Pet Shop · Gym / Fitness · Clinic · Event Management ·
E-commerce · Construction · Travel Agency


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
