# Track: Biz-Ops Projects (Campaigns)
**Created**: 2026-03-24
**Status**: planning
**Priority**: high

## Summary
Module Quản trị Dự án/Chiến dịch (Campaigns) phục vụ cho plugin `biz-ops`. Tính năng này cho phép agency và tổ chức quản lý tiến độ thực thi dịch vụ (SEO, Web, Social, Ads...) sau khi hợp đồng được ký. Nó kết nối các thành viên trong nội bộ với không gian dự án, phân bổ ngân sách (budget) và chi phí thực tế (cogs).

## User Stories
- Là người quản lý (Manager), tôi muốn khởi tạo dự án dưới một Hợp đồng (Contract) để phân bổ ngân sách.
- Là người thực thi, tôi muốn xem mình được gán vào dự án nào, tiến độ đến đâu (Planning, In Progress, Completed).
- Là Admin, tôi muốn xem chi phí thực tế so với ngân sách dự kiến của dự án (Health: healthy, at risk, delayed).

## Acceptance Criteria
- [ ] Tính năng sử dụng lại table **`campaigns`** và **`project_members`** đã có sẵn.
- [ ] Giao diện có Kanban Board để nhân sự dễ kéo thả chuyển Stage.
- [ ] Modal chi tiết dự án có 2 tab chính: Thông tin (Name, Budget) và Thành viên (Add/Delete mem).
- [ ] API backend chuẩn API-Only: Chỉ `engine/campaigns.ts` và `engine/project-members.ts` được chạm DB. Tất cả API Routes phải bọc Zod payload.

## Cấu trúc dữ liệu & Thuật ngữ
- **Campaign (Dự án):** Tên chung cho mọi hoạt động thực thi.
- **Stage:** Trạng thái tiến độ thực thi (`planning`, `in_progress` v.v...)
- **Health:** Tình trạng ngân sách và rủi ro trễ hạn (`healthy`, `at_risk`, `delayed`, `completed`).

## Implementation Phases
- [ ] Giai đoạn 1: Sửa UI API để load danh sách Projects (Card/Kanban).
- [ ] Giai đoạn 2: Ghép nối Engine và API cho luồng Tạo mới Project.
- [ ] Giai đoạn 3: Tính năng gán/xóa thành viên (Project Members).
- [ ] Giai đoạn 4: Hoàn thành Audit Component và UI Update tĩnh (Optimistic).

## Open Questions
- Dự án này có cần link trực tiếp tới thư mục Lưu trữ File (`files`) không? (V0.1 chỉ tập trung text)
