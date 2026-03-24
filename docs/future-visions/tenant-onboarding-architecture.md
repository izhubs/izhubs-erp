# Tenant Onboarding Architecture (State Machine)

Tài liệu này mô tả chi tiết dòng chảy (flow) và các trạng thái (states) của hệ thống tính từ lúc Database hoàn toàn trống rỗng cho đến khi một end-user (người dùng cuối) vào sử dụng mượt mà với dữ liệu mẫu (seed data) tương ứng.

## State 0: System Bootstrap (Init State)
*Đây là trạng thái hệ thống ngay sau khi Dev/DevOps chạy `npm run db:reset` hoặc `npm run db:migrate`.*
1. **Schema Creation**: Run `001_initial_schema.sql`. Khởi tạo tất cả Tables, Indexes, FTS Triggers, RLS Policies.
2. **System Seed**: Run `002_seed_data.sql`.
   - Tạo **System Tenant** (ID mặc định `0000...0001`).
   - Tạo Seed cho bảng `modules` (Danh mục thư viện Module chung của hệ thống).
   - Tạo Seed cho bảng `industry_templates` (Agency, Freelance, F&B, v.v. kèm theo `nav_config` và `theme_defaults`).

---

## State 1: Bắt đầu đăng ký (Registration State)
*Người dùng vào Landing Page và nhấp vào "Dùng thử miễn phí".*
1. Truy cập trang `/register`.
2. Điền form: Tên doanh nghiệp (Tenant Name), Tên người dùng (User Name), Email, Password.
3. System `POST /api/v1/auth/register`:
   - `INSERT INTO tenants (name, slug)` -> Tạo mới 1 không gian làm việc.
   - `INSERT INTO users (tenant_id, email, password_hash, role='admin')`.
   - Trả về JWT Access Token (Set Cookie).

---

## State 2: Phân luồng ngành nghề (Industry Selection Wizard)
*Người dùng đăng nhập lần đầu.*
1. Middleware nhận diện: `users.tenant_id` chưa có `industry` setup.
2. Chuyển hướng người dùng tới `/onboarding/industry`.
3. Giao diện Wizard (như Notion/Linear): "Mô hình doanh nghiệp của bạn là gì?" 
   - Backend fetch danh sách từ `industry_templates` (Agency, Bất động sản, F&B...).
4. User chọn và bấm "Tiếp tục".

---

## State 3: Khởi tạo không gian làm việc (Tenant Provisioning)
*Quá trình này chạy ngầm trong ~2 giây với hiệu ứng Loading Text.*
1. `POST /api/v1/tenants/provision`:
   - Cập nhật `tenants.industry = :selected_industry`.
   - Copy `theme_defaults` từ `industry_templates` sang `tenants.custom_theme_config`.
   - Kích hoạt Module: Đọc `required_modules` từ template và tự động `INSERT INTO tenant_modules (tenant_id, module_id, is_active=true)`.
2. **Industry-specific Seed Data**: 
   - Hệ thống tự động đẩy dữ liệu của ngành nghề đó vào không gian của user (VD: Template Agency sẽ có các Cột Kanban: `Lead, Proposal, Negotiation, Won`, Custom fields: `Project Type`).
   - Mục tiêu: **Zero Empty State**. User vào là có data demo để xem ngay.

---

## State 4: Hoàn tất & Trải nghiệm (Active State)
*User được chuyển hướng về `/dashboard`.*
1. Layout load `nav_config` và `theme_defaults` dựa trên JWT `tenant_id`. Sidebar sẽ hiển thị đúng chuẩn ngành (VD: F&B thì không hiện nút "Dự án" mà hiện nút "Khách đặt bàn").
2. User nhìn thấy biểu đồ đã có số nhảy (do Seed data của State 3). 
3. User bắt đầu vọc vạch, xóa data demo và điền data thật, hoặc dùng tính năng **AI CSV Import** để hốt trọn data cũ từ Airtable/Excel vào hệ thống.

---
*Đây là Flow chuẩn nhất cho các B2B SaaS hiện tại nhằm chốt sale ngay từ điểm chạm đầu tiên theo mô hình PLG (Product-Led Growth).*
