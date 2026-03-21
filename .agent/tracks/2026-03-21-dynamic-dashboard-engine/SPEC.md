# Track: Dynamic Dashboard Engine (Enterprise Grade)
**Created**: 2026-03-21
**Status**: planning
**Priority**: critical
**Owner**: AI Architecture Team

## 🌟 1. Executive Vision (The "Wow" Factor)
Hệ thống **Dynamic Dashboard Engine** không chỉ là một trang báo cáo tĩnh. Đây là một **Kiến trúc Hiển thị Phân tán (Distributed Rendering Architecture)** hướng tới trải nghiệm "Zero-Code" cho đội ngũ vận hành. 

Nó cho phép hệ thống tự định hình giao diện (UI) thông qua cấu hình JSON thuần túy, vận hành theo nguyên lý Kim tự tháp ngược **D.A.R Framework** (Dashboard - Analysis - Reporting), và mở ra kỷ nguyên cho hệ sinh thái AI Agents tự động phác thảo báo cáo thông qua ngôn ngữ tự nhiên (NL2Dashboard).

### Key Differentiators (Điểm chạm Wow):
- **Biến đổi Hình thái (Polymorphism UI):** Một Engine duy nhất phục vụ vô hạn các ngành hàng (SaaS, Agency, F&B...) chỉ bằng việc thay đổi bản thiết kế cấu hình (JSON Blueprint).
- **Trải nghiệm Thượng hạng (Premium UX):** Staggered Loading (load bậc thang cuộn mượt), Skeleton UI tinh tế, Fluid View-As Transitions, và tương tác vi mô (Micro-interactions) với Framer Motion & VisX/Recharts.
- **Bảo mật Thấm sâu (Deeply-Rooted Security):** Row-Level Security (RLS) tầng Database kết hợp Middle-layer JWT Role Verification (Cloudflare Workers/Middleware) loại bỏ triệt để rủi ro BOLA (Broken Object Level Authorization).

---

## 👥 2. User Profiles & "View-As" Capabilities (RBAC)

| Role | Access Level | Core Capabilities & User Stories |
|------|--------------|----------------------------------|
| **SuperAdmin / CEO** | Omniscient | Có cái nhìn toàn cảnh toàn vẹn hệ thống (`tenant-level view`). Đặc biệt sở hữu chức năng **"View-As Role"**: Tại Header có một Module chọn vai trò (Manager / Member), hệ thống sẽ lập tức *simullate* (mô phỏng) JSON Config + Context của Role đó theo thời gian thực (Runtime) mà không cần đăng xuất. Đảm bảo trải nghiệm Dashboard Rendering & Data Security được kiểm chứng "mắt thấy tai nghe". |
| **Manager / Lead** | Aggregated | Xem Roll-up data của phòng ban cấp dưới. Có khả năng Drill-down (đào sâu) vào dữ liệu từng nhân sự (Member) với Slicer Filtering. |
| **Member / Operator**| Individual | Giao diện tối giản thiết kế theo luồng làm việc Z-Pattern. Tỷ lệ Signal-to-Noise cao nhất: Chỉ tập trung dữ liệu do user tạo (owner) hoặc assign task. Bỏ qua nhiễu loạn thông tin. |

---

## 🎯 3. Product Features & Acceptance Criteria (D.A.R)

### Tầng D: Dashboard (The Pulse)
- **Component**: `SummaryCardWidget.tsx`
- **Criteria**:
  - [ ] Render siêu tốc metrics cốt lõi (KPI, MRR, Tickets).
  - [ ] Micro-interactions: Trend lines (Sparklines), % Growth (M/M, Y/Y) với bảng màu tâm lý học phân phối trạng thái (Success, Warning, Danger).
  - [ ] Deep-link navigation: Click từ Card phi thẳng vào Data Table cụ thể.

### Tầng A: Analysis (The "Why")
- **Component**: `ChartWidget.tsx`
- **Criteria**:
  - [ ] Component linh hoạt hỗ trợ Line, Bar, Donut, Scatter (Recharts).
  - [ ] Cross-filtering (Interactive Slicers): Hover Tooltips tương tác và Click-to-filter đồng bộ giữa các Biểu đồ.

### Tầng R: Reporting (The Ground Truth)
- **Component**: `DataTableWidget.tsx`
- **Criteria**:
  - [ ] Bảng dữ liệu đa chiều (TanStack Table) hỗ trợ Sort, Filter, Real-time Search.
  - [ ] Inline Data Mutation (chỉnh sửa trực tiếp tại cell) thông qua Optimistic UI updates. 
  - [ ] Khớp nối Audit Log tự động (`trg_audit`) đã thiết lập từ phiên **Session 18**.
  - [ ] Hỗ trợ render lazy-load bằng Virtualized Rows hoặc Pagination.

---

## 🛠 4. Đột phá Kiến trúc Kỹ thuật (Technical Architecture)

### 4.1. BFF Data Aggregation & Routing (Chống nghẽn cổ chai)
Để xử lý hàng loạt Widgets đồng thời, thay vì Frontend gửi cả chục request rời rạc, kiến trúc sẽ sử dụng mẫu **BFF (Backend For Frontend)**.
- **Endpoint API**: `GET /api/v1/dashboard/BFF?module={module}`
- **Luồng xử lý**: Backend đọc config JSON -> Khởi chạy `Promise.all()` fetching data nội bộ từ Service logic -> Chuyển hoá định dạng Frontend cần -> Trả về Client chỉ trong **1 HTTP Request duy nhất**.

### 4.2. Khả năng Mở rộng bằng Grid Schema (JSON Payload)
Khai báo siêu dữ liệu quy định Layout System:
```json
{
  "layout_id": "freelancer_view",
  "grid": [
    { "id": "mrr_target", "type": "SummaryCard", "w": 4, "h": 1, "x": 0, "y": 0, "endpoint": "/api/internal/finance/mrr" },
    { "id": "revenue_trend", "type": "ChartWidget", "chart_type": "line", "w": 8, "h": 2, "x": 4, "y": 0, "endpoint": "/api/internal/finance/trend" }
  ]
}
```

### 4.3. Caching & Persistence Layer
- Kỹ thuật **Stale-While-Revalidate (SWR)** hoặc TanStack Query kết hợp cùng Cache Control (Redis / Cloudflare KV) cho các Widget xử lý nặng (TTL = 15-30 phút).
- Pre-fetching data bằng SSR/SSG từ Next.js App Router nơi thích hợp để có Zero-Loading Time trên First-Paint. 

---

## 🚦 5. Implementation Phases (Masterplan)

- [ ] **Phase 1: Foundation (Architectural & Ruleset)**
  - Chốt cấu trúc Config JSON Blueprint (Lưu trên FS DB tĩnh hoặc `dashboard_configs`).
  - Viết module Context cho tính năng **SuperAdmin View-As Role**.

- [ ] **Phase 2: The Core BFF Engine**
  - Xây dựng file `/app/api/v1/dashboard/BFF/route.ts`.
  - Thiết lập Internal Caching Strategy (Redis TTL).

- [ ] **Phase 3: D.A.R UX Masterpiece (UI Components)**
  - Chế tác các khối lego: `ViewAsSelector`, `SummaryCard`, `ChartWidget`, `DataTableWidget`.
  - Tích hợp Skeleton Loaders & Fallback Error Boundaries (Nghiêm cấm vỡ UI toác mảng khi Empty State).

- [ ] **Phase 4: Fluid Experience Polish**
  - Gắn Animations nhẹ bằng Framer Motion cho sự kiện layout change.
  - Tối ưu Mobile Responsive (Xếp chồng Grid tự động về cột đơn - Z-Pattern Stack).

---

## 🛡️ 6. Out of Scope (Guardrails)
- Custom hard-code UI bằng tay để phục vụ riêng một ngành cá biệt (Vi phạm triết lý Config-driven).
- Các luồng WebSockets RealTime Stream (Tạm thời dùng Polling SWR để ra mắt MVP siêu tốc, Real-time dành cho Phase V2).
