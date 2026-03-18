# 🎯 Đánh Giá — Product Owner / PM / User Perspective
**Ngày**: 2026-03-17 · **Version**: v0.1.0

---

## 1. Spec vs Implementation Gap Analysis

So sánh 4 UX specs (`docs/ux-*.md`) với code thực tế:

### Deals / Kanban

| UX Spec Requirement | Implemented? | Notes |
|---------------------|-------------|-------|
| Kanban drag-drop + optimistic update | ✅ Yes | `@dnd-kit/core`, rollback on fail |
| Deal card: name + value + owner + age | ✅ Yes | `DealCard.tsx` — overdue border too |
| Column header: count + total value | ✅ Yes | `KanbanColumn.tsx` |
| Board stats: pipeline / won / count | ✅ Yes | Top bar in `KanbanBoard.tsx` |
| Won/Lost toggle | ✅ Yes | Checkbox `showClosed` |
| Empty column placeholder `[+ Add]` | ✅ Yes | `onAddDeal` callback |
| New Deal modal | ✅ Yes | `DealFormModal.tsx` |
| **Click card → Drawer (not navigate)** | ✅ Yes | `DealSlideOver.tsx` |
| Drawer: editable fields + save/delete | ✅ Yes | Edit + delete in slide-over |
| `[List \| Kanban]` view toggle | ❌ No | Chỉ có Kanban, không có List view |
| Search + filter bar (Owner, Value) | ❌ No | Không có search/filter trên Kanban |
| Activity timeline trong drawer | ❌ No | Không có activity log |
| Quick note trong drawer | ❌ No | Không có notes system |

### Contacts Page

| UX Spec Requirement | Implemented? | Notes |
|---------------------|-------------|-------|
| Table with avatar + name + company | ✅ Yes | `ContactsTable.tsx` |
| Inline edit / delete | ✅ Yes | Action menu |
| `ContactFormModal` for create/edit | ✅ Yes | Modal form |
| **Search bar** | ✅ Partial | Basic search, không có debounce tốt |
| **Status tabs** (All / Lead / Customer / Stale) | ❌ No | Không có tabs |
| **Filter bar** (Owner, Status, Created) | ❌ No | Không có filters |
| **Click row → Drawer** | ❌ No | Spec yêu cầu drawer, hiện navigate away |
| **Bulk actions** (assign, status, export, delete) | ❌ No | Không có checkbox/bulk |
| **Pagination** | ❌ No | Load tất cả, chưa paginate |
| **Status badges** (Active/Lead/Trial/Churned) | ❌ No | Không có status concept |

### Dashboard

| UX Spec Requirement | Implemented? | Notes |
|---------------------|-------------|-------|
| 4 KPI cards (top row) | ✅ Partial | Có 4 cards nhưng thiếu **Win Rate** và **Due Today** |
| Pipeline bar chart | ✅ Yes | Horizontal bars with colors |
| Recent contacts list | ✅ Yes | Last 5 contacts |
| KPI click → navigate | ✅ Yes | Link to relevant pages |
| **Trend arrows** (↑↓ vs 30d) | ❌ No | Chỉ static numbers |
| **Activity Feed** | ❌ No | Spec yêu cầu "who did what when" — chưa có |
| **Win rate KPI** | ❌ No | Spec: Won/(Won+Lost) 30d |
| **Due Today KPI** | ❌ No | Không có Activities/Tasks system |
| **1vh rule** (no scroll) | ❌ Partial | Page scrolls, widgets không fixed height |

---

## 2. Page Inventory — Real vs Stub

17 pages in `app/(dashboard)/`:

| Page | Status | Component |
|------|--------|-----------|
| `/` (Dashboard) | ✅ **Real** | Server Component, KPIs, pipeline chart |
| `/contacts` | ✅ **Real** | Table + search + modal |
| `/deals` | ✅ **Real** | Full Kanban board |
| `/import` | ✅ **Real** | AI CSV Import wizard |
| `/settings/modules` | ✅ **Real** | App Store UI |
| `/reports` | ⬜ Stub | `ComingSoon` — v0.2 |
| `/contracts` | ⬜ Stub | `ComingSoon` — v0.2 |
| `/automation` | ⬜ Stub | `ComingSoon` — v0.3 |
| `/audit-log` | ⬜ Stub | `ComingSoon` |
| `/dashboard` | ⬜ Stub | Redirect? |
| `/settings` | ⬜ Stub | Settings index |
| `/settings/appearance` | ⬜ Stub | Theme picker |
| `/settings/custom-fields` | ⬜ Stub | Custom fields manager |
| `/settings/extensions` | ⬜ Stub | Extension management |
| `/settings/gdpr` | ⬜ Stub | GDPR compliance |
| `/settings/integrations` | ⬜ Stub | Integration config |
| `/settings/pipeline-stages` | ⬜ Stub | Stage customization |

> [!WARNING]
> **12/17 pages là stubs** — user click vào Sidebar thấy "Coming Soon" ở hầu hết menu items. Đây là trải nghiệm rất tệ cho first impression.

---

## 3. User Journey Analysis

### 🧑‍💼 Journey 1: Agency Owner — "Tôi muốn thử izhubs"

```
1. Vào /demo → chọn Industry + Role → auto-login        ✅ Smooth
2. Thấy Dashboard → KPIs + pipeline chart                ✅ Có data
3. Click "Deals" → Kanban board với demo deals            ✅ WOW moment
4. Drag deal qua column → optimistic update               ✅ Fast
5. Click deal card → SlideOver drawer                     ✅ Edit/Delete works
6. Click "Contacts" → Table                               ⚠️ OK nhưng basic
7. Muốn filter contacts theo status                       ❌ KHÔNG CÓ
8. Click "Reports" → "Coming Soon"                        ❌ Thất vọng
9. Click "Automation" → "Coming Soon"                     ❌ Thất vọng
10. Click "Contracts" → "Coming Soon"                     ❌ Thất vọng
11. Muốn import data từ Airtable → /import               ✅ AI mapping works
12. Muốn xem activity log "ai làm gì"                    ❌ KHÔNG CÓ
```

**Verdict**: Steps 1-6 rất tốt (demo impression). Steps 7-12: user bắt đầu thấy hạn chế. **Risk**: user đánh giá "product chưa ready" vì quá nhiều Coming Soon.

### 👨‍💻 Journey 2: Freelancer — "Tôi muốn migrate từ Airtable"

```
1. Clone + docker compose up + npm run dev                ✅ Docs clear
2. Login/Register                                        ✅ Works
3. Go to /import → drag CSV file                         ✅ Upload works
4. AI maps columns automatically                          ✅ Impressive
5. Confirm → data imported                                ✅ Contacts + Deals
6. Check contacts list → data đúng                       ✅
7. Check kanban → deals phân stage đúng                   ✅
8. Muốn custom fields riêng (freelancer pricing)          ❌ Custom fields = stub
9. Muốn tạo pipeline stages riêng                        ❌ Pipeline stages = stub
10. Muốn gửi email/invoice cho client                    ❌ KHÔNG CÓ
```

**Verdict**: Import flow (1-7) excellent — đây là differentiator. Nhưng sau khi import xong, user không có gì tiếp theo để làm. **"Now what?" problem.**

---

## 4. Tính Năng Thiếu — MoSCoW Prioritization

### 🔴 Must Have (v0.1 — ship TRƯỚC khi launch)

| Feature | Why | Effort |
|---------|-----|--------|
| **Contacts Drawer** | Spec yêu cầu, click row → drawer thay vì navigate | 3-4h |
| **Contacts Filter + Tabs** | Basic usability — không filter = vô dụng khi >50 records | 4-6h |
| **Contacts Pagination** | Performance — load all won't scale | 2-3h |
| **Reduce stub visibility** | Ẩn hoặc disable Sidebar items chưa có | 1-2h |
| **Pipeline Stages customization** | Mỗi industry cần stages riêng | 4-6h |

### 🟡 Should Have (v0.2 — 1 month)

| Feature | Why |
|---------|-----|
| **Activity/Notes system** | Core CRM — mọi CRM đều có |
| **Deals List view** (table) | Kanban chỉ tốt cho <50 deals |
| **Global search (⌘K)** | Quick navigation |
| **Notifications** | User cần biết "có gì mới" |
| **Reports page** (basic) | Pipeline funnel + win rate chart |
| **Custom Fields UI** | User cần add fields riêng |

### 🟢 Could Have (v0.3)

| Feature | Why |
|---------|-----|
| Automation rules | Nice-to-have, không block adoption |
| Contracts module | Specific to certain verticals |
| Email integration | Important nhưng phức tạp |
| Bulk import from Airtable API | CSV import đã đủ cho v0.1 |

### ⚪ Won't Have (v0.4+)

| Feature | Why |
|---------|-----|
| Invoicing | Scope creep — dùng Stripe/Invoice Ninja |
| HR/Payroll | Not CRM scope |
| Inventory | Not agency/freelancer need |

---

## 5. User Experience Issues

### 🔴 Critical UX Problems

1. **"Coming Soon" fatigue** — 12/17 sidebar links → stub. User cảm thấy product chưa ready.
   - **Fix**: Ẩn items chưa có khỏi sidebar (chỉ show khi module active hoặc feature ready)

2. **No empty state guidance** — Dashboard trống khi chưa có data, không hướng dẫn "what to do next"
   - **Fix**: Empty state với CTA: "Import your first contacts" hoặc "Create your first deal"

3. **No notification/feedback system** — User làm action xong không có toast/notification confirm
   - **Fix**: Toast system cho CRUD success/error

4. **Contact → Deal linking yếu** — Không thấy deals của contact, không link ngược
   - **Fix**: Contact drawer show related deals; Deal drawer show linked contact

### 🟡 UX Improvements

5. **Inline CSS trên Dashboard** — Vi phạm architecture rule "no inline CSS"
   - Fix: Migrate sang SCSS module

6. **No loading states** — Pages chờ data không có skeleton/spinner
   - Fix: Add Suspense boundaries + skeleton components

7. **No error boundaries** — API fail → blank page
   - Fix: Error boundary components

8. **Mobile responsive** — Kanban board likely breaks on mobile
   - Fix: Stack columns vertically hoặc swipe navigation

---

## 6. Feature Completeness Scoreboard

So sánh với minimum viable CRM (không phải enterprise, chỉ cho Agency/Freelancer):

| CRM Core Feature | Status | Score |
|-------------------|--------|-------|
| Contact management (CRUD) | ✅ Basic | 5/10 |
| Deal/Pipeline management | ✅ Good | 8/10 |
| Activity tracking | ❌ Missing | 0/10 |
| Notes/Comments | ❌ Missing | 0/10 |
| Search & Filter | ⚠️ Minimal | 3/10 |
| Reports/Analytics | ⬜ Stub | 1/10 |
| Email integration | ❌ Missing | 0/10 |
| Data import | ✅ Excellent | 9/10 |
| Custom fields | ⬜ Stub | 1/10 |
| Multi-user collaboration | ⚠️ Auth only | 3/10 |
| **Overall CRM Score** | | **3/10** |

> [!CAUTION]
> **Kết luận PO/PM**: Product có 2 "wow moments" rất mạnh (AI Import + Kanban drag-drop) nhưng thiếu quá nhiều CRM cơ bản. Một Agency Owner sẽ thử demo → ấn tượng → muốn dùng thật → nhận ra không có activity tracking, notes, filters → bỏ đi.
>
> **Kết luận User**: "Import rất hay, Kanban đẹp, nhưng tôi import xong rồi thì làm gì tiếp? Không có notes, không có reminder, không filter được contacts. Tôi quay lại dùng Airtable vì ít nhất nó có filter."

---

## 7. Recommended Sprint — "CRM Essentials"

> Trước khi launch Show HN, cần 1 sprint 3-5 ngày ship những thứ cơ bản nhất:

| # | Task | Est. | Priority |
|---|------|------|----------|
| 1 | Contact Drawer (click row → slide-over) | 4h | 🔴 Must |
| 2 | Contact Status Tabs + Filters | 4h | 🔴 Must |
| 3 | Contact Pagination (25/page) | 2h | 🔴 Must |
| 4 | Notes system (polymorphic, attach to contact/deal) | 8h | 🔴 Must |
| 5 | Activity timeline (auto-log CRUD events) | 6h | 🟡 Should |
| 6 | Hide stub sidebar items | 1h | 🔴 Must |
| 7 | Toast notification system | 2h | 🟡 Should |
| 8 | Dashboard empty state + onboarding CTA | 2h | 🟡 Should |
| **Total** | | **~29h** | **~3-5 days** |

Ship sprint này → CRM score tăng từ 3/10 lên **6/10** → đủ để launch.
