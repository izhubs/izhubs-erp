import type { IndustryTemplate } from '../engine/template.schema';

const virtualOfficeTemplate: IndustryTemplate = {
  id: 'virtual-office',
  name: 'Virtual Office Services',
  description: 'Quản lý khách hàng, hợp đồng và gói dịch vụ cho trung tâm văn phòng ảo. Phù hợp cho: virtual office, business center, coworking space, shared office.',
  icon: '🏢',
  category: 'real_estate',
  tags: ['virtual-office', 'business-center', 'coworking', 'shared-office', 'address-service'],

  pipelineStages: [
    { key: 'lead',        label: 'New Lead',      color: '#94a3b8' },
    { key: 'proposal',    label: 'Proposal Sent', color: '#60a5fa' },
    { key: 'negotiation', label: 'Negotiation',   color: '#f59e0b' },
    { key: 'onboarding',  label: 'Onboarding',    color: '#a78bfa' },
    { key: 'active',      label: 'Active Client', color: '#34d399' },
    { key: 'renewal',     label: 'Up for Renewal', color: '#f97316' },
    { key: 'won',         label: 'Won',            color: '#22c55e' },
    { key: 'lost',        label: 'Lost',           color: '#ef4444' },
  ],

  customFields: [
    // Company fields
    { entity: 'company', key: 'dia_chi_dang_ky',   label: 'Registered Address',  type: 'text' },
    { entity: 'company', key: 'loai_doanh_nghiep',  label: 'Business Type',       type: 'select', options: ['LLC', 'JSC', 'Sole Proprietor', 'Other'] },
    { entity: 'company', key: 'ma_so_thue',          label: 'Tax ID',              type: 'text' },
    // Deal fields
    { entity: 'deal', key: 'goi_dich_vu',         label: 'Service Package',        type: 'select', options: ['Basic', 'Pro', 'Enterprise'] },
    { entity: 'deal', key: 'thoi_han_hop_dong',   label: 'Contract Duration (months)', type: 'number' },
    { entity: 'deal', key: 'ngay_ky_hop_dong',    label: 'Contract Signed Date',   type: 'date' },
    // Contact fields
    { entity: 'contact', key: 'nguon_lead',        label: 'Lead Source',            type: 'select', options: ['Google', 'Facebook', 'Referral', 'Cold Outreach', 'Other'] },
  ],

  // Automations are SEED DATA ONLY — inserted into tenant_automations table on setup.
  // Users can edit/disable them via Settings > Automation Rules.
  automations: [
    {
      name: 'Remind renewal when deal reaches Renewal stage',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'renewal'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Contact client for contract renewal', daysFromNow: 0 },
    },
    {
      name: 'Follow-up task after sending proposal',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'proposal'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Follow-up on proposal', daysFromNow: 3 },
    },
    {
      name: 'Schedule periodic review when client is active',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'active'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Schedule periodic service review', daysFromNow: 30 },
    },
  ],

  suggestedModules: ['crm', 'contracts', 'service-packages', 'reports'],
  demoData: true,

  navConfig: {
    sidebar: [
      { id: 'dashboard',        label: 'Dashboard',         href: '/dashboard',         icon: 'LayoutDashboard', roles: ['admin', 'member', 'viewer'] },
      { id: 'leads',            label: 'Leads',             href: '/leads',             icon: 'UserPlus',        roles: ['admin', 'member'] },
      { id: 'contacts',         label: 'Contacts',          href: '/contacts',           icon: 'Users',           roles: ['admin', 'member'] },
      { id: 'deals',            label: 'Pipeline',          href: '/deals',             icon: 'Briefcase',       roles: ['admin', 'member'] },
      { id: 'contracts',        label: 'Contracts',         href: '/contracts',         icon: 'FileText',        roles: ['admin', 'member', 'viewer'] },
      { id: 'service-packages', label: 'Service Packages',  href: '/service-packages',  icon: 'Package',         roles: ['admin', 'member'] },
      { id: 'tasks',            label: 'Tasks',             href: '/tasks',             icon: 'CheckSquare',     roles: ['admin', 'member'] },
      { id: 'reports',          label: 'Reports',           href: '/reports',           icon: 'BarChart2',       roles: ['admin', 'viewer'] },
      { id: 'import',           label: 'Import',            href: '/import',            icon: 'Upload',          roles: ['admin'] },
    ],
    bottomItems: [
      { id: 'plugins',    label: 'Plugins',      href: '/settings/plugins', icon: 'Package',         roles: ['admin'] },
      { id: 'settings', label: 'Settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
    ],
    dashboardLayout: {
      rows: [
        { colSpan: 3,  widgetId: 'kpi-mrr' },
        { colSpan: 3,  widgetId: 'kpi-active-clients' },
        { colSpan: 3,  widgetId: 'kpi-churn-rate' },
        { colSpan: 3,  widgetId: 'kpi-renewals-due' },
        { colSpan: 8,  widgetId: 'arr-line-chart' },
        { colSpan: 4,  widgetId: 'revenue-by-package-donut' },
        { colSpan: 7,  widgetId: 'top-customers-table' },
        { colSpan: 5,  widgetId: 'recent-activity-feed' },
      ],
    },
  },

  themeDefaults: {
    '--color-primary':       '#6366f1',
    '--color-primary-hover': '#4f46e5',
    '--color-primary-light': '#e0e7ff',
    '--color-primary-muted': '#312e81',
  },

  version: '1.0.0',
  author: 'izhubs',
};

export default virtualOfficeTemplate;
