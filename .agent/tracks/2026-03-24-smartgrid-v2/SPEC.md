# Track: SmartGrid V2 Enhancements
**Created**: 2026-03-20
**Status**: planning
**Priority**: medium

## Summary
Upgrade the V1 SmartGrid with premium UX features: Relational Comboboxes (Searchable Single/Multi-select), Offline Buffering with Batch Sync, UI Mapping Masks (Currency/Phone formatting), and User-preference Column Reordering.

## User Stories
- As a user, I want to search and select relational entities (Users, Companies) directly inside the grid cells so I don't have to type raw UUIDs/Names.
- As a user, I want to edit hundreds of cells instantly without waiting for network requests, syncing them all at once when I press "Save All".
- As a user, I want currency and phone numbers to format beautifully when I finish typing them.
- As a user, I want to drag and drop column headers to rearrange them to my personal preference.

## Acceptance Criteria
- [ ] Relational Combobox: Implemented using IzSelect (React-select) with async fetching attached to the `ownerId` and `companyId` meta definitions.
- [ ] Mapped UI Formatting: Cell blur triggers a visual mask (e.g. $1,000.00) while keeping the underlying editable value as purely numerical (`1000`).
- [ ] Offline Buffer: The grid maintains a `diff` state object. The API is called once with `bulkPATCH` via a central "Save" button instead of firing requests `onBlur`.
- [ ] Column Reordering: Integrates `@dnd-kit/core` or TanStack native reordering into the grid headers and saves the column order array to `localStorage` or User DB Preferences.

## Technical Plan

### DB Changes
- (Optional) User Preferences table if column ordering needs to sync across devices. `user_preferences: { grid_columns_order: JSONB }`

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | /api/v1/contacts/bulk-update | withPermission('contacts:write') | Batch update endpoint |
| PATCH | /api/v1/deals/bulk-update | withPermission('deals:write') | Batch update endpoint |

### UI Components
- Modify: `components/ui/SmartGrid/EditableCell.tsx` to handle async searches and formatting masks.
- Modify: `components/ui/SmartGrid/SmartGrid.tsx` to support column dragging and buffer state holding.

### Engine Functions
- `core/engine/db.ts`: Need a generic `buildBulkUpdateQuery` to handle massive batch PATCH operations efficiently using Postgres `UNNEST` or `UPDATE ... FROM (VALUES ...)` blocks.

## Implementation Phases
- [ ] Phase 1: Relational Combobox (Async Search) + Formatting Masks
- [ ] Phase 2: React-Table Column Reordering implementation
- [ ] Phase 3: Bulk Update API Endpoints + DB `buildBulkUpdateQuery` helper
- [ ] Phase 4: Local Diff Status Buffer & "Save Changes" execution hook

## Out of Scope
- Real-time multiplayer cursors (like Google Sheets multiplayer). That belongs in a V3 WebSocket track.

## Open Questions
- [ ] Do we store column reorder preferences locally (`localStorage`) or on the database per user? LocalStorage is faster for V2.
