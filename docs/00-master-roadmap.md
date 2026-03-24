# Master Roadmap & Docs Audit
*Cập nhật: 2026-03-19*

Tài liệu này hệ thống hóa lại toàn bộ cấu trúc định hướng của dự án izhubs ERP, chia làm 3 giai đoạn chính: Đã hoàn thành (Core), Đang xử lý (v0.1 Completion), và Tương lai (v0.2+).
Các tài liệu chi tiết đã được phân bổ vào các thư mục đánh số tương ứng trong `docs/`.

---

## 📁 Cấu trúc Thư mục Tài liệu Mới

- **`01_Active_Sprint/`**: Chứa các file PRD, UX specs cho Sprint hiện tại (Contact Drawer, Timeline, Pagination, Kanban features). ĐÂY LÀ TRỌNG TÂM CODE LÚC NÀY.
- **`02_Core_Architecture/`**: Chứa các nguyên tắc kiến trúc Nền tảng (IzUI Guide, Data Layer, UI Design Language). Là kim chỉ nam cho mọi dòng code.
- **`03_Future_Planning/`**: Chứa các bản nháp thiết kế hệ thống cho các tính năng sẽ làm trong v0.2, v0.3, v0.4 (MCP, Automation, Marketplace, Onboarding).
- **`04_Archive_Vision/`**: Các tài liệu nghiên cứu thị trường, Product Vision cũ, Đánh giá Sprint cũ đã hoàn thành nhiệm vụ và được lưu trữ lại.

---

## 🟢 1. ĐÃ HOÀN THÀNH (Nền tảng Core)
*Nền móng đã vững chắc, sẵn sàng để xây tính năng.*

**Hạ tầng:**
- Next.js 14 App Router, PostgreSQL raw SQL + Zod, JWT Auth.
- **Tenant Isolation**: Row-Level Security (RLS) áp dụng diện rộng.
- **Performance & Security**: Rate limiting, FTS search (GIN Index), Soft-delete.

**Giao diện & Mô đun:**
- Khung IzUI Component Library (hoàn thiện 13 phase với Radix + SCSS, Recharts).
- Tính năng mồi: Contacts/Deals CRUD, Pipeline Kanban cơ bản.
- Demo mode: 5 phân hệ ngành dọc với dữ liệu tự động mồi (seed).

---

## 🟡 2. ĐANG CHỜ XỬ LÝ (v0.1 Completion & v0.2)
*Ưu tiên: Làm ra một sản phẩm "dùng được" không có tính năng ảo để đóng gói bán mồi (Gumroad).*

**Các Task thuộc `01_Active_Sprint`:**
- 🔴 Cắt tỉa Sidebar: Xóa sạch các link "Coming Soon" ảo.
- 🔴 Module Contact: Slide-over Drawer (xem chi tiết không chuyển trang), Filters, Pagination.
- 🔴 Log & Note: Hệ thống Note polymophic và tự động log Activity Timeline.
- 🟡 Kanban Polish: Filters trong Kanban, Cấu hình các column (Pipeline stages) tùy ý cho từng tenant.
- 🟡 Dashboard: Lắp số thật (Win Rate, Trends) và thay bảng trống bằng Onboarding nhắc nhở "Nhập CRM CSV ngay".

**Bước GTM (Wedge Features):**
- Gumroad Packages: Đóng gói code seed của 2 ngành Agency & Freelancer. Quay GIF Demo.
- Interactive Demo: Trải nghiệm full tính năng bằng dữ liệu giả mạo (Seed) mà không cần Signup.
- AI Import: Kéo list csv Airtable tự ráp map cột (Tính năng chốt sale quyết định).
- Hệ thống SDK / OpenAPI: Cài đặt thư viện tự động sinh OpenAPI/Swagger schema từ Zod để phục vụ cho API Reference trên web Docs (Tự động hóa hoàn toàn).
- Cấu hình MCP Server cho Cursor.

---

## 🚀 3. KẾ HOẠCH TƯƠNG LAI DÀI HẠN (v0.3 & v0.4+)
*Tham khảo thư mục `03_Future_Planning`.*

- **Managed Cloud v0.3**: Cấu trúc Stripe Billing $19/mo. 
- **Automation / Flow Engine**: Thiết kế hệ thống Trigger-Action (BullMQ, Redis) cấu hình bằng JSON.
- **Marketplace v0.4**: Cung cấp Extension URL Manifest cho bên thứ 3 viết app kết nối qua Webhooks.
- **PDPL (Luật Bảo vệ Dữ liệu VN)**: Consent tracker và GRC dashboard cho DPO.
- **Agentic AI**: Trợ lý tự hành động, thay vì chỉ là chatbot hỏi đáp thông thường.
