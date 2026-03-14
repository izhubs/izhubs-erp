# izhubs ERP

**Open-source, AI-extensible business management that adapts to your business — not the other way around.**

Built by [izhubs.com](https://izhubs.com)

---

## What is this?

izhubs ERP is a self-hostable business management platform for SMBs and solo builders who want full control over how they run their business — without being forced into someone else's opinionated system.

You customize it using no-code UI, or with AI tools like Cursor, Antigravity, or Claude — you don't need to know how to code deeply.

## Quick Start

```bash
# 1. Clone
git clone https://github.com/izhubs/erp.git
cd izhubs-erp

# 2. Setup env
cp .env.example .env.local

# 3. Start
docker compose up -d

# 4. Open
open http://localhost:3000
```

## For AI Tools (Cursor / Antigravity / Claude)

Read `.agent/AGENTS.md` first — it contains everything an AI needs to understand and extend this system correctly.

```
.agent/
├── AGENTS.md       ← Start here
├── memory.md       ← Current project state
├── skills/         ← How to do things correctly
└── workflows/      ← Step-by-step procedures
```

## Architecture

```
Core Engine  →  Modules  →  Extensions
(immutable)     (business    (user plugins,
                 logic)       guardrailed)
```

## License

MIT — Core is free forever. See [izhubs.com](https://izhubs.com) for cloud hosting.
