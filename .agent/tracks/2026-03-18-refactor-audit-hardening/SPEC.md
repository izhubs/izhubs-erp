# Track: refactor-audit-hardening

**Status:** pending — chờ UI refactor agent hoàn thành trước
**Phase:** v0.2 (parallel, non-blocking)
**Priority:** High — phải xong trước khi managed cloud launch (v0.3)
**Risk refs:** erp_risk_audit.md (Groups 2 + 4), refactor_audit_master_plan.md
**Brain docs:** `brain/c44d8e62.../refactor_audit_master_plan.md` (chi tiết đầy đủ)

> ⚠️ **Agent coordination note:** Một agent khác đang làm UI refactor song song.
> Track này chỉ bắt đầu sau khi UI refactor done để tránh conflict.
> Phase 3 (UI Framework) cần sync với UI agent trước khi implement.

---

## Phase 0 — izhubs Native Skills (✅ DONE — 2026-03-18)

> Skills riêng cho hệ thống — không còn phụ thuộc vào generic antigravity-awesome-skills catalog.

| Skill | File | Thay thế |
|-------|------|---------|
| ✅ `izhubs-api-route` | `.agent/skills/izhubs-api-route/SKILL.md` | `api-design-principles` |
| ✅ `izhubs-database-engine` | `.agent/skills/izhubs-database-engine/SKILL.md` | `database-safety` + `postgres-best-practices` |
| ✅ `izhubs-module-development` | `.agent/skills/izhubs-module-development/SKILL.md` | `create-module` |
| ✅ `izhubs-security` | `.agent/skills/izhubs-security/SKILL.md` | `api-security-best-practices` + `security-auditor` |
| ✅ `izhubs-testing` | `.agent/skills/izhubs-testing/SKILL.md` | `test-driven-development` |

Dokumentasi đã cập nhật trong `AGENTS.md` → phần "⭐ izhubs-native Skills".

---

## Goal

Hardening hệ thống izhubs-ERP theo 3 nhóm mục tiêu:
1. **Security** — Kích hoạt rate limiting, security headers, GDPR erasure
2. **Observability** — CI/CD pipeline, error tracking (Sentry), unit tests
3. **Developer Experience** — UI wrapper layer, React Hook Form, TanStack Query, keyboard shortcuts

Đây **KHÔNG** phải feature mới. Tất cả là non-breaking improvements.

---

## Phase 1 — Security Hardening (Tuần 1 sau UI refactor)

### 1.1 — Redis Rate Limiter
> `redis` package đã install sẵn rồi (2026-03-18).

**Acceptance criteria:**
- [ ] Uncomment Redis implementation trong `lib/rate-limiter.ts` (lines 25-31)
- [ ] `checkRateLimit()` được apply tại: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/import`
- [ ] Redis service được uncomment trong `docker-compose.yml` dev
- [ ] `GET /api/health` trả về `redis: "ok"` thay vì `redis: "error"`

**Files:** `lib/rate-limiter.ts`, `docker-compose.yml`, `app/api/v1/auth/login/route.ts`, `app/api/v1/auth/register/route.ts`, `app/api/v1/import/route.ts`

---

### 1.2 — Security Headers
**Acceptance criteria:**
- [ ] `next.config.mjs` có headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
- [ ] `curl -I http://localhost:1303` hiển thị đủ các headers trên

**Files:** `next.config.mjs`

---

### 1.3 — Database Backup Script
**Acceptance criteria:**
- [ ] `scripts/backup.sh` tồn tại — chạy `pg_dump` tạo file `backups/izhubs-YYYYMMDD-HHmm.sql.gz`
- [ ] `package.json` có script `"backup": "bash scripts/backup.sh"`
- [ ] README có section "Backup & Restore"

**New files:** `scripts/backup.sh`

---

### 1.4 — GDPR / Right to Erasure
**Acceptance criteria:**
- [ ] `core/engine/gdpr.ts` có hàm `anonymizeUser(userId)` — xóa PII (email, name, phone) → `[removed]`, giữ lại records
- [ ] `DELETE /api/v1/user/:id` route tồn tại, wrap `withPermission('users:delete')`
- [ ] Migration: `ALTER TABLE users ADD COLUMN anonymized_at TIMESTAMPTZ`
- [ ] Anonymized users không thể login (`login route` check `anonymized_at IS NULL`)

**New files:** `core/engine/gdpr.ts`, `app/api/v1/user/[id]/route.ts`, `database/migrations/005_gdpr.sql`

---

### 1.5 — PostgreSQL Row Level Security (RLS)
> 🔴 **Lỗ hổng nghiêm trọng** — Hiện tại chỉ có code-level `tenant_id` filter. Nếu 1 route quên `AND tenant_id = $N`, công ty A thấy data công ty B.
> RLS là backstop ở tầng DB — không thể bypass dù code có lỗi.

**Acceptance criteria:**
- [ ] Migration `006_rls.sql` enable RLS trên các bảng core: `contacts`, `deals`, `companies`, `activities`, `notes`
- [ ] Postgres function `set_tenant_id(uuid)` — set `app.tenant_id` session variable
- [ ] `core/engine/db.ts` tự động call `set_tenant_id(tenantId)` sau mỗi connection checkout
- [ ] Test: query không có `SET app.tenant_id` phải trả về 0 rows (không phải error)

```sql
-- database/migrations/006_rls.sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON contacts
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
-- Tương tự cho: deals, companies, activities, notes
```

**Files:** `database/migrations/006_rls.sql`, `core/engine/db.ts`

---

### 1.6 — Docker OOM Build Fix
> ⚠️ Next.js Webpack tiêu tốn RAM lớn khi có nhiều modules. Docker container bị kill (exit code 137) khi build trên server nhỏ.
> `experimental.webpackMemoryOptimizations` chỉ từ Next.js **v15** — không dùng được. Dùng `NODE_OPTIONS` thay.

**Acceptance criteria:**
- [ ] `Dockerfile` có `ENV NODE_OPTIONS="--max-old-space-size=4096"` trước lệnh build
- [ ] `docker-compose.yml` có `mem_limit: 4g` cho service `app` khi build

**Files:** `Dockerfile`, `docker-compose.yml`

---


## Phase 2 — CI/CD & Observability (Tuần 1-2)

### 2.1 — CI Pipeline
**Acceptance criteria:**
- [ ] `.github/workflows/ci.yml` tồn tại và chạy trên mọi `push` + `pull_request`
- [ ] Pipeline steps: `npm ci` → `npm run typecheck` → `npm run lint` → `npm run test:contracts`
- [ ] Pipeline fail nếu bất kỳ step nào fail

**New files:** `.github/workflows/ci.yml`

---

### 2.2 — Error Tracking (Sentry)
**Acceptance criteria:**
- [ ] `@sentry/nextjs` installed
- [ ] `SENTRY_DSN` added vào `.env.example` (với comment)
- [ ] Sentry capture errors tại API `catch` blocks nhưng graceful khi `SENTRY_DSN` không có

**New files:** `sentry.client.config.ts`, `sentry.server.config.ts`

---

### 2.3 — Unit Tests (Minimum 20 tests)
**Acceptance criteria:**
- [ ] `tests/unit/rbac.test.ts` — test `hasPermission()` cho tất cả role × permission combos (ít nhất 16 cases)
- [ ] `tests/unit/api-response.test.ts` — test `ApiResponse.success/error/validationError/serverError`
- [ ] `npm run test:unit` → tất cả pass
- [ ] `npm run test:contracts` → vẫn 58/58 pass (không regression)

---

## Phase 3 — UI Framework (Sau khi sync với UI agent)

> ⚠️ Cần confirm với UI refactor agent về design system đang dùng trước khi implement.
> **Evaluation doc:** `brain/c44d8e62.../component_framework_evaluation.md`

### 3.1 — Internal UI Wrapper
- [ ] `components/ui/index.ts` re-export tất cả UI primitives (Button, Input, Modal, Badge, Table)
- [ ] Không còn feature component nào import trực tiếp HTML `<button>` hay `<input>`

### 3.2 — Modal (P1)
```bash
npm install @radix-ui/react-dialog
```
- [ ] `ContactFormModal` → dùng `@radix-ui/react-dialog` (focus trap + ARIA tự động)
- [ ] `DealFormModal` → tương tự

### 3.3 — React Hook Form (P1)
```bash
npm install react-hook-form @hookform/resolvers
```
- [ ] `ContactFormModal` → `useForm` + `zodResolver`
- [ ] `DealFormModal` → `useForm` + `zodResolver`
- [ ] `components/form/FormField.tsx` wrapper tái sử dụng

### 3.4 — Toast / Notification (P1)
```bash
npm install sonner
```
- [ ] `app/layout.tsx` thêm `<Toaster />` provider
- [ ] Thay tất cả `alert()` bằng `toast.success/error`

### 3.5 — Keyboard Shortcuts (P2)
```bash
npm install react-hotkeys-hook
```
- [ ] `Ctrl+K` → Global Search, `N` → New Contact, `Escape` → đóng modal

### 3.6 — Date Picker (P2 — khi có feature)
```bash
npm install react-day-picker
```
- [ ] Dùng khi: deal due date, activity date, invoice date
- [ ] Wrap thành `components/ui/DatePicker.tsx`

### 3.7 — Select/Combobox (P2)
```bash
npm install @radix-ui/react-select
```
- [ ] Dùng cho: assign owner dropdown, stage picker, industry selector

### 3.8 — TanStack Query (P2)
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```
- [ ] `lib/query-client.ts` + wrap `app/layout.tsx`
- [ ] Refactor `useModules` → `useQuery`

---

## Phase 4 — Data Layer (Tuần 3-4)

### 4.1 — BullMQ Async CSV Queue
> Depends on: Phase 1.1 (Redis active)
```bash
npm install bullmq
```
- [ ] `core/engine/queue.ts` — BullMQ queue setup
- [ ] `POST /api/v1/import` → enqueue job → return `{ jobId }` ngay lập tức
- [ ] Worker xử lý import background

### 4.2 — PostgreSQL Full-text Search
- [ ] Migration `006_fts.sql`: `search_vector tsvector` + GIN index cho contacts
- [ ] Trigger tự update khi INSERT/UPDATE
- [ ] API search endpoint dùng `to_tsquery`

---

## Phase 5 — Core Library Decisions (Tuần 4+)

> **Evaluation doc:** `brain/c44d8e62.../core_framework_evaluation.md`

### 5.1 — Email (P1)
```bash
npm install resend
```
- [ ] Implement `lib/email.ts` wrapper dùng `resend` SDK
- [ ] `RESEND_API_KEY` vào `.env.example`
- [ ] Dùng cho: invite user, reset password, deal won notification

### 5.2 — Structured Logging (P1)
```bash
npm install pino pino-pretty
```
- [ ] Tạo `lib/logger.ts` — centralized logger
- [ ] Replace `console.log` trong `core/engine/` bằng `logger.info/error`

### 5.3 — Vercel AI SDK (P2 — v0.3)
```bash
npm install ai @ai-sdk/openai
```
- [ ] Refactor `core/engine/import-ai.ts` dùng AI SDK
- [ ] Multi-provider support (OpenAI → Claude → Gemini)
- [ ] Streaming responses cho AI features

### 5.4 — File Storage / R2 (P2 — v0.3)
```bash
npm install @aws-sdk/client-s3
```
- [ ] `lib/storage.ts` wrapper
- [ ] Dùng cho: contract PDFs, invoice attachments, avatar

---

## Out of Scope
- Bất kỳ tính năng ERP mới nào (contacts, deals, reports...)
- Migration data schema thay đổi lớn
- UI design thay đổi (thuộc về UI refactor agent)
- Microservices, GraphQL, tRPC



---

## Verification

```bash
# Phase 1: Rate limit active
curl -X POST http://localhost:1303/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  # 101st request phải trả 429 Too Many Requests

# Phase 1: Security headers
curl -I http://localhost:1303
# → X-Frame-Options: DENY ✓

# Phase 1: Health check
curl http://localhost:1303/api/health
# → { "status": "ok", "checks": { "database": "ok", "redis": "ok" } }

# Phase 2: CI pipeline
gh workflow run ci.yml
# → tất cả steps pass

# Phase 2: Unit tests
npm run test:unit
# → 20+ tests pass, 0 failures

# Phase 4: TanStack Query DevTools visible in dev mode
# → QueryClientProvider mounted, DevTools panel hiện ở góc màn hình
```
