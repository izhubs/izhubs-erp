# Track: Pipeline Kanban View
**Created**: 2026-03-16
**Status**: in-progress
**Priority**: high

## Summary
Build a visual Kanban board for the deals pipeline. This is izhubs's **#1 WOW moment** — when a vibe business owner sees their sales pipeline as a clean board instead of a spreadsheet. The board maps to the 7 deal stages already in the schema. **Foundation-first**: complete the missing API layer before building any UI.

## Target Persona
**Vibe business owner / solopreneur** — runs the company like a developer vibe codes.
- Solo or tiny team (1-5 people), smart, no patience for bloated ERP UI
- Wants fast data entry (click, type, done — under 5 seconds)
- Wants AI-ready data (clean structured deals for future AI copilot)
- Will self-host, found izhubs on GitHub/community, no onboarding needed

---

## User Stories

- As a **solo business owner**, I want to see all my deals organized by stage in a Kanban board so I can instantly know where each deal is.
- As a **solo business owner**, I want to drag a deal card from one column to another so I can update its stage in 1 action.
- As a **solo business owner**, I want to create a new deal directly from the Kanban board so I never leave the pipeline view.
- As a **solo business owner**, I want to see deal value and contact name on each card so I can prioritize at a glance.
- As a **solo business owner**, I want to click a deal card to open a quick-edit panel so I can update details without navigating away.

---

## Acceptance Criteria

### API layer (must pass before any UI work)
- [ ] `GET /api/v1/deals/:id` returns a single deal by ID (404 if not found or soft-deleted)
- [ ] `PATCH /api/v1/deals/:id` updates deal fields, emits correct events (stage_changed, won, lost)
- [ ] `DELETE /api/v1/deals/:id` soft-deletes deal, emits `deal.deleted` event
- [ ] `GET /api/v1/deals?stage=qualified` filters deals by stage
- [ ] All endpoints protected by `withPermission()` guard
- [ ] All endpoints return `ApiResponse` factory shape
- [ ] Contract tests cover all 5 new endpoint behaviors

### Kanban UI
- [ ] Board displays 7 columns (new, contacted, qualified, proposal, negotiation, won, lost)
- [ ] Each card shows: deal name, value (formatted VND/USD), contact name
- [ ] Drag-and-drop moves a deal to a new stage (optimistic update, rollback on error)
- [ ] Column header shows deal count + total value sum
- [ ] Clicking a card opens a slide-over panel with full deal details
- [ ] Quick-create button in each column opens an inline form (name + value minimum)
- [ ] Board is responsive down to 768px (horizontal scroll on columns)
- [ ] Empty state per column shows a helpful prompt, not a blank void
- [ ] TypeScript `typecheck` passes after all changes

### Quality gates (non-negotiable)
- [ ] Zero direct `db.query()` calls outside `core/engine/`
- [ ] Zero `NextResponse.json()` calls — only `ApiResponse.*`
- [ ] No component exceeds 150 lines
- [ ] `npm run typecheck` exits 0

---

## Technical Plan

### Phase 1 — Complete the API + Engine layer ← START HERE
This is foundation. No UI until this phase is done and tested.

#### Missing engine functions (add to `core/engine/deals.ts`)
- `getDealsByStage(stage: DealStage): Promise<Deal[]>` — for kanban column loading
- Add `stage` filter to `listDeals()` options

#### New API routes
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/api/v1/deals/[id]` | `deals:read` | Get single deal |
| PATCH | `/api/v1/deals/[id]` | `deals:write` | Update deal (partial) |
| DELETE | `/api/v1/deals/[id]` | `deals:write` | Soft-delete deal |

**New file:** `app/api/v1/deals/[id]/route.ts`

#### Stage filter on list endpoint
Modify `GET /api/v1/deals` to accept `?stage=<DealStage>` query param.

#### DB Migration
No new tables needed — schema already has `stage` column with correct enum values.  
Add index: `CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage) WHERE deleted_at IS NULL;`  
**New file:** `database/migrations/007_add_deals_stage_index.sql`

---

### Phase 2 — Kanban UI

#### New page
`app/(dashboard)/deals/page.tsx` — replace stub with Kanban board  
Strategy: Server Component fetches all deals grouped by stage → passes to Client Component for drag-and-drop.

#### New components (all under 150 lines each)
| Component | Path | Responsibility |
|-----------|------|---------------|
| `KanbanBoard` | `components/deals/KanbanBoard.tsx` | Renders 7 columns, manages optimistic state |
| `KanbanColumn` | `components/deals/KanbanColumn.tsx` | Single column — header, cards, empty state, create button |
| `DealCard` | `components/deals/DealCard.tsx` | Card UI — name, value, contact badge |
| `DealSlideOver` | `components/deals/DealSlideOver.tsx` | Slide-over panel for deal detail + edit |
| `QuickCreateDeal` | `components/deals/QuickCreateDeal.tsx` | Inline form — name + value, submits to POST /deals |

#### Drag and drop strategy
Use `@dnd-kit/core` + `@dnd-kit/sortable` (lightweight, accessible, no jQuery).  
On drop: call `PATCH /api/v1/deals/:id` with `{ stage: newStage }` optimistically.  
On error: rollback UI state + show toast.

#### SCSS
New partial: `app/styles/_kanban.scss`  
Import into `globals.scss`. No inline styles.

---

### Phase 3 — Contract Tests

**File:** `tests/contracts/deals-api.test.ts`

Tests to add:
- `GET /api/v1/deals/:id` → 200 with valid Deal shape
- `GET /api/v1/deals/:id` → 404 for unknown ID
- `PATCH /api/v1/deals/:id` → 200, updated stage reflected
- `PATCH /api/v1/deals/:id` → stage_changed event emitted (spy on eventBus)
- `DELETE /api/v1/deals/:id` → soft-deleted, subsequent GET returns 404

---

## Out of Scope (this track)
- Filtering deals by owner / contact / date range — v0.2
- Drag to reorder within same column — not needed yet
- Deal comments / activity log on slide-over — next track
- Bulk operations (select multiple, move) — v0.2
- Custom pipeline stages (user-defined columns) — v0.3

---

## Implementation Order (strict)
```
Phase 1: Engine + API
  1. Add getDealsByStage() + stage filter to listDeals()
  2. Create app/api/v1/deals/[id]/route.ts (GET, PATCH, DELETE)
  3. migration 007 (stage index)
  4. Contract tests — all green
  ↓ typecheck must pass before Phase 2 starts
Phase 2: UI
  5. Install @dnd-kit/core @dnd-kit/sortable
  6. _kanban.scss
  7. KanbanColumn + DealCard
  8. KanbanBoard
  9. DealSlideOver + QuickCreateDeal
  10. Wire deals/page.tsx
  ↓ typecheck must pass
Phase 3: Final validation
  11. Full test run
  12. Visual QA on mobile (768px)
```

---

## Open Questions
- [ ] Deal value currency — VND only for now, or currency field on Deal?
- [ ] Should "won" and "lost" columns be visually distinct (green/red) or same style as others?
- [ ] Contact name on card: fetch via join or denormalize contact_name on deal?
