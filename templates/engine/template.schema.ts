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

// =============================================================
// LAYER 2: Navigation & Layout Engine Schemas
// These are stored in industry_templates.nav_config (JSONB).
// Dumb components (Sidebar, DashboardGrid) render purely from this.
// IMPORTANT: roles[] here is UI-only filtering.
// Backend RBAC (middleware.ts + user_roles) is the security layer.
// =============================================================

/**
 * NavItem — a single entry in the sidebar navigation.
 * Defined as a plain TypeScript type (not z.infer) so the recursive
 * `children` field doesn't trip up Zod's lazy type inference.
 * Runtime validation uses NavItemSchema below.
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Lucide icon name as string — resolved to component via ICON_MAP in Sidebar */
  icon: string;
  /** UI-only role filter — does NOT grant access, backend enforces RBAC */
  roles: string[];
  /** Optional badge e.g. 'new' | 'beta' displayed as a pill on the menu item */
  badge?: string;
  children?: NavItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NavItemSchema: z.ZodType<NavItem, any, any> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    href: z.string(),
    icon: z.string(),
    roles: z.array(z.string()).default(['admin', 'member', 'viewer']),
    badge: z.string().optional(),
    children: z.array(NavItemSchema).optional(),
  })
);

export const DashboardWidgetRowSchema = z.object({
  /** Number of columns out of 12 this widget spans */
  colSpan: z.number().int().min(1).max(12),
  /** Widget component identifier — resolved via WIDGET_MAP in DashboardGrid */
  widgetId: z.string(),
  /** Minimum role required to see this widget (UI filter, not security) */
  minRole: z.enum(['viewer', 'member', 'admin', 'superadmin']).optional(),
});

export const NavConfigSchema = z.object({
  sidebar: z.array(NavItemSchema),
  dashboardLayout: z.object({
    rows: z.array(DashboardWidgetRowSchema),
  }),
  /**
   * CSS variable overrides injected into :root when this template is active.
   * Stored in the separate `theme_defaults` column in industry_templates,
   * merged into NavConfig at query time in getNavConfig().
   * Example: { "--color-primary": "#6366f1", "--color-primary-hover": "#4f46e5" }
   */
  themeDefaults: z.record(z.string()).optional(),
});

export type NavConfig = z.infer<typeof NavConfigSchema>;
export type DashboardWidgetRow = z.infer<typeof DashboardWidgetRowSchema>;


// =============================================================
// Full Industry Template
// =============================================================

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

  // Layer 2: Navigation + Dashboard config
  navConfig: NavConfigSchema,

  // Layer 1: Default CSS variable overrides for this industry's theme
  // Stored in industry_templates.theme_defaults, merged with custom_theme_config at runtime
  // e.g. { '--color-primary': '#f472b6' }
  themeDefaults: z.record(z.string()).optional(),

  // Niche sub-variants (human-written common ones)
  subTemplates: z.array(SubTemplateSchema).optional(),

  // AI generation prompt for hyper-niche customization
  aiPrompt: z.string().optional(),

  version: z.string().default('1.0.0'),
  author: z.string().default('izhubs'),
});

export type IndustryTemplate = z.infer<typeof IndustryTemplateSchema>;
export type SubTemplate = z.infer<typeof SubTemplateSchema>;
export type TemplateCustomField = z.infer<typeof TemplateCustomFieldSchema>;
