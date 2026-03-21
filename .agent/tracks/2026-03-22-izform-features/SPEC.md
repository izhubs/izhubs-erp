# Track: izForm Plugin Enhancements
**Created**: 2026-03-22
**Status**: planning
**Priority**: high

## Summary
Bổ sung các tính năng nâng cao cho module `izForm` (Lead Capture) bao gồm trình chỉnh sửa Form Builder kéo thả, tính năng nhúng Iframe/Script, tích hợp Webhooks webhook thông báo, và thống kê tỷ lệ chuyển đổi.

## User Stories
- **As an operations admin**, I want a visual drag-and-drop form builder so that I can create and modify forms without typing raw JSON.
- **As a marketer**, I want to generate safe Iframe embed codes so I can capture leads outward across multiple landing pages.
- **As an integration specialist**, I want form submissions to fire outbound Webhooks so I can pass lead data instantly to Zapier/Make.
- **As a data analyst**, I want to view form performance statistics (views vs submissions) so that I can optimize the form's conversion rate.

## Acceptance Criteria
- [ ] **UI Form Builder**: Xây dựng interface kéo thả các fields (Text, Select, Date, Checkbox), support setting Required/Optional.
- [ ] **Embed Code Generator**: Chức năng render đoạn mã nhúng `<iframe src="...">` và UI cấu hình Domain Allowlist (CORS protection).
- [ ] **Webhook Integrations**: Cấu hình Webhook URL tĩnh cho mỗi Form. Khi có submission mới -> POST payload.
- [ ] **Analytics Dashboard**: Thêm cột `views` vào Database, tính tỷ lệ Conversion Rate trên Dashboard theo biểu đồ phễu.

## Technical Notes
- **Database Expansion**: Cần cập nhật bảng `iz_forms` để hỗ trợ lưu webhook URLs và metrics.
- **Security**: Endpoint Public nhận form submission phải gánh Rate Limiting cứng để chống spam.
- **Form Schema**: Component engine render form ngoài frontend phải tương thích với chuẩn `react-hook-form` + `zod` động.

## Phased Implementation Plan
1. **Phase 1: Visual Form Builder** (Config UI + Render Engine).
2. **Phase 2: Lead Routing & Webhooks** (Database migrations + API Background jobs).
3. **Phase 3: Embed & Analytics** (CORS Proxy, rate limiting, chart widgets).
