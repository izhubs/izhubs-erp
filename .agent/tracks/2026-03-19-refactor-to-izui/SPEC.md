# Track: Refactor App to IzUI Component Library

**Status**: ⏳ Pending
**Created**: 2026-03-19
**Priority**: High (UX Consistency & Tech Debt Reduction)

## 🎯 Mục Tiêu (Objective)
Đồng bộ hóa toàn bộ giao diện của dự án ERP (vốn đang dùng component cơ bản hoặc Tailwind tạp nham) sang bộ quy chuẩn chính thức của **IzUI Component Library** (SCSS Modules + Radix UI + Zod/React-Hook-Form).

Đảm bảo sau đợt refactor này, ứng dụng không còn phụ thuộc vào các styling inline sai chuẩn, tuân thủ đúng `IzUI_Usage_Guide.md` và đạt trải nghiệm Accessible + Darkmode 100%.

## 🛣️ Phân Đoạn Triển Khai (Phases)

### Phase 1: Authentication & Onboarding
- [ ] Refactor `/app/(auth)/login/` và `/register/` sang dùng `IzForm`, `IzInput`, `IzAsyncButton`.
- [ ] Refactor thẻ Card đăng nhập sang dùng `IzCard`, loại bỏ Tailwind margins.

### Phase 2: Core CRM Modals (Forms)
- [ ] Thay thế `ContactFormModal` cũ bằng `IzModal` chuẩn.
- [ ] Áp dụng `IzFormInput`, `IzFormSelect` cho các trường nhập liệu Khách Hàng.
- [ ] Thay thế `DealFormModal` cũ bằng `IzModal` và cụm Component IzUI. Tích hợp `IzDatePicker` (nếu cần).
- [ ] Thay thế các thẻ Toast Notification thông thường sang dùng `IzToast` (`useToast` của IzUI).

### Phase 3: Data Display (Tables & Details)
- [ ] Refactor `ContactsTable` sang dùng component `IzTable` kết hợp với `IzBadge` và `IzAvatar`.
- [ ] Thêm `IzDropdownMenu` cho nút thao tác 3 chấm `(...)` trên các hàng của Table để Sửa/Xóa.
- [ ] Refactor màn hình /deals dạng danh sách bảng (nếu có).

### Phase 4: Pipeline Kanban Board (The Heavy Lift)
- [ ] Cài đặt `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- [ ] Tích hợp logic kéo thả của Pipeline cũ vào khung Presentational UI của `IzKanbanBoard`, `IzKanbanColumn`, và `IzKanbanCard`.
- [ ] Xóa bỏ thư mục `components/kanban/` cũ và hoàn toàn dùng IzUI Kanban.

### Phase 5: Dashboard & Metrics
- [ ] Thay thế các Card thống kê trên `app/(dashboard)/page.tsx` thành `IzMetricCard`.
- [ ] Cập nhật các biểu đồ hiện tại (nếu có) thành `IzBarChart` và `IzLineChart`.
- [ ] Đổi luồng hiển thị hoạt động gần đây thành `IzActivityTimeline`.

### Phase 6: Tiện ích nội bộ
- [ ] Refactor thanh Điều hướng toàn cục (Header / Sidebar / Breadcrumbs) dùng `IzBreadcrumb` và `IzDropdownMenu` (User Profile).
- [ ] Triển khai `IzFileUpload` cho màn hình `/import` thay thế cho vùng kéo thả cũ.
- [ ] Màn hình Settings: Dùng `IzTabs` và `IzAccordion`.

## ✅ Acceptance Criteria (Nghiệm thu)
1. Chạy `npm run typecheck` báo 0 lỗi TypeScript (Đảm bảo việc thay đổi Component Props không làm hỏng compiler).
2. Kiểm tra log Terminal không có cảnh báo nào về "extra attributes" hay "validateDOMNesting".
3. Lên giao diện thử (Light Mode + Dark Mode), form nhập liệu bám form sát Zod và bắt lỗi chuẩn xác bằng viền đỏ.
4. Giao diện Drag & Drop Kanban mượt mà, gọi thành công API Optimistic Update giống bản cũ nhưng trong lớp áo xịn của IzKanban.
