# Kanban Board Enhancement Plan

> Created: 2026-03-19 | Status: Backlog

Cải thiện Kanban board của izhubs ERP theo hướng Trello-inspired + ERP-grade.
Đã hoàn thành: layout shift fix, cross-column animation, custom edge auto-scroll.

---

## Phase 1 — Quick Wins (1–2 ngày)

### 1.1 Inline Quick-Add Card ⭐⭐⭐⭐⭐
> Tiết kiệm nhiều click nhất — type trực tiếp vào column, không cần modal.

- Click `+ Add a card` → inline input cuối column → Enter save, Escape cancel
- **Files:** `KanbanColumn.tsx`, `kanban.module.scss`
- **API:** `POST /api/v1/deals` với `stage` + `name`

### 1.2 Drag Handle Visible on Hover
> Icon `⠿` hiện góc trái card khi hover — signal rõ ràng card có thể kéo.

- **Files:** `DealCard.tsx`, `kanban.module.scss` (`.cardDragHandle`)

### 1.3 Drop Zone Glow Animation
> Column border primary + pulse glow khi drag card vào — thay vì chỉ đổi màu nền.

- **Files:** `kanban.module.scss` — update `.columnDragOver`, thêm `@keyframes pulse-glow`

### 1.4 Staggered Card Load Animation
> Cards xuất hiện từng cái với delay 50ms khi board load — cảm giác "sống".

- **Files:** `DealCard.tsx` (animationDelay prop), `KanbanColumn.tsx` (pass index), `kanban.module.scss`

---

## Phase 2 — Core Features (3–5 ngày)

### 2.1 Column Collapse / Minimize ⭐⭐⭐⭐⭐
> Thu cột thành strip 48px dọc với label xoay 90° — giải quyết vấn đề quá nhiều cột.

- Button `‹` ở header → collapse. Persist state vào `localStorage`.
- **Files:** `KanbanColumn.tsx` (isCollapsed prop), `KanbanBoard.tsx` (collapsedColumns state), `kanban.module.scss`

### 2.2 WIP Limits per Column ⭐⭐⭐⭐
> Giới hạn số deals tối đa mỗi stage. Badge `3/5`, vượt limit → highlight đỏ.

- **Config:** thêm `wipLimit?: number` vào `PipelineStageConfig` trong `core/config/pipeline.ts`
- **Files:** `KanbanColumn.tsx`, `kanban.module.scss` (`.columnWipWarning`, `.columnWipOver`)

### 2.3 Quick Filter Bar ⭐⭐⭐⭐
> Filter card ngay trên board — không rời trang.

- 🔍 Search tên deal
- 👤 Filter theo owner (avatar chips)
- 🏷️ Filter theo package tier
- 📅 Overdue only toggle
- **Files:** `KanbanFilterBar.tsx` (new), `KanbanBoard.tsx` (filter state + columnDeals logic)

### 2.4 Card Checklist Preview
> Hiển thị `2/5 ✓` trên card nếu deal có subtasks.

- **Note:** Cần schema `customFields.checklist: [{text, done}]` trước
- **Files:** `DealCard.tsx`, `core/schema/entities.ts`

---

## Phase 3 — Advanced (1–2 tuần)

### 3.1 Swimlane View ⭐⭐⭐⭐
> Rows = người phụ trách, Columns = stage. Toggle từ Kanban view.

- **Files:** `KanbanSwimlane.tsx` (new), `KanbanBoard.tsx` (viewMode state)

### 3.2 Bulk Select + Move
> Checkbox multi-select → floating action bar → "Move to stage X".

- **Files:** `DealCard.tsx` (selectable mode), `KanbanBoard.tsx` (selectedIds), `BulkActionBar.tsx` (new)

### 3.3 Pipeline Analytics Panel ⭐⭐⭐⭐
> Slide-in panel: funnel chart, avg time per stage, win rate by owner.

- **Files:** `PipelineAnalyticsPanel.tsx` (new), `app/(dashboard)/deals/page.tsx`

---

## Priority Table

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Inline Quick-Add | S | ⭐⭐⭐⭐⭐ |
| 2 | Column Collapse | M | ⭐⭐⭐⭐⭐ |
| 3 | Quick Filter Bar | M | ⭐⭐⭐⭐ |
| 4 | WIP Limits | S | ⭐⭐⭐⭐ |
| 5 | Drop Zone Glow | XS | ⭐⭐⭐ |
| 6 | Drag Handle | XS | ⭐⭐⭐ |
| 7 | Staggered Load | XS | ⭐⭐ |
| 8 | Checklist Preview | M | ⭐⭐⭐ |
| 9 | Swimlane View | L | ⭐⭐⭐⭐ |
| 10 | Bulk Select | L | ⭐⭐⭐ |
| 11 | Analytics Panel | L | ⭐⭐⭐⭐ |

> **Effort:** XS = <1h · S = nửa ngày · M = 1 ngày · L = 2–3 ngày
