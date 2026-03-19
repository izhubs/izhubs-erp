# Track: JSON Template Engine ("Freelancer OS" Packager)
**Created**: 2026-03-19
**Status**: planning
**Priority**: high

## Summary
Xây dựng một Export/Import Engine cốt lõi cho phép gom toàn bộ cấu hình chuẩn của một không gian làm việc (Theme, Nav Config, Custom Fields, Automation Rules, Activated Modules) thành một file di động duy nhất `.izhubs.json`. Tính năng này là chìa khóa để phân phối và thương mại hóa các template (như "Freelancer OS", "Agency Starter") trên nền tảng Gumroad, biến người dùng thành những nhà phát triển quy trình.

## User Stories
- Là một **Creator**, tôi muốn setup hoàn chỉnh một quy trình CRM cực xịn và ấn nút "Export Template", để có được một file JSON đem chốt Sale trên Gumroad với giá $29.
- Là một **Freelancer mới**, tôi muốn khi đăng ký tài khoản xong, chỉ cần chọn "Import from File" và thả file mua từ Gumroad vào để ngay lập tức có một không gian làm việc hoàn hảo.

## Acceptance Criteria
- [ ] Cấu trúc chuẩn của file Template tuân thủ nghiêm ngặt theo một Zod Schema (để chặn script rác khi user upload).
- [ ] API `GET /api/v1/tenants/template/export` thu thập đủ: module list, custom fields, automations, theme.
- [ ] API `POST /api/v1/tenants/template/import` giải nén file JSON và đè (upsert) vào không gian của user sử dụng DB Transaction an toàn.
- [ ] Có nút Export/Import ở trang `/settings`.

## Technical Plan

### DB Changes
- Đứng trên vai các bảng đã có (`custom_field_definitions`, `tenant_automations`, `tenant_modules`, `tenants.custom_theme_config`).
- **Không** phát sinh thêm bảng mới.

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/tenants/template/export` | requireAuth | Bundle data thành file application/json |
| POST| `/api/v1/tenants/template/import` | requireAuth | Upload file JSON & Validate = Zod |

### UI Components
- Component: `components/settings/TemplateManager.tsx` (Card hiển thị nút Export/Import).
- Page: Bê TemplateManager vào tab mới tại `/settings/templates`.

### Engine Functions
- `core/engine/templates.ts`:
  - `exportTenantTemplate(tenantId)`
  - `importTenantTemplate(tenantId, jsonPayload)`

## Implementation Phases
- [ ] **Phase 1**: Định nghĩa cấu trúc `IzhubsTemplateSchema` bằng Zod.
- [ ] **Phase 2**: Xây dựng Engine Export và API tải file.
- [ ] **Phase 3**: Xây dựng Engine Import (đảm bảo tính nguyên vẹn dữ liệu).
- [ ] **Phase 4**: Hoàn thiện UI Settings và móc API nối form.

## Out of Scope
- Không bao gồm việc Export/Import Datarows (Contacts/Deals thực tế). JSON Engine này CHỈ pack structure và cấu hình (Metadata). Datarows dùng AI CSV Import.
