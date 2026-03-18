# Service Packages / Gói Dịch vụ

> **Loại file:** Mockup UI (Google Stitch, Gemini 3 Pro) — **CORE SHARED SCREEN**  
> Dùng chung mọi industry có mô hình subscription/gói dịch vụ.

## Nghiệp vụ quản lý
Quản lý **danh mục gói dịch vụ** của doanh nghiệp: tạo gói, định giá, liệt kê tính năng, theo dõi số khách đang dùng từng gói. Admin/CEO dùng để quản lý sản phẩm.

## Vì sao có màn hình này?
Hầu hết dịch vụ B2B (Agency, Virtual Office, SaaS, Consulting) đều có mô hình **tiered pricing** (Basic / Pro / Enterprise). Cần một nơi quản lý tập trung thay vì hardcode trong code hoặc lưu trên Excel.

## Vấn đề giải quyết
- Thay đổi giá gói dịch vụ phải nhờ dev sửa code → chậm, tốn kém
- Không có overview xem gói nào đang có bao nhiêu khách
- Khó tạo gói mới cho chiến dịch khuyến mãi
- Sales không biết feature differences giữa các gói để tư vấn khách

## Mong muốn của màn hình
- Admin tạo/chỉnh sửa gói ngay trên UI, không cần dev
- Nhìn ngay stats: "Gói Pro có 48 khách, tỷ lệ gia hạn 91%"
- Features list dạng checkbox → dễ compare giữa các gói
- Ngừng bán gói cũ khi ra gói mới (không xóa, giữ lịch sử)

## Industry Fit
| Industry | Tên gói mẫu | Đặc thù |
|---|---|---|
| Virtual Office | Cơ bản / Pro / Enterprise | Số lượng user, storage |
| Agency | Starter / Growth / Scale | Số project/tháng, giờ support |
| SaaS | Free / Starter / Business | Feature flags, API limits |
| Consulting | Project / Retainer / Enterprise | Giờ tư vấn/tháng |

## Thành phần chính
| Component | Mục đích |
|---|---|
| Package List (trái) | Danh sách gói + badge trạng thái + số khách |
| Package Detail (phải) | Thông tin đầy đủ gói đang chọn |
| Features Checklist | Liệt kê tính năng bao gồm |
| Package Stats | Số khách, doanh thu, tỷ lệ gia hạn |
| Status Tabs | Đang bán / Nháp / Đã ngừng |
