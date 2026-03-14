# izhubs ERP — Project Memory

## Current Status

**Phase**: v0.1 Foundation MVP in progress
**Last updated**: 2026-03-14
**Health**: ✅ TypeScript clean, 18 contract tests passing

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
