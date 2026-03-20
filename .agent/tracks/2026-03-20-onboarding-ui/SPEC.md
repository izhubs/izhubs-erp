# Track: Onboarding UI & Provisioning
**Created**: 2026-03-20
**Status**: planning
**Priority**: high

## Summary
Xây dựng luồng Onboarding tự động (3 bước) dành cho người mới đăng ký, kèm **Interactive Product Tour**. Trải nghiệm bắt đầu từ form Đăng ký cơ bản, chuyển sang màn hình chọn Ngành nghề (kèm tuỳ chọn tạo Demo Data), và kết thúc bằng màn hình Loading (Provisioning). Khi vào Dashboard lần đầu, người dùng sẽ tự động được hướng dẫn sử dụng (Product Tour) về cách dùng app, cách đổi Theme và cách xoá dữ liệu mẫu.

## User Stories
- As a **New User**, I want to **register an account easily** so that **I can access the system**.
- As a **New User**, I want to **select my specific industry** and **optionally generate demo data** so that **I can explore the features without empty-state anxiety**.
- As a **New User**, I want to **receive an interactive product tour (guide) on my first login** so that **I know how to navigate, change themes, and delete demo data when I'm ready for production**.

## Acceptance Criteria
- [ ] Giao diện Đăng ký (Register) hoạt động mượt mà, valid email/password bằng Zod.
- [ ] Giao diện Onboarding cung cấp **Switch "Tạo dữ liệu mẫu (Demo Data)"** cùng với danh sách Ngành nghề.
- [ ] API Provisioning (`/api/v1/tenant/provision`) hỗ trợ tham số `includeDemoData` (tự động chạy logic seed data nếu bằng true).
- [ ] **Interactive Product Tour** xuất hiện ở lần đăng nhập đầu tiên vào Dashboard, hướng dẫn 3 việc chính: (1) Sử dụng tính năng cốt lõi (Kanban/Contacts), (2) Đổi Theme/Giao diện tại Settings, (3) Nút "Reset/Remove Demo Data" để xoá sạch dữ liệu mẫu.
- [ ] Tính năng "Nuke Demo Data" hoạt động trơn tru (Xoá data nhưng giữ nguyên cấu trúc ngành nghề).
- [ ] Cập nhật JWT token cho client sau Provisioning.

## Technical Plan

### DB Changes
- (Không cần tạo bảng mới. Cấu trúc DB và bảng `tenants`, `users` đã hỗ trợ sẵn RLS và multi-tenant).
- Cần đảm bảo logic tạo bản ghi `tenants` và update `tenant_id` cho user.

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Đăng ký tạo User ban đầu (chưa có Tenant) |
| POST | `/api/v1/tenant/provision` | Valid JWT | Tạo Tenant, Seed Schema & Demo Data (nếu có) |
| DELETE | `/api/v1/tenant/reset-demo-data` | Valid JWT | Xoá toàn bộ dữ liệu mẫu (Contacts, Deals) do hệ thống tự sinh |

### UI Components
- Page: `app/(auth)/register/page.tsx`
- Page: `app/(auth)/onboarding/page.tsx`
- Components: `IndustrySelector.tsx`, `ProvisioningLoader.tsx`
- Overlay Tour: `ProductTourProvider.tsx` (dùng driver.js hoặc thư viện tương đương để báo hiệu các điểm sáng).

### Engine Functions
- `core/engine/tenant.ts`: Hàm `provisionTenant(userId, config)`

## Implementation Phases
- [ ] **Phase 1: Xây dựng core engine Provisioning** (Tạo Tenant, Seed Data).
- [ ] **Phase 2: API Endpoints** (Cập nhật Register, Tạo Provision API).
- [ ] **Phase 3: UI Components** (Giao diện chuẩn IzUI, Browser record verify).
- [ ] **Phase 4: Tích hợp auth & JWT sync** (Đảm bảo token được nối đúng quyền).

## Out of Scope
- Tính năng thanh toán (Stripe/Payment) - người dùng dùng trial hoặc miễn phí trước.
- Không hỗ trợ custom domain trong phase này.
- Luồng mời thêm thành viên vào Tenant (Team invitations) sẽ làm ở track sau.

## Open Questions
- [x] Bản template (JSON) cho việc khởi tạo đã sẵn sàng 100% chưa, hay dùng script Seed hiện tại làm giả định trong function Provisioning?
  **-> Đã chốt:** 
  1. Cấu trúc cấu hình cơ sở (Custom Fields, Stages, Automations) đã có sẵn trong thư mục `templates/industry/*.ts` dưới dạng TypeScript Object, có thể map thẳng vào DB. (Không cần phải có file `.json` tĩnh).
  2. Dữ liệu mẫu (Contacts, Deals) cho nút "Tạo dữ liệu mẫu" sẽ được tái sử dụng trực tiếp từ logic của các script trong thư mục `scripts/seeds/seed-*.js`.
