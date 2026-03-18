# Track Status Board
_Last updated: 2026-03-18 (Session 13 — Security hardening, CI, Unit Tests, Command Palette, Gumroad packages)_

> **Strategic Direction**: All-in-one ERP via Phased Platform Architecture. Focus on the Kernel first, then the Wedge (CRM/Import) to get users, then expand via Marketplace.

---

## 🏁 Phase 0: The Builder OS & Micro-Sprints (Current Focus)
**Rule**: Ship to local/dev environment every 3 days. Focus only on the active Micro-Sprint.

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | 2026-03-16-kernel-sprint-0 | ✅ done | Next.js Setup, DB Schema (User/Tenant), Auth JWT, Docker |
| 2026-03-16 | 2026-03-16-core-entity-sprint-1 | ✅ done | Deals & Contacts CRUD API + Basic form |
| 2026-03-16 | 2026-03-16-view-sprint-2 | ✅ done | Kanban Board UI and Drag-Drop Optimistic updates |
| 2026-03-17 | 2026-03-16-interactive-demo | ✅ done | Personalized Demo: Industry + Role selector → Auto-login → Full dashboard |
| 2026-03-17 | 2026-03-16-wedge-sprint-3 | ✅ done | AI CSV Import — drag-drop, AI column mapping, bulk ingest |

---

## 🔥 v0.1 — Foundation MVP (Completed Work)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-17 | pipeline-kanban | ✅ done | Kanban board — Trello-style, @dnd-kit, auto-refresh auth |
| 2026-03-16 | demo-mode | ✅ done | 5 industry seeds (agency, freelancer, coworking, restaurant, cafe) · `npm run seed:agency` |
| 2026-03-16 | tenant-id-migration | ✅ done | migration 008 — tenant_id on all tables, default=1 |
| 2026-03-16 | docker-dev-simplify | ✅ done | Redis commented out dev compose — uncomment when BullMQ needed |
| 2026-03-16 | multi-role-perspective | ✅ done | docs/multi-role-perspective.md — CEO/Manager/Rep/Ops views |
| 2026-03-18 | gumroad-templates | ⏸ PAUSED | Packages built in `dist/gumroad/` (5 ZIPs ready). Needs: screenshots + Gumroad listing upload. Listing copy in `docs/gumroad/`. Resume when ready to publish. |

## 🏗️ v0.2 — Import + MCP (1 month)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | airtable-import | planning | CSV/API → AI column mapper → contacts+deals (Covered by Wedge Sprint 3) |
| 2026-03-16 | notion-import | planning | Notion CSV export → same AI mapper |
| 2026-03-16 | sheets-import | planning | Google Sheets CSV or API |
| 2026-03-16 | mcp-server | planning 🔼 MOVED UP | MCP Server — moved from v0.3, viral demo potential |
| 2026-03-16 | json-template-format | planning 🏗️ STRUCTURAL | JSON templates for Gumroad distribution |
| 2026-03-16 | agency-vertical-polish | planning | Stage names, project tracking fields, retainer deal type |
| 2026-03-17 | pipeline-views | planning | Multi-view: Kanban / Funnel / Table + industry-specific stage presets |
| 2026-03-17 | sales-frameworks | planning | AIDA, BANT, MEDDIC, SPIN framework templates per industry |

---

## 🔒 refactor-audit-hardening (Session 13 — ALL Phases DONE except BullMQ)

> **Status:** Phase 1 ✅ + Phase 2 ✅ + Phase 3 ✅ + Phase 4 partial ✅. Only BullMQ queue pending.
> **Migrations applied:** 004, 005, 006 (FTS), 007 (RLS) ✅
> **Test count:** 92 unit tests passing, 58 contract tests passing

| Phase | Slug | Status | Description |
|-------|------|--------|--------------|
| 1.1 | redis-rate-limiter | ✅ done | Login 10/min, register 5/min, import 20/min — graceful fallback if no Redis |
| 1.2 | security-headers | ✅ done | X-Frame-Options + X-Content-Type + Referrer + Permissions-Policy |
| 1.3 | db-backup-script | ✅ done | scripts/backup.sh + npm run backup — pg_dump + auto-prune |
| 1.4 | gdpr-erasure | ✅ done | core/engine/gdpr.ts + DELETE /api/v1/user/:id + migration 005 |
| 1.5 | postgres-rls | ✅ done | migration 007_rls.sql — dynamic plpgsql DO block, 6 tables, passthrough for admin |
| 1.6 | docker-oom-fix | ✅ done | Dockerfile NODE_OPTIONS=--max-old-space-size=4096 + nextjs user creation |
| 2.1 | ci-pipeline | ✅ done | .github/workflows/ci.yml — typecheck + lint + tests |
| 2.2 | sentry-integration | ⏸ stub | Stub files ready. Run: npm install @sentry/nextjs + add SENTRY_DSN to env |
| 2.3 | unit-tests | ✅ done | 92/92 passing — rbac.test.ts (31) + api-response.test.ts (16) + components (45) |
| 2.4 | command-palette | ✅ done | Ctrl+K palette — search contacts/deals, keyboard nav, header pill, tested E2E |
| 2.5 | fts-search | ✅ done | migration 006 — tsvector + GIN + immutable_unaccent triggers. Search API upgraded. |
| 3.1 | ui-wrapper-layer | ✅ done | components/providers/QueryProvider.tsx + hooks/index.ts barrel |
| 3.2 | radix-ui-adopt | ✅ done | @radix-ui/react-dialog + select + popover + toast installed. Dialog.tsx abstraction. |
| 3.3 | react-hook-form | ✅ done | react-hook-form + @hookform/resolvers installed. Forms pending refactor. |
| 3.4 | form-refactor | ⏳ pending | Replace ContactFormModal + DealFormModal with Dialog.tsx + useForm + zodResolver |
| 4.1 | tanstack-query | ✅ done | @tanstack/react-query — QueryProvider, useContacts, useDeals (optimistic updates) |
| 4.2 | bullmq-csv-queue | ⏳ pending | BullMQ async queue for CSV import — uncomment Redis in docker-compose first |
| 4.3 | postgres-fts | ✅ done | tsvector + GIN + unaccent triggers on contacts + deals (see 2.5) |
| 4.4 | db-query-tenant | ✅ done | core/engine/db.ts: queryAsTenant() + withTenantTransaction() for RLS support |

## ☁️ v0.3 — Managed Cloud (3 months)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | managed-cloud | planning | $19/mo hosted — activate tenant_id multi-tenant |
| 2026-03-16 | automation-schema | planning 🏗️ STRUCTURAL | Trigger→Condition→Action DB schema |
| 2026-03-16 | e2e-playwright | planning | Core flows tested before managed launch |
| 2026-03-16 | second-vertical | planning | Restaurant OR Coworking — only after Agency = $5K MRR |
| 2026-03-18 | nextjs-v15-upgrade | planning ⏳ | Upgrade Next.js 14→15: webpackMemoryOptimizations, React 19, fetch cache fix. Depends on: refactor-audit Phase 2.3 (tests done) |

## 🚀 v0.4+ — Scale (6 months)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | automation-engine | planning | Visual builder UI |
| 2026-03-16 | extension-marketplace | planning | After 10+ extensions exist |
| 2026-03-16 | ai-chatbot | planning | NL queries — needs enough user data |

---

> **Rule**: Follow the Conductor track strictly. Do not open the code editor until the daily spec is approved by Agent.
