# Track: gumroad-templates

**Status:** 🔴 BLOCKER — thực hiện TRƯỚC community launch
**Phase:** v0.1 (phải xong trước Show HN)
**Priority:** P0 — Revenue BLOCKER. Không có Gumroad templates = không có revenue
**Depends on:** Demo mode ✅ done, 5 industry seeds ✅ done

> **Context:** Quyết định từ Session 6  — "Monetize NOW: Templates trên Gumroad ($29 each) TRƯỚC community launch"
> Seed data đã có đủ. Cần đóng gói thành template packages và upload Gumroad.

---

## Goal

Đóng gói Agency và Freelancer industry seeds thành **Gumroad digital products** bán $29/each.
Mỗi template pack = JSON template + seed data + setup instructions.

---

## Scope

### Pack 1: Agency Starter Template ($29)

**Nội dung pack:**
- [ ] `templates/gumroad/agency-starter/` folder
- [ ] `agency-template.json` — industry template JSON (pipeline stages, custom fields, colors, nav)
- [ ] `agency-seed-data.csv` — 15 contacts + 15 deals mẫu cho agency
- [ ] `README.md` — hướng dẫn import trong 3 bước (download → drop CSV → done)
- [ ] `CHANGELOG.md` — version history cho template

**Gumroad listing:**
- [ ] Title: "Agency CRM Starter Pack for izhubs ERP"
- [ ] Description: Nhấn mạnh "5 minutes to productive" + screenshots từ demo
- [ ] Screenshots: 3-4 ảnh từ `/demo?industry=agency`
- [ ] Price: $29 (launch price, future $49)
- [ ] File: ZIP chứa tất cả template files

---

### Pack 2: Freelancer Starter Template ($29)

- [ ] `templates/gumroad/freelancer-starter/` folder
- [ ] `freelancer-template.json`
- [ ] `freelancer-seed-data.csv`
- [ ] `README.md`

---

### Self-install flow (buyer experience)

```bash
# Buyer nhận ZIP, giải nén, chạy:
npm run import:template -- --file=agency-template.json

# Hoặc drag-drop CSV qua Import UI đã có
```

- [ ] Kiểm tra `POST /api/v1/import` nhận được CSV từ template pack
- [ ] Hướng dẫn trong README là self-serve (không cần hỏi support)

---

## Out of Scope
- Marketplace (v0.4)
- Auto-install via Gumroad webhook (v0.2)
- Tier 2/3 industries (sau $5K MRR)

---

## Verification

```bash
# Kiểm tra template JSON valid
node -e "JSON.parse(require('fs').readFileSync('templates/gumroad/agency-starter/agency-template.json'))"

# Kiểm tra CSV import works
# → Upload agency-seed-data.csv qua /import
# → AI column mapping tự động nhận diện đúng
# → 15 contacts + 15 deals import thành công
```
