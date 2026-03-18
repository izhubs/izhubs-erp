---
name: izhubs-testing
description: "Viết tests cho izhubs ERP: contract tests, unit tests, e2e. Biết rõ test nào cần thiết cho loại code nào. Dùng khi thêm tính năng mới hoặc fix bug."
risk: safe
source: izhubs-internal
date_added: "2026-03-18"
---

# izhubs ERP — Testing Guide

## Ba tầng test

```
tests/
  contracts/    ← Test API routes (HTTP in/out). PHẢI có cho mọi route mới.
  unit/         ← Test pure functions (rbac, response factory, utils)
  e2e/          ← Playwright — test UX flows (login, tạo contact, deal)
  integration/  ← Test engine + DB thực (cần DB running)
```

## Contract Test (Quan trọng nhất)

> **Rule**: Mỗi route mới = ít nhất 1 contract test. Hiện tại: 58 tests đang pass.

```typescript
// tests/contracts/<resource>-api.test.ts
import { createMocks } from 'node-mocks-http';

// Pattern cho contract test
describe('GET /api/v1/contacts', () => {
  it('returns 401 when no auth', async () => {
    const req = new Request('http://localhost/api/v1/contacts');
    const res = await GET(req);  // import từ route file
    expect(res.status).toBe(401);
  });

  it('returns contacts for authenticated tenant', async () => {
    const req = new Request('http://localhost/api/v1/contacts', {
      headers: { Authorization: `Bearer ${validAccessToken}` }
    });
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
  });

  it('returns 403 for insufficient permissions', async () => {
    // viewer token trying to write
    const req = makeRequest('POST', viewerToken, { name: 'Test' });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
```

## Unit Test — RBAC

```typescript
// tests/unit/rbac.test.ts
import { hasPermission } from '@/core/engine/rbac';

describe('hasPermission', () => {
  test('superadmin can do everything', () => {
    expect(hasPermission('superadmin', 'contacts:delete')).toBe(true);
    expect(hasPermission('superadmin', 'users:delete')).toBe(true);
  });

  test('viewer cannot write', () => {
    expect(hasPermission('viewer', 'contacts:write')).toBe(false);
    expect(hasPermission('viewer', 'deals:write')).toBe(false);
  });

  test('member cannot delete', () => {
    expect(hasPermission('member', 'contacts:delete')).toBe(false);
  });

  test('unknown role returns false', () => {
    expect(hasPermission('hacker', 'contacts:read' as any)).toBe(false);
  });
});
```

## Test helper — JWT token

```typescript
// tests/__mocks__/auth.ts
import { signJwt } from '@/core/engine/auth/jwt';

export const makeToken = (role: string, tenantId = DEFAULT_TENANT_ID) =>
  signJwt({ userId: 'test-user', role, tenantId, type: 'access' });

export const makeRequest = (method: string, token: string, body?: object) =>
  new Request(`http://localhost/api/v1/test`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
```

## E2E Test — Playwright

```typescript
// tests/e2e/contact-flow.spec.ts
import { test, expect } from '@playwright/test';

test('create contact flow', async ({ page }) => {
  await page.goto('http://localhost:1303/login');
  await page.fill('[data-testid="email"]', 'admin@demo.com');
  await page.fill('[data-testid="password"]', 'demo123');
  await page.click('[data-testid="login-btn"]');

  await page.goto('/contacts');
  await page.click('[data-testid="new-contact-btn"]');
  await page.fill('[data-testid="contact-name"]', 'Test Contact');
  await page.click('[data-testid="save-contact-btn"]');

  await expect(page.locator('text=Test Contact')).toBeVisible();
});
```

## Chạy tests

```bash
npm run test:contracts   # 58+ contract tests — bắt buộc pass trước mỗi commit
npm run test:unit        # unit tests
npm run test:e2e         # playwright (cần app đang chạy)
npm run test             # tất cả
```

## Quy tắc

- **Trước mỗi commit**: `npm run test:contracts` phải xanh 100%
- **Route mới**: Phải có ít nhất 3 cases — 401 (no auth), 403 (wrong permission), 200/201 (success)
- **Bug fix**: Viết test reproduce bug trước, sau đó fix
- **Không mock DB** trong contract tests — dùng test tenant thực trong DB

## Checklist test mới

- [ ] Contract test cover 401, 403, success case
- [ ] Unit test cho pure functions (utils, formatters, RBAC checks)
- [ ] `npm run test:contracts` pass sau khi thêm test
- [ ] Test có `describe` label rõ ràng mô tả feature
