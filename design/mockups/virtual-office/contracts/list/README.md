# Hợp đồng & Gia hạn

> **Loại file:** Mockup UI (Google Stitch, Gemini 3 Pro)  
> **Stitch Screen ID:** `5016a172cf814f21b7b9a303c4675042`

## Nghiệp vụ quản lý
Quản lý **vòng đời hợp đồng dịch vụ** với khách hàng Virtual Office: theo dõi hợp đồng đang hiệu lực, phát hiện hợp đồng sắp hết hạn, và lên lịch gia hạn proactive.

## Vì sao có màn hình này?
Trong mô hình dịch vụ subscription (Virtual Office), **retention quan trọng hơn acquisition**. Mất một khách hàng có hợp đồng dài hạn = mất doanh thu recurring. Màn hình này giải quyết vấn đề "churn thầm lặng" — khách không gia hạn vì không ai nhắc.

## Vấn đề giải quyết
- Sales quên follow-up gia hạn → khách chuyển sang đối thủ
- Không có visibility tổng thể về HĐ nào đang active / sắp hết hạn
- Mỗi tháng phải check từng file Excel thủ công
- Không có workflow tự động nhắc nhở (automation trong agency.ts)

## Mong muốn của màn hình
- Sales mở tab Hợp đồng buổi sáng thấy ngay "17 HĐ sắp hết hạn — ACTION REQUIRED"
- Các hàng sắp hết hạn (30 ngày) **highlight cam**, urgent badge đỏ
- Nút "Lên lịch gia hạn" → tạo task/activity trực tiếp (Automation từ `agency.ts`)
- Nút "Gửi nhắc nhở" → email template tự động gửi cho khách
- Filter theo trạng thái giúp Sales focus đúng danh mục cần xử lý

## Thành phần chính
| Component | Mục đích |
|---|---|
| KPI Summary Bar | Tổng active, Sắp hết hạn 30d, Hết hạn tuần này, Revenue/tháng |
| Status Tabs | Tất cả / Đang hiệu lực / Sắp hết hạn (badge đỏ) / Đã kết thúc / Chờ ký |
| Data Table | Danh sách HĐ + gói + ngày + giá trị + trạng thái |
| Row Highlight | Hàng sắp hết hạn → highlight cam + badge "Cần gia hạn" |
| Action Buttons | "Lên lịch gia hạn" + "Gửi nhắc nhở" per row |

## Download HTML
[Stitch HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzI0NDkyNjI5YjJiZTQ1OGI5ZGViYjIwZjk0MGVjNjhkEgsSBxDxvuC2uQgYAZIBIwoKcHJvamVjdF9pZBIVQhMyNzczODgxMTM4MjE5OTU2MTcz&filename=&opi=96797242)
