# izhubs ERP — Project Memory

## Current Status

**Phase**: Scaffold complete (v0.0) → Starting v0.1 Foundation MVP
**Last updated**: 2026-03-14
**Health**: ✅ TypeScript clean, all commits passing

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

## Key Decisions

| Decision | Why |
|----------|-----|
| Next.js 14 App Router | Full-stack, file-based routing, RSC ready |
| PostgreSQL raw SQL | Control, performance, migration clarity |
| Zod for all types | Runtime validation + TypeScript types from one source |
| CSS Custom Properties for theming | Runtime theme switching without rebuild |
| SCSS for component organization | Nesting, mixins, partials for large CSS |
| next-intl for i18n | App Router native, auto fallback to EN |
| Feature-cycle not sprint | AI builds fast — cycle = feature complete |
| MIT license | Community first, no feature gating |

## Active Backlog (v0.1)

1. Auth: JWT login / register / refresh
2. Core API: contacts + deals CRUD
3. Pipeline Kanban view
4. Custom Fields UI
5. RBAC
6. Sidebar with real nav links
7. Header with user menu + theme switcher

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
