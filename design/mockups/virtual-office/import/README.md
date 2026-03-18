# Import CSV — 3 bước

> **Loại file:** Mockup UI (Google Stitch, Gemini 3 Pro)  
> **Stitch Screen IDs:**  
> - Bước 1 Upload: `34d89f2300714e1eb4571d63001af60e`  
> - Bước 2 Mapping: `4234108ae54946c29ee4365cb3c908e8`  
> - Bước 3 Review: `405679a70e3b410eb52491870f2caf7d`

## Nghiệp vụ quản lý
Nhập hàng loạt dữ liệu (contacts, leads, deals) vào hệ thống từ file CSV/Excel. Sử dụng AI để tự động map cột CSV vào field của hệ thống.

## Vì sao có màn hình này?
Khi onboard khách hàng mới dùng izhubs-erp, họ thường có dữ liệu cũ trong Excel. Nếu không có công cụ import, họ phải nhập tay từng record — không thực tế.

## Vấn đề giải quyết
- Không thể onboard khách hàng có 1000+ contacts nếu phải nhập tay
- CSV headers thường không match với field names của hệ thống (e.g., "email_addr" vs "Email")
- Import bừa có thể tạo duplicate records → dữ liệu rác

## Mong muốn
- Bước 1: Drag & drop file đơn giản, support CSV và Excel
- Bước 2: AI mapping gợi ý tự động (14/16 cột matched 90%+)
- Bước 3: Preview data trước khi import, highlight duplicate để người dùng quyết định
- Toàn bộ flow có stepper rõ ràng — không bị lạc

## Download HTML
- Upload: [Stitch HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzExYzU2MjYxODVjNzRhODY4ZmMyMzg5YmE5OGEwYzMwEgsSBxDxvuC2uQgYAZIBIwoKcHJvamVjdF9pZBIVQhMyNzczODgxMTM4MjE5OTU2MTcz&filename=&opi=96797242)
- Mapping: [Stitch HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2MwNjRmNTA3N2Q0ODQzMWE4YWMwZmIwZjE2NWEwNmRkEgsSBxDxvuC2uQgYAZIBIwoKcHJvamVjdF9pZBIVQhMyNzczODgxMTM4MjE5OTU2MTcz&filename=&opi=96797242)
- Review: [Stitch HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE0ZTBkZWUxNTU0MDRjZmM4MThlZGMyYTNkZGYyNjI3EgsSBxDxvuC2uQgYAZIBIwoKcHJvamVjdF9pZBIVQhMyNzczODgxMTM4MjE5OTU2MTcz&filename=&opi=96797242)
