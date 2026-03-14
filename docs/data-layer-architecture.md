# Data Layer Architecture — izhubs ERP

> "ERP is a view of the database. If the data is wrong, everything is wrong."

All data in izhubs ERP enters through exactly 3 gates. Each has different risks and different handling requirements.

---

## The 3 Data Gates

```
┌─────────────────────────────────────────────────────────┐
│                   izhubs ERP Database                   │
│         (PostgreSQL — single source of truth)           │
└──────────────┬─────────────────┬────────────────────────┘
               ↑                 ↑                        ↑
         GATE 1: SYNC     GATE 2: CREATE          GATE 3: IMPORT
         (automatic)     (in-app workflow)         (migration from elsewhere)
```

---

## 🔁 Gate 1 — SYNC (Auto-sync from external sources)

### What it is
Data pulled automatically from a connected external system.

### Examples
| Source | Data synced |
|--------|-------------|
| Google Contacts | Contact name, email, phone |
| Gmail | Email activity timeline |
| Google Calendar | Meeting activities |
| Shopify | Orders, customers |
| Tiktok Shop | Orders, buyer info |
| Zalo OA | Messages, contacts |

### Architecture

```
External Source
      ↓
  Connector (OAuth 2.0 per source)
      ↓
  Transformer (maps external schema → izhubs Core Schema)
      ↓
  Deduplication Check (email / phone as unique key)
      ↓
  Zod Validation
      ↓
  Core Engine (upsert via contactEngine.upsert())
      ↓
  EventBus: contact.synced event emitted
```

### Key Rules
- **Upsert, not insert**: if contact already exists (by email/phone), UPDATE, never create duplicate.
- **Never overwrite** a field the user has manually edited — "user wins over sync".
- **Sync jobs run in background** via BullMQ — never block the UI.
- **Sync audit**: every sync writes a row to `sync_log` table (source, count, errors).

### Planned for: v0.3

---

## ✏️ Gate 2 — CREATE (User creates data inside izhubs ERP)

### What it is
A user or an API caller creates a new record through the normal ERP interface/API.

### Flow
```
User submits form (or API call)
      ↓
  Zod Schema Validation (server-side — non-negotiable)
      ↓
  Business Rules check (RBAC: does this user have contacts:write?)
      ↓
  Core Engine (contactEngine.create())
      ↓
  Audit Log entry (who, what, when)
      ↓
  EventBus: contact.created emitted
      ↓
  (Subscribers: webhook, notification, activity log)
```

### Key Rules
- **Never trust client-side validation alone.** All validation is repeated server-side with Zod.
- **Required field enforcement** at DB level (NOT NULL constraints) + at schema level (Zod).
- **Every create action** goes to audit log — immutable, forever.
- **Optimistic UI**: UI shows the record immediately. If server fails → roll back UI and show error.

### Planned for: v0.1 (in progress)

---

## 📥 Gate 3 — IMPORT (Migration from external data sources)

### What it is
A bulk upload of existing data from: CSV files, Excel, old CRM export, Google Sheets.

### Why it's the most dangerous
One bad CSV with 10,000 contacts can:
- Create 10,000 duplicates
- Overwrite clean data with dirty data
- Insert malformed emails that break automations
- Exceed DB constraints and fail silently

### The Import Pipeline (4-stage)

```
Stage 1: UPLOAD
  ↓ User uploads CSV/Excel file
  ↓ File stored temporarily in /tmp/ or S3
  ↓ `import_jobs` table: row created with status=pending

Stage 2: PARSE & PREVIEW
  ↓ Server reads the file
  ↓ Auto-detect columns: "Email", "email", "Email Address" → mapped to contact.email
  ↓ Shows user a PREVIEW of first 20 rows + column mapping UI
  ↓ User confirms or adjusts column mapping

Stage 3: VALIDATE & CLEAN
  ↓ Every row validated through Zod ContactSchema
  ↓ For each row: check if email valid format, phone parseable, required fields present
  ↓ Flag each row: VALID | WARNING | ERROR
  ↓ Present a "Data Quality Report" to the user BEFORE inserting anything:
     - 8,234 valid rows (ready to import)
     -   412 warnings (duplicate emails — will be merged)
     -    52 errors (missing required field — will be skipped)
  ↓ User reviews, decides: import valid only, or fix and re-upload

Stage 4: INSERT (only after user confirms)
  ↓ Valid rows → contactEngine.upsert() in batches of 100
  ↓ Warnings → merging logic (user-wins rule applies)
  ↓ Errors → skipped, logged to import_errors table
  ↓ Progress shown in real-time (via SSE or polling)
  ↓ Final report: X imported, Y merged, Z skipped
  ↓ import_jobs row: status=done, summary stored
```

### Data Quality Rules (Applied in Stage 3)

| Field | Rule |
|-------|------|
| Email | Must pass RFC 5322 format check. Lowercase normalized. |
| Phone | Parsed via libphonenumber. Stored in E.164 format (+84901234567) |
| Name | `.trim()`. First/Last split attempted on full name column. |
| Duplicates | Detected by email OR phone. Strategy: update existing, don't create. |
| Required fields | If missing → row flagged as ERROR, not imported. |
| Encoding | File parsed as UTF-8. If garbled → user warned. |

### Planned for: v0.2

---

## Database Tables Involved

| Table | Purpose |
|-------|---------|
| `import_jobs` | Track every import: file, status, user, timestamp, summary |
| `import_errors` | Rows that failed validation — downloadable by user |
| `sync_log` | Log every sync run from external connectors |
| `audit_log` | Every create/update/delete from any gate |

---

## Version Plan Summary

| Gate | Feature | Version |
|------|---------|---------|
| Create | Core CRUD + validation | v0.1 |
| Create | Audit log UI | v0.1 |
| Import | CSV upload + column mapping | v0.2 |
| Import | Data Quality Report (preview) | v0.2 |
| Import | Batch insert with progress | v0.2 |
| Sync | Google Contacts connector | v0.3 |
| Sync | Shopify connector | v0.3 |
| Sync | Zalo OA connector | v0.3 |
