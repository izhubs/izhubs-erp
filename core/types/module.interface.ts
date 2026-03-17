// =============================================================
// izhubs ERP — IzhubsModule Interface
// Every Fat Module MUST implement this interface.
// Register the module manifest in modules/[id]/index.ts
// =============================================================

import type { Permission } from '@/core/engine/rbac';

/**
 * Module categories shown in the App Store.
 */
export type ModuleCategory = 'core' | 'finance' | 'operations' | 'communication';

/**
 * The contract that every izhubs Fat Module must implement.
 * Used by the Module Registry to validate and load modules.
 */
export interface IzhubsModule {
  /** Unique identifier. Must match the `id` column in the `modules` DB table. */
  id: string;

  /** Human-readable name shown in the App Store. */
  name: string;

  /** Semver version string. */
  version: string;

  /** Category for App Store filtering. */
  category: ModuleCategory;

  /** Emoji icon shown in the App Store card. */
  icon: string;

  /** Short description shown in the App Store card. */
  description: string;

  /**
   * IDs of other modules that must be active before this module can be installed.
   * Example: ['crm'] means CRM module must be active first.
   */
  dependencies: string[];

  /**
   * Permissions this module requires. Used to validate RBAC setup before install.
   * Users with insufficient permissions cannot access module features.
   */
  requiredPermissions: Permission[];

  /**
   * Base URL prefix for all API routes in this module.
   * Example: '/api/v1/crm'
   */
  apiPrefix: string;
}

/**
 * The runtime representation of a module from the database,
 * combined with the tenant's activation status.
 */
export interface ModuleWithStatus extends IzhubsModule {
  isActive: boolean;
  isOfficial: boolean;
  installedAt: Date | null;
  config: Record<string, unknown>;
}
