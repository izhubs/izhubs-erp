# 🚀 Biz-Ops (Project Management) Plugin — Ultimate Vision Plan

This document outlines a massive, long-term vision for the **Biz-Ops Plugin** of izhubs ERP. Dành riêng cho đối tượng Agency, Freelancer và Service Business, module Biz-Ops không chỉ là một công cụ quản lý Task đơn thuần mà sẽ là **trái tim vận hành (Operations Heart)** của toàn bộ doanh nghiệp.

Dưới đây là thiết kế kiến trúc và quy hoạch **~100 tính năng** chia theo 10 Trụ cột Hệ sinh thái (Pillars), giúp chúng ta có tầm nhìn xa trước khi bắt tay code từng phần nhỏ.

---

## Pillar 1: Core Project & Program Management 📂
1. **Dự án dự định (Campaigns/Projects)**: Khởi tạo dự án với thông tin chi tiết.
2. **Portfolios / Programs (Cụm Dự án)**: Nhóm các dự án liên quan thành chiến dịch tổng thể.
3. **Project Phases & Milestones**: Chia dự án thành các giai đoạn (Discovery, Design, Dev, QA, Launch) với các mốc Milestone.
4. **Project Templates (Agency-specific)**: Mẫu dự án dựng sẵn với cấu trúc task, phase có sẵn (VD: Website Redesign Template).
5. **Project Health Status**: Tự động cảnh báo (On track, At risk, Off track).
6. **Custom Fields at Project Level**: Cho phép thêm các trường tuỳ chỉnh (Budget type, Tech Stack, Client Tier).
7. **Cross-project Dependencies**: Ràng buộc giữa dự án A và dự án B.
8. **Project Archives**: Lưu trữ dự án hoàn thành mà không xoá data để làm báo cáo.
9. **Project Access Control (Workspace Isolation)**: Phân quyền xem/Sửa cấp độ dự án (Public trong công ty / Private).
10. **Project Baseline Snapshots**: Lưu lại kế hoạch ban đầu để so sánh với thực tế (Baseline vs Actual).

## Pillar 2: Task & Subtask Engine 📋
11. **Task Entities**: Tạo task, assignees (hỗ trợ multiple assignees).
12. **Infinite Multi-level Subtasks**: Task con lồng task con (Epic -> Story -> Task -> Subtask).
13. **Custom Task Workflows (Statuses)**: Tuỳ chỉnh luồng trạng thái theo từng dự án (To-Do -> Doing -> Review -> Blocked -> Done).
14. **Task Dependencies (Ràng buộc)**: Finish-to-Start, Start-to-Start, Finish-to-Finish luồng logic.
15. **Priorities Matrix**: Độ ưu tiên (Low, Med, High, Urgent, Critical).
16. **Recurring Tasks**: Tự động lặp lại task (Daily, Weekly, Monthly) cho các công việc bảo trì/Admin.
17. **Task Templates**: Mẫu task kèm checklist chuẩn SOP.
18. **Checklists inside Tasks**: Danh sách cần kiểm tra trong mỗi task.
19. **Rich-text & Markdown Descriptions**: Hỗ trợ format, chèn ảnh, syntax code.
20. **Tags & Labels System**: Phân loại theo nhãn đa sắc.
21. **Time Estimates & Story Points**: Ước tính số giờ hoặc số điểm cho Agile.
22. **Approvals Workflow**: Cơ chế Submit for Approval (đòi hỏi Manager hoặc Client duyệt).
23. **Bulk Edit Tasks**: Sửa trạng thái, assign, dueDate hàng loạt.
24. **Linked Issues**: Liên kết task với bug, ticket hoặc CR (Change Request).
25. **Task Merging & Duplication**: Gộp các task trùng hoặc nhân bản task nhanh.

## Pillar 3: Views & Visualizations 👁️
26. **Kanban Board View**: Giao diện kéo thả với Swimlanes.
27. **List / Grid Spreadsheet View**: Nhìn như Excel, edit inline nhanh chóng.
28. **Calendar View**: Lịch công việc kéo thả ngày tháng theo tháng/tuần.
29. **Gantt Chart / Timeline View**: Timeline tổng quan và dependency links.
30. **Workload / Resource View**: Bản đồ nguồn lực xem ai đang rảnh/bận.
31. **"My Tasks" Global Dashboard**: View tổng hợp mọi task cùa 1 user từ TẤT CẢ các dự án.
32. **Custom Saved Filters**: Lưu lại bộ lọc (VD: "Task gấp của team Dev").
33. **Cross-project Aggregate Views**: Bảng Kanban gộp nhiều dự án.
34. **Map View**: Cho các agency có event/shooting ngoài trời cần gắn location.
35. **Dashboard Widgets**: Project completion %, Burn-down charts trực tiếp ở dashboard.

## Pillar 4: Time Tracking & Resource Management ⏱️
36. **Native Start/Stop Timer**: Đồng hồ bấm giờ tích hợp ngay trên màn hình.
37. **Manual Time Entry**: Nhập tay log time sau khi làm xong.
38. **Billable vs Non-Billable Hours**: Đánh dấu giờ làm có tính phí khách hàng hay không.
39. **Timesheets Management**: Duyệt bảng chấm công của nhân sự/freelancer.
40. **Resource Capacity Planning**: Setup giới hạn 40h/tuần mỗi người để tránh Overload.
41. **Leave & Holiday Exclusion**: Tự động đẩy due date nếu dính ngày nghỉ/Lễ.
42. **Cost Rate vs Bill Rate**: Theo dõi chi phí trả nhân viên (Cost) vs Phí charge khách (Bill) -> Tính Margin.
43. **Estimated vs Actual Variance**: Báo cáo chênh lệch giữa Estimate và thực tế làm.
44. **Overtime Tracking**: Cảnh báo làm việc vượt số giờ chuẩn.
45. **Idle Time / Inactivity Prompts**: Nhắc nhở nếu quên tắt timer khi máy tính nghỉ.

## Pillar 5: Collaboration & Communication 💬
46. **Task Comments & Threads**: Bàn luận trực tiếp trên task, hỗ trợ Thread/Reply.
47. **@Mentions**: Tag tên người, tag team, tag task khác (VD: "Tham khảo #Task-123").
48. **Project Chat / Inbox**: Kênh chat real-time riêng cho từng dự án (PWA-ready).
49. **Activity Log / Audit Trail**: Lịch sử chi tiết ai đổi trạng thái, sửa gì giờ nào.
50. **In-line File Attachments**: Kéo thả ảnh, video thẳng vào comment.
51. **Read Receipts**: Biết ai đã đọc update/bình luận quan trọng.
52. **External Guest Comments**: Khách (client) comment qua email không cần đăng nhập.
53. **"Watch/Follow" Task**: Cài đặt để nhận noti khi có thay đổi kể cả không được assign.
54. **Emoji Reactions**: Thể hiện cảm xúc nhanh trên comment (+1, 👀, ✅).
55. **Voice Memos / Video screen-record inside comments**: Thu âm hoặc quay màn hình bug trực tiếp trên ERP.

## Pillar 6: File & Asset Management (Digital Asset Manager) 📁
56. **Project File Hub**: Quản lý file tập trung của mỗi dự án như Google Drive mini.
57. **File Versioning & History**: Theo dõi các version tệp (v1, v2, v3_final).
58. **Visual Proofing (Feedback on Images/PDFs)**: Click thẳng vào ảnh thiết kế/PDF để comment pinpoint.
59. **Folder Structures**: Tổ chức folder theo chuẩn của dự án.
60. **Global File Search**: Tìm kiếm nội dung bên trong tài liệu (OCR, Text Extractor).
61. **Public Sharing Links**: Tạo link chia sẻ file có hạn sử dụng (Password protected).
62. **Storage Tracking & Limits**: Quản lý dung lượng lưu trữ của từng dự án/tenant.
63. **Auto-organization**: Tự gom file từ các task comment vào File Hub.
64. **Cloud Integration**: Sync 2 chiều với Google Drive, OneDrive, Dropbox.
65. **Native Media Playback**: Xem trước video/audio/3D model thẳng trong trình duyệt.

## Pillar 7: Client Portal & Extensibility 🤝
66. **White-labeled Client Portal**: Cổng thông tin cho khách hàng với logo và domain riêng.
67. **Client Read/Comment Views**: Cấu hình chế độ xem (Chỉ xem tổng quan, không thấy chat nội bộ).
68. **Client Approval Workflows (Sign-offs)**: Gửi UX/UI hoặc Document cho khách "Duyệt / Từ chối".
69. **Magic Link Passwords**: Khách vào duyệt qua link mã hoá gửi qua email (No login required).
70. **Intake Forms (izForm)**: Tích hợp izForm làm "Brief request", submit tự tạo Task/Project.
71. **Client File Dropzone**: Khu vực cho khách upload resource siêu to (bypass email limit).
72. **Shared Feedback Boards**: Bảng góp ý chung cho khách.
73. **Internal vs External Notes**: Note trên task chia 2 tab: Team Only & Client Visible.
74. **Invoices/Quotes sharing in Portal**: Khách vào có thể xem hoá đơn của chính dự án đó.
75. **Embeddable Project Status Widget**: Widget nhúng vào website để khách tự tra cứu tiến độ bằng ID.

## Pillar 8: Flow Automations & Webhooks ⚡
76. **"If This, Then That" Engine**: VD: "Nếu Status = Done, auto-assign QA".
77. **Auto-tagging**: Tự động dán nhãn dựa trên keyword tiêu đề.
78. **Overdue Nudges**: Tự động gửi tin nhắn Slack/Email đòi nợ task khi quá hạn.
79. **Cross-project Routing**: Move/Duplicate task từ dự án thiết kế sang dự án Code khi xong UI.
80. **Percentage Auto-calculator**: % hoàn thành dự án = Số lượng task Done / Tổng Số Task.
81. **Milestone Webhooks**: Bắn webhook ra ngoài ngay khi đạt mốc Milestone.
82. **Recurring Project Generation**: Đầu mỗi tháng tự sinh ra 1 Project "Retainer Plan T4".
83. **Capacity Auto-warning**: Alert quản lý nếu tự động gán việc làm 1 bạn Dev load > 100%.
84. **Auto Update Deal Stage**: Liên kết CRM - Dự án Done tự động kéo Deal về "Fulfilled".
85. **Scheduled Reports**: Thứ 6 hàng tuần Email gửi báo cáo hiệu suất dự án cho BOD.

## Pillar 9: Financials & Operations (ERP Linkage) 💰
86. **CRM Deal to Project Handover**: Nốt "Won" Deal bên CRM tự động đẻ ra Project/Contract định sẵn.
87. **Invoicing Line Items from Time**: Biến tổng số giờ Billable thành hoá đơn (Invoice plugin).
88. **Project Expense Tracking**: Ghi nhận chi phí mua tool, chạy Ads của riêng dự án đó.
89. **Vendor / PO Tracking**: Quản lý hợp đồng phụ/nhà thầu liên kết trong dự án.
90. **Contractor Payouts**: Dựa vào timesheet của freelancer, tự tạo báo cáo thanh toán Paycheck.
91. **Multi-currency per Project**: Dự án gia công quốc tế dùng USD, trả nợ nội địa VND.
92. **Progress Billing (Thanh toán theo tiến độ)**: Gắn Invoice đợt 1, 2, 3 vào các Milestones.
93. **Cost Overrun Alerts**: Cảnh báo khi chi phí / thời gian vượt mức Estimate 80%.
94. **Profitability & Burn Rate Calculation**: Doanh thu dự kiến - (Giờ đã làm x Cost Rate) - Expenses = Lãi ròng.
95. **Asset Depreciation Allocation**: (Advanced ERP) Phân bổ chi phí khấu hao thiết bị vào dự án.

## Pillar 10: Analytics, Insights & AI 📊
96. **Custom Report Builder**: Drag-drop chỉ số để làm báo cáo đặc thù.
97. **Team Performance / Turnaround Time**: Đo lường vận tốc của team (Velocity).
98. **Time-to-Resolution Metrics**: Thời gian Tb từ lúc mở task tới lúc Done.
99. **Export Engine**: Xuất PDF, CSV, Excel tất tần tật mọi thứ đẹp mắt.
100. **AI Project Co-pilot**: AI tự phân tích Brief và tự "Suggest 20 Tasks cần làm", AI ước lượng Budget rủi ro dựa vào lịch sử dự án, AI tự viết báo cáo tuần từ activity logs.

---

## 🎯 Horizontal Plugin Architecture (Nền tảng Tái sử dụng)

Một tư duy cực kỳ sắc bén! Thay vì nhồi nhét 100 tính năng trên vào dọc một module `biz-ops`, chúng ta sẽ **bóc tách các điểm chung** thành các **Core Plugins (Platform Services)**. Các plugin này hoạt động độc lập và bất kỳ module nào (CRM, HR, Support, Biz-Ops) cũng có thể "cắm" (attach) vào để dùng lại.

Dưới đây là **9 Horizontal Plugins** được rút trích ra từ 100 tính năng trên:

### 1. Universal Task Engine (`izTask`)
- **Nguồn gốc**: Bóc từ Pillar 2 (Task, Subtask, Board, Dependencies).
- **Cách dùng**: Cung cấp API để "đính kèm" (attach) một Task Board vào bất kỳ một Entity ID nào. 
- **Ứng dụng**: 
  - `biz-ops` dùng izTask để quản lý Project.
  - `crm` dùng izTask để gán To-Do list cho 1 Lead/Deal.
  - `support` dùng izTask để quản lý Ticket support cho khách.

### 2. Unified Communication Service (`izComment`)
- **Nguồn gốc**: Bóc từ Pillar 5 (Comments, Threads, @Mentions, Read Receipts, Emoji).
- **Cách dùng**: Cung cấp Chat Component / Comment Thread Component đính vào `entity_id` và `entity_type`.
- **Ứng dụng**: Dùng để chat/bình luận nội bộ ở Hợp đồng (Contracts), Invoices, Contacts, Deals, Tasks, v.v.

### 3. Digital Asset Management (`izFileHub`)
- **Nguồn gốc**: Bóc từ Pillar 6 (File storage, versioning, visual proofing).
- **Cách dùng**: Xử lý toàn bộ logic upload, lưu S3, preview, versioning. 
- **Ứng dụng**: `crm` lưu hợp đồng PDF, `biz-ops` lưu design asset, `izform` lưu file khách upload.

### 4. Universal Time Engine (`izTimer`)
- **Nguồn gốc**: Bóc từ Pillar 4 (Start/Stop timer, Timesheet, Cost rate vs Bill rate).
- **Cách dùng**: Component đồng hồ bấm giờ global ở Navbar, lưu table `time_entries` với polymorphic relations.
- **Ứng dụng**: Tính giờ làm Task (`biz-ops`), tính giờ gọi khách (`crm`), tính giờ fix bug (`support`).

### 5. Automation Rule Engine (`izFlow`)
- **Nguồn gốc**: Bóc từ Pillar 8 (If This Then That, Auto-assign, Webhooks).
- **Cách dùng**: Lắng nghe Event Bus của toàn hệ thống (`event.emit`) và tự động chạy actions dựa trên JSON Config.
- **Ứng dụng**: Toàn bộ hệ thống chạy tự động hoá qua đây. (Đã nằm trong chiến lược v0.3 Automation Schema của chúng ta).

### 6. Universal Approval Engine (`izApproval`)
- **Nguồn gốc**: Bóc từ Pillar 7 (Client Sign-offs) & Pillar 2 (Approvals workflow).
- **Cách dùng**: Trạng thái duyệt nhiều cấp (Pending -> Manager Approved -> Client Approved).
- **Ứng dụng**: Duyệt nghỉ phép (`hr`), duyệt chi (`finance`), duyệt thiết kế (`biz-ops`), duyệt hợp đồng (`contracts`).

### 7. Client Portal Gateway (`izPortal` / `izerp-theme`)
- **Nguồn gốc**: Bóc từ Pillar 7 (White-labeled portal, magic links).
- **Cách dùng**: Lớp vỏ bọc (BFF + UI) bảo mật bằng Next.js middleware, chỉ render dữ liệu dựa theo Guest Token (Magic Link).
- **Ứng dụng**: Khách xem danh sách Task, xem Invoices, tải Files, điền Form – tất cả tựu chung vào 1 cổng Portal theo tên miền riêng.

### 8. Dynamic Dashboard Engine & Reports (`izReport`)
- **Nguồn gốc**: Bóc từ Pillar 10 (Custom Report Builder, Dashboard Widgets).
- **Cách dùng**: Core module ta đang làm dở (D.A.R Framework) hỗ trợ JSON cấu hình Layout và Recharts.
- **Ứng dụng**: Chạy mọi báo cáo và View-As role boards.

### 9. Custom Entity Metadata (`izMeta`)
- **Nguồn gốc**: Bóc từ Pillar 1 (Custom fields per project).
- **Cách dùng**: Cho phép Admin tự add thêm Column (Text, Đơn vị tiền tệ, Dropdown) vào UI mà không cần can thiệp DB Schema (EAV hoặc JSONB pattern).
- **Ứng dụng**: Gắn thêm trường "Size Cửa hàng" vào Contacts, hay "Loại Content" vào Task.

---

## 🔗 Cơ Chế Tái Sử Dụng: Kiến Trúc Đa Hình (Polymorphic Architecture)

Câu hỏi *"nếu doanh nghiệp không quản lý theo dự án mà quản lý bên ngoài thì sao?"* chính là điểm nút để hệ quy chiếu ERP này vươn tầm. Để các **Horizontal Plugins** có thể xài được trôi chảy cả trong Project lẫn ngoài Project, chúng ta sử dụng **Kiến trúc Đa hình (Polymorphic Relations)** (Entity-Agnostic Design).

Quy tắc cốt lõi: **Không bao giờ dùng khoá ngoại cứng (Hard Foreign Keys) như `project_id` hay `deal_id` trong các plugin dùng chung này.**

Thay vào đó, bảng dữ liệu (DB) của plugin sẽ có 2 cột chuẩn:
1. `entity_type` (chuỗi - VARCHAR)
2. `entity_id` (UUID)

**Ví dụ thực tế với `izTask` (Universal Task Engine):**
- Trợ lý mở một Task con trong Project A: `entity_type = 'bizops_project'`, `entity_id = 'id_cua_project_A'`.
- Sale gán lời nhắc gọi điện chăm sóc một Deal ở ngoài CRM: `entity_type = 'crm_deal'`, `entity_id = 'id_cua_deal'`.
- Chị Kế toán chỉ muốn lưu to-do cá nhân trên Dashboard (không thuộc dự án nào): `entity_type = 'user'`, `entity_id = 'id_cua_ke_toan'`.
- Công ty dịch vụ IT quản lý Task dính liền với 1 Công ty Khách hàng: `entity_type = 'crm_company'`, `entity_id = 'id_cua_khach_hang'`.

**Về mặt UI Interfaces (React Components):**
Plugin chỉ phơi bày (expose) duy nhất một React Component. Bạn mang Component đó thả vào bất cứ chỗ nào trong app.
```tsx
// Giao diện hồ sơ Project 
<UniversalTaskBoard entityType="bizops_project" entityId={project.id} />

// Giao diện hồ sơ Khách hàng
<UniversalTaskBoard entityType="crm_contact" entityId={contact.id} />

// Cột bên phải (SlideOver) khi bấm vào 1 dòng Invoice
<UniversalCommentThread entityType="invoice" entityId={invoice.id} />
```

**Lợi ích kép:**
Bằng cách này, module `izTask` bị **MÙ** hoàn toàn về việc nó đang nằm ở đâu. Nó không quan tâm nó thuộc về module CRM hay module HR hay module Biz-Ops. Sự "mù" này chính là cảnh giới tái sử dụng cao nhất giúp ERP vận hành linh hoạt không khác gì Notion hay Airtable. Bất kỳ doanh nghiệp nào, dù cấu trúc tổ chức họ ra sao, cũng đều ghép được luồng đi cho riêng họ.
