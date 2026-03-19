# Document Hub, AI Chatbot & Search Architecture — izhubs ERP

> Plan for v0.3. These 3 features are deeply connected: Documents feed the AI chatbot; Search is the bridge between both.

---

## 🔍 Part 1 — Global Search

### How Search Works in izhubs (Simple First)

> The user is right: 90% of real-world search queries are title/name lookups.

**Default approach: PostgreSQL Full-Text Search**
No Elasticsearch needed at v0.3. PostgreSQL `tsvector` + `tsquery` handles most cases well.

```sql
-- Each searchable table gets a search column:
ALTER TABLE contacts ADD COLUMN search_vector tsvector;
ALTER TABLE deals    ADD COLUMN search_vector tsvector;
ALTER TABLE documents ADD COLUMN search_vector tsvector;

-- Auto-updated via trigger:
search_vector = to_tsvector('english',
  coalesce(first_name, '') || ' ' ||
  coalesce(last_name, '') || ' ' ||
  coalesce(email, '') || ' ' ||
  coalesce(phone, '')
);

CREATE INDEX idx_contacts_search ON contacts USING gin(search_vector);
```

**Search priority ranking:**
```
1. Exact match on name/title     (highest priority)
2. Prefix match (starts with)
3. Full-text match anywhere in content
4. Related field match (e.g. company name → contacts at that company)
```

### Global Search UI
- Single `⌘K` / `Ctrl+K` command palette (like Linear, Vercel)
- Searches across: Contacts, Deals, Documents, Activities simultaneously
- Grouped results by entity type
- Recent searches stored locally (no server hit for history)

### When to upgrade to ElasticSearch / Qdrant
Only when:
- Full-text search inside document body becomes slow (> 500ms)
- Semantic/AI search needed ("show deals similar to this one")

Planned for: v0.5+

---

## 📄 Part 2 — Document Hub

### What it is
Internal knowledge base inside izhubs. Think lightweight Notion page inside the ERP.

### Use cases
- Company SOPs (quy trình nội bộ)
- Contract templates
- Refund / warranty policies
- Employee onboarding docs
- Product pricing sheets

### Data Model
```sql
-- Migration 007
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id),
  created_by      UUID REFERENCES users(id),
  title           TEXT NOT NULL,
  body            TEXT,           -- Markdown content
  body_plain      TEXT,           -- Stripped text (for search + AI embedding)
  category        TEXT,           -- 'policy', 'template', 'sop', 'product', 'other'
  is_public       BOOLEAN DEFAULT false,  -- Visible to all staff?
  search_vector   tsvector,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_search ON documents USING gin(search_vector);
```

### Editor
- Markdown-based (MDX or simple rich text → stored as Markdown)
- No complex block editor (v0.3). Simple titles + paragraphs + bullet lists.
- Code blocks, tables supported via Markdown.
- AI: "Improve this document" button → GPT cleans and structures the content.

### Permissions
| Role | Can do |
|------|--------|
| Admin | Create, edit, delete all docs |
| Manager | Create docs in their department |
| Staff | Read only (unless granted write) |

---

## 🤖 Part 3 — Internal AI Chatbot (Knowledge Assistant)

### What it is
An internal AI assistant trained on:
1. **Static knowledge** → Document Hub (policies, SOPs, templates)
2. **Dynamic knowledge** → Live CRM data (contacts, deals, activities)

### Two types of queries it handles

**Type A — Static (Documents)**
> *"What is our refund policy?"*
> *"Show me the sales script template."*
> *"How do I onboard a new client?"*

Mechanism: Full-text search in Document Hub → feed top 3 results to LLM → LLM answers in natural language.

**Type B — Dynamic (Live Data)**
> *"How many deals did we win this month?"*
> *"Show me all contacts from Hanoi with no activity in 30 days."*
> *"What's the average deal size for Q1?"*

Mechanism: LLM generates SQL query → runs on read-only DB connection → returns formatted result.

### Architecture

```
User asks question
      ↓
Intent classifier (static vs dynamic?)
      ↓
  [Static] → search documents (full-text) → LLM answers with context
  [Dynamic] → LLM generates SQL → validated/sandboxed → execute → LLM formats result
      ↓
Answer displayed in chat UI (with source reference for static)
```

### Safety Rules for Dynamic Queries
- LLM-generated SQL runs on **READ-ONLY** database user. No INSERT/UPDATE/DELETE ever.
- Query timeout: 5 seconds max.
- Results capped at 100 rows.
- No joins across more than 3 tables (prevent slow queries).
- Every generated query logged to `ai_query_log` for audit.

### What the chatbot CANNOT do
- Cannot create or modify any data (read-only)
- Cannot answer questions outside the company's data scope
- Cannot access other companies' data (tenant isolation enforced)

---

## Version Plan

| Feature | Version |
|---------|---------|
| Global search `⌘K` (title-based) | v0.2 |
| Document Hub create/read | v0.3 |
| Document search (full-text) | v0.3 |
| AI Chatbot — Static (documents) | v0.3 |
| AI Chatbot — Dynamic (live SQL) | v0.4 |
| Semantic search (Qdrant embeddings) | v0.5+ |

---

## ⚡ Performance Budget (Non-negotiable)

> "ERP phải nhẹ. Nặng quá chạy không nổi là vô nghĩa."

### Bundle Size Limits
| Bundle | Max size (gzipped) |
|--------|-------------------|
| Initial JS (first load) | **< 150kb** |
| Per-page chunk | **< 80kb** |
| Total CSS | **< 30kb** |

Check with: `npm run build` → Next.js shows bundle analysis.  
If any chunk exceeds limit → find and remove/lazy-load the cause before merging.

### Rules for Staying Lightweight
1. **No heavy libraries by default** — Recharts instead of D3. No lodash (use native JS). No moment.js (use `date-fns` or `Intl`).
2. **Lazy-load everything non-critical** — Charts, rich text editor, AI chatbot widget → all `dynamic(() => import(...), { ssr: false })`.
3. **No library for something that's 5 lines of code** — write it yourself.
4. **Audit dependencies monthly** — run `npx depcheck` to find unused packages.
5. **Images: always `next/image`** — auto WebP, lazy, sized correctly.
6. **No Qdrant/ElasticSearch by default** — PostgreSQL full-text search first. Add vector DB only when proven necessary (v0.5+).
7. **AI features are optional** — LLM calls are always async, never block the UI, never on initial page load.
