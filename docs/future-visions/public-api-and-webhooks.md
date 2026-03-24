# Public API & Webhook System — izhubs ERP

> Planned for **v0.2**. This document describes the design for external integrations.

---

## Overview

Two distinct mechanisms for external app communication:

| Mechanism | Direction | Use Case |
|-----------|-----------|---------|
| **Public REST API + API Keys** | Inbound (external → izhubs) | n8n pulls contacts, custom app queries deals |
| **Outbound Webhooks** | Outbound (izhubs → external) | n8n/Zapier receives event when deal stage changes |

---

## 1. Public REST API + API Keys

### Why API Keys (not JWT)?
JWT tokens expire and require a login session. External apps (n8n, Zapier, custom scripts) need a stable, long-lived credential — that's an **API Key**.

### Design

**New DB Table: `api_keys`**
```
id            UUID        primary key
user_id       UUID        owner of the key
name          TEXT        human label (e.g. "n8n integration")
key_hash      TEXT        bcrypt hash of the key (never store plaintext)
scopes        TEXT[]      e.g. ['contacts:read', 'deals:write']
rate_limit    INTEGER     requests per minute (default: 100)
last_used_at  TIMESTAMP
expires_at    TIMESTAMP   nullable (null = no expiry)
created_at    TIMESTAMP
```

**New Route Prefix: `/api/public/v1/`**
- Separate from `/api/v1/` (which uses JWT sessions)
- Uses `X-API-Key: izh_<key>` header
- Scope-gated: key with `contacts:read` cannot access `/deals`
- Rate-limited per key via Redis

**Middleware: `lib/api-key-auth.ts`**
1. Extract key from header
2. Hash incoming key → look up in DB
3. Validate scopes for the requested endpoint
4. Log every call with timestamp, IP, endpoint to audit log
5. Return 429 if rate limit exceeded

**API Key Format**
```
izh_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   (production)
izh_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   (test/sandbox)
```
Prefix reveals environment, avoids accidental cross-env usage.

**Settings UI (v0.2)**
- Page: `app/(dashboard)/settings/api-keys/` 
- Create / revoke API keys
- Set scopes (read-only, read-write, specific modules)
- View last used timestamp

---

## 2. Outbound Webhooks

> Stub already exists in `lib/webhooks/`. Needs to be wired to EventBus.

### Design

**DB Table: `webhook_configs`** *(Migration 003 already covers this)*
```
id            UUID
user_id       UUID
url           TEXT        destination endpoint
events        TEXT[]      e.g. ['contact.created', 'deal.stage_changed']
secret        TEXT        HMAC signing secret
active        BOOLEAN
```

**Flow**
```
Core Engine emits event (e.g. deal.stage_changed)
       ↓
EventBus
       ↓
WebhookDispatcher (reads webhook_configs for this event)
       ↓
HTTP POST to destination URL (with HMAC-signed body)
       ↓ (fire-and-forget via BullMQ queue for retries)
External: n8n / Zapier / Make / custom
```

**Payload shape**
```json
{
  "event": "deal.stage_changed",
  "timestamp": "2026-03-14T10:00:00Z",
  "data": {
    "deal_id": "...",
    "from_stage": "proposal",
    "to_stage": "won"
  }
}
```

**Retry policy**: 3 retries with exponential backoff (5s, 30s, 5min).

**Security**: Each payload signed with `X-izhubs-Signature: sha256=<hmac>`. Destination verifies before processing.

**Settings UI (v0.2)**
- Page: `app/(dashboard)/settings/webhooks/`
- Add webhook URL + select events to trigger
- Test webhook (send a sample payload)
- View delivery history + response codes

---

## Migration Plan

| Step | Task | Version |
|------|------|---------|
| 1 | Add `api_keys` table (migration 006) | v0.2 |
| 2 | `lib/api-key-auth.ts` middleware | v0.2 |
| 3 | `/api/public/v1/` routes with scope checks | v0.2 |
| 4 | Settings UI — API Keys page | v0.2 |
| 5 | Wire EventBus → WebhookDispatcher | v0.2 |
| 6 | Settings UI — Webhooks page | v0.2 |
| 7 | BullMQ retry queue for webhook delivery | v0.2 |

---

## Scope Reference

| Scope | Access |
|-------|--------|
| `contacts:read` | GET /contacts, /contacts/:id |
| `contacts:write` | POST/PATCH/DELETE /contacts |
| `deals:read` | GET /deals |
| `deals:write` | POST/PATCH/DELETE /deals |
| `*:read` | Read all entities |
| `*:write` | Write all entities (admin only) |
