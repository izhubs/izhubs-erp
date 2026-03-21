import type { IndustryTemplate } from '../engine/template.schema';

const coworkingTemplate: IndustryTemplate = {
  id: 'coworking',
  name: 'Coworking / Văn phòng cho thuê',
  description: 'Quản lý lead, hợp đồng thuê văn phòng ảo, văn phòng cố định và phòng họp. Dựa trên kinh nghiệm thực tế từ Yesoffice.',
  icon: '🏢',
  category: 'real_estate',
  tags: ['coworking', 'office', 'virtual-office', 'flexible-desk', 'meeting-room'],

  pipelineStages: [
    { key: 'new', label: 'Mới', color: '#94a3b8' },
    { key: 'contacted', label: 'Đã liên hệ', color: '#60a5fa' },
    { key: 'consulting', label: 'Đang tư vấn', color: '#a78bfa' },
    { key: 'site_visit', label: 'Xem văn phòng', color: '#f59e0b' },
    { key: 'closing', label: 'Chốt hẹn ký', color: '#f97316' },
    { key: 'won', label: 'Khách hàng', color: '#22c55e' },
    { key: 'lost', label: 'Không phù hợp', color: '#ef4444' },
    { key: 'referred', label: 'Chuyển đối tác', color: '#8b5cf6' },
  ],

  customFields: [
    { entity: 'deal', key: 'service_type', label: 'Gói dịch vụ', type: 'select', options: ['Văn phòng ảo', 'Văn phòng cố định', 'Chỗ ngồi linh hoạt', 'Phòng họp', 'Thành lập DN'] },
    { entity: 'deal', key: 'branch', label: 'Chi nhánh', type: 'select', options: ['Quận 1', 'Quận 3', 'Gò Vấp', 'Tân Bình'] },
    { entity: 'deal', key: 'contract_months', label: 'Số tháng hợp đồng', type: 'number' },
    { entity: 'deal', key: 'vpa_address', label: 'Địa chỉ VPA', type: 'text' },
    { entity: 'contact', key: 'contact_channel', label: 'Kênh liên hệ', type: 'select', options: ['ZaloOA', 'Hotline', 'Google', 'Facebook', 'Website', 'Môi giới'] },
    { entity: 'contact', key: 'contact_count', label: 'Số lần liên hệ', type: 'number' },
    { entity: 'contact', key: 'business_need', label: 'Nhu cầu', type: 'text' },
    { entity: 'company', key: 'tax_code', label: 'Mã số thuế', type: 'text' },
    { entity: 'company', key: 'legal_rep', label: 'Người đại diện pháp luật', type: 'text' },
  ],

  automations: [
    {
      name: 'Nhắc follow-up sau 3 ngày không có activity',
      trigger: 'deal.created',
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Follow-up lead mới', daysFromNow: 3 },
    },
    {
      name: 'Tạo task ký hợp đồng khi chốt hẹn',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'closing'",
      action: 'create_activity',
      actionConfig: { type: 'meeting', subject: 'Hẹn ký hợp đồng', daysFromNow: 0 },
    },
  ],

  suggestedModules: ['crm', 'contracts', 'invoices', 'reports'],
  demoData: true,

  navConfig: {
    sidebar: [
      { id: 'dashboard',  label: 'Dashboard',    href: '/dashboard',  icon: 'LayoutDashboard', roles: ['admin', 'member', 'viewer'] },
      { id: 'contacts',   label: 'Khách hàng',   href: '/contacts',   icon: 'Users',           roles: ['admin', 'member'] },
      { id: 'deals',      label: 'Cơ hội',       href: '/deals',      icon: 'Building2',       roles: ['admin', 'member'] },
      { id: 'import',     label: 'Import',       href: '/import',     icon: 'Upload',          roles: ['admin', 'member'] },
    ],
    bottomItems: [
      { id: 'plugins',    label: 'Plugins',      href: '/settings/plugins', icon: 'Package',         roles: ['admin'] },
      { id: 'settings',   label: 'Cài đặt',      href: '/settings',   icon: 'Settings',        roles: ['admin'] },
    ],
    dashboardLayout: {
      rows: [
        { colSpan: 6,  widgetId: 'active-contracts' },
        { colSpan: 6,  widgetId: 'occupancy-rate' },
        { colSpan: 8,  widgetId: 'pipeline-summary' },
        { colSpan: 4,  widgetId: 'tasks-due-today' },
        { colSpan: 12, widgetId: 'recent-activity' },
      ],
    },
  },

  themeDefaults: {
    '--color-primary':       '#1d4ed8',
    '--color-primary-hover': '#1e40af',
    '--color-primary-light': '#dbeafe',
    '--color-primary-muted': '#1e3a8a',
  },

  version: '1.0.0',
  author: 'izhubs',
};

export default coworkingTemplate;
