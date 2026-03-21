import type { IndustryTemplate } from '../engine/template.schema';

const spaTemplate: IndustryTemplate = {
  id: 'spa',
  name: 'Spa & Wellness',
  description: 'Quản lý lịch hẹn, khách hàng thân thiết và dịch vụ chăm sóc sức khỏe cho spa, nail salon, thẩm mỹ viện.',
  icon: '💆',
  category: 'services',
  tags: ['spa', 'wellness', 'beauty', 'nail', 'salon', 'massage'],

  pipelineStages: [
    { key: 'inquiry',   label: 'Hỏi dịch vụ',    color: '#94a3b8' },
    { key: 'booked',    label: 'Đã đặt lịch',     color: '#60a5fa' },
    { key: 'confirmed', label: 'Xác nhận',         color: '#a78bfa' },
    { key: 'arrived',   label: 'Khách đến',        color: '#f59e0b' },
    { key: 'in_service',label: 'Đang phục vụ',     color: '#f97316' },
    { key: 'completed', label: 'Hoàn thành',       color: '#22c55e' },
    { key: 'cancelled', label: 'Huỷ',              color: '#ef4444' },
  ],

  customFields: [
    { entity: 'deal',    key: 'service_type',    label: 'Dịch vụ',          type: 'select', options: ['Massage', 'Facial', 'Nail', 'Hair', 'Body wrap', 'Khác'] },
    { entity: 'deal',    key: 'duration_min',    label: 'Thời gian (phút)', type: 'number' },
    { entity: 'deal',    key: 'therapist_name',  label: 'Nhân viên phục vụ',type: 'text' },
    { entity: 'deal',    key: 'appointment_at',  label: 'Giờ hẹn',          type: 'date' },
    { entity: 'contact', key: 'loyalty_points',  label: 'Điểm tích lũy',    type: 'number' },
    { entity: 'contact', key: 'skin_type',       label: 'Loại da',          type: 'select', options: ['Da dầu', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm'] },
    { entity: 'contact', key: 'allergy_notes',   label: 'Ghi chú dị ứng',  type: 'text' },
    { entity: 'contact', key: 'preferred_therapist', label: 'Nhân viên yêu thích', type: 'text' },
  ],

  automations: [
    {
      name: 'Nhắc xác nhận lịch hẹn 1 ngày trước',
      trigger: 'deal.created',
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Gọi xác nhận lịch hẹn spa', daysFromNow: -1 },
    },
    {
      name: 'Gửi cảm ơn + mời đặt lịch tiếp theo',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'completed'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Gửi lời cảm ơn + ưu đãi lần sau', daysFromNow: 1 },
    },
  ],

  suggestedModules: ['crm', 'reports'],
  demoData: true,

  // Layer 2: Navigation + Dashboard config
  navConfig: {
    sidebar: [
      { id: 'dashboard', label: 'Tổng quan',    href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'member', 'viewer'] },
      { id: 'contacts',  label: 'Khách hàng',   href: '/contacts',  icon: 'Users',           roles: ['admin', 'member'] },
      { id: 'deals',     label: 'Lịch hẹn',     href: '/deals',     icon: 'CalendarHeart',   roles: ['admin', 'member'] },
      { id: 'import',    label: 'Import',       href: '/import',    icon: 'Upload',          roles: ['admin', 'member'] },
    ],
    dashboardLayout: {
      rows: [
        { colSpan: 12, widgetId: 'appointments-today' },
        { colSpan: 6,  widgetId: 'revenue-today' },
        { colSpan: 6,  widgetId: 'new-bookings' },
        { colSpan: 4,  widgetId: 'top-services' },
        { colSpan: 4,  widgetId: 'loyalty-overview' },
        { colSpan: 4,  widgetId: 'upcoming-schedule' },
      ],
    },
  },

  // Layer 1: Default CSS variable overrides (pastel pink for spa)
  themeDefaults: {
    '--color-primary':       '#f472b6',
    '--color-primary-hover': '#ec4899',
    '--color-primary-light': '#fce7f3',
    '--color-primary-muted': '#831843',
  },

  version: '1.0.0',
  author: 'izhubs',
};

export default spaTemplate;
