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

export const IndustryTemplateSchema = z.object({
  id: z.string(),                      // Unique slug: "restaurant", "agency"
  name: z.string(),                    // Display name: "Restaurant"
  description: z.string(),
  icon: z.string(),                    // Emoji or icon name
  category: z.enum(['hospitality', 'retail', 'services', 'technology', 'real_estate', 'other']),
  tags: z.array(z.string()),

  // Pipeline configuration
  pipelineStages: z.array(z.object({
    key: z.string(),
    label: z.string(),
    color: z.string().optional(),      // hex color for kanban
  })),

  // Pre-defined custom fields
  customFields: z.array(TemplateCustomFieldSchema),

  // Pre-built automations
  automations: z.array(TemplateAutomationSchema).default([]),

  // Suggested modules to enable
  suggestedModules: z.array(z.string()).default([]),

  // Optional seed data for demo
  demoData: z.boolean().default(false),

  version: z.string().default('1.0.0'),
  author: z.string().default('izhubs'),
});

export type IndustryTemplate = z.infer<typeof IndustryTemplateSchema>;
export type TemplateCustomField = z.infer<typeof TemplateCustomFieldSchema>;
