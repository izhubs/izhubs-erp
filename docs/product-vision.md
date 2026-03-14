# Product Vision — izhubs ERP

> "ERP phải theo doanh nghiệp, không phải ngược lại."

---

## The Core Design Principle

> **"Simple UX for users = More data for the business."**

If data entry is hard, users skip it. If users skip it, the database is empty. If the database is empty, the ERP is useless. Every feature must be evaluated against this principle: *can a non-technical user do this in under 10 seconds?*

---

## Why Millions of Businesses Are Stuck

| Problem | Why it's stuck | izhubs answer |
|---------|---------------|---------------|
| **Excel trap** | Too familiar, too hard to migrate from | Zero-pain import (Gate 3) |
| **Low adoption** | Tools too complex, staff won't use it | Beautiful UI, PWA, AI-guided |
| **Data silos** | Zalo, Shopify, email all separate | Sync connectors (Gate 1) |
| **Vendor lock-in** | Can't leave Salesforce cleanly | MIT + standard PostgreSQL |
| **Cost at scale** | $100/user/month is painful | Self-host free |

---

## 6 Unsolved Gaps in the ERP Market

### 🥇 Priority 1 — Sales Forecasting AI (v0.5)
Current ERPs are reactive (show what happened). izhubs will be proactive.
Think like a financial analyst: *"You need 3 more deals to hit your 100M target this month"*, *"This deal has a 60% win probability based on similar historical deals"*, *"Your top sales rep is underperforming vs last quarter — here's why."*

Not just dashboard. **A co-pilot that tells you what to do next.**

### 🥈 Priority 2 — Institutional Memory Made Simple (v0.2)
When a salesperson leaves, their customer knowledge leaves with them.
The fix is NOT a complex Notes module. It's friction-free capture:
- One text field. Always visible. Auto-saved.
- Voice-to-text note on mobile.
- Quick-tag: `#important`, `#follow-up`, `#discount-ok`

**Simple for the user = rich context for the business.**
PWA offline mode makes this work even without internet (on the road, in a warehouse).

### 📱 Priority 3 — PWA First (v0.1+)
PWA is the enabler of Priority 2. The CRM app must work on a phone, in the field, offline.  
Every tap on mobile must be purposeful. No desktop-first design ported to mobile.

### 📋 Priority 4 — Data Freshness Score (Community, v0.3+)
Every contact gets a health score: *(last activity + field completeness + verified fields)*.  
*"8,234 contacts — only 3,100 are healthy. Here are the stale ones to review."*

### ⚙️ Priority 5 — No-Code Automation Builder (Community, v0.3+)
Trigger → Condition → Action. Visual. Inside izhubs. No Zapier needed.  
*"When deal moves to Won → create invoice → send email → create task for accounting."*

### 💬 Priority 6 — Conversational Data Entry (Research, v0.4+)
Type or say in Zalo/Telegram: *"Met John at coffee, new lead, 200M deal, follow-up Friday."*  
AI creates contact, deal, activity, and reminder. No form filling.

---

## Design Principles (Non-negotiable)

1. **Mobile-first, PWA always** — every feature must work on a phone.
2. **10-second rule** — if a common action takes > 10 seconds, redesign it.
3. **Beautiful by default** — premium feel from first login. First impression determines retention.
4. **Data never dies** — export anytime, standard formats, no lock-in.
5. **AI assists, human decides** — AI suggests next steps, never auto-executes.
6. **Simple UX = more data** — reduce friction at every data entry point.

---

## What izhubs is NOT

- Not a competitor to Salesforce on feature count.
- Not an accounting software.
- Not a project management tool.
- Not trying to be everything.

**izhubs is the CRM/ERP for business owners who want AI to help them grow — without needing an IT team.**
