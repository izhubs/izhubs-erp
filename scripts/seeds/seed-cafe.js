// =============================================================
// izhubs ERP — Cafe / Coffee Shop Seed Data
// Pipeline: inquiry → reservation → confirmed → seated → completed / cancelled
// Focus: loyalty program, regulars, workspace members
// =============================================================

module.exports = {
  industry: 'Cafe / Coffee Shop',

  adminUser: {
    name: 'Cafe Demo',
    email: 'demo@izhubs.com',
    password: 'Demo@12345',
    role: 'admin',
  },

  customFields: [
    { entity: 'contact', key: 'loyalty_points', label: 'Loyalty Points', type: 'number' },
    { entity: 'contact', key: 'favorite_drink', label: 'Favorite Drink', type: 'text' },
    { entity: 'contact', key: 'workspace_member', label: 'Workspace Member', type: 'boolean' },
    { entity: 'contact', key: 'visit_frequency', label: 'Visit Frequency', type: 'select', options: ['Daily', '3-4x per week', 'Weekly', '2-3x per month', 'Occasionally'] },
    { entity: 'deal', key: 'seat_type', label: 'Seat Type', type: 'select', options: ['Regular Table', 'Quiet Corner', 'Standing Desk', 'Sofa', 'Outdoor', 'Private Room'] },
    { entity: 'deal', key: 'order_value', label: 'Order Value (USD)', type: 'number' },
    { entity: 'deal', key: 'booking_purpose', label: 'Purpose', type: 'select', options: ['Remote Work', 'Client Meeting', 'Group Study', 'Birthday', 'Date', 'Relaxation', 'Video Call'] },
  ],

  contacts: [
    { name: 'Alex Turner', email: 'alex@freelance.io', phone: '+12025550401', title: 'Freelancer', custom_fields: { loyalty_points: 420, favorite_drink: 'Espresso with oat milk', workspace_member: true, visit_frequency: 'Daily' } },
    { name: 'Bella Scott', email: 'bella@designer.io', phone: '+14155550402', title: 'UX Designer', custom_fields: { loyalty_points: 280, favorite_drink: 'Matcha latte', workspace_member: true, visit_frequency: '3-4x per week' } },
    { name: 'Charlie Reed', email: 'charlie@student.edu', phone: '+13105550403', title: 'Student', custom_fields: { loyalty_points: 95, favorite_drink: 'Cold brew', workspace_member: false, visit_frequency: 'Weekly' } },
    { name: 'Diana Foster', email: 'diana@marketing.com', phone: '+16505550404', title: 'Marketing Exec', custom_fields: { loyalty_points: 340, favorite_drink: 'Oat milk cappuccino', workspace_member: true, visit_frequency: '3-4x per week' } },
    { name: 'Ethan Park', email: 'ethan@startup.io', phone: '+17185550405', title: 'Startup Founder', custom_fields: { loyalty_points: 180, favorite_drink: 'Iced Americano', workspace_member: false, visit_frequency: '2-3x per month' } },
    { name: 'Fiona Chen', email: 'fiona@content.io', phone: '+12125550406', title: 'Content Creator', custom_fields: { loyalty_points: 520, favorite_drink: 'Flat white', workspace_member: true, visit_frequency: 'Daily' } },
    { name: 'George Kim', email: 'george@dev.io', phone: '+16175550407', title: 'Developer', custom_fields: { loyalty_points: 650, favorite_drink: 'Strong cold brew', workspace_member: true, visit_frequency: 'Daily' } },
    { name: 'Hannah White', email: 'hannah@teacher.edu', phone: '+13055550408', title: 'Teacher', custom_fields: { loyalty_points: 120, favorite_drink: 'Peach iced tea', workspace_member: false, visit_frequency: 'Weekly' } },
    { name: 'Ivan Lopez', email: 'ivan@hr.com', phone: '+14085550409', title: 'HR Manager', custom_fields: { loyalty_points: 210, favorite_drink: 'Hot latte', workspace_member: false, visit_frequency: '2-3x per month' } },
    { name: 'Julia Nguyen', email: 'julia@agency.com', phone: '+15125550410', title: 'Creative Director', custom_fields: { loyalty_points: 390, favorite_drink: 'Flat white', workspace_member: true, visit_frequency: '3-4x per week' } },
    { name: 'Kevin Morris', email: 'kevin@accountant.com', phone: '+17025550411', title: 'Accountant', custom_fields: { loyalty_points: 75, favorite_drink: 'Blended matcha', workspace_member: false, visit_frequency: 'Occasionally' } },
    { name: 'Laura Adams', email: 'laura@writer.io', phone: '+14255550412', title: 'Freelance Writer', custom_fields: { loyalty_points: 480, favorite_drink: 'Black coffee', workspace_member: true, visit_frequency: 'Daily' } },
    { name: 'Max Taylor', email: 'max@photo.com', phone: '+12145550413', title: 'Photographer', custom_fields: { loyalty_points: 160, favorite_drink: 'Caramel macchiato', workspace_member: false, visit_frequency: '2-3x per month' } },
    { name: 'Nina Brown', email: 'nina@fintech.io', phone: '+14693550414', title: 'Product Manager', custom_fields: { loyalty_points: 295, favorite_drink: 'Espresso + sparkling water', workspace_member: true, visit_frequency: '3-4x per week' } },
    { name: 'Oscar Davis', email: 'oscar@coach.io', phone: '+16193550415', title: 'Life Coach', custom_fields: { loyalty_points: 230, favorite_drink: 'Oolong tea latte', workspace_member: false, visit_frequency: '2-3x per month' } },
  ],

  deals: [
    { name: 'Alex Turner — Workspace Day Pass', value: 12, stage: 'inquiry', contactIdx: 0, custom_fields: { seat_type: 'Quiet Corner', booking_purpose: 'Remote Work', order_value: 8 } },
    { name: 'Bella Scott — Group Meeting x4', value: 36, stage: 'inquiry', contactIdx: 1, custom_fields: { seat_type: 'Private Room', booking_purpose: 'Group Study', order_value: 32 } },
    { name: 'Charlie Reed — Study Session', value: 8, stage: 'reservation', contactIdx: 2, custom_fields: { seat_type: 'Regular Table', booking_purpose: 'Remote Work', order_value: 6 } },
    { name: 'Diana Foster — Client Pitch', value: 25, stage: 'reservation', contactIdx: 3, custom_fields: { seat_type: 'Quiet Corner', booking_purpose: 'Client Meeting', order_value: 19 } },
    { name: 'Ethan Park — Investor Meeting', value: 40, stage: 'confirmed', contactIdx: 4, custom_fields: { seat_type: 'Private Room', booking_purpose: 'Client Meeting', order_value: 35 } },
    { name: 'Fiona Chen — Live Stream Session', value: 18, stage: 'confirmed', contactIdx: 5, custom_fields: { seat_type: 'Sofa', booking_purpose: 'Video Call', order_value: 15 } },
    { name: 'George Kim — All-Day Coding', value: 22, stage: 'seated', contactIdx: 6, custom_fields: { seat_type: 'Quiet Corner', booking_purpose: 'Remote Work', order_value: 18 } },
    { name: 'Hannah White — Weekend Coffee', value: 9, stage: 'seated', contactIdx: 7, custom_fields: { seat_type: 'Outdoor', booking_purpose: 'Relaxation', order_value: 7 } },
    { name: 'Ivan Lopez — Zoom Interview', value: 16, stage: 'completed', contactIdx: 8, closedAt: '2026-03-15', custom_fields: { seat_type: 'Quiet Corner', booking_purpose: 'Video Call', order_value: 13 } },
    { name: 'Julia Nguyen — Agency Brainstorm', value: 48, stage: 'completed', contactIdx: 9, closedAt: '2026-03-14', custom_fields: { seat_type: 'Private Room', booking_purpose: 'Group Study', order_value: 42 } },
    { name: "Kevin Morris — Birthday Catch-up x4", value: 32, stage: 'completed', contactIdx: 10, closedAt: '2026-03-13', custom_fields: { seat_type: 'Sofa', booking_purpose: 'Birthday', order_value: 29 } },
    { name: 'Laura Adams — Writing Session', value: 14, stage: 'completed', contactIdx: 11, closedAt: '2026-03-12', custom_fields: { seat_type: 'Quiet Corner', booking_purpose: 'Remote Work', order_value: 12 } },
    { name: 'Max Taylor — Photo Concept Shoot', value: 20, stage: 'completed', contactIdx: 12, closedAt: '2026-03-11', custom_fields: { seat_type: 'Outdoor', booking_purpose: 'Client Meeting', order_value: 18 } },
    { name: 'Nina Brown — Product Review Call', value: 17, stage: 'completed', contactIdx: 13, closedAt: '2026-03-10', custom_fields: { seat_type: 'Quiet Corner', booking_purpose: 'Video Call', order_value: 15 } },
    { name: 'Oscar Davis — Coaching Date', value: 25, stage: 'completed', contactIdx: 14, closedAt: '2026-03-09', custom_fields: { seat_type: 'Outdoor', booking_purpose: 'Date', order_value: 22 } },
  ],
};
