# Theme & Template Architecture (WordPress-like Model)

> **Prerequisite**: This entire architecture is built on top of the **IzUI Component Library** (`components/ui/Iz*`). IzUI components are designed specifically to inherit `var(--*)` CSS variables from `_tokens.scss` rather than hardcoding Tailwind classes. Without IzUI, this theme system cannot dynamically alter the app's structure.

izhubs ERP is built on a highly modular architecture that intentionally separates **how the app looks** from **what the app does**, very similar to how WordPress separates Themes from Page Templates/Plugins.

We divide the user experience into two distinct configuration layers:

## 1. Industry Templates (Mô hình Kinh Doanh / Business Template)
**Xác định: Dữ liệu, Logic, và Cấu trúc màn hình.**

Stored in the database (`industry_templates` table), these define the "content" of the application for a specific business vertical (e.g., Coworking, Fine Dining, Digital Agency).

- **`nav_config`**: Determines which Sidebar menus exist. A "Real Estate" template might show a "Properties" menu, while a "Software" template hides it.
- **`dashboardLayout`**: Defines which interactive widgets appear on the Dashboard and who can see them. (e.g., CEO sees `kpi-mrr` and `revenue-by-package-donut`, Sales staff only see `recent-activity-feed`).
- **`pipelineStages`**: Defines the Kanban board stages (e.g., "Mới", "Tham quan", "Ký Hợp Đồng" for Coworking vs "Lead", "Meeting", "Proposal" for Agency).
- **`theme_defaults`**: The *fallback* primary brand colors for that specific industry (e.g., Coworking defaults to Emerald Green).

*Khi user đổi Industry Template, toàn bộ workflow, menu, và dashboard metrics lập tức thay đổi.*

## 2. CSS Themes (Giao diện / Layout / Visual Theme)
**Xác định: Cảm giác, Typography, Khoảng cách (Spacing), và Bố cục khối (Layout System).**

Defined in SCSS (`_themes.scss` via `[data-theme="..."]`), these override the global Design Tokens (variables). This behaves exactly like a WordPress Theme.

- **Không gắn liền với ngành nghề**: Bất kỳ mô hình kinh doanh nào cũng có thể dùng bất kỳ Theme nào.
- **Toàn quyền kiểm soát UI**: Một Theme không chỉ đổi màu sắc! Bằng cách ghi đè biến CSS (CSS Variables), Theme có thể thay đổi:
  - `font-size-base`: Làm text to ra hoặc nhỏ lại (Compact Mode).
  - `space-4`, `space-6`: Làm khoảng cách các phần tử dày đặc (Dense) hoặc thoáng đãng (Spacious).
  - `radius-lg`: Đổi toàn bộ các nút bấm và Card từ bo góc tròn sang vuông vức sắc cạnh.
  - `sidebar-width`, `header-height`: Đổi kích thước khung layout cơ bản.

### Examples of CSS Themes:
1. **Default (Bản gốc)**: Uses the Industry Template's default brand color. Modern, rounded corners, spacious.
2. **Compact Layout (Vuông Vức)**: Typography shrunk to 13px, border-radiuses set to `0px`, paddings reduced. Best for heavy data entry (table-heavy CRM usage).
3. **Emerald/Rose/Amber Dark**: Keeps modern rounded layout but overrides the primary colors regardless of industry defaults.

## Tóm lại (Summary for AI & Developers)

Nếu khách hàng yêu cầu:
- *"Thêm một trang Báo cáo Doanh thu vào thanh bên cho tài khoản Quản lý"* 👉 Sửa `nav_config` trong **Industry Template**.
- *"Bảng Kanban cần thêm cột 'Chờ thanh toán'"* 👉 Sửa `pipelineStages` trong **Industry Template**.
- *"Giao diện hiện tại khoảng cách các dòng rộng quá, tốn diện tích màn hình"* 👉 Tạo một **CSS Theme mới** (ví dụ `[data-theme="ultra-dense"]`) trong `_themes.scss` và set lại các biến `--space-*` nhỏ hơn.
- *"Đổi màu nút bấm"* 👉 Sửa `_themes.scss` hoặc `theme_defaults` trong DB.

**KHÔNG hardcode layout hay spacing cố định vào Component bằng Tailwind hoặc CSS cục bộ. LUÔN sử dụng css variables (Design Tokens) để Themes có quyền ghi đè toàn bộ ứng dụng.**
