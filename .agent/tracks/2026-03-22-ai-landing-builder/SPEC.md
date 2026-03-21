# Track: AI Landing Page Builder Plugin
**Created**: 2026-03-22
**Status**: planning
**Priority**: high

## Summary
Xây dựng một nền tảng SaaS tạo Landing Page tự động bằng AI (Prompt-to-Website), tích hợp như một Plugin (`izlanding`) vào izhubs-erp. Sử dụng trải nghiệm "Vibe Code" qua giao diện chat tự nhiên, tách bạch dữ liệu (Content) và Cấu trúc (Layout), cho phép kho giao diện tự động học hỏi. 

Hệ thống sử dụng kiến trúc Hybrid: 
1. **Plugin trong ERP (`izlanding`)** đóng vai trò Control Plane (quản lý DB, API, Chat UI, Billing, Domains).
2. **Microservice render bên ngoài (`landing-renderer`)** chạy Astro SSR đóng vai trò Data Plane để build website tĩnh siêu tốc (Zero-JS) và deploy lên Cloudflare Pages.

## User Stories
- As a user, I want to type a prompt describing my desired website so that the AI can instantly generate a ready-to-publish landing page.
- As a marketer, I want to inject my Facebook Pixel and Google Analytics tracking codes into the generated pages.
- As a business owner, I want to map my custom domain to the generated landing page with automatic SSL provisioning.
- As an admin, I want to limit the generation quota (vibe count) based on the user's subscription tier.

## Acceptance Criteria
- [ ] User có thể cài đặt plugin `izlanding` từ App Store.
- [ ] Cài đặt thành công tự động thêm menu "Landing Pages" vào sidebar (RBAC: admin, member).
- [ ] Giao diện Chat có thể nhận prompt và stream về JSON Schema phân tách `structure` và `content`.
- [ ] Zod filter loại bỏ mọi mã độc (script, onload) từ AI output.
- [ ] Dữ liệu `structure` được đẩy vào thư viện pgvector để AI học hỏi lại.
- [ ] User có thể trỏ custom domain về hệ thống và được cấp SSL (Cloudflare for SaaS).
- [ ] Landing page được build đệ quy bằng Astro xuất ra HTML/CSS siêu nhẹ đạt >90 điểm Google PageSpeed.

## Technical Plan

### DB Changes
- New tables (Plugin spec):
  - `iz_landing_projects` (id, tenant_id, name, status, active_domain...)
  - `iz_landing_pages` (id, project_id, content_json, tracking_scripts...)
  - `iz_landing_domains` (id, project_id, domain, ssl_status, cloudflare_id...)
  - `iz_landing_generation_logs` (id, tenant_id, user_id, prompt, token_usage...)
- Vector DB integration: `pgvector` extension cho layout thư viện (`layout_structures`).
- Migration: `019_izlanding_plugin.sql`

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/plugins/izlanding/projects` | `withPermission('landing:read')` | List all projects |
| POST | `/api/v1/plugins/izlanding/generate` | `withPermission('landing:write')` | Stream AI generation (SSE) |
| POST | `/api/v1/plugins/izlanding/domains` | `withPermission('landing:write')` | Add custom domain |

### Engine Functions
- `core/engine/ai.ts`: LLM abstraction layer (Gemini SDK wrapper), token metering.

### Microservice: `landing-renderer`
- Cần tạo service Node.js/Astro riêng biệt (sẽ setup repo con hoặc thư mục riêng trong monorepo).
- Consume build jobs từ BullMQ (đẩy từ plugin `izlanding`).
- API giao tiếp với Cloudflare API (Wrangler/Pages + SaaS Domains).

## Implementation Phases
- [ ] **Phase 1: Plugin Foundation**: DB migration `iz_landing_*`, Module manifest, App Store seed, Basic CRUD routes.
- [ ] **Phase 2: AI Integration**: `core/engine/ai.ts`, System Prompt (Structure/Content), Zod Validation, Chat UI streaming.
- [ ] **Phase 3: Renderer Microservice**: `landing-renderer` setup (Astro recursive build), BullMQ queue, pgvector layout library, Cloudflare deployment script.
- [ ] **Phase 4: Domain & Publishing**: Custom Domain management, Cloudflare for SaaS integration, SSL automation.

## Out of Scope
- Trình kéo thả (Drag-and-Drop builder) UI truyền thống (như Ladipage/Elementor) — hệ thống CHỈ tạo bằng AI Prompt-to-Website (Vibe Code).
- Quản lý hosting cho backend code của user (chỉ support site tĩnh HTML/CSS/JS thuần túy sinh từ AI).

## Open Questions
- [ ] Chọn model LLM nào (Gemini 1.5 Pro hay GPT-4o) để có khả năng generate tailwind classes chuẩn xác nhất với JSON format và schema mong muốn?
- [ ] Chiến lược quản lý version cho các AI-generated components.
