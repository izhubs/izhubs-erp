# 🛠️ Biz-Ops (Digital Hub): Technical Implementation Plan

## 1. Database Schema Additions (Prisma / SQL)
Tạo file migration mới (`025_bizops_digital_sync.sql`) để định nghĩa cấu trúc dữ liệu cốt lõi cho Hub:
- Bảng `integration_connections`: Quản lý vòng đời OAuth2 Token (Encrypted). Mỗi User có thể có 1 connection với FB/GG.
- Bảng `ad_accounts`: Danh sách các tài khoản quảng cáo (Trello/Meta/Google) quẹt được từ Business Manager. Chứa `currency`, `timezone`, và `is_sync_enabled`.
- Bảng `campaign_ad_sources`: Lớp map N-N nối 1 chiến dịch `bizops_campaigns` nội bộ với N các `external_campaign_id` ngoại bang.
- Bảng `campaign_digital_metrics`: Data Warehouse lưu metrics (Spend, Click, Conversion, Impression) chốt theo từng ngày (Daily Snapshots).
- Sửa đổi bảng `biz_ops_expenses`: Thêm nguồn phát sinh (`source_type = 'ads_sync'`) để phân biệt với chi phí tiêu xài nhập tay.

## 2. Phase 1: Authentication & Account Discovery (The Root)
**Mục tiêu:** Khách hàng bấm Connect và kéo được 1.000 tài khoản về izhubs trong 5 giây.
1. Khởi tạo tầng Service `izIntegration`. Xây dựng luồng đăng nhập OAuth2 cho Facebook Marketing API (`/api/v1/integrations/facebook/auth` và `/callback`).
2. Tích hợp Facebook Graph API (`/me/adaccounts`) để fetch toàn bộ Ad Accounts, bóc tách Phân quyền View/Edit.
3. Cập nhật Giao diện **Settings -> Integrations**: UI trực quan (Data Table) hiển thị list tài khoản, cho phép Manager bật On/Off (Toggle) tính năng Sync cho những tài khoản hữu ích.

## 3. Phase 2: Campaign Mapping & Metric Pipelines (The Engine)
**Mục tiêu:** Nối mảng rác của FB vào Project sạch của izhubs.
1. Thêm tab **[Digital Sources]** vào trang Chi tiết Campaign (`/biz-ops/campaigns/[id]`).
2. Setup Select/Dropdown cho người dùng chọn `external_campaign_id` từ danh sách live fetch bên FB.
3. Thiết lập **Background Jobs System (BullMQ Engine)**:
   - Setup `cron-sync-queue` lên lịch vào lúc 2:00 AM mỗi đêm.
   - Viết `sync-worker` (Sử dụng config Concurrency: 5, Rate limiter) để loop qua Bảng `campaign_ad_sources` và gọi API lấy báo cáo ngày hôm qua (`date_preset = yesterday`).

## 4. Phase 3: Financial Expense Auto-Generation & UI (The Wow Factor)
**Mục tiêu:** Biến số tiền tiêu hôm qua thành Chứng từ / Phiếu chi hợp lệ trong ERP. Tự động hoá 100% công sức kế toán & báo cáo.
1. Tại bước xử lý của Worker (Phase 2), sau khi lấy được Spend (Chi phí), Worker tự động `INSERT` 1 dòng dữ liệu vào `biz_ops_expenses`.
2. Dữ liệu này tự động cập nhật Tổng Chi (Total Actual Cost) của Campaign hiện tại.
3. Xây dựng Report Component (Dùng `Recharts.js`) trên Client Portal: Show biểu đồ đường (Line chart) tương quan giữa Chi Phí Mới và Chuyển Đổi Thực Tế một cách sắc nét.

## 5. Phase 4: Google Ads & Advanced Platforms (Scale Out)
**Mục tiêu:** Mọi nền tảng đều phải "đầu hàng" kiến trúc này.
1. Khai báo **Interface** chuẩn `IAdSyncAdapter` với các phương thức bắt buộc: `getTokens()`, `fetchAccounts()`, `fetchCampaigns(accountId)`, `fetchDailyInsights(campaignId)`.
2. Map Adapter của Facebook vào Interface này. Bất kể sau này thêm Google Ads hay Tiktok Ads, core Engine (BullMQ) không cần can thiệp 1 dòng code.
3. Lập trình OAuth2 và MCC List Customers cho Google Ads API.
