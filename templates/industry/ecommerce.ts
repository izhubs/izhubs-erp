import type { IndustryTemplate } from '../engine/template.schema';

const ecommerceTemplate: IndustryTemplate = {
  id: 'ecommerce',
  name: 'Bán hàng Online / E-commerce',
  description: 'Quản lý đơn hàng, khách hàng và chăm sóc sau bán cho shop online, dropshipping, và D2C brand.',
  icon: '🛒',
  category: 'retail',
  tags: ['ecommerce', 'shop', 'online-store', 'dropshipping', 'd2c', 'retail'],

  pipelineStages: [
    { key: 'new_order', label: 'Đơn mới', color: '#60a5fa' },
    { key: 'confirmed', label: 'Xác nhận', color: '#a78bfa' },
    { key: 'processing', label: 'Đang xử lý', color: '#f59e0b' },
    { key: 'shipped', label: 'Đã giao vận', color: '#f97316' },
    { key: 'delivered', label: 'Giao thành công', color: '#22c55e' },
    { key: 'returned', label: 'Hoàn hàng', color: '#ef4444' },
    { key: 'refunded', label: 'Đã hoàn tiền', color: '#94a3b8' },
  ],

  customFields: [
    { entity: 'deal', key: 'order_id', label: 'Mã đơn hàng', type: 'text' },
    { entity: 'deal', key: 'shipping_carrier', label: 'Đơn vị vận chuyển', type: 'select', options: ['GHN', 'GHTK', 'J&T', 'Viettel Post', 'Ninja Van', 'Khác'] },
    { entity: 'deal', key: 'tracking_code', label: 'Mã vận đơn', type: 'text' },
    { entity: 'deal', key: 'source_channel', label: 'Kênh bán', type: 'select', options: ['Shopee', 'Lazada', 'TikTok Shop', 'Website', 'Facebook', 'Zalo', 'Khác'] },
    { entity: 'deal', key: 'product_sku', label: 'SKU sản phẩm', type: 'text' },
    { entity: 'contact', key: 'order_count', label: 'Tổng đơn hàng', type: 'number' },
    { entity: 'contact', key: 'total_spent', label: 'Tổng chi tiêu (VND)', type: 'number' },
    { entity: 'contact', key: 'customer_tier', label: 'Hạng khách hàng', type: 'select', options: ['New', 'Regular', 'VIP', 'Wholesale'] },
  ],

  automations: [
    {
      name: 'Xác nhận đơn hàng ngay khi tạo',
      trigger: 'deal.created',
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Xác nhận đơn hàng với khách', daysFromNow: 0 },
    },
    {
      name: 'Follow-up sau giao hàng thành công',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'delivered'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Hỏi phản hồi + upsell', daysFromNow: 3 },
    },
  ],

  suggestedModules: ['crm', 'reports'],
  demoData: true,

  navConfig: {
    sidebar: [
      { id: 'dashboard',  label: 'Dashboard',    href: '/dashboard',  icon: 'LayoutDashboard', roles: ['admin', 'member', 'viewer'] },
      { id: 'contacts',   label: 'Khách mua',    href: '/contacts',   icon: 'Users',           roles: ['admin', 'member'] },
      { id: 'deals',      label: 'Đơn hàng',     href: '/deals',      icon: 'ShoppingCart',    roles: ['admin', 'member'] },
      { id: 'import',     label: 'Import',       href: '/import',     icon: 'Upload',          roles: ['admin', 'member'] },
    ],
    bottomItems: [
      { id: 'settings',   label: 'Cài đặt',      href: '/settings',   icon: 'Settings',        roles: ['admin'] },
    ],
    dashboardLayout: {
      rows: [
        { colSpan: 4,  widgetId: 'orders-today' },
        { colSpan: 4,  widgetId: 'revenue-today' },
        { colSpan: 4,  widgetId: 'pending-shipments' },
        { colSpan: 8,  widgetId: 'pipeline-summary' },
        { colSpan: 4,  widgetId: 'top-customers' },
      ],
    },
  },

  themeDefaults: {
    '--color-primary':       '#f97316',
    '--color-primary-hover': '#ea580c',
    '--color-primary-light': '#ffedd5',
    '--color-primary-muted': '#7c2d12',
  },

  version: '1.0.0',
  author: 'izhubs',
};

export default ecommerceTemplate;
