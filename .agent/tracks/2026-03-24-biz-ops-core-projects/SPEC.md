# Track: Biz-Ops Core Project Management (Pillar 1)
**Created**: 2026-03-24
**Status**: review
**Priority**: high

## Summary
Nâng cấp bảng `campaigns` hiện tại thành một Entity "Project" độc lập hoàn chỉnh theo tầm nhìn Pillar 1. Cho phép tạo dự án không cần hợp đồng, gom nhóm dự án thành Portfolios (Programs), quản lý Project Phases, và thiết lập quyền riêng tư (Private/Public).

## User Stories
- As a Manager, I want to create internal projects without needing a signed Contract.
- As a Director, I want to group related projects into a Portfolio/Program to track aggregate health.
- As a Project Manager, I want to split my project into Phases (Milestones) to track progress more granularly.
- As an Agency owner, I want to mark some sensitive projects as "Private" so only assigned members can see them.

## Acceptance Criteria
- [ ] `campaigns.contract_id` có thể NULL.
- [ ] Bảng `portfolios` được tạo và API CRUD hoạt động.
- [ ] Bảng `campaign_phases` được tạo và API CRUD hoạt động.
- [ ] Project detail UI hiển thị chọn Portfolio và chỉnh sửa các Phases.
- [ ] Bật/tắt cờ `is_private` trên UI (Nếu true, chỉ owner hoặc member có trong `campaign_members` mới có quyền xem nội dung chi tiết dự án - chặn backend access route).

## Technical Plan

### DB Changes
- Migration: `database/migrations/022_biz_ops_core_projects.sql`
- **New table**: `portfolios`
  - `id, tenant_id, name, description, owner_id, status, deleted_at, created_at, updated_at`
- **New table**: `campaign_phases`
  - `id, tenant_id, campaign_id, name, start_date, end_date, status, sort_order, deleted_at, created_at, updated_at`
- **Modified table**: `campaigns`
  - `ALTER TABLE campaigns ALTER COLUMN contract_id DROP NOT NULL;`
  - `ALTER TABLE campaigns ADD COLUMN portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL;`
  - `ALTER TABLE campaigns ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT false;`

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/v1/biz-ops/portfolios` | `biz_ops:read/write` | Quản lý Portfolios |
| GET/POST | `/api/v1/biz-ops/campaigns/[id]/phases` | `biz_ops:read/write` | Quản lý trạng thái (Phases) của 1 dự án |

### Engine Functions
- `packages/izerp-plugin/modules/biz-ops/engine/portfolios.ts`: CRUD for portfolios
- `packages/izerp-plugin/modules/biz-ops/engine/campaigns.ts`: Update to include `portfolio_id` and `is_private`.

## Implementation Phases
- [x] Phase 1: Thảo luận và chốt SPEC.md
- [x] Phase 2: Chạy migration DB (`022_biz_ops_core_projects.sql`) & Update Type/Models ở `core`.
- [x] Phase 3: Viết API Endpoints (Engine + Route) & Contract Tests
- [x] Phase 4: Thiết kế lại Component UI Form Create / Edit Project

## Out of Scope
- KHÔNG làm Universal Task Engine (`izTask`) trong track này (để dành sang track riêng biệt).
- KHÔNG làm GANTT chart UI. Chỉ làm danh sách Phase cơ bản.
- KHÔNG làm Báo cáo (Reports).
- KHÔNG làm luồng Role đặc quyền (Cứ Owner hoặc Member là xem được full quyền của Project đó nếu "is_private=true").

## Open Questions
- [ ] *Chốt: Chúng ta đã có `contract_milestones` (để tính tiền). Giờ ta sẽ thêm `campaign_phases` (để tính tiến độ công việc dự án). Điều này có đúng ý bạn không?*
