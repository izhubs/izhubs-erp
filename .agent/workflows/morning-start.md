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
   
   ### 🎯 CURRENT MICRO-SPRINT FOCUS (DO NOT IGNORE)
   [Look at STATUS.md -> Phase 0: The Builder OS. Pick the ONE track that is '🚧 NEXT' or 'in-progress']
   [Display its Slug and Description clearly here]

   ### 🔥 Other Active Tracks
   [list from STATUS.md with current phase]
   
   ### 📦 Recent Commits (3 days)
   [grouped by feat/fix/chore]
   
   ### 📋 Up Next (Backlog)
   [top 3 from memory.md backlog]
   ```

## Step 5: Agent Briefing & AI Vibe Code Rules
7. Khi kích hoạt tác vụ mới hoặc track `in-progress` (hoặc chuẩn bị bàn giao cho Agent khác), generate luôn prompt **định hướng kiến trúc** (Briefing) để "chốt hạ" Scope cho AI:
   ```text
   Hãy đọc theo thứ tự trước khi viết bất kỳ dòng code nào:
   1. .agent/AGENTS.md — 3-Repo Architecture Rules (QUAN TRỌNG NHẤT: Ranh giới Core, Plugin, Theme)
   2. .agent/memory.md — 8 Golden Rules (bắt buộc)
   3. .agent/tracks/[track-slug]/SPEC.md — spec đầy đủ
   4. docs/architecture-and-guides/ui-design-language.md — visual rules + Known Visual Issues
   
   ⚠️ Hard Constraints thiết yếu:
   - Chức năng nghiệp vụ (Business flow) -> Bỏ vào `packages/izerp-plugin/`
   - Giao diện (UI Components) -> Bỏ vào `packages/izerp-theme/`
   - BẮT BUỘC dùng Path Alias (`@izerp-plugin/*`, `@izerp-theme/*`), CẤM dùng Relative paths (../../) cắt ngang kho chứa.
   
   Sau khi code xong: npm run typecheck (0 errors) + npm run test:contracts (all pass)
   ```
   Đảm bảo khuyên User hãy dùng khối prompt này để mồi (Context Injection) cho các Agent khác tạo đà Vibe Code chuẩn xác nhất.

## Step 6: Ask What to Do
8. Ask the user:
   > "Hôm nay bạn muốn làm gì?"
   > - Tiếp tục track đang có → nói tên track
   > - Bắt đầu feature mới → mình sẽ dùng **conductor-new-track** để clarify spec trước khi code
   > - Fix bug / quick task → nói luôn

> **Note**: Nếu user muốn làm feature mới (dù mô tả vague), LUÔN dùng skill `conductor-new-track` trước. Chỉ bắt đầu code sau khi có SPEC.md được confirm.

