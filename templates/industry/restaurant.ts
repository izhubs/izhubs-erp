import type { IndustryTemplate } from '../engine/template.schema';

const restaurantTemplate: IndustryTemplate = {
  id: 'restaurant',
  name: 'Nhà hàng / F&B',
  description: 'Quản lý đặt bàn, khách hàng thân thiết và phản hồi cho nhà hàng, quán cafe, F&B.',
  icon: '🍽️',
  category: 'hospitality',
  tags: ['restaurant', 'cafe', 'fnb', 'food', 'hospitality'],

  pipelineStages: [
    { key: 'inquiry', label: 'Hỏi thông tin', color: '#94a3b8' },
    { key: 'reservation', label: 'Đã đặt bàn', color: '#60a5fa' },
    { key: 'confirmed', label: 'Xác nhận', color: '#a78bfa' },
    { key: 'seated', label: 'Đang ngồi', color: '#f59e0b' },
    { key: 'completed', label: 'Hoàn thành', color: '#22c55e' },
    { key: 'cancelled', label: 'Huỷ', color: '#ef4444' },
  ],

  customFields: [
    { entity: 'deal', key: 'table_count', label: 'Số bàn', type: 'number' },
    { entity: 'deal', key: 'guest_count', label: 'Số khách', type: 'number' },
    { entity: 'deal', key: 'reservation_date', label: 'Ngày đặt bàn', type: 'date' },
    { entity: 'deal', key: 'special_request', label: 'Yêu cầu đặc biệt', type: 'text' },
    { entity: 'deal', key: 'occasion', label: 'Dịp', type: 'select', options: ['Sinh nhật', 'Kỷ niệm', 'Hội họp', 'Hẹn hò', 'Gia đình', 'Khác'] },
    { entity: 'contact', key: 'visit_count', label: 'Số lần ghé thăm', type: 'number' },
    { entity: 'contact', key: 'preferred_table', label: 'Bàn yêu thích', type: 'text' },
    { entity: 'contact', key: 'dietary_notes', label: 'Ghi chú ăn uống', type: 'text' },
  ],

  automations: [
    {
      name: 'Nhắc xác nhận đặt bàn trước 1 ngày',
      trigger: 'deal.created',
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Gọi xác nhận đặt bàn', daysFromNow: -1 },
    },
    {
      name: 'Gửi cảm ơn sau khi hoàn thành',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'completed'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Gửi lời cảm ơn + xin đánh giá', daysFromNow: 1 },
    },
  ],

  suggestedModules: ['crm', 'reports'],
  demoData: true,

  // Common niche variants — human-written
  subTemplates: [
    {
      id: 'restaurant-fine-dining',
      label: 'Fine Dining / Nhà hàng cao cấp',
      description: 'Quy trình quản lý chặt chẽ hơn: dress code, chef\'s table, sommelier notes.',
      icon: '🥂',
      overrides: {
        pipelineStages: [
          { key: 'inquiry', label: 'Yêu cầu đặt bàn', color: '#94a3b8' },
          { key: 'waitlist', label: 'Danh sách chờ', color: '#cbd5e1' },
          { key: 'confirmed', label: 'Xác nhận', color: '#60a5fa' },
          { key: 'pre_arrival', label: 'Chuẩn bị đón', color: '#a78bfa' },
          { key: 'seated', label: 'Đang dùng bữa', color: '#f59e0b' },
          { key: 'completed', label: 'Hoàn thành', color: '#22c55e' },
          { key: 'vip_followup', label: 'Chăm sóc VIP', color: '#f97316' },
        ],
        customFields: [
          { entity: 'deal', key: 'dress_code_noted', label: 'Đã thông báo dress code', type: 'boolean' },
          { entity: 'deal', key: 'wine_preference', label: 'Sở thích rượu vang', type: 'text' },
          { entity: 'deal', key: 'chef_table', label: 'Chef\'s table', type: 'boolean' },
          { entity: 'contact', key: 'vip_tier', label: 'Hạng VIP', type: 'select', options: ['Regular', 'Silver', 'Gold', 'Platinum'] },
          { entity: 'contact', key: 'allergy_notes', label: 'Dị ứng thực phẩm', type: 'text' },
        ],
      },
    },
    {
      id: 'restaurant-street-food',
      label: 'Quán ăn bình dân / Street Food',
      description: 'Đơn giản hóa quy trình, tập trung vào lượt khách và tốc độ phục vụ.',
      icon: '🍜',
      overrides: {
        pipelineStages: [
          { key: 'walk_in', label: 'Khách vào', color: '#94a3b8' },
          { key: 'ordering', label: 'Đang gọi món', color: '#60a5fa' },
          { key: 'serving', label: 'Đang phục vụ', color: '#f59e0b' },
          { key: 'completed', label: 'Thanh toán', color: '#22c55e' },
        ],
        customFields: [
          { entity: 'contact', key: 'regular_order', label: 'Món thường gọi', type: 'text' },
          { entity: 'contact', key: 'visit_frequency', label: 'Tần suất ghé', type: 'select', options: ['Hàng ngày', 'Hàng tuần', 'Thỉnh thoảng'] },
        ],
      },
    },
    {
      id: 'restaurant-cafe',
      label: 'Cafe / Coffee Shop',
      description: 'Quản lý khách hàng thân thiết, loyalty program và không gian làm việc.',
      icon: '☕',
      overrides: {
        customFields: [
          { entity: 'contact', key: 'loyalty_points', label: 'Điểm tích lũy', type: 'number' },
          { entity: 'contact', key: 'favorite_drink', label: 'Đồ uống yêu thích', type: 'text' },
          { entity: 'deal', key: 'seat_type', label: 'Loại chỗ ngồi', type: 'select', options: ['Bàn thường', 'Góc yên tĩnh', 'Bàn đứng', 'Sofa', 'Ngoài trời'] },
          { entity: 'contact', key: 'workspace_member', label: 'Thành viên workspace', type: 'boolean' },
        ],
      },
    },
  ],

  // AI prompt for hyper-niche customization
  // When user describes: "Nhà hàng Ấn Độ cao cấp, 2 CS, chuyên tiệc cưới"
  // AI uses this prompt to generate a fully custom sub-template
  aiPrompt: `You are an expert business consultant helping configure a CRM/ERP system for a food & beverage business.

User description: {userDescription}
Industry: {industry}
Sub-category: {subCategory}
Location: {location}

Generate a custom template configuration that includes:
1. 5-8 pipeline stages specific to their exact business workflow
2. 4-8 custom fields that matter most for this specific niche
3. 2-3 automations that save time for this type of business

Consider cuisine type, price point, service style, and customer expectations.
Return as a valid SubTemplate override object.`,

  version: '1.0.0',
  author: 'izhubs',
};

export default restaurantTemplate;
