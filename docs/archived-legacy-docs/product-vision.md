# Product Vision — izhubs ERP

> "ERP phải theo doanh nghiệp, không phải ngược lại."

---

## The Core Design Principle

> **"Simple UX for users = More data for the business."**

If data entry is hard, users skip it. If users skip it, the database is empty. If the database is empty, the ERP is useless. Every feature must pass this test: *can a non-technical user do this in under 10 seconds?*

---

## Strategic Pivot (2026-03-16): Vertical-First

**Old direction**: Horizontal ERP for all industries  
**New direction**: Vertical CRM for **Agencies & Freelancers** first → expand to other verticals after $ARR

### Why Agency vertical first?
- Highest overlap with our target persona (vibe business owner = runs an agency or freelances)  
- Richest custom field needs → strongest AI-extensibility use case  
- Most likely to pay for templates + upgrade to managed cloud  
- Clear migration path: always on Airtable/Notion/Google Sheets → outgrown → izhubs

---

## Native Import: Airtable · Notion · Google Sheets

**This is not an optional feature. It IS the go-to-market.**

The persona is currently running their business on one of these 3 tools. The switching cost must be near-zero.

| Source | What they store there | izhubs maps to |
|---|---|---|
| **Airtable** | Client list, deals, project tracker | Contacts + Deals + custom fields |
| **Notion** | CRM table, task board | Contacts + Activities |
| **Google Sheets** | Client spreadsheet, revenue tracker | Contacts + Deals + Companies |

### Import flow (v0.2 priority)
```
Upload file / Paste URL → AI maps columns → Preview + confirm → Import
                                  ↑
                    "Name" → name, "Email" → email, 
                    unknown columns → custom_fields (JSONB)
```

The AI column mapper is the **product moment** — user sees their data organized for the first time.

---

## Monetization Path (Start Now)

### Phase 1 — Templates on Gumroad (v0.1)
- **Agency Starter Pack**: Pipeline + custom fields + sample data — **$29**
- **Restaurant F&B Pack**: Reservation + table tracking — **$29**
- **Freelancer OS**: Client tracker + invoice reminder — **$29**

No marketplace needed. No code. Ship in 1 week on Gumroad.

### Phase 2 — Managed Cloud (v0.2)
- **$19/month** — hosted, backups, updates
- Target: users who installed self-host, liked it, don't want to manage server

### Phase 3 — Marketplace Listings (v0.5+)
- Community templates, extensions — revenue share

---

## Simplified Roadmap

```
NOW     → v0.1 DONE: Demo seed + Show HN + Gumroad templates
1 month → v0.2: Airtable/Notion/Sheets import + MCP Server + Agency vertical polish
3 month → v0.3: Managed cloud + tenant_id → first paid users
6 month → v0.4: Automation rules + 2nd vertical
```

---

## Design Principles (Non-negotiable)

1. **Mobile-first, PWA always** — every feature must work on a phone.
2. **10-second rule** — if a common action takes > 10 seconds, redesign it.
3. **Beautiful by default** — premium feel from first login.
4. **Data never dies** — export anytime, standard formats, no lock-in.
5. **AI assists, human decides** — AI suggests, never auto-executes.
6. **Simple UX = more data** — reduce friction at every data entry point.
7. **Ship > Perfect** — working beats polished. Ship, learn, iterate.

---

## What izhubs is NOT

- Not a competitor to Salesforce on feature count.
- Not an accounting software.
- Not trying to cover all industries at once.
- Not a no-code tool (users can code via AI).

**izhubs is the CRM for agencies and freelancers who migrated from Airtable/Notion/Sheets and want AI to help them grow — without needing an IT team.**
