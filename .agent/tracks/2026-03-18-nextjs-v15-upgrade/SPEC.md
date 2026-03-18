# Track: nextjs-v15-upgrade

**Status:** planned — thực hiện sau Phase 1-2 refactor-audit-hardening
**Phase:** v0.3
**Priority:** Medium — đợi tests coverage đủ trước khi upgrade
**Depends on:** `refactor-audit-hardening` Phase 2.3 (unit tests phải xanh trước)

> ⚠️ **Không làm sớm.** Upgrade v15 có breaking changes cần tests để catch regression.

---

## Mục tiêu

Upgrade Next.js 14 → 15 để dùng:
- `experimental.webpackMemoryOptimizations: true` — giảm RAM khi Docker build
- React 19 và Turbopack stable
- Caching behavior rõ ràng hơn (opt-in thay vì opt-out)

---

## Breaking Changes cần xử lý

### 1. `fetch` caching đảo ngược (quan trọng nhất)

```typescript
// Next.js 14: cache by default
fetch('/api/data')  // → cached

// Next.js 15: NO cache by default
fetch('/api/data')  // → không cached
fetch('/api/data', { cache: 'force-cache' })  // → mới cached
```

**Việc cần làm:**
- [ ] Audit toàn bộ `fetch()` calls trong Server Components
- [ ] Thêm `{ cache: 'force-cache' }` cho các call cần cache
- [ ] Thêm `{ next: { revalidate: 30 } }` cho các call cần ISR

---

### 2. `params` và `searchParams` phải `await`

```typescript
// Next.js 14
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>
}

// Next.js 15
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // ← bắt buộc await
  return <div>{id}</div>
}
```

**Việc cần làm:**
- [ ] Chạy Next.js v15 codemod tự động: `npx @next/codemod@canary upgrade latest`
- [ ] Review tất cả `page.tsx` có `params` hoặc `searchParams`

---

### 3. React 19 — `useFormState` → `useActionState`

```typescript
// React 18 (Next.js 14)
import { useFormState } from 'react-dom'

// React 19 (Next.js 15)
import { useActionState } from 'react'
```

**Việc cần làm:**
- [ ] Tìm tất cả `useFormState` imports và replace

---

## Lợi ích sau upgrade

```js
// next.config.mjs — Next.js 15
experimental: {
  webpackMemoryOptimizations: true,  // ← Giảm RAM build Docker
}
```

Kết hợp với `NODE_OPTIONS=--max-old-space-size=4096` từ Phase 1.6 → giải quyết hoàn toàn OOM khi build.

---

## Các bước thực hiện

```bash
# 1. Chạy codemod tự động (xử lý ~80% breaking changes)
npx @next/codemod@canary upgrade latest

# 2. Chạy tests để catch regression
npm run test:contracts
npm run test:unit

# 3. Kiểm tra thủ công các page chính
# → Login, Contacts list, Deals Kanban, Import flow

# 4. Update next.config.mjs
```

---

## Verification

```bash
# Check version
npm list next  # → 15.x.x

# Tests phải pass
npm run test:contracts  # → 58+ pass

# Docker build không OOM
docker build . --no-cache   # → exit 0, không exit 137

# Webpack memory optimization active
# next.config.mjs: experimental.webpackMemoryOptimizations: true
```

---

## Out of Scope
- Không migrate sang `app/` nếu chưa có (đã migrate từ v14)
- Không adopt Server Actions mới nếu không có requirement
- React 19 concurrent features — chỉ fix breaking APIs, không refactor
