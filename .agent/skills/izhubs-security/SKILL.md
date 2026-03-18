---
name: izhubs-security
description: "Security checklist đặc thù cho izhubs ERP: RBAC, JWT, rate limiting, OWASP, GDPR. Dùng khi review security của feature mới, implement auth, hoặc expose API public."
risk: safe
source: izhubs-internal
date_added: "2026-03-18"
---

# izhubs ERP — Security Patterns

## Authentication Flow

```
Browser                    Edge Middleware              API Route
   │  POST /api/v1/auth/login  │                            │
   │ ──────────────────────────>│                            │
   │                           │  verifyJwt (hz_access)     │
   │  Set-Cookie: hz_access    │  verifyJwt (hz_refresh)   │
   │  Set-Cookie: hz_refresh   │                            │
   │ <────────────────────────  │                            │
   │                           │                            │
   │  GET /dashboard           │                            │
   │ ──────────────────────────>│                            │
   │                           │ Check hz_refresh cookie    │
   │                           │ → isAuthenticated = true   │
   │ <──────── 200 OK ─────────│                            │
   │                           │                            │
   │  GET /api/v1/contacts     │                            │
   │ ───────────────────────────────────────────────────────>│
   │                           │                 getAuthClaims()
   │                           │                 hasPermission()
   │ <─────────── 200 data ──────────────────────────────────│
```

## JWT Token Rules

| Token | Nơi lưu | TTL | Dùng cho |
|-------|---------|-----|---------|
| `hz_access` | httpOnly cookie | 15 phút | Gọi API |
| `hz_refresh` | httpOnly cookie | 7 ngày | Kiểm tra session ở middleware |

```typescript
// ❌ KHÔNG được đặt token trong localStorage — XSS vulnerability
// ✅ Chỉ httpOnly cookies

// ❌ KHÔNG share JWT_SECRET giữa môi trường
// ✅ Mỗi môi trường có JWT_SECRET riêng trong .env
```

## Luôn kiểm tra trong API route

```typescript
// 1. Auth check — đã được withPermission() xử lý tự động
// 2. Tenant isolation — PHẢI filter theo tenantId trong mọi query
const { rows } = await db.query(
  'SELECT * FROM contacts WHERE id = $1 AND tenant_id = $2',  // tenant_id bắt buộc
  [id, claims.tenantId]  // claims từ JWT, không từ body
);

// 3. Input validation — Zod safeParse trước khi xử lý
const parsed = Schema.safeParse(body);
if (!parsed.success) return ApiResponse.validationError(parsed.error);
```

## OWASP Top 10 — Trạng thái hiện tại

| # | Rủi ro | Trạng thái izhubs |
|---|--------|-------------------|
| A01 | Broken Access Control | 🟢 withPermission() + withModule() |
| A02 | Cryptographic Failures | 🟢 jose JWT, bcrypt passwords, httpOnly cookies |
| A03 | SQL Injection | 🟢 Parameterized queries ($1, $2...) xuyên suốt |
| A04 | Insecure Design | 🟡 Đang cải thiện (Phase 1 audit) |
| A05 | Security Misconfiguration | 🟡 Security headers chưa có (plan: next.config.mjs) |
| A06 | Vulnerable Components | 🟢 Chạy `npm audit` định kỳ |
| A07 | Auth failures | 🔴 Rate limiting chưa active (lib/rate-limiter.ts no-op) |
| A09 | Logging failures | 🔴 Không có centralized logging/Sentry |
| A10 | SSRF | 🟢 Không có external HTTP calls phía server |

## Rate Limiting (Cần activate)

```typescript
// lib/rate-limiter.ts — ĐÃ VIẾT, chưa activate
// Sau khi npm install redis và uncomment:

import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limiter';

// Áp dụng cho login endpoint
const result = await checkRateLimit(`login:${ip}`, 10, 60);  // 10 req/60s
if (!result.allowed) {
  return NextResponse.json({ error: 'Too many requests' }, {
    status: 429,
    headers: rateLimitHeaders(result),
  });
}
```

## GDPR / PDPA Compliance

```typescript
// Khi user yêu cầu xóa data (Right to Erasure):
// 1. Anonymize PII — KHÔNG xóa record (giữ metrics)
// 2. Đánh dấu anonymized_at
// 3. Block login cho user đã anonymize

// core/engine/gdpr.ts (kế hoạch implement - Phase 1.4)
export async function anonymizeUser(userId: string, tenantId: string) {
  await db.query(`
    UPDATE users
    SET email = $1, name = '[removed]', phone = NULL, anonymized_at = NOW()
    WHERE id = $2 AND tenant_id = $3
  `, [`deleted-${userId}@removed.invalid`, userId, tenantId]);
}
```

## Environment Variables Security

```bash
# .env.local — KHÔNG commit vào git
JWT_SECRET=          # min 32 chars, random
DATABASE_URL=        # connection string với password
REDIS_URL=           # redis://... cho production

# KHÔNG đặt secret trong:
# - next.config.mjs (expose client-side)
# - NEXT_PUBLIC_* variables
# - Code source
```

## Security checklist trước deploy

- [ ] `JWT_SECRET` trong `.env.local` khác với dev (min 32 chars)
- [ ] `DATABASE_URL` dùng SSL (`?sslmode=require`) trên production
- [ ] Rate limiting active (Redis connected)
- [ ] Security headers trong `next.config.mjs`
- [ ] `npm audit` clean (không có high severity)
- [ ] Không có `console.log` chứa PII (password, token, credit card)
