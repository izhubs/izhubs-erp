# Track: izhubs Website
**Created**: 2026-03-16
**Status**: planning
**Priority**: medium — needed before community launch, not before kanban

## Summary
Build `erp.izhubs.com` — website riêng cho izhubs, không phải app. Bao gồm landing page (marketing), docs (self-host + module dev + API), và changelog. Là "full story" — GitHub README chỉ là teaser. Deploy trên Coolify với infra đã có.

## Dependency
**Blocked by:** `pipeline-kanban` Phase 2 done (cần screenshots/GIF thật để đưa vào landing).  
**Blocks:** `community-launch` track (cần website sống trước khi post Show HN).

---

## Acceptance Criteria

### Landing Page (`erp.izhubs.com`)
- [ ] Hero: tagline + GIF demo + CTA "Try demo" → `erp-demo.izhubs.com`
- [ ] "Why izhubs" — 3 pain points, không feature list
- [ ] Architecture visual — 4-tier diagram đơn giản
- [ ] "Self-host in 5 min" section với Docker command
- [ ] Feature highlights v0.1 (kanban, notes, PWA...)
- [ ] Roadmap section (honest — v0.1 done, v0.2 next, v0.3 future)
- [ ] Footer: GitHub, Docs, License (MIT), Changelog
- [ ] Mobile responsive
- [ ] Dark mode (match app theme)

### Docs (`erp.izhubs.com/docs`)
- [ ] Getting started: Prerequisites + Docker install + first login
- [ ] Self-host guide: docker compose, env vars, database setup
- [ ] Architecture overview: 4-tier system, what's core vs module
- [ ] How to build a module (developer docs) — v0.2 timeline
- [ ] API reference: `/api/v1/` endpoints — auto-generate từ code nếu có thể
- [ ] FAQ: "Can I use this for X?", "Is this production ready?", "How to update?"

### Changelog (`erp.izhubs.com/changelog`)
- [ ] v0.1.0 — first public release
- [ ] Format: Keep a Changelog standard
- [ ] Link từ GitHub releases

---

## Technical Plan

### Tech Choice: Astro + Starlight
**Tại sao Astro + Starlight:**
- **File-based nav** — thêm `docs/feature.md` là tự xuất hiện trong sidebar, zero config
- **Static build** — deploy trên Coolify không cần Node server, fast, zero maintenance
- **Search + dark mode** built-in — không cần plugin
- **Auto-sync CHANGELOG** — script copy `CHANGELOG.md` từ app repo vào `src/content/changelog.md` khi deploy
- **MDX** — docs có thể có code blocks, diagrams, components

### Repo Structure
```
izhubs-website/
  src/
    pages/
      index.astro          ← Landing page
    content/
      docs/
        getting-started.md
        self-host.md
        architecture.md
        building-modules.md  ← v0.2
        api-reference.md     ← v0.2
      changelog.md           ← auto-sync từ app repo
  public/
    demo.gif               ← kanban demo
    screenshots/
  astro.config.mjs
  package.json
```

### Auto-Sync CHANGELOG
Coolify deploy hook → script chạy `sync-changelog.sh`:
```bash
# sync-changelog.sh (runs on deploy)
curl -s https://raw.githubusercontent.com/izhubs/izhubs-erp/main/CHANGELOG.md \
  > src/content/changelog.md
```
Kết quả: mỗi lần push lên app repo + trigger website redeploy → changelog tự cập nhật.

### Deploy
- Coolify: new service từ `izhubs-website` repo, `npm run build` → `dist/`
- Domain: `erp.izhubs.com` → Coolify static serve
- Auto-deploy on push to `main`

---

## Content Architecture

```
erp.izhubs.com/
  /                     ← Landing page
  /docs                 ← Docs index
  /docs/getting-started ← Install guide
  /docs/self-host       ← Production deployment  
  /docs/architecture    ← 4-tier system explained
  /docs/modules         ← How to build a module (v0.2)
  /docs/api             ← API reference
  /changelog            ← Version history
```

---

## Out of Scope
- Blog / articles — v0.2 sau launch
- Community forum — v0.3 (Discourse hoặc GitHub Discussions)
- Marketplace listing — v0.4
- i18n (Vietnamese + English) — v0.2 sau launch
- Pricing page — khi có pricing model

## Locked Decisions
| Decision | Value |
|----------|-------|
| **Repo** | Separate — `github.com/izhubs/izhubs-website` |
| **Framework** | Astro + Starlight |
| **Language** | English |
| **Changelog** | Auto-sync from app repo via deploy hook |
