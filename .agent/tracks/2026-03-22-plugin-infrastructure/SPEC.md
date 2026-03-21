# Track: Plugin Infrastructure Finalization
**Created**: 2026-03-22
**Status**: planning
**Priority**: high

## Summary
Hoàn thiện kiến trúc Plugin (Module Registry) ở phía Frontend và Data Access. Hiện tại API và App Store đã hoàn chỉnh, nhưng các trang UI của plugin chưa được bảo vệ theo trạng thái `is_active`, đồng thời còn hardcode `tenant_id`.

## User Stories
- As a Tenant Admin, I only want to see UI pages of plugins that I have explicitly installed.
- As a Super Admin, when I enable a plugin, it should be uniformly visible to roles I choose (default admin/member), and I can subsequently explicitly disable access for specific roles.
- As a Product Owner, I want the plugin integration layer to be strict so developers building new plugins are forced to use the standardized Auth and Security wraps.

## Acceptance Criteria
- [ ] Users cannot access `/plugins/[id]` if `isModuleActive` is false for their tenant (shows 403 / "Not Installed" block).
- [ ] Multi-tenant isolation is fully respected on plugin pages (no hardcoded DEFAULT_TENANT_ID).
- [ ] A standardized component `RequireModule` exists for developers to protect their custom Plugin pages, encompassing both module active status AND User Role validation.
- [ ] `nav-config.ts` dynamically parses plugin configs (`allowedRoles`) to construct the menu.
- [ ] Admin UI permits modifying `allowedRoles` for an active plugin without coding.

## Technical Plan

### DB Changes
- (None needed - `modules` and `tenant_modules` work flawlessly)

### UI Components
- Component: `components/providers/RequireModule.tsx` (Server Component guard).
- Page: refactor `app/(dashboard)/plugins/izform/page.tsx`

### Engine Functions
- No core engine changes needed. Leverage existing `isModuleActive`.

## Implementation Phases
- [ ] Phase 1: Build `RequireModule` wrapper (Security Layer).
- [ ] Phase 2: Refactor `izform` plugin to use standard context/cookies + wrapper.
- [ ] Phase 3: Manual Testing.

## Out of Scope
- Building a new plugin creation CLI.
- Community API keys (belongs to later phase).

## Open Questions
- Hình ảnh UI khi người dùng bị block khỏi Plugin (hiện Toast, Redirect về Trang chủ, hay hiện Màn hình Empty State yêu cầu cài đặt)? -> Chọn Empty State yêu cầu cài đặt.
