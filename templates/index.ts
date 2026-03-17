// =============================================================
// izhubs ERP — Template Registry
// All industry templates are registered here.
// To add a new template: create a file in industry/ and import here.
// =============================================================

import agencyTemplate from './industry/agency';
import restaurantTemplate from './industry/restaurant';
import coworkingTemplate from './industry/coworking';
import ecommerceTemplate from './industry/ecommerce';
import spaTemplate from './industry/spa';
import type { IndustryTemplate } from './engine/template.schema';

export const TEMPLATES: IndustryTemplate[] = [
  agencyTemplate,
  restaurantTemplate,
  coworkingTemplate,
  ecommerceTemplate,
  spaTemplate,
];

export const TEMPLATE_MAP = Object.fromEntries(
  TEMPLATES.map(t => [t.id, t])
) as Record<string, IndustryTemplate>;

export function getTemplate(id: string): IndustryTemplate | undefined {
  return TEMPLATE_MAP[id];
}

export function getTemplatesByCategory(category: IndustryTemplate['category']): IndustryTemplate[] {
  return TEMPLATES.filter(t => t.category === category);
}

export { type IndustryTemplate } from './engine/template.schema';
