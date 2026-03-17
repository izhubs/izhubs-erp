/**
 * core/types/demo.ts
 * ============================================================
 * Shared constants and types for izhubs ERP industries, roles,
 * and demo configuration.
 *
 * These are used across:
 *  - Demo wizard UI (/demo)
 *  - Demo engine (core/engine/demo.ts)
 *  - Demo API (/api/v1/demo-login)
 *  - Role-specific dashboards (future: personalized per-user views)
 *  - Seed scripts
 *  - Module permissions matrix
 * ============================================================
 */

// ── Industries ──────────────────────────────────────────────

export const INDUSTRY_IDS = ['agency', 'freelancer', 'coworking', 'restaurant', 'cafe'] as const;
export type IndustryId = typeof INDUSTRY_IDS[number];

export interface Industry {
  id: IndustryId;
  icon: string;
  label: string;
  description: string;
  seedCommand: string;
}

export const INDUSTRIES: Record<IndustryId, Industry> = {
  agency: {
    id: 'agency',
    icon: '🏢',
    label: 'Agency / Digital Marketing',
    description: '15 clients · 15 deals · Full service pipeline',
    seedCommand: 'seed:agency',
  },
  freelancer: {
    id: 'freelancer',
    icon: '💻',
    label: 'Freelancer / Creator',
    description: '15 clients · 10 deals · Project tracking',
    seedCommand: 'seed:freelancer',
  },
  coworking: {
    id: 'coworking',
    icon: '🏠',
    label: 'Coworking Space',
    description: '15 members · 10 deals · Membership pipeline',
    seedCommand: 'seed:coworking',
  },
  restaurant: {
    id: 'restaurant',
    icon: '🍜',
    label: 'Restaurant / F&B',
    description: '15 guests · 10 deals · Event & catering',
    seedCommand: 'seed:restaurant',
  },
  cafe: {
    id: 'cafe',
    icon: '☕',
    label: 'Café',
    description: '15 regulars · 10 deals · Loyalty pipeline',
    seedCommand: 'seed:cafe',
  },
};

// ── Roles ────────────────────────────────────────────────────
// Roles control what a user sees in the dashboard (their "lens").
// These map to RBAC roles but carry richer UX context.
// Future: roles can be scoped further per-user for deep personalization.

export const ROLE_IDS = ['ceo', 'sale', 'ops'] as const;
export type RoleId = typeof ROLE_IDS[number];

export interface Role {
  id: RoleId;
  icon: string;
  label: string;
  description: string;
  /** Maps to the actual RBAC role in the `users` table */
  rbacRole: 'superadmin' | 'admin' | 'member' | 'viewer';
}

export const ROLES: Record<RoleId, Role> = {
  ceo: {
    id: 'ceo',
    icon: '👔',
    label: 'CEO / Founder',
    description: 'Full revenue dashboard, all pipeline, team KPIs',
    rbacRole: 'admin',
  },
  sale: {
    id: 'sale',
    icon: '📞',
    label: 'Sales / Account Manager',
    description: 'Personal Kanban, own deals, follow-up list',
    rbacRole: 'member',
  },
  ops: {
    id: 'ops',
    icon: '⚙️',
    label: 'Operations / Admin',
    description: 'Team activity, contract list, member management',
    rbacRole: 'member',
  },
};
