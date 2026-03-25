# 🚀 Biz-Ops (Digital Hub) — Tầm Nhìn Hệ Sinh Thái Tích Hợp (Integration-First)

## 🌟 Tầm nhìn chiến lược (The Pivot)
Thay vì xây dựng một công cụ Quản lý Công việc (Task Management) rườm rà cồng kềnh ngay từ đầu để cạnh tranh với Asana/Jira/Trello, **izhubs Biz-Ops** quyết định chọn một lối đi riêng biệt, đánh trúng "nỗi đau" (Pain-point) cốt lõi của mọi Hệ thống Marketing Agency / Freelancer: **Báo cáo và Ghi nhận Chi phí Quảng cáo tự động**. 

Biz-Ops sẽ đóng vai trò là một **Trạm trung chuyển (Integration Hub)** tổng hợp dữ liệu — từ Chi phí (Spend), Hiệu suất (Insights) từ các nền tảng ngoại bang (Meta, Google, Tiktok) và hút thẳng vào trung tâm quản trị Chiến dịch (Campaigns). Từ đó tự động hóa hoàn toàn luồng **Report & Expense Tracking** mà không cần con người dùng Excel.

---

## 🏗️ Kiến trúc Cốt lõi (The Scale-Ready Architecture)

Hệ thống được thiết kế theo chuẩn Enterprise, chịu tải cho **Hàng nghìn (2.000+) Tài khoản Quảng cáo** chạy song song cùng lúc, từ hàng chục Media Buyers khác nhau trong cùng 1 doanh nghiệp (Tenant).

### 1. Unified Authentication Layer (`izIntegration`)
- **OAuth2 Token Vault:** Nơi mã hoá và bảo mật các `access_token` và `refresh_token` từ Facebook, Google, Tiktok.
- **Federated Connections:** Từng nhân sự (Media Buyer) trong Agency sẽ tự kết nối tài khoản Facebook/Google cá nhân của họ. Một Agency có 20 nhân sự = 20 luồng Connections riêng biệt và tự chủ.

### 2. Bulk Discovery & Ad Account Management
- **Quét hàng loạt:** Chỉ cần kết nối 1 lần, hệ thống dùng token quét ra hàng trăm tài khoản quảng cáo (thông qua Business Manager / MCC) mà cá nhân đó có quyền xem.
- **Selective Sync (Đồng bộ chọn lọc):** Manager chọn Đóng / Mở (Bật/Tắt đồng bộ) cho từng Account để giảm rác hệ thống (Trích xuất 100 tài khoản sinh lời từ danh sách rác 2.000 tài khoản).
- **Auto-Invalidation Alert (Cảnh báo đứt gãy):** Nếu Token hết hạn hoặc Nhân viên đổi Pass/Nghỉ việc, Jobs tự động Pause. Bắn *Alert màu đỏ* lên Dashboard yêu cầu Re-Connect ngay lập tức để không hỏng báo cáo của Khách Hàng.

### 3. Campaign Mapping Engine
- **Giao diện Nối-Ghép (Mapping UI):** Cho phép người dùng liên kết một Chiến dịch Biz-Ops hệ thống (`bizops_campaign`) với một hoặc nhiều Chiến dịch Quảng cáo gốc (`external_campaign_id`).
- *Ví dụ:* Campaign nội bộ "Mùa Hè Sôi Động - Vinamilk" = Chiến dịch Bumper Ads (Google) + Chiến dịch Chuyển đổi (Facebook_1) + Chiến dịch Retargeting (Facebook_2). 

### 4. Background Data Sync Engine (Sức mạnh của BullMQ)
- **Nightly Sync (Cronjob Queue):** Đây là "bộ não" của hệ thống. 2:00 Sáng mỗi ngày, BullMQ sinh ra 2000 Jobs độc lập (tương ứng 2000 tài khoản). 
- **Concurrency Rate-Limit Control:** Giới hạn 5 xử lý song song để luồn lách qua các giới hạn API gắt gao của Meta/Google (Rate Limiting).
- **Auto-Expense Generation (Magic):** Khi có số tiền đã tiêu ngày hôm qua, tự phát sinh 1 phiếu chi phí (`bizops_expenses`) tự động vào sổ cái của chiến dịch.
- **Metrics Aggregation:** Đổ các chỉ số (Reach, Clicks, CPC, Thiết lập chuyển đổi) đóng băng vào bảng `digital_metrics` để vẽ Chart đẹp mắt.

---

## 🚀 Lộ trình Triển khai Các Nền tảng (Integration Tiers)

Khối lượng tích hợp nền tảng được chia thành 3 giai đoạn ưu tiên tuyệt đối:

### 🔥 Phase 1: The Big Two (Core Ads Sink)
1. **Facebook Marketing API (Meta Ads Graph API):**
   - Hút danh sách Ad Accounts từ Facebook Business Manager.
   - Kéo Daily Insights (Spend, Impressions, Clicks, Conversions).
2. **Google Ads API:**
   - Xử lý My Client Center (MCC) customer list.
   - Kéo Metrics hằng ngày từ Search, Youtube, GDN.

### ☀️ Phase 2: Analytics & E-commerce (Doanh thu & Lưu lượng)
3. **TikTok Ads API:** Đáp ứng thị hiếu của các Agency Tiktok Shop/Affiliate đang bùng nổ.
4. **Google Analytics 4 (Data API):** Đối chiếu Clicks của Quảng cáo với Sessions thật sự vào web (Bounce Rate).
5. **Shopify / WooCommerce / Tiktok Shop Open API:** Kéo thẳng Doanh thu (Revenue/Orders) về để tính ROI (Lợi nhuận - Chi phí Ads = Lãi Ròng).

### ☁️ Phase 3: Project Automation & CRM (Workflows)
6. **Task Sync (Trello / Asana / Jira):** Hút tiến độ công việc của các team Design/Dev về chiến dịch.
7. **CRM (HubSpot / Pipedrive):** Khi chốt "Deal Won" trên Hubspot thì tự Create Project bên izhubs.

---

## 💾 Cấu trúc Cơ Sở Dữ Liệu Dự Kiến (Database Schema Draft)

**1. `integration_connections`:** (Nơi gắn Token của Nhân viên)
- `id` (UUID), `tenant_id`, `user_id` (Người Add), `provider` (facebook, google), `credentials` (Encrypted JSON), `status` (active / disconnected).

**2. `ad_accounts`:** (Trung tâm tài sản số)
- `id` (UUID), `connection_id` (FK), `tenant_id`, `platform`, `external_account_id` (act_1234), `name` (Client ABC), `currency` (Rất quan trọng cho ERP), `timezone`, `is_sync_enabled`.

**3. `campaign_ad_sources`:** (Routing Data)
- `id` (UUID), `campaign_id` (FK biz_ops_campaign), `ad_account_id` (FK), `external_campaign_id`, `external_campaign_name`.

**4. `campaign_digital_metrics`:** (Bảng dữ liệu Data Warehouse)
- `id`, `campaign_id` (FK), `date` (YYYY-MM-DD), `platform`, `spend` (Decimal), `impressions`, `clicks`, `conversions`, `roas`. (Hỗ trợ Recharts UI/UX).

---

## 🎯 Tổng kết (The Killer Feature)
Không cần cố gắng ép người dùng từ bỏ Trello hay Jira. Việc Biz-Ops chuyển hoá thành **"Data Integration Hub"** sẽ là bài thuyết trình Sale tốt nhất: *"Sử dụng izhubs ERP, 8:00 Sáng CEO và Khách hàng sẽ thấy báo cáo ngân sách / hiệu quả quảng cáo mới nhất cập nhật tự động bằng biểu đồ, mà không một nhân sự nào phải OT xuất file Excel CSV tải lên nữa!"*

*(Note: Những tính năng UI Task Board, Time Tracker, File Hub native nội sinh... vẫn có sẵn nhưng được dời xuống Roadmap "Optional" / Cắm thêm nếu cần).*
