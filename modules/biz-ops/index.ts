// =============================================================
// izhubs ERP — Business Operations Module Manifest
// Fat Module pattern: self-contained biz-ops plugin
// =============================================================

import type { IzhubsModule } from '@/core/types/module.interface';

const bizOpsModule: IzhubsModule = {
  id: 'biz-ops',
  name: 'Business Operations',
  version: '1.0.0',
  category: 'operations',
  icon: '💼',
  description: 'Manage contracts, payment milestones, and project campaigns.',
  dependencies: [],
  requiredPermissions: ['contracts:read'],
  apiPrefix: '/api/v1/biz-ops',
};

export default bizOpsModule;
