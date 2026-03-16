---
description: daily startup — understand context and what to do next
---

## Step 1: Load Project Context
// turbo
1. Read `.agent/memory.md` → summarize: current phase, health status, last session summary
// turbo
2. Read `.agent/tracks/STATUS.md` → list all active and planning tracks

## Step 2: Check Recent Changes
// turbo
3. Run: `git log --oneline --pretty=format:"%h %s" --since="3 days ago"` → show recent commits grouped by type (feat/fix/chore)

## Step 3: Verify Health
// turbo
4. Run: `npm run typecheck 2>&1 | head -20` → confirm TypeScript is clean. Report ✅ clean or ❌ errors found.
// turbo
5. Run: `npm run test:contracts 2>&1 | tail -8` → confirm contract tests pass. Report ✅ X/X passed or ❌ failures.

## Step 4: Display Morning Brief
6. Print a **Morning Brief** in this format:
   ```
   ## 🌅 Morning Brief — [date]
   
   **Project**: izhubs ERP | Phase: [from memory.md]
   **Health**: [✅ TypeScript clean | ❌ X errors] | [✅ X/X tests | ❌ failures]
   
   ### 🔥 Active Tracks
   [list from STATUS.md with current phase]
   
   ### 📦 Recent Commits (3 days)
   [grouped by feat/fix/chore]
   
   ### 📋 Up Next (Backlog)
   [top 3 from memory.md backlog]
   ```

## Step 5: Agent Briefing (nếu có agent khác đang làm)
7. Nếu có track `in-progress` đang được agent khác thực hiện, generate briefing ngắn cho agent đó:
   ```
   Đọc theo thứ tự trước khi code:
   1. .agent/memory.md — 8 Golden Rules (bắt buộc)
   2. .agent/tracks/[track-slug]/SPEC.md — spec đầy đủ
   3. docs/ui-design-language.md — visual rules + Known Visual Issues
   
   Sau khi xong: npm run typecheck (0 errors) + npm run test:contracts (all pass)
   ```
   Thêm các constraint cụ thể từ SPEC.md của track đó.

## Step 6: Ask What to Do
8. Ask the user:
   > "Hôm nay bạn muốn làm gì?"
   > - Tiếp tục track đang có → nói tên track
   > - Bắt đầu feature mới → mình sẽ dùng **conductor-new-track** để clarify spec trước khi code
   > - Fix bug / quick task → nói luôn

> **Note**: Nếu user muốn làm feature mới (dù mô tả vague), LUÔN dùng skill `conductor-new-track` trước. Chỉ bắt đầu code sau khi có SPEC.md được confirm.

