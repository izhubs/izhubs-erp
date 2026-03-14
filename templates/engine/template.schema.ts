import { z } from 'zod';

// =============================================================
// izhubs ERP — Industry Template Schema
// Templates are JSON/YAML configs applied at setup.
// They pre-configure pipeline stages, custom fields, and automations
// for a specific business type — without changing the Core engine.
// =============================================================

export const TemplateCustomFieldSchema = z.object({
  entity: z.enum(['contact', 'company', 'deal', 'activity']),
  key: z.string().regex(/^[a-z_]+$/),
  label: z.string(),
  type: z.enum(['text', 'number', 'date', 'boolean', 'select', 'multiselect', 'url', 'email', 'phone']),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),   // defaults to false if omitted
});

export const TemplateAutomationSchema = z.object({
  name: z.string(),
  trigger: z.enum(['deal.created', 'deal.stage_changed', 'deal.won', 'deal.lost', 'contact.created', 'activity.created']),
  condition: z.string().optional(), // Simple expression: "toStage == 'renewal'"
  action: z.enum(['create_activity', 'send_notification', 'update_field']),
  actionConfig: z.record(z.unknown()),
});

// Sub-template: niche variant of a parent template
// Only defines what's DIFFERENT — merged with parent at apply-time
export const SubTemplateSchema = z.object({
  id: z.string(),              // e.g. "restaurant-fine-dining"
  label: z.string(),           // e.g. "Fine Dining"
  description: z.string(),
  icon: z.string().optional(),
  overrides: z.object({
    pipelineStages: z.array(z.object({
      key: z.string(),
      label: z.string(),
      color: z.string().optional(),
    })).optional(),
    customFields: z.array(TemplateCustomFieldSchema).optional(),
    automations: z.array(TemplateAutomationSchema).optional(),
  }),
});

export const IndustryTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(['hospitality', 'retail', 'services', 'technology', 'real_estate', 'other']),
  tags: z.array(z.string()),

  pipelineStages: z.array(z.object({
    key: z.string(),
    label: z.string(),
    color: z.string().optional(),
  })),

  customFields: z.array(TemplateCustomFieldSchema),
  automations: z.array(TemplateAutomationSchema).default([]),
  suggestedModules: z.array(z.string()).default([]),
  demoData: z.boolean().default(false),

  // Niche sub-variants (human-written common ones)
  // e.g. restaurant → fine-dining, street-food, cafe, buffet
  subTemplates: z.array(SubTemplateSchema).optional(),

  // AI generation prompt for hyper-niche customization
  // User describes their business in natural language →
  // AI reads this prompt + userDescription → generates a custom config
  // Placeholders: {userDescription}, {industry}, {subCategory}, {location}
  aiPrompt: z.string().optional(),

  version: z.string().default('1.0.0'),
  author: z.string().default('izhubs'),
});

export type IndustryTemplate = z.infer<typeof IndustryTemplateSchema>;
export type SubTemplate = z.infer<typeof SubTemplateSchema>;
export type TemplateCustomField = z.infer<typeof TemplateCustomFieldSchema>;
