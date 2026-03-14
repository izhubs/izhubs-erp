# izhubs ERP vs 10 CRM/ERP trên thị trường

## Positioning

```
                    ENTERPRISE
                        ↑
           Salesforce ● ● Odoo
                        |
FREE ←──────────────────┼──────────────────── PAID
  ERPNext ●   Frappe ●  |  ● Zoho     ● HubSpot
    SuiteCRM ●          |        ● Pipedrive
                        |
                izhubs ERP ★
                        ↓
                SMB / Solo Builder / Business Owner
```

**Target**: Business owner dùng AI (Cursor, Antigravity, Claude) để setup và extend — không cần IT team.

## So sánh nhanh

| | HubSpot | Salesforce | Odoo | ERPNext | Twenty | izhubs ERP |
|---|---|---|---|---|---|---|
| Open source | ❌ | ❌ | ✅ Community | ✅ MIT | ✅ AGPL | ✅ **MIT** |
| Self-host | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Target | Marketing | Enterprise | Dev/IT | Dev/IT | Developer | **Business owner** |
| Industry templates | ❌ | ❌ | Limited | ❌ | ❌ | ✅ **+ Sub + AI niche** |
| Vibe coding | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Core feature** |
| Beautiful UI | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (target) |
| Setup < 5 min | ✅ (cloud) | ❌ | ❌ | ❌ | ✅ | ✅ **Docker** |

## Unique differentiators (chỉ izhubs có)

1. **Industry Templates + Sub-templates + AI niche generation**
2. **Vibe coding native** — `.agent/` context layer built-in từ ngày đầu
3. **Guardrailed Extension SDK** — community build mà không break core
4. **MCP Server** — mọi AI tool đều tích hợp được

## ✅ Nên làm

1. MIT Core thật sự mạnh (không cắt xén)
2. Beautiful UI từ ngày đầu
3. Setup < 5 phút bằng Docker
4. Guardrailed Extension SDK
5. CONTRIBUTING guides rõ ràng
6. MCP Server từ sớm
7. Backward compatible API (contract tests)
8. Build in public — community trust sớm hơn

## ❌ Nên tránh

1. Cạnh tranh feature với Salesforce (sai target)
2. Cắt free tier → mất community
3. UI phức tạp cho non-dev
4. Plugin đụng DB trực tiếp (WordPress security nightmare)
5. Break Core API không version
6. Quá nhiều modules cùng lúc (Odoo effect)
7. Hardcode business logic vào core
8. Thiếu test cho core → một PR xấu phá cả ecosystem
9. Lock vào một AI provider
10. Feature-gating để monetize sớm
