import { z } from 'zod';

// =============================================================
// izhubs ERP — Core Entity Schemas
// SOURCE OF TRUTH: All other files import from here.
// DO NOT rename or remove fields — extensions depend on them.
// To add fields: add as optional. To deprecate: mark @deprecated.
// =============================================================

// ---- User ----
export const UserRoleSchema = z.enum(['superadmin', 'admin', 'member', 'viewer']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: UserRoleSchema.default('member'),
  avatarUrl: z.string().url().optional(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

// ---- Company ----
export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  customFields: z.record(z.unknown()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Company = z.infer<typeof CompanySchema>;

// ---- Contact ----
export const ContactStatusSchema = z.enum(['lead', 'customer', 'prospect', 'churned']);
export type ContactStatus = z.infer<typeof ContactStatusSchema>;

export const ContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: ContactStatusSchema.default('lead').optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
  customFields: z.record(z.unknown()).default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Contact = z.infer<typeof ContactSchema>;

// ---- Deal ----
export const DealStageSchema = z.enum([
  // Generic CRM stages
  'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost',
  // Virtual Office / subscription-model stages
  'lead', 'active', 'onboarding', 'renewal',
  // Project / freelancer stages
  'revision', 'completed', 'cancelled', 'pending',
  // Restaurant / F&B stages
  'inquiry', 'reservation', 'confirmed', 'seated',
  // Coworking stages
  'tour_scheduled', 'tour_completed', 'member_active',
  // Coworking pipeline legacy stages
  'consulting', 'site_visit', 'closing', 'referred', 'quoted',
]);

export const DealSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  // pg returns DECIMAL/NUMERIC as strings — coerce handles string → number
  value: z.coerce.number().min(0).default(0),
  stage: DealStageSchema.default('new'),
  contactId: z.string().uuid().optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
  closedAt: z.coerce.date().optional().nullable(),
  customFields: z.record(z.unknown()).default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Deal = z.infer<typeof DealSchema>;
export type DealStage = z.infer<typeof DealStageSchema>;

// ---- Activity ----
export const ActivityTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'note',
  'task',
]);

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  type: ActivityTypeSchema,
  subject: z.string().min(1),
  body: z.string().optional(),
  dueAt: z.date().optional(),
  completedAt: z.date().optional(),
  // Polymorphic relation — linked to one of:
  contactId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

// ---- Custom Field Definition ----
export const CustomFieldTypeSchema = z.enum([
  'text',
  'number',
  'date',
  'boolean',
  'select',
  'multiselect',
  'url',
  'email',
  'phone',
]);

export const CustomFieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['contact', 'company', 'deal', 'activity']),
  key: z.string().regex(/^[a-z_]+$/, 'Key must be lowercase with underscores'),
  label: z.string().min(1),
  type: CustomFieldTypeSchema,
  options: z.array(z.string()).optional(), // for select/multiselect
  required: z.boolean().default(false),
  createdAt: z.date(),
});
export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;
