# izhubs ERP Constitution

## Core Principles

### I. Clean Code & Modularity (CRITICAL)
Follow Uncle Bob's Clean Code principles and GoF design patterns. Components MUST NOT exceed 150 lines. Split logic appropriately to retain readability. Encapsulate styles with SCSS Modules (`.module.scss`) – absolutely no Tailwind inside core visual components.

### II. Fat Module Logic (Encapsulation)
Each module (e.g., crm, registry) must self-contain its engine, API routes, and UI components. Interactions across modules should happen via predefined interfaces or the Event Bus, reducing side effects and tight coupling.

### III. Self-Explanatory UX
Every action must take ≤ 5 seconds. The system requires zero onboarding. UIs must use IzUI (in-house library built on Radix UI constraints) with strict inline flex structures and smooth `<Dialog>/<IzSheet>` transitions.

### IV. Direct DB Data Safety
API routes are forbidden from calling the database directly. Only `core/engine/*.ts` (e.g., `contacts.ts`, `deals.ts`) may call `db.query()`. DB logic must always be encapsulated in the engine layer.

### V. API Contract & Validation
ALL API routes MUST use `ApiResponse.success/error/validationError/serverError` factory functions to ensure shape consistency. Every row returned from the DB must be parsed through `Schema.parse()` (Zod) inside the engine before returning to catch DB drift immediately. Every route must be protected by `withPermission('resource:action', handler)`.

### VI. Immutability & Soft-Deletions
Physical deletion (`DELETE FROM`) is strictly prohibited. You must ALWAYS use `UPDATE SET deleted_at = NOW()` to soft-delete records.

## Architecture & Database Standards

- **Tech Stack**: Next.js 14 (App Router), React Server Components (RSC), TanStack Query, SCSS, Radix UI.
- **Database**: PostgreSQL queried via raw SQL wrapper (`core/engine/db.ts`). No ORMs are permitted.
- **Migrations**: Migrations are strictly sequential. New migration = new file `00X_description.sql`. Never edit committed migrations. Pure DDL stays separate from Data Seeds (which stay in `scripts/seeds/`).
- **Auth**: JWT via `jose` library using `httpOnly` cookies.

## Quality Gates & Testing

- **Compiler Level**: `npm run typecheck` MUST yield exactly 0 errors.
- **Testing Standard**: `npm run test:contracts` must fully pass prior to any Git commit or pull request.
- **Internationalization**: Keys/DB identifiers use Vietnamese `snake_case`, but UI-facing labels (e.g., `options[]`) in templates and seed files must be assigned in English with `next-intl` handling runtime fallback.

## Governance

All Pull Requests and reviews must verify compliance with this Constitution before merge. Any architectural deviation, addition of external libraries, or changes in module structure require justification and tracking in `.agent/tracks/STATUS.md`. Workflows must rely on `.agent/workflows/...` definitions.

**Version**: 0.1.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
