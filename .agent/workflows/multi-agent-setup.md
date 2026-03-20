---
description: Hướng dẫn thiết lập và vận hành đội ngũ Đa tác nhân (Multi-Agent) bằng Antigravity Ultra cho dự án.
---

# Quy trình Vận hành Đa tác nhân (Multi-Agent Workflow)

Dự án này sử dụng chiến lược **Multi-Agent** trên Antigravity Ultra để tăng tốc phát triển. 

## 1. Thiết lập ban đầu
- Các quy tắc (Rules) đã được định nghĩa tại `.agent/rules/*.mdc` bao gồm: `core`, `pm`, `architecture`, `backend`, `frontend`, `qa`.
- Nếu có sẵn Antigravity Kit 2.0, bạn có thể chạy:
  ```bash
  // turbo
  npx vvdavin/ag-kit init
  ```
  *(Lệnh trên sẽ tự động cấu hình 16 tác nhân chuyên biệt nếu gói hỗ trợ).*

## 2. Cách Vận Hành Song Song
Thay vì dùng một Agent để code từ đầu đến cuối, hãy chia nhỏ công việc:
1. **Mở nhiều Workspace (Duplicate Workspace)**: Mỗi cửa sổ giao việc cho một Persona (Ví dụ: Cửa sổ 1 gọi `@backend` làm API, Cửa sổ 2 gọi `@frontend` làm UI).
2. **Theo dõi qua Inbox (Agent Manager)**: Khi các Agent tạo *Implementation Plan* hoặc *Walkthrough*, hãy vào Agent Manager để review Artifacts và phê duyệt trước khi chúng tạo PR hoặc merge code.
3. **Merging (Git Branches)**: Đảm bảo các Agent làm việc trên các nhánh riêng biệt để tránh conflict.

## 3. Các Artifact Dùng Để Giao Tiếp
Để tránh rủi ro hệ thống, bạn **bắt buộc** các Agent phải cung cấp:
- **Implementation Plan**: Bản thiết kế trước khi viết code (Đặc biệt quan trọng với `@architecture` và `@backend`).
- **Browser Recording / Screenshots**: Bằng chứng hoạt động của UI bằng Browser Agent (Dành cho `@frontend`).
- **Walkthrough**: Tóm tắt bàn giao công việc sau khi hoàn thành.
