---
description: Branching strategy and deployment workflow for Coolify
---

# Git Workflow — izhubs ERP

This workflow defines how code moves from development to production via Coolify.

## Branch Structure

| Branch | Purpose |
|---|---|
| `master` | Stable code, source of truth for all new features. This is where AI agents work. |
| `production` | Deployment branch for Coolify. Triggers automatic builds. |
| `feature/*` | (Optional) Used for large, multi-day experimental features before merging to `master`. |

*(Note: AI vibe-coding using `@feature-cycle` typically happens directly on `master` for speed, unless specified otherwise by the user).*

## The Deployment Flow (Coolify)

```text
master (dev) ──────> feature is built, tested, and committed
         │
         └───────> git checkout production
                   git merge master
                   git push origin production  (Coolify auto-deploys)
```

### 1. Daily AI Development
Use `@feature-cycle` and `@commit-push`. These tools will automatically commit to the current branch (usually `master`).

### 2. Deploying to Production (Coolify)
When the user says "Deploy to production" or "Push to prod":

1. Ensure working tree is clean.
2. Checkout production branch: `git checkout production` (Create it if it doesn't exist: `git checkout -b production`)
3. Merge master: `git merge master`
4. Push to trigger Coolify: `git push origin production`
5. Return to master: `git checkout master`

### 3. Commit Message Convention
AI agents must follow this convention (enforced by `@commit-push`):

- `feat(scope):` new feature
- `fix(scope):` bug fix
- `chore(scope):` config, dependencies, structure, ops
- `docs(scope):` documentation updates

## ⚠️ Critical Rules
- **NEVER commit directly to `production`** — always merge from `master`.
- **NEVER commit secrets** (`.env`, credentials) to Git.
- Coolify listens to the `production` branch. Pushing to `master` does NOT deploy.
