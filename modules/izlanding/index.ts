// =============================================================
// izLanding Plugin Manifest
// =============================================================

import type { IzhubsModule } from '@/core/types/module.interface';

export const izLandingModule: IzhubsModule = {
  id: 'izlanding',
  name: 'izLanding — AI Landing Pages',
  version: '1.0.0',
  category: 'operations',
  icon: '🚀',
  description: 'AI-powered Landing Page Builder using Zero-JS Astro framework. Type a prompt and get a blazing fast responsive page.',
  dependencies: ['crm'],
  requiredPermissions: [
    // We will define these if the RBAC system uses them, otherwise we just leave empty if it's broad plugin access
  ],
  apiPrefix: '/api/v1/plugins/izlanding',
};

export default izLandingModule;
