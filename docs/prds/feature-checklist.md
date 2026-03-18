# 📋 izhubs ERP — Feature Checklist (PO / UX / BA)
**Ngày tạo**: 2026-03-17 · **Version**: v0.1 Completion Sprint  
**Mục đích**: Master checklist trước khi code — mọi tính năng đều có lý do, đầu vào, đầu ra rõ ràng.

---

## Hướng dẫn đọc

Mỗi feature có 3 góc nhìn:
- **🎯 PO (Product Owner)**: _Tại sao_ feature này tồn tại? Business value? Ai cần?
- **📐 UX**: _Như thế nào_? Layout, interaction, edge cases
- **📊 BA (Business Analyst)**: _Đầu vào / Đầu ra / Acceptance Criteria_

Ưu tiên:
- 🔴 **P0 — Critical**: Phải có trước khi launch. Thiếu = user bỏ đi.
- 🟡 **P1 — High**: Nên có. Tăng retention đáng kể.
- 🟢 **P2 — Medium**: Tốt nếu có. Tăng polish.
- ⚪ **P3 — Nice-to-have**: Làm sau. Không block launch.

---

## A. CRM Core — Contact Management

### A1. 🔴 Contact Drawer (Slide-Over)
**Status**: ❌ Chưa có

**🎯 PO**: User cần xem chi tiết contact mà không mất ngữ cảnh danh sách. UX spec yêu cầu drawer pattern giống Linear / Notion. Nếu navigate full page, user mất vị trí scroll → frustration khi scan nhiều contacts liên tục.

**📐 UX**:
- Click row trong bảng contacts → Drawer slide từ phải (50% width)
- Bảng vẫn visible phía trái, row được selected highlighted
- Drawer hiển thị: avatar, name, company, email, phone, status, owner
- Sections trong drawer: Info | Deals (linked) | Notes | Activity Timeline
- Buttons: [Edit] [Delete] [✕ Close]
- Keyboard: `Esc` = close, `↑↓` = prev/next contact

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Click vào row contact trong bảng |
| **Output** | Drawer mở bên phải hiển thị full detail của contact |
| **API** | `GET /api/v1/contacts/:id` (đã có) |
| **Acceptance Criteria** | 1) Click row → drawer opens trong <200ms; 2) Bảng bên trái vẫn visible; 3) Click row khác → drawer update, ko cần đóng mở lại; 4) [Edit] → form inline / modal; 5) Esc → close |

---

### A2. 🔴 Contact Status Tabs
**Status**: ❌ Chưa có

**🎯 PO**: Agency owner cần phân loại contacts: Lead mới, Customer đang serve, Stale cần follow-up. Không có tabs = tất cả đổ chung 1 list → không biết ưu tiên ai. Đây là tính năng CRM cơ bản nhất mà mọi đối thủ (HubSpot, Pipedrive) đều có.

**📐 UX**:
```
All (342)  |  Lead (89)  |  Customer (201)  |  ⚠️ Stale (12)
```
- `All`: tất cả contacts (trừ deleted)
- `Lead`: `status = 'lead'` — chưa convert
- `Customer`: `status = 'customer'` — đang active
- `⚠️ Stale`: không có activity trong 30+ ngày — data freshness signal
- Mỗi tab hiển thị count. Click tab → filter bảng, giữ nguyên search/sort

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Click tab trên Contacts page |
| **Output** | Bảng filter theo status tương ứng, count update |
| **DB Change** | Cần thêm column `status` vào bảng `contacts` (enum: `lead`, `customer`, `prospect`, `churned`) nếu chưa có |
| **API** | `GET /api/v1/contacts?status=lead` — thêm query param |
| **Acceptance Criteria** | 1) Mặc định tab "All" active; 2) Click tab → bảng update, URL query updated; 3) Stale = contacts mà `updated_at < NOW() - 30 days`; 4) Count chính xác, real-time |

---

### A3. 🔴 Contact Filter Bar
**Status**: ❌ Chưa có

**🎯 PO**: Khi có >50 contacts, user PHẢI filter được. Không filter = vô dụng. Mọi CRM đều có filter. Đặc biệt Owner filter quan trọng cho team — "show me only MY contacts."

**📐 UX**:
```
[🔍 Search...]  [Owner ▾]  [Status ▾]  [Created ▾]  [↕ Sort]
```
- `Search`: full-text search name, email, company — debounce 300ms
- `Owner ▾`: dropdown list team members
- `Status ▾`: dropdown (All, Lead, Customer, Prospect, Churned)
- `Created ▾`: preset ranges (Today, This week, This month, Custom)
- Active filter → show chip: `✕ Owner: @me` (dismissable)
- Clear all filters button khi có filter active

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | User chọn filter values từ dropdowns |
| **Output** | Bảng contacts filter theo điều kiện, URL query params update |
| **API** | `GET /api/v1/contacts?owner_id=xxx&status=lead&search=abc` |
| **Acceptance Criteria** | 1) Filters composable (combine nhiều filters); 2) Clear filter → reset; 3) URL params → shareable / bookmarkable; 4) Search debounce 300ms; 5) Empty result → "No contacts match filters" |

---

### A4. 🔴 Contact Pagination
**Status**: ❌ Chưa có (load all)

**🎯 PO**: Load tất cả contacts = crash khi user import 500+ contacts từ Airtable. Đây không phải feature, mà là **technical requirement** để product hoạt động. Không paginate = product vỡ khi data thật.

**📐 UX**:
```
[← Prev]  1–25 of 342  [Next →]
```
- Default page size: 25
- Compact pagination bar dưới bảng
- Giữ nguyên filters/search khi chuyển page
- Keyboard: Page Up/Down (optional)

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Click Prev/Next hoặc page number |
| **Output** | Bảng hiển thị 25 records theo page |
| **API** | `GET /api/v1/contacts?page=2&limit=25` (cần thêm `page` param) |
| **Acceptance Criteria** | 1) Default 25/page; 2) Prev disabled ở page 1; 3) Next disabled ở last page; 4) Total count hiển thị chính xác; 5) Page state persist khi filter thay đổi (reset về page 1) |

---

### A5. 🔴 Contact Bulk Actions
**Status**: ❌ Chưa có

**🎯 PO**: User import 200 contacts → cần gán owner cho 50 contacts cùng lúc, hoặc đổi status 30 contacts. Không có bulk = phải click từng cái → 50 clicks = user bỏ đi dùng Airtable.

**📐 UX**:
```
Khi chưa select: [🔍 Search...]  [Owner ▾]  [Status ▾]
Khi đã select:   ☑ 3 selected  [Assign Owner ▾]  [Change Status ▾]  [Export]  [Delete]
```
- Checkbox trên mỗi row + header checkbox (select all on page)
- Bulk bar thay thế filter bar khi có selection
- Confirm dialog cho Delete: "Delete 3 contacts? This cannot be undone."
- Export: CSV download selected contacts

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | User select checkbox + chọn bulk action |
| **Output** | Tất cả selected contacts được update cùng lúc |
| **API** | `PATCH /api/v1/contacts/bulk` — body: `{ ids: [...], update: { ownerId: 'xxx' } }` |
| **Acceptance Criteria** | 1) Select all = chỉ select page hiện tại; 2) Count chính xác; 3) Bulk delete → soft delete all; 4) Success toast: "3 contacts updated"; 5) Deselect all sau action thành công |

---

## B. Pipeline & Deals

### B1. 🟡 Deals List View (Table)
**Status**: ❌ Chưa có (chỉ Kanban)

**🎯 PO**: Kanban tuyệt vời cho <50 deals, nhưng Agency owner có 200+ deals cần xem theo bảng: sort theo value, filter theo owner, export. HubSpot, Pipedrive đều có 2 views. Spec UX yêu cầu toggle `[List | Kanban]`.

**📐 UX**:
```
Deals                    [List | Kanban]  [+ New Deal]
───────────────────────────────────────────────────────
[🔍 Search...]  [Stage ▾]  [Owner ▾]  [Value ▾]
───────────────────────────────────────────────────────
☐  Name          Company      Stage      Value     Owner   Updated
☐  ABC Deal      ABC Corp     Proposal   $50K      @me     2d ago
```
- Toggle giữ state khi switch (filter, search persist)
- Table sortable theo mỗi column header (click to sort)
- Row click → DealSlideOver (drawer đã có)

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Click "List" toggle trên Deals page |
| **Output** | Bảng deals thay thế Kanban view, cùng data |
| **API** | `GET /api/v1/deals?view=list&sort=value&order=desc` |
| **Acceptance Criteria** | 1) Toggle giữ state; 2) Sort by column; 3) Row click → drawer; 4) Filters giữa 2 views đồng bộ |

---

### B2. 🟡 Deals Search & Filters
**Status**: ❌ Chưa có trên Kanban

**🎯 PO**: Agency owner có 100+ deals, cần tìm deal cụ thể hoặc lọc theo owner. "Show me only MY deals in Proposal stage" — nếu không filter được, user phải scan bằng mắt → chậm, sai sót.

**📐 UX**:
```
[🔍 Search deals...]  [Owner ▾]  [Value: min-max]  [Filter ▾]
```
- Search: tìm theo deal name, company name
- Owner filter: dropdown team members
- Value filter: range slider hoặc min/max input
- Filter áp dụng cho cả Kanban và List view

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Chọn filters trên Deals page |
| **Output** | Kanban/List chỉ hiển thị deals match filter |
| **API** | `GET /api/v1/deals?search=abc&owner_id=xxx&min_value=1000` |
| **Acceptance Criteria** | 1) Search debounce 300ms; 2) Filters composable; 3) Kanban column counts update theo filter; 4) Clear filters → show all |

---

### B3. 🟡 Pipeline Stages Customization
**Status**: ⬜ Stub page (`/settings/pipeline-stages`)

**🎯 PO**: Mỗi industry cần stages khác nhau. Agency: `Lead → Discovery → Proposal → SOW → Won`. Restaurant: `Inquiry → Tasting → Booked → Deposit → Done`. Hardcode 7 stages = chỉ fit 1 workflow. Đây là **BLOCKER cho Gumroad templates** — mỗi template cần pipeline riêng.

**📐 UX**:
```
Pipeline Stages                              [+ Add Stage]
───────────────────────────────────────────────────────────
☰  New           ● Default    [Edit] [Delete]
☰  Contacted     ●            [Edit] [Delete]
☰  Qualified     ●            [Edit] [Delete]
☰  Proposal      ●            [Edit] [Delete]
☰  Negotiation   ●            [Edit] [Delete]
───────────────── closed ──────────────────────
☰  Won           ● Closed-Won   (non-deletable)
☰  Lost          ● Closed-Lost  (non-deletable)
```
- Drag-reorder stages (☰ handle)
- Won/Lost stages không xóa được (system required)
- Max 10 stages (prevent abuse)
- Color picker cho mỗi stage

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Admin vào Settings → Pipeline Stages → add/edit/reorder |
| **Output** | Kanban board update columns theo config mới |
| **DB Change** | Bảng `pipeline_stages` mới: `id, tenant_id, name, position, color, is_closed, is_won` |
| **API** | `GET/POST/PATCH/DELETE /api/v1/settings/pipeline-stages` |
| **Acceptance Criteria** | 1) Reorder → Kanban update; 2) Won/Lost không xóa; 3) Rename stage → existing deals giữ stage mới; 4) Delete stage → prompt user move deals sang stage khác; 5) Per-tenant isolation |

---

## C. Notes & Activity System

### C1. 🔴 Notes System (Polymorphic)
**Status**: ❌ Chưa có

**🎯 PO**: Đây là tính năng CRM cơ bản nhất sau CRUD. Agency owner cần ghi lại: "Client muốn redesign homepage, budget $5K, deadline tháng 4". Không có notes = user mở Google Docs bên cạnh → izhubs trở thành tool phụ, không phải tool chính. **Tính năng này quyết định user có ở lại hay không.**

**📐 UX**:
```
─── Notes ─────────────────────────────────
📝 Quick note                    [+ Add]
──────────────────────────────────────────
@me · 2h ago
Client muốn redesign homepage, budget $5K

@binh · 1d ago  
Đã gửi proposal qua email

@me · 3d ago
First call — rất interested, hẹn demo thứ 5
──────────────────────────────────────────
```
- Hiển thị trong Contact Drawer và Deal Drawer (polymorphic — cùng hệ thống, attach vào entity khác nhau)
- Textarea + submit, không cần rich text (v0.1 = plain text)
- Sort: newest first
- Badges: author + relative time
- Delete note: chỉ author hoặc admin

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | User gõ text + click Add trong drawer |
| **Output** | Note xuất hiện trong timeline, persist trong DB |
| **DB Change** | Bảng `notes` mới: `id, tenant_id, entity_type ('contact'/'deal'), entity_id, author_id, content, created_at, deleted_at` |
| **API** | `GET /api/v1/notes?entity_type=contact&entity_id=xxx` · `POST /api/v1/notes` · `DELETE /api/v1/notes/:id` |
| **Acceptance Criteria** | 1) Create note → appears immediately (optimistic); 2) Notes sorted newest first; 3) Delete → soft delete, disappear from UI; 4) Author name + avatar hiển thị; 5) Empty state: "No notes yet. Add one!" |

---

### C2. 🟡 Activity Timeline (Auto-log)
**Status**: ❌ Chưa có

**🎯 PO**: Agency manager cần biết "ai đã làm gì với deal ABC tuần qua?" — nếu không có activity log, manager phải hỏi nhân viên → bottleneck. Activity log tự động = transparency trong team. Ngoài ra, Dashboard spec yêu cầu "Activity Feed" widget — cần data source này.

**📐 UX**:
```
─── Activity ──────────────────────────────
📋 Timeline
──────────────────────────────────────────
🔄 @me moved deal to "Proposal"      2h ago
📝 @me added a note                  2h ago  
✏️ @binh updated value to $50K       1d ago
➕ @me created this deal             3d ago
──────────────────────────────────────────
```
- Hiển thị trong Contact/Deal Drawer, tab "Activity"
- Auto-generated khi: create, update fields, change stage, add note, delete
- Không editable (immutable audit log)
- Grouped by day khi nhiều items

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Tự động — mỗi CRUD action tạo 1 activity entry |
| **Output** | Timeline hiển thị chronological log |
| **DB Change** | Bảng `activities` mới: `id, tenant_id, entity_type, entity_id, actor_id, action ('created'/'updated'/'stage_changed'/'note_added'/'deleted'), meta (JSONB), created_at` |
| **Integration** | Hook vào Event Bus (`contact.created`, `deal.stage_changed`, etc.) |
| **Acceptance Criteria** | 1) Tự động log khi CRUD; 2) Không tay tạo/sửa/xóa activity; 3) meta chứa diff (old_value → new_value); 4) Max 50 per load, scroll to load more |

---

## D. Dashboard & Analytics

### D1. 🟡 Dashboard Activity Feed
**Status**: ❌ Chưa có

**🎯 PO**: Dashboard spec yêu cầu "Activity Feed" — manager mở app buổi sáng → biết ngay "team đã làm gì hôm qua". Không có activity feed = dashboard chỉ là bảng số tĩnh, không có narrative.

**📐 UX**:
```
─── Activity Feed ─────────────────────────
@nguyen moved ABC → Qualified       2h ago
@binh added note on XYZ             5h ago
New contact: Lê Chi (imported)    yesterday
... max 5 items              [View all →]
───────────────────────────────────────────
```
- Max 5 items, click "View all" → `/audit-log` hoặc full activity page
- Click item → mở drawer của entity tương ứng
- Data source: bảng `activities` (C2)

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Dashboard page load |
| **Output** | 5 recent activities across all entities |
| **API** | `GET /api/v1/activities?limit=5` |
| **Dependency** | C2 (Activity Timeline) phải có trước |
| **Acceptance Criteria** | 1) Show 5 newest; 2) Click → open entity drawer; 3) Author avatar + name; 4) Relative time; 5) Empty state nếu mới setup |

---

### D2. 🟢 Dashboard KPI Trends
**Status**: ❌ Chưa có (numbers tĩnh)

**🎯 PO**: Static numbers không nói lên xu hướng. "$50K pipeline" là tốt hay xấu? Cần trend: "↑ 15% so với 30 ngày trước" → user biết đang đi đúng hướng. HubSpot luôn show trend arrows — đây là tiêu chuẩn.

**📐 UX**:
```
┌──────────────────┐
│ 15 deals         │
│ in pipeline      │
│ ↑ 3 (+25%)       │  ← trend vs last 30d
└──────────────────┘
```
- Arrow ↑ green / ↓ red / → gray (neutral)
- Percentage change vs 30 days ago
- Tooltip: "15 deals now vs 12 deals 30 days ago"

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Dashboard load |
| **Output** | Mỗi KPI card thêm trend arrow + percentage |
| **Logic** | Query count/sum tại `NOW() - 30 days`, so sánh với current |
| **Acceptance Criteria** | 1) ↑ green khi tăng; 2) ↓ red khi giảm; 3) → gray khi bằng hoặc ±1%; 4) Tooltip giải thích |

---

### D3. 🟢 Win Rate KPI
**Status**: ❌ Chưa có

**🎯 PO**: Agency owner cần biết: "bao nhiêu % deals tôi win?" — đây là KPI quan trọng nhất của sales. UX spec Dashboard yêu cầu "Win rate (30d)" là 1 trong 4 KPI cards.

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Dashboard load |
| **Output** | Card hiển thị: `Win Rate: 68%` |
| **Formula** | `Won / (Won + Lost)` cho deals closed trong 30 ngày gần nhất |
| **Edge case** | Nếu 0 closed deals → show "—" thay vì 0% hoặc NaN |
| **Acceptance Criteria** | 1) Đúng 30-day window; 2) Percentage format; 3) Handle 0 closed deals |

---

## E. Navigation & Shell

### E1. 🔴 Hide/Disable Stub Sidebar Items
**Status**: ❌ 12/17 items = "Coming Soon"

**🎯 PO**: User click "Reports" → "Coming Soon" → click "Automation" → "Coming Soon" → click "Contracts" → "Coming Soon". Sau 3 lần, user nghĩ: "Product này chưa ready, tôi đi dùng cái khác." **First impression quyết định retention.** Phải ẩn hoặc disable rõ ràng.

**📐 UX**:
- **Option A** (recommended): Ẩn hoàn toàn items chưa ready. Sidebar chỉ show: Dashboard, Contacts, Deals, Import, Settings (modules only)
- **Option B**: Show nhưng grayed out + tooltip "Coming in v0.2" + lock icon 🔒
- **KHÔNG ĐƯỢC**: Show normal → navigate → blank "Coming Soon"

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | N/A — config change |
| **Output** | Sidebar chỉ hiển thị items có real page |
| **Scope** | Ẩn: Reports, Contracts, Automation, Audit Log, Settings (trừ Modules) |
| **Acceptance Criteria** | 1) Không có link nào dẫn đến ComingSoon; 2) Sidebar clean, 5-6 items max; 3) Khi feature ready → add lại vào sidebar |

---

### E2. 🟡 Toast Notification System
**Status**: ❌ Chưa có

**🎯 PO**: User tạo contact → không có feedback → "nó đã save chưa?" → refresh page để check. Không có toast = user mất tin tưởng vào hệ thống. Mọi SaaS hiện đại đều có toast notifications.

**📐 UX**:
```
┌──────────────────────────────────────┐
│ ✅ Contact created successfully      │  ← top-right, auto-dismiss 3s
└──────────────────────────────────────┘
```
- Position: top-right, stack downward
- Auto-dismiss: 3s cho success, 5s cho error
- Types: success (green), error (red), warning (amber), info (blue)
- Manual dismiss: click ✕

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | API response success/error |
| **Output** | Toast popup với message |
| **Component** | Zustand toast store + `<ToastContainer />` in root layout |
| **Acceptance Criteria** | 1) Show trên mọi CRUD action; 2) Auto-dismiss; 3) Stackable; 4) Error toast không auto-dismiss (user cần đọc) |

---

### E3. 🟢 Global Search (⌘K)
**Status**: ❌ Chưa có (planned v0.2)

**🎯 PO**: Power users muốn tìm nhanh: `⌘K` → gõ tên → jump đến record bất kỳ. Linear, Notion, Slack đều có. Đây là UX signature cho "pro tool" vibe.

**📐 UX**:
```
⌘K → Modal:
┌─────────────────────────────────────────┐
│ 🔍 Search contacts, deals, settings... │
│ ─────────────────────────────────────── │
│ 👤 Nguyễn An — Contact                  │
│ 💼 ABC Deal — Deal (Proposal)           │
│ ⚙️ Pipeline Stages — Setting            │
└─────────────────────────────────────────┘
```
- Unified search across contacts, deals, settings pages
- Recent items khi chưa gõ gì
- Keyboard navigation: ↑↓ select, Enter → navigate

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | `⌘K` (Mac) / `Ctrl+K` (Windows) |
| **Output** | Search modal → click result → navigate to entity |
| **API** | `GET /api/v1/search?q=abc` — search across entities |
| **Acceptance Criteria** | 1) <100ms render; 2) Debounce 200ms; 3) Max 10 results; 4) ⌘K from anywhere; 5) Esc → close |

---

### E4. 🟢 Dashboard Empty State & Onboarding
**Status**: ❌ Chưa có

**🎯 PO**: User mới register → Dashboard trống: 0 contacts, 0 deals, $0 pipeline. Trống = boring = bỏ đi. Cần CTA hướng dẫn: "Import your first contacts" hoặc "Try the demo". Giảm drop-off rate từ registration → first value.

**📐 UX**:
```
┌─────────────────────────────────────────┐
│  🚀 Welcome to izhubs!                  │
│                                          │
│  Get started in 3 steps:                 │
│  ① Import contacts from CSV   [Import →] │
│  ② Check out the demo        [Demo →]    │
│  ③ Create your first deal    [New Deal →]│
│                                          │
│  [Dismiss — I'll explore on my own]      │
└─────────────────────────────────────────┘
```
- Show khi `totalContacts === 0 && totalDeals === 0`
- Dismissable — store in localStorage `onboarding_dismissed`
- Không show nữa khi user đã có data hoặc đã dismiss

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Dashboard load + no data detected |
| **Output** | Onboarding card hiển thị thay cho KPIs |
| **Acceptance Criteria** | 1) Show chỉ khi 0 data; 2) Dismiss persists; 3) Links đúng routes; 4) Sau khi import → auto-hide |

---

## F. Data Management

### F1. 🔴 Contact ↔ Deal Linking
**Status**: ⚠️ DB has `contact_id` on deals, UI chưa hiển thị rõ

**🎯 PO**: CRM là về **quan hệ**: Contact A có 3 Deals. Deal X thuộc về Contact B. Nếu không link visible, user phải nhớ trong đầu → sai sót. Đây là core of CRM — relationship management.

**📐 UX**:
- **Contact Drawer** → section "Deals": list deals linked to this contact
  ```
  🔗 Deals (2)
  ├ ABC Deal — Proposal — $50K
  └ XYZ Project — New — $12K
  [+ Link Deal]
  ```
- **Deal Drawer** → section "Contact": show linked contact
  ```
  👤 Contact: Nguyễn An (Agency Director) [View]
  ```
- Click → navigate đến entity tương ứng

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Open Contact/Deal drawer |
| **Output** | Related entities displayed |
| **API** | `GET /api/v1/contacts/:id/deals` · deals already have `contact_id` |
| **Acceptance Criteria** | 1) Contact drawer show deal list; 2) Deal drawer show contact info; 3) Click → cross-navigate; 4) Count badge trên section header |

---

### F2. 🟢 CSV Export
**Status**: ❌ Chưa có

**🎯 PO**: User import data vào → cũng cần export ra. "Tôi cần gửi list contacts cho accountant" hoặc backup data. Không có export = data lock-in → mất trust.

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Click [Export] trên Contacts/Deals page |
| **Output** | CSV file download |
| **API** | `GET /api/v1/contacts/export?format=csv` |
| **Scope** | Export respects current filters/search |
| **Acceptance Criteria** | 1) UTF-8 CSV; 2) Headers = column names; 3) Respects active filters; 4) Max 10K rows |

---

## G. Gumroad & Launch (Pre-Launch Essentials)

### G1. 🔴 Gumroad Template Package
**Status**: ❌ Chưa có · **BLOCKER cho revenue**

**🎯 PO**: Revenue = $0. Templates ($29 each) là con đường nhanh nhất đến first dollar. Mỗi template = JSON config + seed data + README hướng dẫn setup. 2 templates: Agency Starter + Freelancer OS.

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Package seed data + config thành distributable format |
| **Output** | 2 Gumroad products: `.zip` chứa seed script + setup guide |
| **Contents** | `seed-[industry].js` + `README.md` + `screenshot.png` |
| **Acceptance Criteria** | 1) Buyer download → extract → `npm run seed:agency` → full data; 2) README clear step-by-step; 3) Gumroad listing with screenshots |

---

### G2. 🔴 README Demo GIF
**Status**: ❌ Chưa có

**🎯 PO**: GitHub README without GIF = invisible. Top trending repos LUÔN có GIF demo. 30s recording: login → import CSV → kanban drag-drop. Đây là marketing asset #1 cho Show HN.

**📊 BA**:
| | Chi tiết |
|---|---|
| **Input** | Screen recording of demo flow |
| **Output** | GIF/WebP embedded in README.md |
| **Flow to record** | Demo login → Import → Kanban → drag deal → slide-over |
| **Acceptance Criteria** | 1) <10MB file size; 2) Clear, readable; 3) Shows key features in 30s; 4) Embedded in README |

---

## Tổng Kết — Priority Matrix

| Priority | Count | Est. Total | Items |
|----------|-------|-----------|-------|
| 🔴 P0 Critical | 9 | ~50h | A1-A5, C1, E1, F1, G1 |
| 🟡 P1 High | 6 | ~40h | B1-B3, C2, D1, E2 |
| 🟢 P2 Medium | 5 | ~25h | D2, D3, E3, E4, F2 |
| ⚪ P3 (deferred) | 2 | — | G2 + future |

### Suggested Sprint Order

```
Sprint 1 (Week 1): CRM Core + Shell
├── E1  Hide stubs (1h)
├── A1  Contact Drawer (4h)
├── A2  Contact Status Tabs (4h)
├── A3  Contact Filter Bar (6h)
├── A4  Contact Pagination (3h)
├── C1  Notes System (8h)
└── E2  Toast System (2h)
    Total: ~28h (3-4 days)

Sprint 2 (Week 2): Deals + Activity
├── F1  Contact ↔ Deal Linking (4h)
├── A5  Bulk Actions (6h)
├── C2  Activity Timeline (6h)
├── D1  Dashboard Activity Feed (4h)
├── B2  Deals Search & Filters (6h)
└── B1  Deals List View (8h)
    Total: ~34h (4-5 days)

Sprint 3 (Week 3): Polish + Launch
├── B3  Pipeline Stages Custom (8h)
├── D2  KPI Trends (4h)
├── D3  Win Rate KPI (2h)
├── E3  Global Search ⌘K (8h)
├── E4  Empty State & Onboarding (3h)
├── G1  Gumroad Templates (4h)
└── G2  README GIF (2h)
    Total: ~31h (3-4 days)
```

> [!IMPORTANT]
> **Timeline tổng**: ~3 weeks (93h). Sau Sprint 1, CRM score tăng từ 3/10 → 6/10. Sau Sprint 3, product ready to launch → Show HN + Gumroad.
