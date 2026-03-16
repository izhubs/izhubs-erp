# Track: Community Launch
**Created**: 2026-03-16
**Status**: planning
**Priority**: high — parallel with pipeline-kanban

## Locked Decisions
| Decision | Value |
|----------|-------|
| **Tagline** | "The open-source business platform for vibe entrepreneurs." |
| **Demo URL** | `erp-demo.izhubs.com` — live demo instance with sample data, no login required |
| **Website URL** | `erp.izhubs.com` — full website: landing page + docs + changelog (track: `izhubs-website`) |
| **GitHub** | Primary discovery channel — README is the teaser, website is the full story |

## Summary
Chuẩn bị tất cả assets, content, và sequence cần thiết để launch izhubs lên cộng đồng open source (GitHub, Show HN, Indie Hackers, r/selfhosted). Không phải digital marketing — đây là **developer marketing**: product tốt + story thật + timing đúng. Mục tiêu: 200+ GitHub stars trong tháng đầu, first 5 self-hosters không cần support từ bạn.

## Dependency
**Blocked by:** `pipeline-kanban` Phase 2 (UI) và `demo-mode` track phải done trước khi launch.  
**Parallel với:** `demo-mode` track (cả hai cùng prepare trong khi kanban đang code).

---

## Acceptance Criteria

### Product Prerequisites (blockers cứng)
- [ ] Kanban pipeline functional trên desktop + mobile
- [ ] Demo mode với sample data — không màn hình trống khi first visit
- [ ] `docker compose up` → app chạy trong < 2 phút, zero manual steps
- [ ] `npm run typecheck` + `npm run test:contracts` xanh

### Assets
- [ ] GIF demo 15–30 giây: từ login → thấy pipeline kanban → drag 1 deal
- [ ] Screenshot light mode (kanban)
- [ ] Screenshot dark mode (kanban)
- [ ] GIF/screenshot mobile PWA (add to home screen)

### Content
- [ ] README rewrite (format: sales page — xem Technical Plan)
- [ ] Show HN post draft (title + first comment)
- [ ] `CONTRIBUTING.md` — how to build a module, how to add a template
- [ ] `docs/self-host.md` — step-by-step timed guide (< 5 phút target)
- [ ] GitHub release `v0.1.0` với CHANGELOG.md đầy đủ

### Launch Sequence
- [ ] Post GitHub release v0.1.0
- [ ] Submit Show HN (thứ 3, 9–11am PST)
- [ ] Cross-post: Indie Hackers, r/selfhosted, Startup Vietnam Facebook group
- [ ] Engage mọi comment trong 2h đầu sau Show HN post

---

## Technical Plan

### Phase 1 — Demo Assets (cần tool hỗ trợ)
**GIF capture:** Chạy app với demo data, dùng LICEcap (Windows) hoặc ScreenToGif để record.  
**Quality bar:** 600px wide, no cursor jitter, no loading spinners visible, smooth drag-and-drop.  
**What to show:** Login with demo account → pipeline kanban → drag deal từ "contacted" → "qualified" → hover thấy deal value. Total 20 giây.

### Phase 2 — README Rewrite
**Format (top to bottom):**
```
[Logo + tagline 1 dòng]
[GIF demo — above the fold]
[Badges: MIT | TypeScript | PostgreSQL | CI passing]
[Docker one-liner: docker compose up]

## Why izhubs
[3 bullet — pain points, không phải features]
[Comparison: Excel vs izhubs — 1 ảnh hoặc table]

## What's inside
[Architecture diagram đơn giản — 4-tier visual]
[Feature list ngắn — v0.1]

## Self-host in 5 minutes
[Prerequisites + 4 commands + screenshot]

## Roadmap
[3 milestones — honest, no hype]

## Contributing
[Link to CONTRIBUTING.md — "how to build a module"]

## License
[MIT]
```

**Tagline options** (cần chọn 1):
- "WordPress for business operations — self-host, extend, own your data."
- "The open-source business platform for vibe entrepreneurs."
- "Manage your business like a developer manages code."

### Phase 3 — Show HN Post
**Title formula:** `Show HN: izhubs – [what it is in < 10 words]`

**Candidates:**
- "Show HN: izhubs – open-source, self-hosted business platform (like WordPress but for ops)"
- "Show HN: izhubs – MIT CRM/ERP that you extend with modules, not lock into"

**First comment structure (bạn tự post ngay sau khi submit):**
```
Hey HN — I built izhubs because I kept hitting the same wall:
- Salesforce: too expensive and needs a consultant
- Notion/Airtable: outgrow quickly when you have 500+ contacts  
- Excel: works until it doesn't

izhubs is "WordPress for business" — tiny core, extend with modules,
self-host with one Docker command. MIT license.

What's working now: [v0.1 features]
What's next: [v0.2 honest roadmap]
Would love feedback on [specific thing you want feedback on]
```

### Phase 4 — Cross-Post Sequence
| Platform | What to post | When |
|---------|-------------|------|
| GitHub Release | v0.1.0 tag + CHANGELOG | Day 0 |
| Show HN | Main launch post | Day 1 (Tuesday 9am PST) |
| Indie Hackers | "I just launched..." post | Day 2 |
| r/selfhosted | Focus on Docker self-host angle | Day 3 |
| r/opensource | Focus on MIT + extension angle | Day 3 |
| Startup Vietnam FB | Tiếng Việt, focus on SME angle | Day 4 |
| Twitter/X | Thread: "Why I built this" | Day 4 |

---

## Out of Scope
- Paid advertising — zero budget community launch only
- SEO / content marketing — v0.2+ when there's content to market
- Product Hunt launch — separate track sau Show HN (timing khác)
- Vietnamese-specific communities ngoài Startup Vietnam — v0.2 after product is more polished

---

## Open Questions
- [ ] `erp-demo.izhubs.com` — deploy trên Coolify (infra đã có sẵn từ session 2)
- [ ] `erp.izhubs.com` — landing page hay redirect về GitHub? Quyết định sau khi kanban xong
- [ ] Build in public — optional, để sau khi có GIF demo tốt
