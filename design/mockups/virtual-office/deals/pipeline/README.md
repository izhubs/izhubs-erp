# Pipeline Bán hàng (Virtual Office)

> **Loại file:** Mockup UI (Google Stitch, Gemini 3 Pro)  
> **Stitch Screen ID:** `1ae37c0ed98345609a49ec30360fe6c4`

## Nghiệp vụ quản lý
Kanban board theo dõi **toàn bộ cơ hội bán hàng** (deals) theo từng giai đoạn trong quy trình bán dịch vụ Virtual Office. Tuân thủ 8 stage từ `templates/industry/agency.ts`.

## Vì sao có màn hình này?
Pipeline là công cụ làm việc hàng ngày của Sales team. Không có pipeline rõ ràng:
- Sales Manager không biết deal nào đang "stuck" cần hỗ trợ
- Sales Rep không biết ưu tiên deal nào trước
- Không dự báo được doanh thu tháng tới (forecast)

## Vấn đề giải quyết
- Deals nằm rải rác trên email, ghi chú, memory của từng Sales Rep
- Không visualize được tổng giá trị deal ở mỗi stage
- Khó nhận ra deal nào đang ở quá lâu 1 stage (không tiến triển)
- Giai đoạn **Gia hạn** đặc biệt quan trọng với Virtual Office (subscription model)

## Mong muốn của màn hình
- Sales mở app thấy ngay toàn bộ pipeline của mình
- Badge "14 ngày" trên thẻ deal → Sales nhận ra deal cần action ngay
- Column header hiển thị tổng giá trị → Sales Manager forecast được
- Stage **Gia hạn** và **Đang chạy** luôn có deal → đây là core của VO business
- Drag và drop (interaction) chuyển deal sang stage mới

## Thành phần chính
| Component | Mục đích |
|---|---|
| 8 Kanban Columns | Lead mới → Proposal → Đàm phán → Onboarding → Đang chạy → Gia hạn → Chốt / Không chốt |
| Column Header | Tên stage + số deals + tổng giá trị VND |
| Deal Card | Tên deal + công ty + giá trị + owner avatar + days-in-stage + loại gói |
| Top Bar | Pipeline selector + "Tạo Deal mới" + Kanban/List toggle |

## Stages (từ agency.ts)
`Lead mới` → `Gửi Proposal` → `Đàm phán` → `Onboarding` → `Đang chạy` → `Gia hạn` → `Đã chốt ✓` / `Không chốt ✗`

## Download HTML
[Stitch HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzM0MDVjZDJhODRjNDRiNDQ5NTRiNDA3YjNkYjAzMzViEgsSBxDxvuC2uQgYAZIBIwoKcHJvamVjdF9pZBIVQhMyNzczODgxMTM4MjE5OTU2MTcz&filename=&opi=96797242)
