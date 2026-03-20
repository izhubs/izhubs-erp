# Track: Contextual Interactive Product Tour

**Status:** Draft (Planning Phase)
**Persona:** `@pm` khởi tạo, chờ `@frontend` và `@backend` thực thi.

## 1. Bối cảnh & Mục tiêu (Context & Goals)
Trải nghiệm Onboarding tĩnh (Popover thụ động) hiện tại chưa đủ sức giữ chân người dùng. Để tối đa hoá **Retention Rate**, hệ thống cần:
- Trực quan hoá quy trình thực tế: **Bắt buộc/khuyến khích người dùng tự tay "Click"** thực hiện một hành động thật (Ví dụ: Thêm thử 1 Lead).
- **Cá nhân hoá theo Ngành Nghề (Industry-Contextual):** Ví dụ ngành Agency thì chỉ số Dashboard sẽ giải thích về "Retainer", trong khi ngành Restaurant giải thích về "Lượng khách đặt bàn". 

## 2. Phân tích Yêu cầu (Requirements)
1. **Interactive Steps (Click-driven):** 
   - Tour không chỉ bấm "Next" mà phải đợi người dùng bấm vào đúng Nút `IzButton` trên màn hình (như nút "Cài đặt ở đâu?", "Thêm Lead chỗ nào?").
   - Ứng dụng `driver.js` hoặc chuyển sang `react-joyride` nếu cần hook sâu vào Lifecycle React.
2. **Context-Aware Engine (Theo Ngữ Cảnh Từng Màn Hình):**
   - Dữ liệu Tour không fix cứng ở Frontend. Nội dung (mặc định bằng Tiếng Anh - **English First**) được bóc tách từ `templates/industry/*.ts` hoặc nạp từ API tuỳ theo `tenant.industry_id`.
   - Mỗi màn hình (Trang chủ, Contacts, Deals, Settings) phân bổ các chỉ số hay chức năng riêng khác nhau, vì vậy hướng dẫn cũng phải tuỳ biến dựa trên URL hiện tại.
3. **Nút Trợ giúp Chủ động (Help `?` Button):**
   - Ở góc trên cùng bên phải (Header) của *bất kỳ* màn hình nào, xuất hiện một nút `?`.
   - Khi bấm vào, hệ thống **bắt đầu lại Product Tour** chuyên biệt dành cho màn hình đang đứng. 
4. **Màn hình/Popup Tổng kết (Post-Tour Guide):**
   - Khi chạy xong 1 luồng hướng dẫn, thay vì tắt ngúm, hệ thống hiển thị một Popup tóm tắt hoặc dẫn link tới "Hướng dẫn chi tiết" (Comprehensive Knowledge Base or Welcome Interface) dùng mô tả tiếng Anh.

## 3. Kiến trúc Đề xuất (Technical Plan)
### `@backend`
- Nâng cấp `IndustryTemplate` schema (`core/schema/entities` -> `templates/`): Bổ sung thêm object `tourScript` chứa danh sách các popover được tuỳ biến cho riêng ngành đó.

### `@frontend`
- Xây dựng `InteractiveTourManager.tsx`, quản lý State toàn cục qua Zustand hoặc Context API.
- Lắng nghe event click của các UI Component cụ thể (Gắn `data-tour-target="add-lead"`). Khi người dùng click đúng target, Tour mới tự động chuyển sang Next Step.

## 4. Open Questions
- [ ] Tiếp tục ép dùng `driver.js` (chặn click bên ngoài) hay viết custom popover hook bằng Radix UI để quản lý chặt State thay đổi route của Next.js?
- [ ] Lưu trữ trạng thái "Đã xoá Demo Data" thì có huỷ Tour luôn không?
