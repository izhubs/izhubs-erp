# izhubs Virtual Office — Design System

> **Đây là tài liệu mockup UI.** Các màn hình được thiết kế bằng Google Stitch (Gemini 3 Pro).  
> Dùng làm tài liệu tham chiếu khi implement component thực tế.

---

## Industry Context
**Lĩnh vực:** Dịch vụ Văn phòng Ảo (Virtual Office Services)  
**Template:** `agency.ts` — 8 pipeline stages  
**Stitch Project:** `projects/2773881138219956173`

---

## Color Palette

| Token | Value | Mô tả |
|---|---|---|
| `--color-bg` | `#0f172a` | Background navy |
| `--color-surface` | `#ffffff` | Card / surface trắng |
| `--color-primary` | `#6366f1` | Indigo — accent chính |
| `--color-primary-hover` | `#4f46e5` | Indigo hover |
| `--color-primary-light` | `#e0e7ff` | Indigo nhạt / badge BG |
| `--color-primary-muted` | `#312e81` | Indigo tối / sidebar active |
| `--color-border` | `#e2e8f0` | Border nhẹ |
| `--color-text` | `#0f172a` | Text chính |
| `--color-text-muted` | `#64748b` | Text phụ |
| `--color-success` | `#22c55e` | Xanh lá — active/won |
| `--color-warning` | `#f59e0b` | Cam — cảnh báo |
| `--color-danger` | `#ef4444` | Đỏ — urgent/error |

---

## Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Font family | Inter | — | — |
| H1 Page Title | Inter | 24px | 700 |
| H2 Section Title | Inter | 18px | 600 |
| Body | Inter | 14px | 400 |
| Caption / Muted | Inter | 12px | 400 |
| KPI Number | Inter | 32px | 700 |

---

## Layout

| Element | Spec |
|---|---|
| Sidebar | 64px fixed icon-only, navy bg |
| Top Nav | 56px height |
| Card border-radius | 8px |
| Page padding | 24px |
| Grid gap | 16px |

---

## Pipeline Stages (agency.ts)

| Key | Label (VI) | Color |
|---|---|---|
| `lead` | Lead mới | `#94a3b8` |
| `proposal` | Gửi Proposal | `#60a5fa` |
| `negotiation` | Đàm phán | `#f59e0b` |
| `onboarding` | Onboarding | `#a78bfa` |
| `active` | Đang chạy | `#34d399` |
| `renewal` | Gia hạn | `#f97316` |
| `won` | Đã chốt | `#22c55e` |
| `lost` | Không chốt | `#ef4444` |

---

## Roles & Permissions

| Role | Màn hình chính |
|---|---|
| CEO | Executive Dashboard, Reports |
| CMO | Marketing Dashboard, Leads, Reports |
| Sales | Pipeline, Deals, Contacts, Contracts |
| Marketing | Marketing Dashboard, Leads, Contacts |
| Admin | Settings, tất cả màn hình |
