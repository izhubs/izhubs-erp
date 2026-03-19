# Track: Embeddable Lead Form (Viral Loop Module)
**Created**: 2026-03-19
**Status**: planning
**Priority**: high

## Summary
Một chiến lược "Growth-hack" truyền thống nhưng cực kỳ hiệu quả: Cho phép các Agency/SMEs tự build form nhận liên hệ (Web-to-Lead) và cung cấp đoạn mã `iframe` để nhúng vào website (WordPress, Webflow) của họ. Data khách điền form sẽ chui thẳng vào Pipeline IZhubs. Điểm cốt lõi là dưới mỗi form luôn chèn cứng logo **"⚡ Powered by IZhubs - Free CRM"** giúp chúng ta bắt được mẻ user mới tự nhiên hoàn toàn miễn phí (Viral Loop).

## User Stories
- Là một **Chủ Agency**, tôi muốn dán nhanh cái form "Liên hệ nhận báo giá" vào trang chủ của mình để khi khách điền xong nó nổ ngay Notification và tạo Contact trong IZhubs.
- Là **Chủ Admin IZhubs**, tôi muốn hàng ngàn website của Agency ngoài kia đang quảng cáo miễn phí giùm tôi qua dòng chữ nhỏ dưới mỗi form.

## Acceptance Criteria
- [ ] UI Form Builder cơ bản: Checkbox chọn các cột bắt buộc nhập (Tên, Số ĐT, Email, Ghi chú).
- [ ] Nút "Copy Code" nhả ra đoạn `<iframe>` tag chuẩn chỉnh.
- [ ] Route Public (không JWT token) để render giao diện Form cho khách của khách điền.
- [ ] Dòng chữ "Powered by IZhubs" không đổi màu, không ẩn đi được trên giao diện form public (thẻ `!important` ẩn sẽ báo lỗi logic).

## Technical Plan

### DB Changes
- Thêm table mới `lead_forms`
  - id UUID [PK]
  - tenant_id UUID [FK]
  - title VARCHAR
  - fields_config JSONB (cấu trúc form kéo thả)
  - redirect_url TEXT (trang cám ơn)
  - is_active BOOLEAN
  - created_at TIMESTAMP
- Tạo migration `011_lead_forms.sql`

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/forms/[id]` | Public | Load schema + theme của form để render UI. |
| POST | `/api/v1/forms/[id]/submit` | Public | Hứng data, cấy vào bảng `contacts` & tạo Deal dạng `new` (Tùy option config). |

### UI Components
- Layout: `app/(public)/layout.tsx` (Layout trắng trơn cho iframe).
- Page: `app/(public)/f/[form-id]/page.tsx` (Trang tĩnh hiển thị form).
- Page: `app/(dashboard)/tools/forms/page.tsx` (Nơi user chỉnh sửa lấy iframe).

### Engine Functions
- `modules/crm/engine/forms.ts`: Logic tạo form và hàm hứng data đẩy gộp vào `contacts.ts`.

## Implementation Phases
- [ ] **Phase 1**: Migration DB `011_lead_forms.sql`.
- [ ] **Phase 2**: Public UI Route và Submit Webhook (Trái tim của tính năng).
- [ ] **Phase 3**: Form Builder UI & Iframe Generator.
- [ ] **Phase 4**: Event Trigger (Gắn form nổ chuông qua Webhook gốc).
- [ ] **Phase 5**: Tests.

## Out of Scope
- KHÔNG hỗ trợ Upload File trong form (Tránh rủi ro bị up shell, mã độc chiếm băng thông).
