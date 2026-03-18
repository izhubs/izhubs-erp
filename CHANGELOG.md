# Changelog

All notable changes to izhubs ERP are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

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
