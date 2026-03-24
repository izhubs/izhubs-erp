# izhubs ERP — MCP Server Setup

Connect any AI tool (Cursor, Claude Desktop, Antigravity, n8n) to your izhubs ERP instance.

## What is MCP?

Model Context Protocol — lets AI tools query your ERP data and take actions using natural language.

**Examples:**
- *"Tìm tất cả deals không có activity trong 30 ngày"*
- *"Tạo task follow-up cho khách hàng Nguyễn Văn A"*
- *"Báo cáo doanh thu tháng này theo từng stage"*

## Setup

### 1. Start the MCP server

```bash
node ai/mcp-server/server.ts
# or via docker compose
docker compose up mcp
```

### 2. Connect in Cursor

Add to `.cursor/mcp.json` or global MCP settings:

```json
{
  "mcpServers": {
    "izhubs-erp": {
      "command": "node",
      "args": ["D:/Project/izhubs-erp/ai/mcp-server/server.ts"],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_DB": "izhubs_erp"
      }
    }
  }
}
```

### 3. Connect in Antigravity

Add to `C:\Users\{user}\.gemini\antigravity\mcp_config.json`:

```json
{
  "mcpServers": {
    "izhubs-erp": {
      "command": "node",
      "args": ["D:/Project/izhubs-erp/ai/mcp-server/server.ts"]
    }
  }
}
```

### 4. Connect in Claude Desktop

Add to Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "izhubs-erp": {
      "command": "node",
      "args": ["D:/Project/izhubs-erp/ai/mcp-server/server.ts"]
    }
  }
}
```

## Available Tools (when MCP server is running)

| Tool | Description |
|------|-------------|
| `query_contacts` | Search and filter contacts |
| `query_deals` | Search deals by stage, owner, value |
| `create_activity` | Create a task, call, or meeting |
| `run_report` | Generate metrics report |

## Self-hosting

MCP server runs as part of docker-compose. No extra setup needed in production.
