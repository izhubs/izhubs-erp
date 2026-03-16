# UX Spec: Dashboard Page

---

## The 1vh Rule (non-negotiable)
Everything important must be visible without scrolling. Dashboard = at-a-glance view, not a report page.

## Layout

```
┌─ Sidebar ──┬─ Header (Dashboard · [date]) ────────────────────────┐
│            │                                                        │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│            │  │ 15 deals │ │  $2.4B   │ │  68%     │ │  3 due │  │
│            │  │ in pipe  │ │ pipeline │ │ win rate │ │  today │  │
│            │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│            │  ─────────────────────────────────────────────────── │
│            │  ┌─ Pipeline Overview ──────┐ ┌─ Recent Deals ─────┐ │
│            │  │  (funnel chart)          │ │  ABC - Proposal     │ │
│            │  │  NEW ████████ 12         │ │  XYZ - Qualified    │ │
│            │  │  CONTACTED ██████ 8      │ │  Big - New (3d)     │ │
│            │  │  QUALIFIED ████ 5        │ │  ...max 5 rows      │ │
│            │  │  PROPOSAL ██ 3           │ │  [View all →]       │ │
│            │  └──────────────────────────┘ └─────────────────────┘ │
│            │  ─────────────────────────────────────────────────── │
│            │  ┌─ Activity Feed ────────────────────────────────┐  │
│            │  │  @nguyen moved ABC → Qualified  2h ago         │  │
│            │  │  @binh added note on XYZ        5h ago         │  │
│            │  │  New contact: Lê Chi (imported) yesterday       │  │
│            │  │  ...max 5 items                  [View all →]  │  │
│            │  └────────────────────────────────────────────────┘  │
└────────────┴────────────────────────────────────────────────────────┘
```

## KPI Cards (top row)
| Card | What it shows | Click action |
|------|--------------|--------------|
| Deals in pipeline | Count of open deals | → Deals page |
| Pipeline value | Sum of open deal values | → Deals page |
| Win rate (30d) | Won / (Won + Lost) | → Reports |
| Due today | Activities due today | → Activities |

**Format:** Big number + small label + trend arrow (↑↓) vs last 30 days

## Pipeline Overview (left panel)
- Horizontal bar chart — stage name + bar + count
- NOT a pie chart (hard to read stage distribution)
- Click bar → Deals page filtered to that stage

## Recent Deals (right panel)
- Max 5 rows: deal name · stage badge · days since last activity
- Sort: last activity (most stale first = needs attention)
- `[View all →]` → Deals page

## Activity Feed (bottom)
- Max 5 items: who did what to which record, when
- Timestamp: relative (`2h ago`, `yesterday`)
- Click item → opens relevant record drawer

## What Dashboard is NOT
- Not a full report page — reports = separate page
- Not a task manager — activities = separate section
- No infinite scroll — fixed widgets, scrolling = separate pages

## Widget height rule
```scss
.dashboard-widget {
  height: calc((100vh - var(--header-height) - var(--kpi-row-height) - 48px) / 2);
  overflow-y: auto; // widget scrolls, not the page
}
```
