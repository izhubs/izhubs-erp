# izhubs ERP — Stitch Screen Inventory (2026-03-25)

> **Stitch Project**: https://stitch.withgoogle.com/projects/2420013479080174207
> **Design System**: "Indigo Prism Executive" — Dark glassmorphism, Inter font, compact data-dense
> **Feng Shui**: Gold/champagne (#D4A76A) accent — auspicious for Kim (Metal) element, 1993 Quý Dậu
> **Device**: Desktop PC priority (1280px+)

---

## 📊 Screen Audit Summary

### Existing Screens (47 page routes in codebase)

| Category | Screens | Status |
|----------|---------|--------|
| **Auth** | Login, Register, Onboarding | ✅ Done |
| **Dashboard** | Main dashboard, Generic module dashboard | ✅ Done |
| **CRM** | Contacts list, Contacts sheet, Deals list, Deals sheet, Leads, Contracts | ✅ Done |
| **Detail Pages** | Companies/[id] | ✅ Done |
| **Import** | CSV Import wizard | ✅ Done |
| **Reports** | Reports hub | ✅ Done |
| **Tasks** | Task list | ✅ Done |
| **Service Packages** | Package list | ✅ Done |
| **Audit Log** | System audit log | ✅ Done |
| **Automation** | Automation rules | ✅ Done |
| **Settings** | Main, Appearance, Automation, Custom Fields, Extensions, GDPR, Integrations, Modules, Packages, Pipeline Stages, Plugins, Users | ✅ Done |
| **Biz-Ops** | Main, Campaigns/[id], Contracts/[id] | ✅ Done |
| **izForm** | List, Create, Edit, Detail | ✅ Done |
| **izLanding** | List, Create, Edit | ✅ Done |
| **Demo** | Demo page, IzUI demo, Demo-sync | ✅ Done |
| **Public** | Forms/[id], Landing pages | ✅ Done |

### New Screens Created in Stitch (10 screens)

| # | Screen Name | Stitch Screen ID | Purpose |
|---|-------------|------------------|---------|
| 1 | CEO Executive Dashboard | `9a98b3dd6039442c8fe485d95ebd08fb` | Executive KPIs, Revenue chart, Pipeline funnel, Top deals, Activity timeline |
| 2 | Marketing Dashboard | `75bb43858e92411caae8071c15d53554` | Ad spend KPIs, ROAS chart, Platform comparison, Campaign leaderboard |
| 3 | Contact Detail Page | `7690c695a8f141a0ab51d5eae786365f` | Full contact view: properties, notes, activities, related deals/contracts |
| 4 | Notification Center | `5a81c840515c4c42a90a2cfd7e07b884` | Slide-out panel: grouped notifications, unread indicators, filters |
| 5 | Forgot Password Flow | `2df060241cff4d74b36508c5913ebab3` | 2-step password reset (email entry → success confirmation) |
| 6 | Deal Detail Page | *(generated session 2)* | Full deal view: stage progress, properties, timeline, related contacts/tasks |
| 7 | Settings Profile | *(generated session 2)* | User profile, password, preferences, danger zone |
| 8 | Auto-Expenses Approval | *(generated session 2)* | Biz-Ops synced ad expenses: review, approve/reject, bulk actions |
| 9 | Campaign Creation Wizard | *(generated session 2)* | 3-step modal: details → digital mapping → review & create |
| 10 | OAuth Callback Screen | *(generated session 2)* | Sync progress after OAuth redirect: stepped status, success state |

---

## 🎨 Design System: "Indigo Prism Executive"

| Token | Value |
|-------|-------|
| Background | `#111125` |
| Surface (cards) | `#1a1a2e` |
| Surface High | `#28283d` / `#333348` |
| Primary (brand) | `#c0c1ff` (indigo) |
| Accent (feng shui Kim) | `#D4A76A` (gold/champagne) |
| Tertiary (warning) | `#ffb783` |
| Error | `#ffb4ab` |
| Text Primary | `#e2e0fc` |
| Text Secondary | `#c7c4d7` |
| Font | Inter (400/500/600) |
| Border Radius | 4-8px |
| Card Padding | 12px |
| Table Row Height | 36px |
| Input Height | 32px |
| Gaps | 8px |

---

## 🔮 Phong Thủy — Mệnh Kim (1993 Quý Dậu)

- **Thổ sinh Kim** (tốt nhất): Vàng gold `#D4A76A`, nâu đất, champagne
- **Kim tương hợp**: Trắng, bạc `#C0C8D4`, xám thép
- **Tránh**: Đỏ (Hỏa khắc Kim), xanh lá đậm (Mộc)
- Applied in: accent buttons, highlights, KPI badges, active states

---

## 📋 Next Steps

- [ ] Apply feng shui gold color to existing screens via `edit_screens`
- [ ] Implement Contact Detail page from Stitch mockup
- [ ] Implement Deal Detail page from Stitch mockup
- [ ] Add Notification Center component
- [ ] Add Forgot Password auth flow
- [ ] Add Settings Profile page
- [ ] Integrate Auto-Expenses Approval into Biz-Ops
- [ ] Add Campaign Creation Wizard modal
- [ ] Add OAuth Callback progress screen
