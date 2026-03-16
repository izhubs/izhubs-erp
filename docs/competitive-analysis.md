# izhubs ERP — Competitive Analysis (Vertical CRM)

## Updated Positioning (2026-03-16)

**Focus**: Agency & Freelancer CRM with native Airtable/Notion/Sheets import

```
                    ENTERPRISE
                        ↑
           Salesforce ● ● Odoo
                        |
FREE ←──────────────────┼──────────────────── PAID
  ERPNext ●   Frappe ●  |  ● Zoho     ● HubSpot
    SuiteCRM ●          |        ● Pipedrive
                        |
                izhubs ERP ★  ← Vertical CRM for agencies
                        ↓
               Agency / Freelancer / Solo Builder
```

**Migration path we own**: Airtable → izhubs · Notion → izhubs · Google Sheets → izhubs

## Competitor Comparison

| | HubSpot | Pipedrive | Twenty | Notion CRM | izhubs ERP |
|---|---|---|---|---|---|
| Open source | ❌ | ❌ | ✅ AGPL | ❌ | ✅ **MIT** |
| Self-host | ❌ | ❌ | ✅ | ❌ | ✅ |
| Target | Marketing | Sales team | Developer | Knowledge worker | **Agency/Freelancer** |
| Airtable import | Manual CSV | Manual CSV | ❌ | Native | ✅ **AI-mapped** |
| Notion import | ❌ | ❌ | ❌ | N/A | ✅ **v0.2** |
| Vibe coding | ❌ | ❌ | ❌ | ❌ | ✅ **Core feature** |
| Industry templates | ❌ | ❌ | ❌ | Community | ✅ **Monetized** |
| MCP Server | ❌ | ❌ | ❌ | ❌ | ✅ **v0.2** |
| Setup < 5 min | ✅ cloud | ✅ cloud | ✅ | ✅ SaaS | ✅ **Docker** |

## Unique Differentiators (only izhubs)

1. **Native import from Airtable / Notion / Google Sheets** — AI column mapping, zero config
2. **Vertical CRM templates** — pre-configured for Agency, Restaurant, Coworking (not generic)
3. **Vibe coding native** — `.agent/` context layer + MCP Server, built-in day 1
4. **Guardrailed Extension SDK** — community builds without breaking core

## Monetization Moat

| Revenue Source | When | Type |
|---|---|---|
| Agency Starter Pack template | **Now** (Gumroad) | One-time $29 |
| Freelancer OS template | **Now** (Gumroad) | One-time $29 |
| Managed cloud hosting | v0.3 | Recurring $19/mo |
| Marketplace listing fees | v0.5+ | Revenue share |

## ✅ Do

1. Own the "migrate from Airtable/Notion" narrative — publish comparison content
2. Launch on Gumroad before GitHub launch (revenue before fame)
3. Build MCP Server in v0.2 — demo "ask Claude about your deals" on Show HN
4. Focus Agency vertical until $5K MRR, then expand
5. Backward compatible API always — contract tests protect community trust

## ❌ Don't

1. Compete on feature count with Salesforce or HubSpot
2. Go multi-vertical before owning one vertical well
3. Launch managed cloud before having 20 self-hosted users
4. Build Extension Marketplace before having 10 extensions
5. Feature-gate free tier (kills community trust = kills moat)
6. Add accounting, HR, inventory in v0.x (scope creep kills solo projects)
