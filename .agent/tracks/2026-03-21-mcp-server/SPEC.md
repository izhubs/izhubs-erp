# Track: izhubs MCP Server

## Overview

Build a standalone **stdio MCP server** (`izhubs-mcp-server`) that lets Claude Desktop / Cursor / any MCP-compatible client query and manage izhubs ERP data using natural language.

**Stack:** TypeScript · `@modelcontextprotocol/sdk` · Zod · `pg` (direct Postgres)  
**Transport:** stdio (local) — no HTTP, no auth server needed; connected via Claude Desktop config  
**Repo location:** `D:\Project\izhubs-mcp-server\` (separate package, not inside izhubs-erp)

---

## Goals

1. Natural language access to ERP data — "Show me deals closing this month"
2. Read-only tools for safe exploration (no accidental mutations)
3. Write tools with confirmation hints for creates/updates
4. Works with Claude Desktop + Cursor MCP plugin out of the box

---

## Architecture

```
Claude Desktop / Cursor
        │ stdio
        ▼
izhubs-mcp-server (Node process)
        │ pg client (direct DB)
        ▼
PostgreSQL (izhubs ERP DB)
```

Auth: `DATABASE_URL` env var — the MCP server uses the same Postgres connection string as izhubs-erp. No JWT needed since it runs locally as the developer.

---

## Project Structure

```
izhubs-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # Main: McpServer + StdioTransport
│   ├── db.ts             # pg Pool singleton
│   ├── constants.ts      # CHARACTER_LIMIT = 25000
│   ├── types.ts          # Shared TS interfaces
│   ├── tools/
│   │   ├── contacts.ts   # 4 tools
│   │   ├── deals.ts      # 4 tools
│   │   ├── activities.ts # 3 tools
│   │   ├── search.ts     # 1 tool (global search)
│   │   ├── notes.ts      # 2 tools
│   │   └── pipeline.ts   # 2 tools (analytics/summary)
│   └── utils/
│       ├── format.ts     # Markdown + JSON formatters
│       ├── paginate.ts   # Shared pagination helper
│       └── errors.ts     # handleDbError()
└── dist/
```

---

## Tool Inventory (10 tools — all read-only)

### Contacts (2 tools)

| Tool | Description |
|------|-------------|
| `izerp_list_contacts` | List contacts with filter (status, search) + pagination |
| `izerp_get_contact` | Get full contact details by ID |

### Deals (2 tools)

| Tool | Description |
|------|-------------|
| `izerp_list_deals` | List deals by stage/date range + pagination |
| `izerp_get_deal` | Get full deal details + linked contact |

### Activities & Notes (3 tools)

| Tool | Description |
|------|-------------|
| `izerp_list_activities` | List activities (filter by type, contactId, dealId, due date) |
| `izerp_list_notes` | List notes for a contact or deal |
| `izerp_get_activity` | Get single activity detail |

### Pipeline Analytics (2 tools)

| Tool | Description |
|------|-------------|
| `izerp_pipeline_summary` | MRR, churn rate, deal count by stage breakdown |
| `izerp_sales_leaderboard` | Top deals & activities by owner this month |

### Global Search (1 tool)

| Tool | Description |
|------|-------------|
| `izerp_search` | Full-text search across contacts + deals + companies |

> **All tools:** `readOnlyHint: true`, `destructiveHint: false`

---

## Input/Output Design

### Pagination (all list tools)
```typescript
{ limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0) }
```
Response: `{ total, count, offset, has_more, next_offset, items[] }`

### Response Format
All tools support `response_format: 'markdown' | 'json'` (default: `markdown`).

### Character Limit
`CHARACTER_LIMIT = 25000` — large responses truncated with `truncation_message`.

---

## Environment / Claude Desktop Config

```json
{
  "mcpServers": {
    "izhubs": {
      "command": "node",
      "args": ["D:/Project/izhubs-mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

---

## Acceptance Criteria

- [ ] `npm run build` compiles with 0 TypeScript errors
- [ ] All 10 tools validated with `npx @modelcontextprotocol/inspector`
- [ ] `izerp_list_contacts limit=5` returns correct pagination + `has_more`
- [ ] `izerp_pipeline_summary` matches izhubs dashboard KPI numbers
- [ ] `izerp_search query="ABC"` returns contacts + deals containing "ABC"
- [ ] Claude Desktop: "Show me all deals closing this month" works
- [ ] Claude Desktop: "Who are the top 5 contacts with most activities?" works
- [ ] No DATABASE_URL → clear error message on startup
- [ ] All tools marked `readOnlyHint: true`, `destructiveHint: false`

---

## Phased Implementation

### Phase 1 — Scaffold + DB + List tools
- Set up project, `db.ts`, `constants.ts`, `utils/`
- Implement `izerp_list_contacts` + `izerp_list_deals`
- Test with MCP Inspector

### Phase 2 — Detail + Analytics + Search
- Add `izerp_get_contact`, `izerp_get_deal`, `izerp_get_activity`
- Add `izerp_list_activities`, `izerp_list_notes`
- Add `izerp_pipeline_summary`, `izerp_sales_leaderboard`, `izerp_search`
- Final validation with MCP Inspector

### Phase 3 — Polish
- README with Claude Desktop config snippet
- Evaluation XML (10 Q&A pairs per mcp-builder spec)
- Update track STATUS.md
