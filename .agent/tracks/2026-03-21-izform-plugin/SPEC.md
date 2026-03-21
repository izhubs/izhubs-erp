# Track: izForm — Embeddable Lead Capture Plugin
**Created**: 2026-03-21
**Status**: in-progress
**Priority**: high

## Summary
izForm là plugin cho phép tenant tạo form thu thập lead (contacts) và nhúng vào website ngoài bằng iframe, giống HubSpot Form / Typeform đơn giản. Viral loop: form nhúng hiện "Powered by izhubs" → đưa traffic về izhubs.

## User Stories
- Là **Admin**, tôi muốn tạo form thu thập lead với các fields tùy chọn để nhúng vào website của mình
- Là **Admin**, tôi muốn lấy embed code (iframe snippet) để copy vào website
- Là **Visitor** (không cần account), tôi muốn điền form và submit thành công
- Là **Admin**, tôi muốn xem danh sách submissions và import thành Contacts

## Acceptance Criteria
- [ ] Admin tạo được form với ít nhất: name, email, phone, message fields
- [ ] Hệ thống tạo unique embed URL public (không cần auth): `/forms/[formId]`
- [ ] Admin copy được iframe snippet 1-click
- [ ] Form submit không cần login, lưu vào `form_submissions` table
- [ ] Admin xem được danh sách submissions trong UI
- [ ] "Convert to Contact" button: tạo Contact từ submission
- [ ] "Powered by izhubs" link hiển thị trên form nhúng (viral loop)
- [ ] TypeScript clean, contract tests ≥ 3 cases

## Technical Plan

### DB Changes (migration 016_izform.sql)
```sql
CREATE TABLE iz_forms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  fields      JSONB NOT NULL DEFAULT '[]',  -- [{id, type, label, required}]
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE TABLE iz_form_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     UUID NOT NULL REFERENCES iz_forms(id),
  tenant_id   UUID NOT NULL,
  data        JSONB NOT NULL,   -- { fieldId: value }
  contact_id  UUID REFERENCES contacts(id), -- null until converted
  ip_address  VARCHAR(50),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/plugins/izform/forms | withPlugin('izform','izform:read') | List forms |
| POST | /api/v1/plugins/izform/forms | withPlugin('izform','izform:write') | Create form |
| GET | /api/v1/plugins/izform/forms/[id] | withPlugin('izform','izform:read') | Get form |
| PUT | /api/v1/plugins/izform/forms/[id] | withPlugin('izform','izform:write') | Update form |
| DELETE | /api/v1/plugins/izform/forms/[id] | withPlugin('izform','izform:write') | Soft-delete |
| GET | /api/v1/plugins/izform/forms/[id]/submissions | withPlugin('izform','izform:read') | Submissions |
| **POST** | **/api/v1/public/forms/[formId]/submit** | **No auth** | **Public submit** |
| POST | /api/v1/plugins/izform/submissions/[id]/convert | withPlugin('izform','contacts:write') | → Contact |

### UI Components (in izhubs-erp)
- Page: `app/(dashboard)/plugins/izform/page.tsx` — list forms
- Page: `app/(dashboard)/plugins/izform/[id]/page.tsx` — form detail + submissions
- Public Page: `app/(public)/forms/[formId]/page.tsx` — embed target
- Components:
  - `FormBuilder.tsx` — drag-drop field editor
  - `EmbedCodePanel.tsx` — copy iframe snippet
  - `SubmissionTable.tsx` — list submissions
  - `ConvertToContactBtn.tsx`

### Plugin Files (in izerp-plugin repo)
```
plugins/izform/
  plugin.json           ← manifest
  index.ts              ← IzhubsModule (activate/deactivate)
  README.md
  CHANGELOG.md
```

### Engine Functions (in izhubs-erp/core/engine/izform.ts)
- `listForms(tenantId)` → IzForm[]
- `createForm(tenantId, data)` → IzForm
- `getForm(tenantId, formId)` → IzForm | null
- `updateForm(tenantId, formId, data)` → IzForm
- `deleteForm(tenantId, formId)` → boolean
- `submitForm(formId, data, ip)` → IzFormSubmission  ← public, no auth
- `getSubmissions(tenantId, formId)` → IzFormSubmission[]
- `convertToContact(tenantId, submissionId)` → Contact

## Implementation Phases
- [ ] Phase 1: DB migration + engine layer (`core/engine/izform.ts`)
- [ ] Phase 2: API routes (private + public submit)
- [ ] Phase 3: Plugin manifest in izerp-plugin repo
- [ ] Phase 4: UI — Form list + builder + embed code
- [ ] Phase 5: Public form page (no auth)
- [ ] Phase 6: Submissions table + convert to contact
- [ ] Phase 7: Contract tests

## Out of Scope (v1.0)
- Email notifications on submit
- Conditional fields / logic jumps
- File upload fields
- Spam protection (reCAPTCHA)
- Analytics / conversion tracking
- Custom domain for form URL

## Open Questions
- [x] Form builder: drag-drop hay chỉ add/remove fields? → **chỉ add/remove v1.0**, drag-drop v2.0
- [x] Branding: "Powered by izhubs" là link hay chỉ text? → **link** về izhubs.vn
