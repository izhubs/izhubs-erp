# izhubs ERP — Core Shared Screens

> Các màn hình trong thư mục này là **shared/core** — dùng chung mọi industry template.  
> Không specific cho Virtual Office hay Agency, có thể tái sử dụng khi implement bất kỳ industry nào.

**Stitch Project:** https://stitch.withgoogle.com/projects/2773881138219956173

---

## Màn hình

| Thư mục | Màn hình | Customize theo industry |
|---|---|---|
| `tasks/` | Tasks / Công việc | Loại task (automation từ template) |
| `company-detail/` | Company / Account Detail | Custom fields theo ngành |
| `service-packages/` | Gói Dịch vụ | Tên gói, features, giá theo ngành |

---

## Nguyên tắc "Core vs Industry-specific"

**Core screen** = Layout và UX pattern không đổi giữa các ngành.  
**Industry customization** = Chỉ thay đổi:
- Custom fields (từ `customFields` trong template)
- Labels/nhãn (VD: "Gói dịch vụ" → "Pricing Plan" → "Service Package")
- Automation triggers (từ `automations` trong template)
