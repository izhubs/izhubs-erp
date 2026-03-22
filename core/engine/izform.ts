// =============================================================
// izhubs ERP — izForm Engine
// DB layer for iz_forms and iz_form_submissions tables.
// Only this file may query iz_forms* tables.
// Migration: 016_izform_plugin.sql
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

// ── Zod Schemas ──────────────────────────────────────────────

const FormFieldSchema = z.object({
  id:       z.string(),
  type:     z.enum(['text', 'email', 'phone', 'textarea', 'select', 'number']),
  label:    z.string(),
  required: z.boolean().default(false),
  options:  z.array(z.string()).optional(), // for select type
});

export type FormField = z.infer<typeof FormFieldSchema>;

export const IzFormSchema = z.object({
  id:              z.string().uuid(),
  tenantId:        z.string().uuid(),
  name:            z.string(),
  description:     z.string().nullable(),
  fields:          z.array(FormFieldSchema),
  isActive:        z.boolean(),
  webhookUrl:      z.string().nullable().default(null),
  autoConvertLead: z.boolean().default(false),
  createdAt:       z.coerce.date(),
});

export type IzForm = z.infer<typeof IzFormSchema>;

export const CreateFormSchema = z.object({
  name:            z.string().min(1).max(200),
  description:     z.string().optional(),
  fields:          z.array(FormFieldSchema).min(1, 'At least 1 field required'),
  webhookUrl:      z.string().url().optional().or(z.literal('')),
  autoConvertLead: z.boolean().optional(),
});

export const UpdateFormSchema = CreateFormSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const IzFormSubmissionSchema = z.object({
  id:          z.string().uuid(),
  formId:      z.string().uuid(),
  tenantId:    z.string().uuid(),
  data:        z.record(z.string(), z.unknown()),
  contactId:   z.string().uuid().nullable(),
  ipAddress:   z.string().nullable(),
  submittedAt: z.coerce.date(),
});

export type IzFormSubmission = z.infer<typeof IzFormSubmissionSchema>;

export const SubmitFormSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

// ── Engine Functions ─────────────────────────────────────────

/** List all active forms for a tenant */
export async function listForms(tenantId: string): Promise<IzForm[]> {
  const res = await db.query(
    `SELECT
       id, tenant_id AS "tenantId", name, description,
       fields, is_active AS "isActive",
       webhook_url AS "webhookUrl", auto_convert_lead AS "autoConvertLead",
       created_at AS "createdAt"
     FROM iz_forms
     WHERE tenant_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return res.rows.map(r => IzFormSchema.parse(r));
}

/** Get a single form (validates tenant ownership) */
export async function getForm(tenantId: string, formId: string): Promise<IzForm | null> {
  const res = await db.query(
    `SELECT
       id, tenant_id AS "tenantId", name, description,
       fields, is_active AS "isActive",
       webhook_url AS "webhookUrl", auto_convert_lead AS "autoConvertLead",
       created_at AS "createdAt"
     FROM iz_forms
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [formId, tenantId]
  );
  if (!res.rows[0]) return null;
  return IzFormSchema.parse(res.rows[0]);
}

/** Get form by ID only (for public submit — no tenant check here, tenant_id stored in form) */
export async function getFormPublic(formId: string): Promise<IzForm | null> {
  const res = await db.query(
    `SELECT
       id, tenant_id AS "tenantId", name, description,
       fields, is_active AS "isActive",
       webhook_url AS "webhookUrl", auto_convert_lead AS "autoConvertLead",
       created_at AS "createdAt"
     FROM iz_forms
     WHERE id = $1 AND deleted_at IS NULL AND is_active = true`,
    [formId]
  );
  if (!res.rows[0]) return null;
  return IzFormSchema.parse(res.rows[0]);
}

/** Create a new form */
export async function createForm(
  tenantId: string,
  data: z.infer<typeof CreateFormSchema>
): Promise<IzForm> {
  const res = await db.query(
    `INSERT INTO iz_forms (tenant_id, name, description, fields, webhook_url, auto_convert_lead)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING
       id, tenant_id AS "tenantId", name, description,
       fields, is_active AS "isActive",
       webhook_url AS "webhookUrl", auto_convert_lead AS "autoConvertLead",
       created_at AS "createdAt"`,
    [tenantId, data.name, data.description ?? null, JSON.stringify(data.fields), data.webhookUrl || null, data.autoConvertLead ?? false]
  );
  return IzFormSchema.parse(res.rows[0]);
}

/** Update form (partial) */
export async function updateForm(
  tenantId: string,
  formId: string,
  data: z.infer<typeof UpdateFormSchema>
): Promise<IzForm | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name        !== undefined) { fields.push(`name = $${idx++}`);        values.push(data.name); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.fields      !== undefined) { fields.push(`fields = $${idx++}`);      values.push(JSON.stringify(data.fields)); }
  if (data.isActive    !== undefined) { fields.push(`is_active = $${idx++}`);   values.push(data.isActive); }
  if (data.webhookUrl  !== undefined) { fields.push(`webhook_url = $${idx++}`); values.push(data.webhookUrl || null); }
  if (data.autoConvertLead !== undefined) { fields.push(`auto_convert_lead = $${idx++}`); values.push(data.autoConvertLead); }

  if (fields.length === 0) return getForm(tenantId, formId);

  values.push(tenantId, formId);
  const res = await db.query(
    `UPDATE iz_forms SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING
       id, tenant_id AS "tenantId", name, description,
       fields, is_active AS "isActive", created_at AS "createdAt"`,
    values
  );
  if (!res.rows[0]) return null;
  return IzFormSchema.parse(res.rows[0]);
}

/** Soft-delete a form */
export async function deleteForm(tenantId: string, formId: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE iz_forms SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [formId, tenantId]
  );
  return (res.rowCount ?? 0) > 0;
}

/** List submissions for a form (validates tenant ownership) */
export async function getSubmissions(tenantId: string, formId: string): Promise<IzFormSubmission[]> {
  const res = await db.query(
    `SELECT
       s.id, s.form_id AS "formId", s.tenant_id AS "tenantId",
       s.data, s.contact_id AS "contactId",
       s.ip_address AS "ipAddress",
       s.submitted_at AS "submittedAt"
     FROM iz_form_submissions s
     JOIN iz_forms f ON f.id = s.form_id
     WHERE s.form_id = $1 AND f.tenant_id = $2 AND f.deleted_at IS NULL
     ORDER BY s.submitted_at DESC`,
    [formId, tenantId]
  );
  return res.rows.map(r => IzFormSubmissionSchema.parse(r));
}

/** Public submit — no auth required. formId must be active */
export async function submitForm(
  formId: string,
  data: Record<string, unknown>,
  ipAddress?: string
): Promise<IzFormSubmission> {
  const form = await getFormPublic(formId);
  if (!form) throw new Error(`Form '${formId}' not found or inactive`);

  const res = await db.query(
    `INSERT INTO iz_form_submissions (form_id, tenant_id, data, ip_address)
     VALUES ($1, $2, $3, $4)
     RETURNING
       id, form_id AS "formId", tenant_id AS "tenantId",
       data, contact_id AS "contactId",
       ip_address AS "ipAddress", submitted_at AS "submittedAt"`,
    [formId, form.tenantId, JSON.stringify(data), ipAddress ?? null]
  );
  const submission = IzFormSubmissionSchema.parse(res.rows[0]);

  // ── Side-effects (async, non-blocking) ──
  // Auto-convert to Contact
  if (form.autoConvertLead) {
    convertToContact(form.tenantId, submission.id).catch(err =>
      console.error('[izForm] Auto-convert lead failed:', err)
    );
  }
  // Fire webhook
  if (form.webhookUrl) {
    fireWebhook(form.webhookUrl, {
      event: 'form.submission',
      formId: form.id,
      formName: form.name,
      submission: { id: submission.id, data, submittedAt: submission.submittedAt },
    }).catch(err =>
      console.error('[izForm] Webhook failed:', err)
    );
  }

  return submission;
}

/** Convert a submission to a Contact */
export async function convertToContact(
  tenantId: string,
  submissionId: string
): Promise<{ contactId: string }> {
  const res = await db.query(
    `SELECT s.*, f.tenant_id AS form_tenant_id
     FROM iz_form_submissions s
     JOIN iz_forms f ON f.id = s.form_id
     WHERE s.id = $1 AND f.tenant_id = $2`,
    [submissionId, tenantId]
  );
  if (!res.rows[0]) throw new Error(`Submission '${submissionId}' not found`);

  const sub = res.rows[0];
  const data = sub.data as Record<string, string>;

  // Smart field lookup — try multiple key patterns for name/email/phone
  const find = (keys: string[]) => {
    for (const k of keys) {
      const found = Object.entries(data).find(([key]) => key.toLowerCase() === k.toLowerCase());
      if (found?.[1]) return found[1];
    }
    return null;
  };

  const contactName = find(['name', 'full name', 'fullName', 'full_name', 'họ tên', 'tên']) ?? 'Unknown';
  const contactEmail = find(['email', 'e-mail', 'emailAddress', 'email_address']);
  const contactPhone = find(['phone', 'phone number', 'phoneNumber', 'phone_number', 'điện thoại', 'số điện thoại']);

  // Create contact from form data (status = 'lead')
  const contactRes = await db.query(
    `INSERT INTO contacts (tenant_id, name, email, phone, status)
     VALUES ($1, $2, $3, $4, 'lead')
     RETURNING id`,
    [tenantId, contactName, contactEmail, contactPhone]
  );
  const contactId = contactRes.rows[0].id;

  // Link submission → contact
  await db.query(
    `UPDATE iz_form_submissions SET contact_id = $1 WHERE id = $2`,
    [contactId, submissionId]
  );

  return { contactId };
}

/** Fire outbound webhook (Zapier/Make compatible) */
async function fireWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'izhubs-erp/1.0' },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
      signal: controller.signal,
    });
    console.log(`[izForm] Webhook fired to ${url} — status ${res.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

/** Send a test webhook payload */
export async function sendTestWebhook(url: string, formName: string): Promise<{ status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'izhubs-erp/1.0' },
      body: JSON.stringify({
        event: 'form.test',
        formName,
        submission: { id: 'test-000', data: { name: 'Test User', email: 'test@example.com' }, submittedAt: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    return { status: res.status };
  } finally {
    clearTimeout(timeout);
  }
}
