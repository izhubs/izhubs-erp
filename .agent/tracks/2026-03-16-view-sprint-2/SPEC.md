# The View - Kanban Board

## Overview
Status: Planning
Type: Feature

**Trigger:** Phase 3 of the All-in-one ERP Bootstrapping roadmap.
**Goal:** Build a drag-and-drop Kanban Board for Deals.
**Success Criteria:** Can drag a Deal from "New" to "Won" and it updates in the database instantly (Optimistic UI).

## Phase 1: API Updates
- [ ] Add `PATCH /api/v1/deals/[id]` to update Deal stage.
- [ ] Ensure stage update emits a `deal.stage_changed` event in the Event Bus.

## Phase 2: UI Components
- [ ] Build `KanbanBoard` component.
- [ ] Build `KanbanColumn` component.
- [ ] Build `DealCard` component.
- [ ] Implement Drag and Drop context.

## Phase 3: Integration
- [ ] Wire up Drag and drop to trigger server action or API call.
- [ ] Implement Optimistic UI updates to make it feel instant.
