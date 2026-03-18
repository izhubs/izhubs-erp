# Changelog

All notable changes to izhubs ERP are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

## [Unreleased] — 2026-03-18 (Session 15 — Virtual Office Template Full Stack)

### ✨ Added

**Phase 1 — Virtual Office Industry Template**
- `templates/industry/virtual-office.ts` — complete industry template:
  - 8 pipeline stages (`lead → proposal → negotiation → onboarding → active → renewal → won → lost`)
  - 7 custom fields (all labels/options in English per project rule): `dia_chi_dang_ky`, `loai_doanh_nghiep`, `ma_so_thue`, `goi_dich_vu`, `thoi_han_hop_dong`, `ngay_ky_hop_dong`, `nguon_lead`
  - 3 automations as SEED DATA only (inserted into `tenant_automations` DB on setup — users can edit)
  - 9 sidebar nav items: dashboard / leads / contacts / deals / contracts / service-packages / tasks / reports / import
  - CEO Dashboard widget layout: KPI × 4 + ARR chart + Revenue Donut + Top Customers + Activity Feed
  - Indigo `#6366f1` theme defaults
- `templates/index.ts` — registered `virtualOfficeTemplate` in TEMPLATES array

**Phase 2 — Bilingual Seed Data**
- `scripts/seeds/seed-virtual-office.js` — 15 contacts + 15 deals × EN & VI
- `package.json` — `seed:virtual-office`, `seed:virtual-office:en`, `seed:virtual-office:vi` scripts
- `scripts/seed.js` — `--lang=en|vi` flag + `resolveLocaleData()` helper

**Phase 3 — Service Packages (DB + Engine + API)**
- `database/migrations/008_service_packages.sql` — service_packages table with billing types ✅ applied
- `database/migrations/009_tenant_automations.sql` — tenant_automations table ✅ applied
- `core/engine/service-packages.ts` — full CRUD + soft-delete + `getPackageSubscriberCounts()`
- `core/engine/automations.ts` — full CRUD + `seedAutomationsFromTemplate()` (idempotent)
- `app/api/v1/service-packages/route.ts` — GET (list + subscriber counts) / POST
- `app/api/v1/service-packages/[id]/route.ts` — PATCH / DELETE
- `app/api/v1/automations/route.ts` — GET / POST
- `app/api/v1/automations/[id]/route.ts` — PATCH / DELETE

**Phase 4 — UI Screens**
- `app/(dashboard)/service-packages/page.tsx` — master/detail layout, active/inactive tabs, create/edit modal — bilingual
- `app/(dashboard)/page.tsx` — replaced generic dashboard with Virtual Office CEO dashboard:
  - 4 KPI cards: MRR, Active Clients, Renewals Due, Open Deals — bilingual (reads `hz_locale` cookie)
  - ARR Line Chart + Revenue Donut (by `goi_dich_vu`) via recharts — bilingual axes/tooltips
  - Pipeline Breakdown — Virtual Office stages, bilingual stage labels
  - Top 5 Customers table — sorted by deal value
  - Activity Feed grid — 8 recent contacts
- `components/dashboard/DashboardCharts.tsx` — Client component wrapping ARR + Revenue Donut recharts

**Phase 3 Extra — Settings Automation UI**
- `app/(dashboard)/settings/automation/page.tsx` — list rules, toggle on/off, create/edit modal — bilingual
- `app/(dashboard)/settings/page.tsx` — Automation Rules card added (Zap icon)

**Bilingual Infrastructure**
- `components/providers/LanguageProvider.tsx` — context with `useLanguage()` hook, `t()` function, `localStorage` persistence
- `components/ui/Header.tsx` — globe icon + EN/VI badge language toggle
- `app/(dashboard)/settings/appearance/page.tsx` — Theme selector + Language selector (fully functional)
- `app/styles/_layout.scss` — sticky header (`position: sticky; top: 0; backdrop-filter: blur(8px)`)
- `messages/en.json` + `messages/vi.json` — translation bundles

**Phase 6 — Tests**
- `tests/contracts/service-packages-api.test.ts` — 16 new tests: schema parsing (price coercion, billing enum), input validation (defaults, edge cases), partial update, HTTP response shapes
- Total: **74 tests, 74 passing**

**Project Rules (`memory.md`)**
- Custom field labels/options = English (keys may be Vietnamese)
- Automations = DB-backed, not hardcoded in TS template files
- PowerShell: use `;` not `&&` for command chaining

### 🔧 Changed
- `templates/index.ts` — `virtualOfficeTemplate` registered
- `app/(dashboard)/settings/page.tsx` — Automation Rules card added

---

## [Unreleased] — 2026-03-18 (Session 14 — UI Layer, Chart Widgets, Pipeline Views, BullMQ)

### ✨ Added

**Phase 1 — Shared Component Library**
- `components/shared/` — 8 reusable components, all use CSS variables (no hardcoded colors):  
  `KpiCard`, `Badge`, `PageHeader`, `AvatarGroup`, `EmptyState`, `DataTable<T>`, `SidePanel`, `Modal`
- `components/shared/index.ts` — barrel export

**Phase 2 — Dashboard Widget System**
- 11 self-fetching Server Component KPI widgets across 3 roles:
  - CEO: `kpi.mrr`, `kpi.customers`, `kpi.churn`, `kpi.contracts_expiring`
  - Sales: `kpi.my_pipeline`, `kpi.quota_progress`, `kpi.deals_stuck`, `kpi.tasks_today`
  - Marketing: `kpi.leads_month`, `kpi.conversion_rate`, `kpi.cac`
- `core/engine/auth/server-context.ts` — `getTenantId`, `getCurrentUserId` helpers

**Phase 2b — Chart Widgets (recharts, lazy-loaded)**
- `components/modules/reports/widgets/ChartWidgets.tsx` — Server wrappers:
  `ArrTrendWidget`, `RevenueByPackageWidget`, `PipelineFunnelWidget`
- `components/modules/reports/widgets/charts/` — 3 recharts components (AreaChart, horizontal BarChart, BarChart)
- `components/modules/reports/widgets/TopCustomersWidget.tsx` — top 8 by total deal value + expiry warning
- `components/modules/reports/widgets/ActivityFeedWidget.tsx` — last 15 activities with type icon + time ago
- WIDGET_MAP in `DashboardGrid.tsx` now has 16 entries (11 KPI + 5 chart/table)

**Phase 3 — Core Screens**
- `core/engine/activities.ts` — listActivities, completeActivity, createActivity (Zod validated)
- `app/(dashboard)/tasks/page.tsx` + `TasksClient` — grouped tasks, SidePanel, optimistic complete
- `app/(dashboard)/companies/[id]/page.tsx` — 3-column, custom_fields JSONB auto-render by type
- `app/(dashboard)/settings/packages/page.tsx` — service packages admin with subscriber count + revenue
- `app/api/v1/activities/[id]/complete/route.ts` — PATCH endpoint
- `core/engine/rbac.ts` — `activities:read/write` added to all role matrices

**Phase 4 — Virtual Office Pages**
- `app/(dashboard)/leads/page.tsx` + `LeadsClient` — channel badges, SidePanel, Create Deal CTA
- `app/(dashboard)/contracts/page.tsx` — KPI bar + DataTable highlighting expiring ≤30d/≤0d
- `app/(dashboard)/reports/page.tsx` — 5 KPIs + pipeline stage table + revenue trend + top deals

**Phase 5 — Theme Config System**
- `app/(dashboard)/layout.tsx` — fetches `theme_defaults` from `industry_templates` in parallel with navConfig
- `components/ui/AppLayout.tsx` — `themeDefaults` prop + `useEffect` injects CSS vars on `document.root`

**Pipeline Multi-View**
- `components/deals/PipelineViews.tsx` — Kanban / Table (sortable) / Funnel view switcher
- View preference persisted in `localStorage`. Funnel bars decrease proportionally by stage order (100%→40%)

**Infrastructure**
- `database/migrations/008_service_packages.sql` — service_packages table, billing types, FK on deals.package_id
- `components/providers/ReactQueryProvider.tsx` — TanStack Query v5, 60s stale, devtools in dev
- `app/layout.tsx` — wrapped with ReactQueryProvider
- `core/engine/import-queue.ts` — BullMQ Queue + `addImportJob()` + `createImportWorker()` factory
- `scripts/workers/import-worker.ts` — standalone worker (upsert contacts/deals, progress every 50 rows, SIGTERM shutdown)

### 🔧 Changed
- `components/ui/DashboardGrid.tsx` — WIDGET_MAP fully populated (was all stubs)
- `app/(dashboard)/deals/page.tsx` — replaced direct `<KanbanBoard>` with `<PipelineViews>`
- `package.json` — added `bullmq` dependency

---

## [Unreleased] — 2026-03-18 (Session 12)

### 🤖 Agent Layer
- **5 izhubs-native SKILL.md files** — tailored skills replacing generic catalog: `izhubs-api-route`, `izhubs-database-engine`, `izhubs-module-development`, `izhubs-security`, `izhubs-testing`
- **AGENTS.md** — added `⭐ izhubs-native Skills` section with "replaces" mapping to generic skills
- **refactor-audit-hardening track** — `.agent/tracks/2026-03-18-refactor-audit-hardening/SPEC.md` (6 phases: Security, CI/CD, UI, Data Layer, Core, +2 new: PostgreSQL RLS, Docker OOM)
- **nextjs-v15-upgrade track** — `.agent/tracks/2026-03-18-nextjs-v15-upgrade/SPEC.md` (plan for v0.3)
- **Framework evaluation docs** — `component_framework_evaluation.md` (10 UI), `core_framework_evaluation.md` (10 core)
- **`redis` package installed** — awaiting activation (Phase 1.1 of refactor track)

---

## [Unreleased] — 2026-03-17 (Session 11)

### ✨ Added
- **Multi-Industry Theme Architecture — Layer 2 (Layout Engine)**
  - `database/migrations/003_industry_theme.sql` — `industry` + `custom_theme_config` columns on `tenants`; `industry_templates` table
  - `templates/engine/template.schema.ts` — extended with `NavItemSchema`, `NavConfigSchema`, `DashboardWidgetRowSchema`
  - `templates/industry/spa.ts` — new Spa & Wellness industry template
  - All 4 existing templates (`agency`, `restaurant`, `coworking`, `ecommerce`) updated with `navConfig` + `themeDefaults`
  - `scripts/seed-industry-templates.ts` — upserts all industry templates into DB (dry-run supported)
  - `lib/nav-config.ts` — server-side fetch with `unstable_cache` + on-demand `revalidateTag`, role filtering
  - `app/api/v1/tenant/nav-config/route.ts` — GET endpoint for client components
  - `components/ui/Sidebar.tsx` — refactored to dumb component (accepts `NavItem[]` prop, icon string → Lucide via `ICON_MAP`)
  - `components/ui/DashboardGrid.tsx` — new 12-column CSS Grid renderer from `DashboardWidgetRow[]` prop
  - `app/styles/_layout.scss` — dashboard grid, widget card, nav badge CSS
- **DB Bootstrap** — `scripts/_bootstrap-migration.js` one-time reconciler for existing DBs (already run, do not run again)
- **Migration Guide** — `database/MIGRATIONS.md` with rules, workflow, history, troubleshooting

### 🔧 Changed
- `app/(dashboard)/layout.tsx` — converted to Server Component; fetches `NavConfig` from DB and passes to `AppLayout`
- `components/ui/AppLayout.tsx` — accepts `navItems` + `bottomItems` props (IoC pattern)
- `templates/index.ts` — registered `spa` template
- `package.json` — added `seed:industry-templates` + `seed:industry-templates-dry` scripts
- `database/` — removed empty `seed/` folder duplicate

### 📖 Docs
- `docs/multi-industry-theme-architecture.md` — full 3-layer spec with problems, solutions, code samples, rollout phases

---

## [0.1.0] — 2026-03-16

### ✨ Added
- Full project scaffold with Next.js 14 App Router
- AI context layer: `AGENTS.md`, `memory.md`, skills, workflows
- Core DB schema: entities, events, event-bus with typed Zod
- DB migrations: 001 (init) → 006 (soft-delete)
- Auth system: JWT login / register / refresh with `jose`
- Core API: Contacts and Deals CRUD with Zod validation
- RBAC: Permission matrix (superadmin/admin/member/viewer) + `withPermission()` guard
- Engine layer: `core/engine/` — only layer allowed to query DB
- `ApiResponse` factory: consistent response shape across all routes
- Soft-delete: all entities use `deleted_at`, nothing physically removed
- Event Bus: `contact.*` and `deal.*` events (typed Zod)
- `db.withTransaction()`: atomic multi-write helper
- `ErrorCodes` registry: machine-readable error codes
- Extension SDK: `ExtensionBase.ts`
- Templates: agency, restaurant (3 sub), coworking, ecommerce
- SCSS: 5 themes (indigo, emerald, rose, amber, light) + full component system
- PWA: manifest.json + service worker
- App shell: login, setup wizard, dashboard layout, 12 page stubs
- i18n: next-intl with EN/VI + auto English fallback
- Docker: dev/staging/prod compose files + bridge network
- Git workflow: master → production (Coolify auto-deploy)
- Docs: product-vision, data-layer-architecture, ui-design-language, knowledge-search, public-api
- 30+ AI skills installed in `.agent/skills/` (18 from antigravity catalog + 5 izhubs-native added session 12)

### 🔧 Changed
- Port changed from 3000 → **1303**
- Auth routes refactored to use engine layer + `ApiResponse` (removed direct DB + NextResponse.json)

---

_Older pre-release work tracked in `.agent/memory.md` session logs_
