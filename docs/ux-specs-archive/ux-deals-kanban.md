# UX Spec: Deals / Kanban Page

---

## Layout — Two views: Kanban (default) + List

```
┌─ Sidebar ──┬─ Header ─────────────────────────────────────────────────┐
│            │  Deals                          [List | Kanban] [+ New]  │
│            │  ─────────────────────────────────────────────────────── │
│            │  [🔍 Search...]  [Owner ▾] [Value ▾] [Filter ▾]         │
│            │                                                           │
│            │  NEW (12)    CONTACTED (8)  QUALIFIED (5)  PROPOSAL (3)  │
│            │  ┌─────────┐ ┌───────────┐ ┌──────────┐  ┌──────────┐  │
│            │  │[+]      │ │           │ │          │  │          │  │
│            │  │ ABC Deal│ │ XYZ Deal  │ │ Big Corp │  │ MegaCorp │  │
│            │  │ 50M     │ │ 12M       │ │ 200M     │  │ 80M      │  │
│            │  │ @me 3d  │ │ @binh 1w  │ │ @me 2d   │  │ @chi 5d  │  │
│            │  └─────────┘ └───────────┘ └──────────┘  └──────────┘  │
│            │  ... more    ... more                                     │
└────────────┴───────────────────────────────────────────────────────────┘
```

## Kanban Card — What to show

```
┌────────────────────────────────┐
│ ABC Corporation Deal     ⋯    │  ← company name + action menu
│ Tư vấn triển khai ERP         │  ← deal name
│                                │
│ 💰 50,000,000 VND              │  ← value (prominent)
│                                │
│ 👤 @nguyen   📅 3d ago        │  ← owner + last activity
└────────────────────────────────┘
```

**Show on card:** name, value, owner, last activity age  
**Don't show:** email, phone, notes (too dense)  
**Color signal:** card border-left if overdue (no activity 14+ days) = `--color-warning`

## Column Header
```
NEW  (12)  $240M
```
Count + total value per column — pipeline health at a glance.

## Drag behavior
- Drag card to new column → optimistic update immediately
- PATCH `/api/v1/deals/[id]` with `{ stage: 'qualified' }` in background
- If API fails → rollback + toast: "Failed to move deal, please try again"

## Deal Drawer (same pattern as Contacts)
Click card → right drawer, list still visible:
```
┌─ Kanban still visible ─────┬─ Deal Drawer ──────────────────────┐
│                             │  ABC Corporation Deal    [Edit][✕] │
│  [card selected]           │  Stage: QUALIFIED                   │
│                             │  Value: 50,000,000 VND             │
│                             │  Owner: @nguyen                    │
│                             │  Contact: Nguyễn An (linked)       │
│                             │  ─────────────────────────────── │
│                             │  📋 Activity Timeline             │
│                             │  📝 Quick note    [+ Add]         │
└─────────────────────────────┴───────────────────────────────────┘
```

## WON / LOST columns
- Not shown on main kanban — too wide
- Accessible via List view + filter `stage: won`
- Or toggle: `[Show Won/Lost]` checkbox above kanban

## Anti-patterns ❌
- Don't show all 7 columns including Won/Lost (too wide, rarely needed daily)
- Don't navigate away on card click (use drawer)
- Don't re-fetch all deals after drag (optimistic update only)
- Don't show empty state as blank columns (show `[+] Add deal` card placeholder)
