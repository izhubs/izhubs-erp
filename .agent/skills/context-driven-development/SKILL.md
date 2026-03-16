---
name: context-driven-development
description: Manage project context artifacts to ensure AI and humans share the same understanding across sessions. Use when managing project context, onboarding to a session, or ensuring AI has full project understanding.
triggers:
  - context
  - project context
  - memory
  - onboarding
  - catch up
  - what do you know about this project
---

# Context-Driven Development

## The Problem
- **Humans**: remember the big picture but forget details
- **AI**: knows details within context window but loses history between sessions
- **Result**: repeated mistakes, re-explaining, inconsistent decisions

## The Solution: Context Artifacts Layer

Maintain a set of files that capture project truth in a format both humans and AI can read quickly.

## Context Artifact Hierarchy

```
.agent/
  memory.md              ← PRIMARY: AI reads this first every session
  AGENTS.md              ← AI behavior rules and skill index
  tracks/
    STATUS.md            ← All feature tracks at a glance
    [date]-[slug]/
      SPEC.md            ← Feature spec (what + why + how)
  skills/                ← Reusable AI skills
  workflows/             ← Step-by-step procedures
docs/
  product-vision.md      ← Why we're building this
  architecture.md        ← How the system is designed
CHANGELOG.md             ← What changed and when
```

## Context Artifact Rules

### memory.md (session journal)
- Update at the END of every session
- Format: `### Session [n] — [date] (Title)` with bullet list of what was done
- Must include: decisions made, files changed, current status
- Keep it scannable — bullets only, no paragraphs

### SPEC.md (feature track)
- Created BEFORE any code is written (see conductor-new-track)
- Never start a feature without one
- Contains: user stories, acceptance criteria, technical plan

### CHANGELOG.md
- Updated at release time from commit history (see changelog-automation)
- Gives AI instant context on what shipped

## Session Startup Protocol (done by /morning-start)
1. Read `memory.md` → current status, recent decisions
2. Read `tracks/STATUS.md` → active tracks
3. Read `CHANGELOG.md` → last release, recent commits
4. Display summary to user before asking what to do

## Writing Good Context
When updating memory.md, write for "future AI that has never seen this project":
- ✅ "Auth uses jose library, JWT stored in httpOnly cookie, refresh token in `user_tokens` table"
- ❌ "Auth is done"

When writing SPEC.md acceptance criteria:
- ✅ "Admin can filter revenue chart by month/quarter/year using dropdown"
- ❌ "Chart has filters"

## Metrics of Good Context
A session is well-documented if:
- [ ] New AI agent can understand project in < 2 minutes by reading memory.md
- [ ] Each decision has a documented "why"
- [ ] Active features have SPEC.md with acceptance criteria
- [ ] CHANGELOG.md reflects last 2 releases
