# Changelog

All notable changes to izhubs ERP are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

## [Unreleased]

### ✨ Added
_Upcoming changes go here_

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
- 18 AI skills installed in `.agent/skills/`

### 🔧 Changed
- Port changed from 3000 → **1303**
- Auth routes refactored to use engine layer + `ApiResponse` (removed direct DB + NextResponse.json)

---

_Older pre-release work tracked in `.agent/memory.md` session logs_
