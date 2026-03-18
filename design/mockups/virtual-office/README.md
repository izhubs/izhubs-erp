# izhubs Virtual Office — UI Mockups

> **Tất cả các file trong thư mục này là MOCKUP — không phải code production.**  
> Được tạo bằng Google Stitch (Gemini 3 Pro), dùng làm tài liệu thiết kế tham chiếu.

**Stitch Project:** https://stitch.withgoogle.com/projects/2773881138219956173  
**Industry:** Virtual Office Services | **Template:** `agency.ts`

---

## Cấu trúc thư mục

```
virtual-office/
├── _theme/
│   └── design-system.md       # Design tokens, palette, typography
├── auth/
│   ├── login/                  # Màn hình đăng nhập
│   └── forgot-password/        # Quên mật khẩu (2 bước)
├── dashboard/
│   ├── ceo/                    # CEO Executive Dashboard
│   └── marketing/              # Marketing Dashboard
├── contacts/
│   ├── list/                   # Danh sách contacts
│   ├── detail/                 # Chi tiết contact
│   └── add-modal/              # Modal thêm contact
├── deals/
│   ├── pipeline/               # Kanban pipeline
│   ├── detail/                 # Chi tiết deal
│   └── create-modal/           # Modal tạo deal
├── leads/
│   └── list/                   # Danh sách leads + chiến dịch
├── contracts/
│   └── list/                   # Hợp đồng & gia hạn
├── reports/
│   └── hub/                    # Báo cáo & Phân tích
├── import/
│   ├── upload/                 # Bước 1: Upload file
│   ├── mapping/                # Bước 2: Mapping cột
│   └── review/                 # Bước 3: Review data
├── settings/
│   └── profile/                # Cài đặt tài khoản
└── notifications/
    └── center/                 # Notification center
```

---

## Màn hình theo Role

| Role | Xem màn hình |
|---|---|
| CEO | `dashboard/ceo`, `reports/hub` |
| CMO | `dashboard/marketing`, `leads/list`, `reports/hub` |
| Sales | `deals/pipeline`, `deals/detail`, `contacts/list`, `contracts/list` |
| Marketing | `dashboard/marketing`, `leads/list`, `contacts/list` |
| Admin | Tất cả |
