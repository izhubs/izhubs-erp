# Company / Account Detail

> **Loại file:** Mockup UI (Google Stitch, Gemini 3 Pro) — **CORE SHARED SCREEN**  
> Dùng chung mọi industry B2B. Custom fields thay đổi theo `customFields` trong template.

## Nghiệp vụ quản lý
Trang chi tiết **công ty/tổ chức** — đơn vị ký hợp đồng trong B2B. Tổng hợp toàn bộ contacts, deals, hợp đồng, và lịch sử tương tác của một công ty trong một nơi.

## Vì sao có màn hình này?
Trong B2B, **công ty** mới là đơn vị mua hàng, không phải cá nhân. Một công ty có thể có nhiều contacts. Deal được ký với công ty. Cần một trang để nhìn toàn bộ relationship với một doanh nghiệp khách hàng.

## Vấn đề giải quyết
- Không biết tổng doanh thu từ một công ty là bao nhiêu (nhiều deal)
- Contacts của công ty rải rác, không biết ai là người quyết định
- Không theo dõi được "health" của account: HĐ sắp hết hạn? Deal đang stuck?
- Sales mới tiếp quản không biết lịch sử với công ty đó

## Mong muốn của màn hình
- Account Manager mở trang → 30 giây hiểu toàn bộ relationship với công ty
- Quick Stats bên phải: tổng deal value, HĐ active, ngày hết hạn sắp tới
- Tab Contacts → thấy ngay ai là decision maker (chức danh + status)
- Custom fields section extensible → mỗi industry có fields riêng

## Industry Customization (via `customFields` trong template)
| Industry | Custom Fields thêm vào |
|---|---|
| Virtual Office | Địa chỉ đăng ký, Loại doanh nghiệp, MST |
| Agency | Ngân sách marketing/năm, Công cụ đang dùng |
| E-commerce | Platform (Shopify/WooCommerce), GMV/tháng |

## Thành phần chính
| Component | Mục đích |
|---|---|
| Company Card (trái) | Logo, thông tin cơ bản, tags, action buttons |
| Custom Fields | Extensible theo industry template |
| Tabs (giữa) | Contacts / Deals / Hợp đồng / Hoạt động / Ghi chú |
| Quick Stats (phải) | Deal value, HĐ active, sắp hết hạn, Account Owner |

## Liên kết với industry template
```typescript
// agency.ts — customFields cho entity 'company'
{ entity: 'company', key: 'industry_type', label: 'Ngành', type: 'text' }
// → render thành custom field trong section "Thông tin mở rộng"
```
