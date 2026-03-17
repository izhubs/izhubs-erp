# Track Status Board
_Last updated: 2026-03-16 (Session 9 — Execution Blueprint & Micro-Sprints)_

> **Strategic Direction**: All-in-one ERP via Phased Platform Architecture. Focus on the Kernel first, then the Wedge (CRM/Import) to get users, then expand via Marketplace.

---

## 🏁 Phase 0: The Builder OS & Micro-Sprints (Current Focus)
**Rule**: Ship to local/dev environment every 3 days. Focus only on the active Micro-Sprint.

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | 2026-03-16-kernel-sprint-0 | ✅ done | Next.js Setup, DB Schema (User/Tenant), Auth JWT, Docker |
| 2026-03-16 | 2026-03-16-core-entity-sprint-1 | ✅ done | Deals & Contacts CRUD API + Basic form |
| 2026-03-16 | 2026-03-16-view-sprint-2 | ✅ done | Kanban Board UI and Drag-Drop Optimistic updates |
| 2026-03-16 | 2026-03-16-interactive-demo | planning ⭐ ACTIVATION | Personalized Demo: Industry + Role selector → Auto-login → Full dashboard |
| 2026-03-16 | 2026-03-16-wedge-sprint-3 | planning | AI CSV Import — The killer feature for launch |

---

## 🔥 v0.1 — Foundation MVP (Completed Work)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | pipeline-kanban | ✅ done | Kanban board — WOW moment #1 |
| 2026-03-16 | demo-mode | ✅ done | 5 industry seeds (agency, freelancer, coworking, restaurant, cafe) · `npm run seed:agency` |
| 2026-03-16 | tenant-id-migration | ✅ done | migration 008 — tenant_id on all tables, default=1 |
| 2026-03-16 | docker-dev-simplify | ✅ done | Redis commented out dev compose — uncomment when BullMQ needed |
| 2026-03-16 | multi-role-perspective | ✅ done | docs/multi-role-perspective.md — CEO/Manager/Rep/Ops views |

## 🏗️ v0.2 — Import + MCP (1 month)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | airtable-import | planning | CSV/API → AI column mapper → contacts+deals (Covered by Wedge Sprint 3) |
| 2026-03-16 | notion-import | planning | Notion CSV export → same AI mapper |
| 2026-03-16 | sheets-import | planning | Google Sheets CSV or API |
| 2026-03-16 | mcp-server | planning 🔼 MOVED UP | MCP Server — moved from v0.3, viral demo potential |
| 2026-03-16 | json-template-format | planning 🏗️ STRUCTURAL | JSON templates for Gumroad distribution |
| 2026-03-16 | agency-vertical-polish | planning | Stage names, project tracking fields, retainer deal type |

## ☁️ v0.3 — Managed Cloud (3 months)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | managed-cloud | planning | $19/mo hosted — activate tenant_id multi-tenant |
| 2026-03-16 | automation-schema | planning 🏗️ STRUCTURAL | Trigger→Condition→Action DB schema |
| 2026-03-16 | e2e-playwright | planning | Core flows tested before managed launch |
| 2026-03-16 | second-vertical | planning | Restaurant OR Coworking — only after Agency = $5K MRR |

## 🚀 v0.4+ — Scale (6 months)

| Date | Slug | Status | Description |
|------|------|--------|-------------|
| 2026-03-16 | automation-engine | planning | Visual builder UI |
| 2026-03-16 | extension-marketplace | planning | After 10+ extensions exist |
| 2026-03-16 | ai-chatbot | planning | NL queries — needs enough user data |

---

> **Rule**: Follow the Conductor track strictly. Do not open the code editor until the daily spec is approved by Agent.
