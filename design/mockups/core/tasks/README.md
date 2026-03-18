# Tasks / Công việc

> **Loại file:** Mockup UI (Google Stitch, Gemini 3 Pro) — **CORE SHARED SCREEN**  
> Dùng chung mọi industry. Chỉ khác ở loại task được automation tạo ra.

## Nghiệp vụ quản lý
Quản lý **tất cả công việc hàng ngày** liên quan đến Sales, Marketing, và chăm sóc khách hàng. Tasks có thể tạo thủ công hoặc được tạo tự động từ `automations` trong industry template (VD: agency.ts tự tạo task "Follow-up proposal" sau 3 ngày).

## Vì sao có màn hình này?
Activity tracking và follow-up là backbone của mọi CRM. Không có task management tích hợp, nhân viên phải dùng tool riêng (Trello, sticky notes...) → mất context với deal/contact.

## Vấn đề giải quyết
- Task rải rác ở nhiều tool → không ai biết ai đang làm gì
- Automation tạo task (từ `agency.ts`) nhưng không có nơi xem
- Quá hạn task mà không ai biết → bỏ sót khách hàng
- Không link được task với deal/contact cụ thể → mất context

## Mong muốn của màn hình
- Mở app sáng thấy ngay "8 tasks hôm nay", biết ưu tiên cái nào
- Task quá hạn highlight đỏ → không thể bỏ qua
- Link task với Deal/Contact → click thẳng vào object liên quan
- Sidebar filter nhanh theo loại task (call, email, renewal...)
- Automation tasks hiển thị cùng manual tasks

## Industry Customization
| Industry | Loại task hay gặp |
|---|---|
| Virtual Office | Nhắc gia hạn HĐ, Follow-up proposal |
| Agency | Follow-up proposal (sau 3 ngày), Lên lịch review |
| E-commerce | Xử lý đơn hàng, Liên hệ khách pending |

## Thành phần chính
| Component | Mục đích |
|---|---|
| Filter Tabs | Hôm nay / Tuần này / Tất cả / Đã hoàn thành |
| Sidebar Filters | Theo loại, người assign, đối tượng liên quan |
| Task List (grouped) | Hôm nay / Ngày mai / Quá hạn |
| Task Row | Checkbox + tên + loại badge + entity link + priority + owner |
| Detail Panel | Chi tiết task + lịch sử khi click |
