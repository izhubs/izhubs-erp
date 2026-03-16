---
name: mcp-tool-design
description: Add a new tool to the izhubs ERP MCP server. MCP tools allow AI assistants to query and mutate ERP data with natural language.
---

# Skill: MCP Tool Design

## What is the MCP Server?

The **Model Context Protocol (MCP) server** (`ai/mcp-server/`) exposes izhubs ERP data to AI tools (Claude, Cursor, Antigravity) via structured tools.

Users can ask: *"Show me all open deals above $10k"* and the AI calls the MCP tool — no SQL knowledge needed.

## MCP Tool Structure

```
ai/mcp-server/
  index.ts          ← MCP server entry point
  tools/
    contacts.ts     ← Contact-related tools
    deals.ts        ← Deal-related tools
    your-tool.ts    ← New tool goes here
```

## Step 1: Define the tool in the tools directory

```typescript
// ai/mcp-server/tools/deals.ts
import { z } from 'zod'
import { MCPTool } from '../types'

export const searchDeals: MCPTool = {
  name: 'search_deals',
  description: 'Search and filter deals in the CRM pipeline. Use this when the user asks about deals, opportunities, or sales.',
  inputSchema: z.object({
    stage: z.enum(['lead', 'qualified', 'proposal', 'won', 'lost']).optional()
      .describe('Filter by pipeline stage'),
    minValue: z.number().optional()
      .describe('Minimum deal value in USD'),
    maxValue: z.number().optional()
      .describe('Maximum deal value in USD'),
    ownerId: z.string().uuid().optional()
      .describe('Filter by assigned user ID'),
    limit: z.number().min(1).max(100).default(20)
      .describe('Number of results to return'),
  }),
  handler: async (input, context) => {
    // ALWAYS go through Core API — never import db directly
    const params = new URLSearchParams()
    if (input.stage) params.set('stage', input.stage)
    if (input.minValue) params.set('minValue', String(input.minValue))
    if (input.limit) params.set('limit', String(input.limit))

    const res = await context.api.get(`/api/v1/deals?${params}`)
    if (!res.ok) throw new Error('Failed to fetch deals')

    const { data, meta } = await res.json()
    return {
      deals: data,
      total: meta.total,
      summary: `Found ${meta.total} deals matching your criteria.`
    }
  }
}
```

## Step 2: Register in `index.ts`

```typescript
// ai/mcp-server/index.ts
import { searchDeals } from './tools/deals'
import { createMCPServer } from './server'

const server = createMCPServer({
  name: 'izhubs-erp',
  version: '1.0.0',
  tools: [
    searchDeals,
    // add your tool here
  ]
})

server.start()
```

## Tool Design Principles

### 1. Description is critical — AI uses it to choose tools
```typescript
// ❌ Bad — too vague
description: 'Get deals'

// ✅ Good — explains when AND what
description: 'Search and filter deals in the CRM pipeline. Use this when the user asks about sales opportunities, pipeline stages, deal values, or which deals are won/lost.'
```

### 2. Every parameter needs `.describe()`
```typescript
// ❌ Missing descriptions — AI can't infer
stage: z.enum(['won', 'lost']).optional()

// ✅ Clear descriptions
stage: z.enum(['won', 'lost']).optional()
  .describe('Current stage of the deal in the pipeline. "won" = closed successfully, "lost" = no longer pursuing')
```

### 3. Return human-readable summary alongside data
```typescript
return {
  contacts: data,
  summary: `Found ${data.length} contacts. ${highPriority.length} are high priority.`
}
```

### 4. MCP tools are READ-HEAVY — mutations need confirmation
```typescript
// For write operations, return a confirmation step first
export const moveDealToWon: MCPTool = {
  name: 'close_deal_as_won',
  description: 'Mark a deal as won. Ask user to confirm before calling this tool.',
  // ...
}
```

## Checklist

- [ ] Tool name is `snake_case` and descriptive
- [ ] Description explains WHEN to use the tool (not just what it does)
- [ ] All parameters have `.describe()`
- [ ] Handler calls Core API — never imports `db`
- [ ] Returns both data and human-readable `summary`
- [ ] Write operations include a confirmation mechanism
- [ ] Tool registered in `ai/mcp-server/index.ts`
- [ ] Tested manually with Claude or Antigravity
