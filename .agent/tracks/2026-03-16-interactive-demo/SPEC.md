# Interactive Demo — Personalized "Try Before Signup"

## Overview
Status: Planning
Type: Growth / Activation
Priority: HIGH — This is the primary Sales weapon. Must ship before community launch.

**Goal:** Create a zero-friction demo experience where visitors choose their Industry + Role and instantly see a fully loaded dashboard with relevant sample data and role-specific views — no signup required.

**Why:** HubSpot/Salesforce force users to sign up and see an empty dashboard. izhubs will show value in 60 seconds. This is our competitive advantage for Activation.

## The User Flow

### Screen 1: Industry Selector
> "Bạn đang kinh doanh trong lĩnh vực nào?"

| Option | Seed Script | Sample Data |
|--------|------------|-------------|
| 🏢 Agency / Digital Marketing | `seed:agency` | 20 contacts, 15 deals, agency pipeline |
| 💻 Freelancer / Creator | `seed:freelancer` | 15 contacts, 10 deals, freelancer pipeline |
| ☕ F&B (Nhà hàng / Quán café) | `seed:restaurant` | 15 contacts, 10 deals, F&B pipeline |
| 🏠 Coworking Space | `seed:coworking` | 15 contacts, 10 deals, coworking pipeline |

### Screen 2: Role Perspective
> "Bạn muốn xem góc nhìn của ai?"

| Role | What They See | RBAC Permissions |
|------|--------------|-----------------|
| 👔 CEO / Founder | Revenue dashboard, full pipeline, team KPIs, all deals | `superadmin` — sees everything |
| 📞 Sale / Account Manager | Personal Kanban board, own deals only, follow-up reminders | `member` — sees own data |
| ⚙️ Operations / Admin | Contract list, team activity log, member management | `admin` — sees team data |

### Screen 3: Auto-Login → Personalized Dashboard
- System auto-creates (or reuses) a demo session with `tenant_id = DEMO_[industry]`
- API: `GET /api/demo-login?industry=agency&role=ceo` → Returns JWT token, redirects to dashboard
- No password, no email, no signup form. Instant access.

## Technical Architecture

### Demo Tenant Strategy
- Each industry gets a dedicated demo tenant (e.g., `tenant_id = 1000` for Agency Demo)
- 3 demo user accounts per tenant (CEO, Sale, Ops) with pre-configured RBAC
- Demo tenants are READ-WRITE (users can play freely)

### Auto-Reset (Cron Job)
- Schedule: Every 1 hour (or 24 hours depending on traffic)
- Action: `DELETE FROM * WHERE tenant_id IN (demo tenants)` → Re-run `seed:[industry]`
- Result: Demo always feels fresh and clean for the next visitor

### Security Considerations
- Demo JWT tokens expire after 30 minutes
- Demo accounts cannot: change passwords, delete tenant, access admin settings
- Rate-limit demo-login API to prevent abuse

## Phases

### Phase 1: Core Demo Flow
- [ ] Create demo tenant seeds (extend existing seed scripts with demo-specific tenant_id)
- [ ] Build `/api/demo-login` endpoint (returns JWT, no password required)
- [ ] Create Industry Selector UI (full-screen, beautiful, 4 cards)
- [ ] Create Role Selector UI (3 cards with role descriptions)
- [ ] Auto-redirect to Dashboard after selection

### Phase 2: Role-Specific Dashboards
- [ ] CEO Dashboard: Revenue chart, pipeline overview, team KPIs
- [ ] Sale Dashboard: Personal Kanban, follow-up list, "New Deal" CTA
- [ ] Ops Dashboard: Contract list, activity log, member management

### Phase 3: Auto-Reset & Polish
- [ ] Cron job to reset demo data periodically
- [ ] Add "💡 This is a demo — Sign up to keep your data" banner
- [ ] Track demo usage analytics (which industry/role is most popular)

## Success Metrics
- **Time-to-Value**: < 60 seconds from landing page click to seeing a full dashboard
- **Demo-to-Signup Conversion**: ≥ 15% of demo users create a real account
- **Most Popular Path**: Track which Industry + Role combo is most used → Double down on that vertical
