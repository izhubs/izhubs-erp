# Multi-Role Perspective — Who Sees What in izhubs ERP

> An ERP/CRM is not one product. It's 4-5 different products sharing one database.  
> Each role has a different job, a different fear, and a different definition of "useful."

---

## The 5 Roles That Matter

```
┌─────────────────────────────────────────────────────────┐
│                    BUSINESS OWNER                       │
│             "Is the business growing?"                  │
├─────────────┬───────────────────────────────────────────┤
│   MANAGER   │          OPERATIONS LEAD                  │
│  "Is my     │     "Is everything running?"              │
│  team       ├───────────────────────────────────────────┤
│  performing?"│                                          │
├─────────────┤       DATA ENTRY STAFF                    │
│             │  "Let me log this fast and move on"       │
│             └───────────────────────────────────────────┤
│                    CUSTOMER / CLIENT                    │
│         (sees nothing directly — but feels everything)  │
└─────────────────────────────────────────────────────────┘
```

---

## Role 1: Business Owner (CEO / Founder)

### Their reality
- Works 12+ hours a day
- Switches contexts 40 times per day
- Doesn't log into ERP to enter data — they log in to make decisions
- Time in the system: **5-10 minutes per day, maximum**

### Their core question
> *"Is the business growing? Where are we leaking? What needs my attention right now?"*

### What they need to see

| View | Why |
|---|---|
| **Revenue forecast** | "Will we hit target this month?" |
| **Pipeline by stage** | Where are deals stuck? |
| **Top clients by value** | Who to protect at all costs |
| **Win/Loss rate trend** | Are we getting better or worse? |
| **Team activity summary** | Who's working, who's coasting |
| **Alerts / anomalies** | Deal stalled 30 days, key contact gone cold |

### What they hate
- Logging in to find a blank dashboard
- Needing to click 5 levels deep to find one number
- Information that requires interpretation — they want conclusions

### Design principle for this role
> **"The answer, not the data."**  
One screen. 3-5 numbers. 1-2 alerts. Done.

---

## Role 2: Sales Manager / Team Lead

### Their reality
- Accountable for team quota
- Needs to coach, not just monitor
- Spends time in 1:1s reviewing pipeline health
- Time in the system: **30-60 minutes per day**

### Their core question
> *"Which deals need my help? Who on my team is struggling? Where should I focus today?"*

### What they need to see

| View | Why |
|---|---|
| **Team pipeline board** | All deals, by owner, by stage |
| **Deals with no activity > X days** | Stalled deals = lost deals |
| **Next steps on every deal** | "What's the plan?" |
| **Conversion rate by stage** | Where do we consistently lose? |
| **Activity log per rep** | Calls made, emails sent, meetings booked |
| **Deals at risk** | High value + no movement + close date approaching |

### What they hate
- Not knowing why a deal was lost
- Team members updating stages without notes
- Having to ask reps manually for pipeline status

### Design principle for this role
> **"Visibility without micromanagement."**  
They need context, not surveillance. Show patterns, not ticks.

---

## Role 3: Sales Rep / Account Manager

### Their reality
- On the phone or in the field most of the day
- Data entry is a cost, not a benefit (to them)
- Uses CRM because they have to, not because they want to
- Time in the system: **2-5 minutes per interaction, throughout the day**

### Their core question
> *"What do I need to do today? Who do I call? What did I last say to this client?"*

### What they need to see

| View | Why |
|---|---|
| **My tasks for today** | Clear to-do list |
| **My contacts with follow-up due** | No client falls through the cracks |
| **Contact history in one tap** | Before a call: "what did we last discuss?" |
| **Quick log: call / email / note** | Friction must be near-zero |
| **My deals and their stage** | Quick status check |
| **Mobile first, always** | They're rarely at a desk |

### What they hate
- Forms with 20 required fields to log a 2-minute call
- Slow load times on mobile
- Losing data because they lost signal in the field
- Being asked to re-enter things they already said in a Zalo message

### Design principle for this role
> **"One tap to log. Zero taps to find."**  
If they have to think about the app, the app is wrong.

---

## Role 4: Operations / Admin Staff

### Their reality
- High volume, repetitive data entry
- Responsible for data accuracy and completeness
- Manages the system, not just uses it
- Time in the system: **3-6 hours per day**

### Their core question
> *"Is the data clean? Are all records complete? What's pending action?"*

### What they need to see

| View | Why |
|---|---|
| **Incomplete records** | Contacts missing email, deals missing value |
| **Import queue / status** | Airtable/Sheets import progress |
| **Bulk edit tools** | Update 50 records at once |
| **Audit log** | "Who changed this? When?" |
| **Custom field completeness** | Are required fields actually filled? |
| **Duplicate detection** | Same client entered twice = bad data |

### What they hate
- Not being able to bulk update records
- Having to scroll through 500 contacts to find incomplete ones
- No way to see what changed and who changed it
- Importing data that breaks because of format mismatch

### Design principle for this role
> **"Power tools with safety rails."**  
Give them bulk actions, filters, and audit trails — but prevent destructive accidents.

---

## Role 5: Warehouse / Inventory Manager *(Future — v0.4+)*

> *Note: izhubs v0.1-v0.3 is CRM-first. Inventory is roadmap only.*

### Their core question
> *"What stock do we have? What's pending dispatch? What's running low?"*

### What they'll need
- Stock levels by SKU
- Incoming vs. outgoing orders
- Low stock alerts
- Linked to deals (deal won → trigger fulfillment)

---

## How This Maps to izhubs ERP Design

| Role | Primary Interface | Key Design Rule |
|---|---|---|
| Business Owner | Dashboard (KPI + alerts) | 1 screen, 5 numbers, conclusions not data |
| Manager | Team pipeline + activity view | Pattern visibility, no micromanagement |
| Sales Rep | My tasks + contact detail (mobile) | One tap log, zero taps find |
| Operations | Table view + bulk tools + import | Power tools with safety rails |
| Warehouse | Inventory module (v0.4+) | Linked to deal pipeline |

---

## The Shared Failure Mode

Every ERP project fails the same way:

> **It was designed for the person who bought it, not the person who uses it.**

The CEO approves the budget. The sales rep uses it daily.  
If the sales rep hates it, they stop using it.  
If they stop using it, the database is empty.  
If the database is empty, the CEO has no data.  
The CEO wonders why they paid for an ERP.

**izhubs principle**: Optimize for the daily user first. Delight the CEO second.  
A sales rep who loves logging = a CEO who loves the dashboard.

---

*Last updated: 2026-03-16 | izhubs ERP v0.1*
