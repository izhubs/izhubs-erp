# Track: Smart Grid — Spreadsheet-Style Data Entry
**Created**: 2026-03-19
**Status**: planning
**Priority**: high

## Summary
Build an inline-editable spreadsheet grid (NocoDB/Airtable-style) for izhubs ERP that serves two purposes:
1. **Post-CSV Import Review** — after AI column mapping, user reviews and edits all imported rows in a grid before committing to the database.
2. **Standalone Sheet View** — a dedicated `/sheet` view per entity (contacts, deals) for fast bulk data entry, keyboard navigation, and drag-to-fill, replacing slow form-by-form entry.

## User Stories
- As an **admin importing 500 contacts from CSV**, I want to see all rows in an editable grid after AI column mapping so I can fix errors before saving.
- As a **sales rep**, I want a Google-Sheets-style tab where I can Tab/Enter through cells, paste rows, and edit multiple records without opening a modal for each one.
- As a **manager doing a bulk data cleanup**, I want to select multiple rows and delete or bulk-edit a field value across all selected rows at once.

## Acceptance Criteria
- [ ] After CSV import mapping step, rows display in an editable SmartGrid (not committed yet)
- [ ] User can click any cell to edit inline (text, number, select/dropdown cells)
- [ ] Tab key moves to next cell, Enter moves to next row, Arrow keys navigate
- [ ] User can Add Row (blank row at bottom), Delete selected rows
- [ ] Multi-row select via checkbox column; Bulk delete supported
- [ ] Column headers are sortable (click to sort asc/desc)
- [ ] Errors from validation (empty required fields) highlighted in red per cell
- [ ] Import confirm button commits only valid rows, shows skip count for invalid
- [ ] Standalone `/contacts/sheet` and `/deals/sheet` routes load entity data into same SmartGrid
- [ ] Changes in standalone sheet auto-save on blur (optimistic update via TanStack Query mutation)
- [ ] Virtual scrolling — smooth performance for 1000+ rows without lag

## Technical Plan

### UI Architecture
```
SmartGrid (components/ui/SmartGrid/)
├── SmartGrid.tsx          — Main headless grid component (TanStack Table v8)
├── SmartGrid.module.scss  — Grid styles (sticky header, frozen col, selection)
├── EditableCell.tsx       — Click-to-edit cell with type-aware input
├── useGridKeyboard.ts     — Keyboard nav hook (Tab/Enter/Arrow)
└── index.ts               — Barrel export
```

### Library Choice
- **TanStack Table v8** (`@tanstack/react-table`) — already ecosystem-aligned, headless, supports virtual scrolling via `@tanstack/react-virtual`
- **No AG Grid** — avoids heavy deps, keeps IzUI design system consistent
- Install: `@tanstack/react-table @tanstack/react-virtual`

### DB Changes
- None — SmartGrid is a pure UI layer over existing contacts/deals APIs

### API Endpoints (new)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | /api/v1/contacts/:id | withPermission('contacts:write') | Inline edit single contact field |
| PATCH | /api/v1/deals/:id | withPermission('deals:write') | Inline edit single deal field |
| DELETE | /api/v1/contacts | withPermission('contacts:delete') | Bulk delete (body: `{ ids: string[] }`) |
| DELETE | /api/v1/deals | withPermission('deals:delete') | Bulk delete (body: `{ ids: string[] }`) |

### UI Components
- **Modified**: `app/(dashboard)/import/page.tsx` — Step 2 "mapping" page gets SmartGrid replacing the current `<table>` preview
- **New**: `app/(dashboard)/contacts/sheet/page.tsx` — Standalone sheet view
- **New**: `app/(dashboard)/deals/sheet/page.tsx` — Standalone sheet view
- **New**: `components/ui/SmartGrid/` — Reusable grid component

### Engine Functions (hooks/useSmartGrid.ts)
- `useContactsSheet()` — fetches all contacts, exposes mutation for PATCH
- `useDealsSheet()` — fetches all deals, exposes mutation for PATCH
- Both use TanStack Query optimistic updates (from `tanstack-query-expert` skill pattern)

## Implementation Phases
- [ ] Phase 1: Install `@tanstack/react-table` + `@tanstack/react-virtual`; build base `SmartGrid.tsx` with static data
- [ ] Phase 2: `EditableCell.tsx` — click-to-edit, keyboard nav hook, Tab/Enter/Arrow
- [ ] Phase 3: Integrate SmartGrid into import flow (Step 2 review before confirm)
- [ ] Phase 4: PATCH + bulk DELETE API endpoints
- [ ] Phase 5: Standalone `/contacts/sheet` and `/deals/sheet` routes with auto-save
- [ ] Phase 6: Tests (unit: keyboard nav + cell editing; E2E: import → grid → confirm)

## Out of Scope
- Drag-to-fill (Excel-style drag handle for copying values) — Phase 2 future
- Column resize / reorder by drag — future
- Freeze columns — future (left-side checkbox + name col only)
- Field type management (adding new columns) — out of scope for this ERP context
- Real-time multi-user collaboration — out of scope

## Open Questions
- [ ] Should SmartGrid rows have a row-level "dirty" indicator before auto-save?
- [ ] Copy-paste from Excel/Sheets → multi-row paste support needed in v1 or deferred?
