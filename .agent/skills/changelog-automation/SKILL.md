---
name: changelog-automation
description: Automate changelog generation from commits, PRs, and releases following Keep a Changelog format. Use when setting up release workflows, generating release notes, or reviewing what changed since last release.
triggers:
  - generate changelog
  - release notes
  - what changed
  - changelog
  - release
---

# Changelog Automation

## Purpose
Auto-generate a structured `CHANGELOG.md` from git commits following [Keep a Changelog](https://keepachangelog.com) format. Every release should have a readable changelog — humans and AI can both scan it instantly.

## Commit Convention (required)
Must use [Conventional Commits](https://www.conventionalcommits.org):

| Prefix | Changelog section | Example |
|--------|------------------|---------|
| `feat:` | ✨ Added | `feat(deals): add kanban view` |
| `fix:` | 🐛 Fixed | `fix(auth): refresh token expiry bug` |
| `feat!:` or `BREAKING CHANGE:` | 💥 Breaking | `feat!: rename API endpoint` |
| `perf:` | ⚡ Changed | `perf(query): index on tenant_id` |
| `refactor:` | 🔧 Changed | `refactor(engine): extract auth helpers` |
| `docs:` | 📚 Docs | (usually omitted from public changelog) |
| `chore:` | (skip) | (internal, not user-facing) |

## CHANGELOG.md Format

```markdown
# Changelog

All notable changes are documented here.
Format: [Keep a Changelog](https://keepachangelog.com)

## [Unreleased]

### ✨ Added
- feat(deals): kanban board view for pipeline

### 🐛 Fixed
- fix(auth): refresh token expiry calculation

---

## [0.1.0] — 2026-03-16

### ✨ Added
- ...

### 🐛 Fixed
- ...
```

## How to Generate

### Manual (one-off)
Run and parse output:
```bash
git log --oneline --pretty=format:"%h %s" [last-tag]..HEAD
```

Then categorize commits by prefix and write to CHANGELOG.md under `## [Unreleased]`.

### At Release Time
1. Review `## [Unreleased]` section
2. Replace `[Unreleased]` with version + date: `## [0.2.0] — 2026-XX-XX`
3. Add new empty `## [Unreleased]` section at top
4. Commit: `chore(release): v0.2.0`
5. Tag: `git tag v0.2.0`

## Integration with /morning-start
During morning startup, run:
```bash
git log --oneline --pretty=format:"%h %s" --since="1 week ago"
```
Summarize recent commits in human-readable form to give AI context on what changed.

## izhubs-erp CHANGELOG location
File: `D:\Project\izhubs-erp\CHANGELOG.md`

## Rules
- Never manually edit old sections — only append
- `## [Unreleased]` is always the top section
- Breaking changes must be prominently documented
- Run before every release tag
