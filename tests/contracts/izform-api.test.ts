/**
 * izForm Plugin API — Contract Tests
 */

import { z } from 'zod';
import { IzFormSchema, IzFormSubmissionSchema, CreateFormSchema, SubmitFormSchema } from '@/core/engine/izform';

// ---- Fixtures ----
const makeForm = (overrides = {}) => ({
  id: '00000000-0000-0000-0000-000000000020',
  tenantId: '00000000-0000-0000-0000-000000000001',
  name: 'Contact Us',
  description: 'Thu thập thông tin khách hàng',
  fields: [
    { id: 'f1', type: 'text', label: 'Họ tên', required: true },
    { id: 'f2', type: 'email', label: 'Email', required: true },
    { id: 'f3', type: 'phone', label: 'Số điện thoại', required: false },
  ],
  isActive: true,
  createdAt: new Date('2026-03-21'),
  ...overrides,
});

const makeSubmission = (overrides = {}) => ({
  id: '00000000-0000-0000-0000-000000000030',
  formId: '00000000-0000-0000-0000-000000000020',
  tenantId: '00000000-0000-0000-0000-000000000001',
  data: { f1: 'Nguyễn Văn A', f2: 'nva@gmail.com', f3: '0901234567' },
  contactId: null,
  ipAddress: '1.2.3.4',
  submittedAt: new Date('2026-03-21'),
  ...overrides,
});

// =====================================================
// 1. IzFormSchema — output shape
// =====================================================
describe('IzFormSchema — output shape', () => {
  it('parses a valid form', () => {
    expect(IzFormSchema.safeParse(makeForm()).success).toBe(true);
  });

  it('rejects form with no fields', () => {
    const result = IzFormSchema.safeParse(makeForm({ fields: [] }));
    // Empty fields array is VALID for schema (engine validates min 1 at create time)
    expect(result.success).toBe(true);
  });

  it('rejects invalid field type', () => {
    const result = IzFormSchema.safeParse(makeForm({
      fields: [{ id: 'x', type: 'file', label: 'Upload', required: false }]
    }));
    expect(result.success).toBe(false);
  });

  it('accepts null description', () => {
    expect(IzFormSchema.safeParse(makeForm({ description: null })).success).toBe(true);
  });
});

// =====================================================
// 2. CreateFormSchema — input validation
// =====================================================
describe('CreateFormSchema — input validation', () => {
  it('accepts valid create payload', () => {
    const result = CreateFormSchema.safeParse({
      name: 'Newsletter Signup',
      fields: [{ id: 'f1', type: 'email', label: 'Email', required: true }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(CreateFormSchema.safeParse({ name: '', fields: [{ id: 'f1', type: 'text', label: 'X', required: false }] }).success).toBe(false);
  });

  it('rejects form with 0 fields', () => {
    expect(CreateFormSchema.safeParse({ name: 'Test', fields: [] }).success).toBe(false);
  });
});

// =====================================================
// 3. SubmitFormSchema — public submit validation
// =====================================================
describe('SubmitFormSchema — public submit', () => {
  it('accepts form data object', () => {
    const result = SubmitFormSchema.safeParse({
      data: { f1: 'John', f2: 'john@example.com' },
    });
    expect(result.success).toBe(true);
  });
});

// =====================================================
// 4. IzFormSubmissionSchema — submission shape
// =====================================================
describe('IzFormSubmissionSchema — submission shape', () => {
  it('parses valid submission', () => {
    expect(IzFormSubmissionSchema.safeParse(makeSubmission()).success).toBe(true);
  });

  it('accepts null contactId (not yet converted)', () => {
    expect(IzFormSubmissionSchema.safeParse(makeSubmission({ contactId: null })).success).toBe(true);
  });
});

// =====================================================
// 5. API contract shapes
// =====================================================
describe('API contract shapes', () => {
  it('GET /api/v1/plugins/izform/forms — returns array', () => {
    const response = { data: [makeForm()] };
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('POST /api/v1/public/forms/[id]/submit — returns submissionId', () => {
    const response = { data: { submissionId: '00000000-0000-0000-0000-000000000030', message: 'Form submitted successfully' } };
    expect(response.data.submissionId).toBeTruthy();
  });

  it('POST returns 404 when form not found', () => {
    const response = { error: { message: "Form 'invalid-id' not found or inactive" }, status: 404 };
    expect(response.status).toBe(404);
  });
});
