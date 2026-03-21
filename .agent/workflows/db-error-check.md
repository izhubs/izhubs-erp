---
description: Workflow to check and process database error logs
---

# Mục đích
Workflow này dùng để trích xuất các log lỗi (`level = 'error'`) từ database (`system_logs`), nhóm chúng lại theo `context` hoặc `message` và xử lý nguyên nhân gây lỗi từng bước một.

## Các bước thực hiện:

1. **Lấy danh sách lỗi từ Database**
// turbo
Chạy lệnh query sau trong docker để lấy danh sách lỗi 100 lỗi gần nhất:
```powershell
docker exec -i izhubs-erp-postgres-1 psql -U postgres -d izhubs_erp -c "SELECT id, context, message, meta, created_at FROM system_logs WHERE level = 'error' ORDER BY created_at DESC LIMIT 100;"
```

2. **Nhóm lỗi (Group by)**
- Phân tích output từ bước 1.
- Nhóm các log lại theo `context` hoặc `message` để gom các lỗi giống nhau.

3. **Lên kế hoạch xử lý (Triage)**
- Chọn từng nhóm lỗi từ trầm trọng nhất (hoặc xuất hiện nhiều nhất) đến ít nhất.
- Đọc `meta` JSONB logs để lấy stacktrace hoặc details cụ thể.

4. **Xử lý từng lỗi (Process)**
- Tạo `task_boundary` cho từng nhóm lỗi để sửa code, test và fix tận gốc.
- Đối với mỗi lỗi:
  - Tái hiện lỗi trên mã code.
  - Fix mã nguồn gốc gây ra lỗi.
  - Viết `test:contracts` hoặc `unit` để đảm bảo lỗi không tái diễn.

5. **Lưu ý về trạng thái xử lý**
Hiện tại bảng `system_logs` sử dụng cấu trúc mặc định, không có cột `status` để đánh dấu 'đã xử lý'.
Bạn (AI) cần tự track các lỗi đã fix trong quá trình chạy dựa vào thời gian tạo (sẽ không fix lại các bản nháp trước thời gian code được sửa). Hoặc yêu cầu User chạy lệnh UPDATE thêm field vào `meta`.
