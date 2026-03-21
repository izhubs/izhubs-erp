import type { IndustryTemplate } from '../engine/template.schema';

const agencyTemplate: IndustryTemplate = {
  id: 'agency',
  name: 'Agency / Freelancer',
  description: 'Quản lý khách hàng, dự án và hợp đồng cho agency hoặc freelancer. Phù hợp cho: digital agency, marketing agency, design studio, solo builder.',
  icon: '🎯',
  category: 'services',
  tags: ['agency', 'freelancer', 'marketing', 'design', 'consulting'],

  pipelineStages: [
    { key: 'lead', label: 'Lead mới', color: '#94a3b8' },
    { key: 'proposal', label: 'Gửi proposal', color: '#60a5fa' },
    { key: 'negotiation', label: 'Đàm phán', color: '#f59e0b' },
    { key: 'onboarding', label: 'Onboarding', color: '#a78bfa' },
    { key: 'active', label: 'Đang chạy', color: '#34d399' },
    { key: 'renewal', label: 'Gia hạn', color: '#f97316' },
    { key: 'won', label: 'Chốt', color: '#22c55e' },
    { key: 'lost', label: 'Không chốt', color: '#ef4444' },
  ],

  customFields: [
    { entity: 'deal', key: 'monthly_budget', label: 'Budget tháng (VND)', type: 'number' },
    { entity: 'deal', key: 'project_type', label: 'Loại dự án', type: 'select', options: ['SEO', 'Ads', 'Web design', 'Content', 'Branding', 'Khác'] },
    { entity: 'deal', key: 'contract_duration', label: 'Thời hạn hợp đồng (tháng)', type: 'number' },
    { entity: 'contact', key: 'channel', label: 'Kênh tiếp cận', type: 'select', options: ['Google', 'Facebook', 'Referral', 'Cold outreach', 'LinkedIn', 'Khác'] },
    { entity: 'contact', key: 'company_size', label: 'Quy mô công ty', type: 'select', options: ['1-10', '11-50', '51-200', '200+'] },
    { entity: 'company', key: 'industry_type', label: 'Ngành', type: 'text' },
  ],

  automations: [
    {
      name: 'Nhắc gia hạn khi deal đến giai đoạn Renewal',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'renewal'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Liên hệ gia hạn hợp đồng', daysFromNow: 0 },
    },
    {
      name: 'Tạo task follow-up sau khi gửi proposal',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'proposal'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Follow-up proposal', daysFromNow: 3 },
    },
  ],

  suggestedModules: ['crm', 'contracts', 'invoices', 'reports'],
  demoData: true,

  navConfig: {
    sidebar: [
      { id: 'dashboard',  label: 'Dashboard',    href: '/dashboard',  icon: 'LayoutDashboard', roles: ['admin', 'member', 'viewer'] },
      { id: 'contacts',   label: 'Contacts',     href: '/contacts',   icon: 'Users',           roles: ['admin', 'member'] },
      { id: 'deals',      label: 'Deals',        href: '/deals',      icon: 'Briefcase',       roles: ['admin', 'member'] },
      { id: 'import',     label: 'Import',       href: '/import',     icon: 'Upload',          roles: ['admin', 'member'] },
    ],
    dashboardLayout: {
      rows: [
        { colSpan: 8,  widgetId: 'pipeline-summary' },
        { colSpan: 4,  widgetId: 'tasks-due-today' },
        { colSpan: 6,  widgetId: 'revenue-this-month' },
        { colSpan: 6,  widgetId: 'deals-by-stage' },
        { colSpan: 12, widgetId: 'recent-activity' },
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

export default agencyTemplate;
