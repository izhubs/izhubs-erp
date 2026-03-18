# Track Status Board
_Last updated: 2026-03-18 (Session 12 — Refactor & Audit Master Plan drafted)_

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
| 2026-03-18 | gumroad-templates | 🔴 BLOCKER | Package Agency+Freelancer seed as $29 Gumroad templates — revenue BLOCKER |

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

## 🔒 refactor-audit-hardening (Parallel Track — DO NOT block v0.2)

> **Note:** Một agent khác đang làm UI refactor song song. Track này chỉ thực hiện sau khi UI refactor done.
> **Tài liệu gốc:** `brain/c44d8e62.../refactor_audit_master_plan.md`
> **`redis` package đã cài sẵn** — chờ activate khi sẵn sàng.

| Phase | Slug | Status | Description |
|-------|------|--------|--------------|
| 1.1 | redis-rate-limiter | ⏳ pending | Activate Redis + uncomment rate-limiter.ts — `redis` package đã install |
| 1.2 | security-headers | ⏳ pending | CSP, HSTS, X-Frame-Options vào next.config.mjs |
| 1.3 | db-backup-script | ⏳ pending | scripts/backup.sh + pg_dump cron |
| 1.4 | gdpr-erasure | ⏳ pending | core/engine/gdpr.ts + DELETE /api/v1/user/:id + migration 005_gdpr.sql |
| 1.5 | postgres-rls | ⏳ pending | PostgreSQL Row Level Security — migration 006_rls.sql, backstop tenant isolation |
| 1.6 | docker-oom-fix | ⏳ pending | Dockerfile NODE_OPTIONS=--max-old-space-size=4096 |
| 2.1 | ci-pipeline | ⏳ pending | .github/workflows/ci.yml — lint + typecheck + test:contracts |
| 2.2 | sentry-integration | ⏳ pending | @sentry/nextjs error tracking cho production |
| 2.3 | unit-tests | ⏳ pending | tests/unit/rbac.test.ts + tests/unit/api-response.test.ts (20+ tests) |
| 3.1 | ui-wrapper-layer | ⏳ pending | components/ui/index.ts — internal wrapper cho tất cả UI primitives |
| 3.2 | radix-ui-adopt | ⏳ pending | @radix-ui/react-dialog, select, popover thay thế custom modals |
| 3.3 | react-hook-form | ⏳ pending | react-hook-form + zodResolver cho ContactFormModal + DealFormModal |
| 3.4 | keyboard-shortcuts | ⏳ pending | Ctrl+K (search), N (new contact), Escape (close modal) |
| 4.1 | tanstack-query | ⏳ pending | @tanstack/react-query wrap app + refactor useModules hook |
| 4.2 | bullmq-csv-queue | ⏳ pending | BullMQ async queue cho CSV import (sau Redis active) |
| 4.3 | postgres-fts | ⏳ pending | Full-text search tsvector + GIN index cho contacts/deals |

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
