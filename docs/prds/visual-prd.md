# 🎨 Visual PRD — izhubs ERP v0.1 Completion
**Ngày**: 2026-03-17 · **Version**: v0.1 Completion Sprint  
**Mục đích**: Bổ sung hình ảnh UI/UX mockup cho feature checklist — để team align trước khi code.

> Xem [feature-checklist.md](file:///C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/feature-checklist.md) cho full BA analysis (inputs/outputs/acceptance criteria).

---

## 📸 Current State — Pipeline Page

![Current Pipeline page — functional but missing search, filters, view toggle, and stats bar](C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/deals_pipeline_current_1773746668665.png)

> **Nhận xét PO**: Kanban đã work tốt — drag-drop, column counts, deal cards. Nhưng thiếu: search, filters, List view toggle, và sidebar chứa quá nhiều stub items (Contracts, Automation, Reports, Audit Log).

---

## Sprint 1: CRM Core + Shell (~28h)

### E1. 🔴 Sidebar Cleanup — Before vs After

![Sidebar comparison — Before: 9 items with stubs vs After: 5 clean items](C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/sidebar_clean_mockup_1773746820777.png)

**Thay đổi**:
- **Before**: 9 sidebar items → 12/17 pages là "Coming Soon" → user thất vọng
- **After**: Chỉ hiển thị 5 real items: Dashboard, Contacts, Deals, Import, Settings
- Ẩn hoàn toàn: Contracts, Automation, Reports, Audit Log cho đến khi ready

| Acceptance | ✅ |
|---|---|
| Không link nào dẫn đến ComingSoon | Required |
| Sidebar clean, 5-6 items max | Required |
| Khi feature ready → add lại | Required |

---

### A1-A4. 🔴 Contacts Page — Filters, Tabs, Pagination

![Contacts page with status tabs, filter bar, data table, and pagination](C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/contacts_filters_mockup_1773746743449.png)

**Features trong mockup**:

| # | Feature | Mô tả |
|---|---------|-------|
| A2 | **Status Tabs** | `All (342) \| Lead (89) \| Customer (201) \| ⚠️ Stale (12)` |
| A3 | **Filter Bar** | Search + Owner dropdown + Status + Created + Sort |
| A4 | **Pagination** | `← Prev  1-25 of 342  Next →` |
| — | **Status Badges** | 🟢 Active, 🔵 Lead, 🟡 Trial, 🔴 Churned |
| — | **Active filter chips** | `✕ Owner: @me` — dismissable |

**Why (PO)**: Thiếu filter = vô dụng khi >50 contacts. Thiếu pagination = crash khi import 500+ records. Status tabs = phân loại cơ bản nhất.

---

### A1. 🔴 Contact Drawer — Slide-Over Detail

![Contact drawer slide-over with linked deals, notes, and activity sections](C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/contacts_drawer_mockup_1773746725446.png)

**Features trong mockup**:

| # | Feature | Mô tả |
|---|---------|-------|
| A1 | **Drawer layout** | Click row → drawer slide phải, table vẫn visible |
| F1 | **Linked Deals** | Section "Deals (2)" → show deals của contact |
| C1 | **Notes** | Quick note input + note entries with author/time |
| C2 | **Activity** | Auto-logged timeline (created, updated, stage changed) |

**Interaction patterns**:
- Click row → drawer opens (không navigate away)
- Click row khác → drawer update in-place
- `Esc` → close drawer
- [Edit] → inline edit mode
- [Delete] → confirm dialog → soft delete

---

### C1. 🔴 Notes & Activity System

![Notes section with text input and timeline, Activity tab with auto-logged entries](C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/notes_activity_mockup_1773746808181.png)

**Two tabs: Notes + Activity**

| Tab | Content | Editable? |
|-----|---------|-----------|
| **Notes** | User-written notes (plain text), author + timestamp | ✅ Create/Delete |
| **Activity** | Auto-logged CRUD events, stage changes, note additions | ❌ Immutable |

**Notes entries format**:
```
@me · 2h ago
Client muốn redesign homepage, budget $5K, deadline tháng 4
```

**Activity entries format**:
```
🔄 @me moved deal to "Proposal"     2h ago
📝 @me added a note                 2h ago
✏️ @binh updated value to $50K      1d ago
➕ @me created this deal            3d ago
```

**DB**: 2 bảng mới — `notes` (polymorphic) + `activities` (auto-generated)

---

## Sprint 2: Deals + Analytics (~34h)

### B1-B2. 🟡 Enhanced Pipeline — Search, Filters, List Toggle

![Enhanced pipeline with search bar, filters, list/kanban toggle, stats bar, and deal drawer](C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/pipeline_enhanced_mockup_1773746793198.png)

**Features trong mockup**:

| # | Feature | Mô tả |
|---|---------|-------|
| B1 | **List/Kanban toggle** | `[List \| Kanban]` — 2 views cùng data |
| B2 | **Search + Filters** | Search bar + Owner/Value dropdowns |
| — | **Stats bar** | Active Pipeline: $2.4M \| Won: $850K \| Total: 42 |
| — | **Overdue indicator** | Red left-border on cards >14 days idle |
| — | **Slide-over** | Click card → deal detail drawer (đã có) |

**Why (PO)**: Kanban chỉ tốt cho <50 deals. Agency owner có 200+ deals cần List view: sort by value, filter by owner, export. Toggle giữ context khi switch views.

---

### D1. 🟡 Dashboard — Activity Feed + KPI Trends

![Dashboard with trend arrows on KPIs, pipeline chart, recent deals, and activity feed](C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/dashboard_improved_mockup_1773746758275.png)

**Improvements so với current**:

| Feature | Current | Target |
|---------|---------|--------|
| KPI trends | Static numbers | ↑↓ arrows + % change vs 30d |
| Win Rate | Missing | `Won / (Won+Lost)` 30d |
| Due Today | Missing | Activities count |
| Activity Feed | Missing | 5 recent entries "who did what when" |
| Empty state | "No data" text | Onboarding CTA cards |

---

## Sprint 3: Polish + Launch (~31h)

### B3. Pipeline Stages Customization

```
Pipeline Stages                              [+ Add Stage]
───────────────────────────────────────────────────────────
☰  Lead            🟣 Default    [Edit] [Delete]
☰  Discovery       🔵            [Edit] [Delete]
☰  Proposal        🟡            [Edit] [Delete]
☰  SOW Sent        🟠            [Edit] [Delete]
☰  Negotiation     🔴            [Edit] [Delete]
───────────────── closed ──────────────────────
☰  Won             🟢 Locked     [Edit]
☰  Lost            ⚫ Locked     [Edit]
```

- Drag to reorder (☰ handle), Won/Lost không xóa
- Color picker per stage
- Max 10 stages
- **Critical for Gumroad**: mỗi industry template cần pipeline riêng

### E3. Global Search (⌘K)

```
┌─────────────────────────────────────────┐
│ 🔍 Search contacts, deals, settings... │
│ ─────────────────────────────────────── │
│ 👤 Nguyễn An — Contact                  │
│ 💼 ABC Deal — Deal (Proposal)           │
│ ⚙️ Pipeline Stages — Setting            │
└─────────────────────────────────────────┘
```

### E4. Empty State Onboarding

```
┌─────────────────────────────────────────┐
│  🚀 Welcome to izhubs!                  │
│  ① Import contacts from CSV   [Import →]│
│  ② Try the demo              [Demo →]   │
│  ③ Create your first deal   [New Deal →]│
│  [Dismiss]                               │
└─────────────────────────────────────────┘
```

---

## Summary — 3 Sprint Timeline

````carousel
### Sprint 1 (Week 1) — CRM Core
**28h · 3-4 days**

- E1 — Sidebar cleanup (1h)
- A1 — Contact Drawer (4h)
- A2 — Status Tabs (4h)
- A3 — Filter Bar (6h)
- A4 — Pagination (3h)
- C1 — Notes System (8h)
- E2 — Toast Notifications (2h)

**Output**: CRM score 3/10 → **6/10**
<!-- slide -->
### Sprint 2 (Week 2) — Deals + Activity
**34h · 4-5 days**

- F1 — Contact ↔ Deal Linking (4h)
- A5 — Bulk Actions (6h)
- C2 — Activity Timeline (6h)
- D1 — Dashboard Activity Feed (4h)
- B2 — Deals Filters (6h)
- B1 — Deals List View (8h)

**Output**: CRM score 6/10 → **8/10**
<!-- slide -->
### Sprint 3 (Week 3) — Polish + Launch
**31h · 3-4 days**

- B3 — Pipeline Stages (8h)
- D2 — KPI Trends (4h)
- D3 — Win Rate (2h)
- E3 — Global Search ⌘K (8h)
- E4 — Empty State (3h)
- G1 — Gumroad Templates (4h)
- G2 — README GIF (2h)

**Output**: Launch-ready → **Show HN + Gumroad**
````

---

> [!IMPORTANT]
> **Next step**: Review và approve checklist này → bắt đầu Sprint 1.
> Xem full BA analysis (inputs/outputs/acceptance criteria) tại [feature-checklist.md](file:///C:/Users/IsaacVu/.gemini/antigravity/brain/56ba7f72-ec8b-41ba-bc62-52e073b86ee8/feature-checklist.md).
