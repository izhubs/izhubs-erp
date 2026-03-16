# UX Spec: Contacts Page

---

## Layout

```
┌─ Sidebar ──┬─ Header ─────────────────────────────────────────────┐
│            │  Contacts                                   [+ New]  │
│            │  ───────────────────────────────────────────────────  │
│            │  [🔍 Search contacts...]  [Filter ▾] [Owner ▾] [↕]  │
│            │  Tab: All (342) | Lead (89) | Customer (201) | ⚠️(12)│
│            │  ───────────────────────────────────────────────────  │
│            │  ☐  Name        Company     Status   Last Active     │
│            │  ☐  Nguyễn An   ABC Corp    🟢 Active  2h ago        │
│            │  ☐  Trần Bình   XYZ Ltd     🔵 Lead    3d ago        │
│            │  ───────────────────────────────────────────────────  │
│            │  [← Prev]  1–25 of 342  [Next →]                     │
└────────────┴──────────────────────────────────────────────────────┘
```

## Rules

### Search
- Per-page search (not global) — placed top of content area
- Global ⌘K search is v0.2, in header

### Filters
```
[🔍 Search...]   [Filter ▾]  [Owner ▾]  [Created ▾]  [↕ Sort]
```
- `Filter ▾` = dropdown (status, has phone, has email, custom fields)
- `Owner ▾` = separate — used most frequently
- Active filter shows chip: `✕ Status: Lead` (dismissable)

### Status Tabs
```
All (342)  |  Lead (89)  |  Customer (201)  |  ⚠️ Stale (12)
```
- `⚠️ Stale` = no activity in 30+ days — data freshness signal

### Table Columns
| Column | Notes |
|--------|-------|
| ☐ Checkbox | Bulk select |
| Avatar + Name | Click → drawer |
| Company | Linked |
| Status badge | 🟢 Active 🔵 Lead 🟡 Trial 🔴 Churned |
| Last Activity | `2h ago` format |
| Owner | Small avatar |
| ⋯ | Inline: Edit, Delete, Add note |

**Not shown in list:** email, phone (too dense). Visible in drawer.

### Row Click → Drawer (not full navigate)
```
┌─ List still visible ───┬─ Contact Drawer ──────────────────────┐
│ ☐ Nguyễn An  ABC ...  │  Nguyễn An                  [Edit][✕] │
│►☐ Trần Bình  XYZ ...◄│  Engineer @ XYZ · binh@xyz.com        │
│                         │  Status: 🔵 Lead  Owner: @me          │
│                         │  ──────────────────────────────────── │
│                         │  📋 Activity Timeline                 │
│                         │  🔗 Deals: (2 open)                  │
│                         │  📝 Notes              [+ Add]       │
└─────────────────────────┴───────────────────────────────────────┘
```
**Why drawer:** User checks multiple contacts fast. Navigate away + back = too slow.

### Bulk Actions (only when rows selected)
```
☑ 3 selected  [Assign owner ▾]  [Change status ▾]  [Export]  [Delete]
```
Replaces filter bar when selection active.

## Anti-patterns ❌
- Infinite scroll → use pagination (user loses position)
- Too many columns → horizontal scroll on table
- Modal for detail → loses list context
- Always-visible bulk bar → wastes space
