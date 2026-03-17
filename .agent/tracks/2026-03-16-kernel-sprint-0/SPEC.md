# The Kernel: Base Scaffold & Skeleton

## Overview
Status: Planning
Type: Foundation

**Trigger:** Bootstrapping a realistic "All-in-one ERP" by starting with the bare minimum skeleton.
**Goal:** Setup Next.js Routing, Database Schema cơ bản (User, Tenant, Auth JWT), and Docker compose.
**Success Criteria:** `docker compose up` and `npm run dev` work, opening a functional (though empty) Login page without errors.

## Phase 1: Environment & Core Schema
- [ ] Ensure `docker-compose.yml` runs PostgreSQL and Redis flawlessly on the local machine.
- [ ] Define the base `Schema.ts` for Users and Tenants.
- [ ] Write DB Migration `001_init.sql` for Users, Tenants, and basic Role strings.

## Phase 2: Auth Flow
- [ ] Implement JWT Login API Route using `jose`.
- [ ] Implement Register API Route with Tenant auto-creation.
- [ ] Build a barebones minimal Login UI (email/password form).
- [ ] Build a barebones minimal Register UI.

## Phase 3: The App Shell
- [ ] Setup Next.js Layout (`app/layout.tsx`) with basic Providers (Theme, Auth Context).
- [ ] Create a blank authenticated Dashboard page (`app/(dashboard)/page.tsx`) protected by middleware.
