// =============================================================
// izhubs ERP — Restaurant / F&B Seed Data
// Pipeline: inquiry → reservation → confirmed → seated → completed / cancelled
// Contacts: 15 regular customers | Deals: 15 bookings with occasion + guest count
// =============================================================

module.exports = {
  industry: 'Restaurant / F&B',

  adminUser: {
    name: 'Restaurant Demo',
    email: 'demo@izhubs.com',
    password: 'Demo@12345',
    role: 'admin',
  },

  customFields: [
    { entity: 'deal', key: 'guest_count', label: 'Number of Guests', type: 'number' },
    { entity: 'deal', key: 'table_count', label: 'Number of Tables', type: 'number' },
    { entity: 'deal', key: 'reservation_date', label: 'Reservation Date', type: 'date' },
    { entity: 'deal', key: 'occasion', label: 'Occasion', type: 'select', options: ['Birthday', 'Anniversary', 'Business Meeting', 'Date Night', 'Family Dinner', 'Corporate Event', 'Other'] },
    { entity: 'deal', key: 'special_request', label: 'Special Request', type: 'text' },
    { entity: 'contact', key: 'visit_count', label: 'Total Visits', type: 'number' },
    { entity: 'contact', key: 'dietary_notes', label: 'Dietary Notes', type: 'text' },
    { entity: 'contact', key: 'preferred_table', label: 'Preferred Table', type: 'text' },
  ],

  contacts: [
    { name: 'Alice Hammond', email: 'alice@email.com', phone: '+12025550301', title: 'VIP Guest', custom_fields: { visit_count: 12, dietary_notes: 'No shellfish', preferred_table: 'Table 5 by window' } },
    { name: 'Brian Foster', email: 'brian@company.com', phone: '+14155550302', title: 'Director', custom_fields: { visit_count: 5, dietary_notes: '', preferred_table: 'Private Room A' } },
    { name: 'Claire Stevens', email: 'claire@personal.com', phone: '+13105550303', title: 'Guest', custom_fields: { visit_count: 2, dietary_notes: 'Vegetarian' } },
    { name: 'Daniel Grant', email: 'daniel@business.com', phone: '+16505550304', title: 'CEO', custom_fields: { visit_count: 8, dietary_notes: 'Peanut allergy', preferred_table: 'Corner Booth' } },
    { name: 'Eleanor Price', email: 'eleanor@gmail.com', phone: '+17185550305', title: 'Guest', custom_fields: { visit_count: 1 } },
    { name: 'Frank Hughes', email: 'frank@corp.com', phone: '+12125550306', title: 'Sales Director', custom_fields: { visit_count: 15, preferred_table: 'Private Room B', dietary_notes: '' } },
    { name: 'Grace Turner', email: 'grace@personal.com', phone: '+16175550307', title: 'Housewife', custom_fields: { visit_count: 3, dietary_notes: 'No red meat' } },
    { name: 'Harry Bennett', email: 'harry@startup.io', phone: '+13055550308', title: 'Founder', custom_fields: { visit_count: 6, dietary_notes: '' } },
    { name: 'Iris Campbell', email: 'iris@media.com', phone: '+14085550309', title: 'Marketing Manager', custom_fields: { visit_count: 4 } },
    { name: 'James Edwards', email: 'james@import.com', phone: '+15125550310', title: 'Business Owner', custom_fields: { visit_count: 9, preferred_table: 'Table 10 (large)' } },
    { name: 'Katherine Hall', email: 'katherine@international.com', phone: '+17025550311', title: 'International Guest', custom_fields: { visit_count: 2, dietary_notes: 'Spicy food preferred' } },
    { name: 'Liam Evans', email: 'liam@teacher.edu', phone: '+14255550312', title: 'Teacher', custom_fields: { visit_count: 7, dietary_notes: 'No onions' } },
    { name: 'Mia Collins', email: 'mia@law.com', phone: '+12145550313', title: 'Lawyer', custom_fields: { visit_count: 11, preferred_table: 'Small Meeting Table' } },
    { name: 'Nathaniel Ward', email: 'nat@gmail.com', phone: '+14693550314', title: 'Guest', custom_fields: { visit_count: 1 } },
    { name: 'Olivia Brooks', email: 'olivia@realestate.com', phone: '+16193550315', title: 'Director', custom_fields: { visit_count: 20, preferred_table: 'Table 1 - Terrace', dietary_notes: '' } },
  ],

  deals: [
    { name: "Alice's Birthday Dinner", value: 250, stage: 'inquiry', contactIdx: 0, custom_fields: { guest_count: 6, table_count: 1, reservation_date: '2026-03-20', occasion: 'Birthday', special_request: 'Custom cake + floral decoration' } },
    { name: 'Brian Corporate Lunch 20 pax', value: 800, stage: 'inquiry', contactIdx: 1, custom_fields: { guest_count: 20, table_count: 4, reservation_date: '2026-03-22', occasion: 'Business Meeting' } },
    { name: 'Claire Family Brunch', value: 180, stage: 'reservation', contactIdx: 2, custom_fields: { guest_count: 8, table_count: 2, reservation_date: '2026-03-23', occasion: 'Family Dinner' } },
    { name: 'Daniel Company Party 30 pax', value: 1500, stage: 'reservation', contactIdx: 3, custom_fields: { guest_count: 30, table_count: 6, reservation_date: '2026-03-25', occasion: 'Corporate Event', special_request: 'Projector + PA system setup' } },
    { name: "Eleanor's First Date Night", value: 60, stage: 'confirmed', contactIdx: 4, custom_fields: { guest_count: 2, table_count: 1, reservation_date: '2026-03-21', occasion: 'Date Night' } },
    { name: 'Frank Strategic Partner Dinner', value: 500, stage: 'confirmed', contactIdx: 5, custom_fields: { guest_count: 10, table_count: 2, reservation_date: '2026-03-24', occasion: 'Business Meeting', special_request: 'Private room required' } },
    { name: "Grace's 5th Anniversary", value: 120, stage: 'seated', contactIdx: 6, custom_fields: { guest_count: 4, table_count: 1, occasion: 'Anniversary', reservation_date: '2026-03-16' } },
    { name: 'Harry Team Building Dinner', value: 600, stage: 'seated', contactIdx: 7, custom_fields: { guest_count: 15, table_count: 3, occasion: 'Corporate Event', reservation_date: '2026-03-16' } },
    { name: 'Iris Media Team Lunch', value: 90, stage: 'completed', contactIdx: 8, closedAt: '2026-03-15', custom_fields: { guest_count: 5, table_count: 1, occasion: 'Business Meeting' } },
    { name: "James's Son Birthday Party", value: 350, stage: 'completed', contactIdx: 9, closedAt: '2026-03-14', custom_fields: { guest_count: 12, table_count: 2, occasion: 'Birthday', special_request: 'Live musician' } },
    { name: 'Katherine International Business Dinner', value: 420, stage: 'completed', contactIdx: 10, closedAt: '2026-03-13', custom_fields: { guest_count: 6, table_count: 1, occasion: 'Business Meeting' } },
    { name: 'Liam Family Weekend Dinner', value: 80, stage: 'completed', contactIdx: 11, closedAt: '2026-03-10', custom_fields: { guest_count: 3, table_count: 1, occasion: 'Family Dinner' } },
    { name: 'Mia Contract Signing Dinner', value: 700, stage: 'completed', contactIdx: 12, closedAt: '2026-03-08', custom_fields: { guest_count: 8, table_count: 1, occasion: 'Business Meeting', special_request: 'Private room + projector' } },
    { name: "Nathaniel's Cancelled Reservation", value: 0, stage: 'cancelled', contactIdx: 13, closedAt: '2026-03-12', custom_fields: { guest_count: 2, occasion: 'Date Night', special_request: 'Cancelled — last minute' } },
    { name: "Olivia's 20th Anniversary Party", value: 1200, stage: 'completed', contactIdx: 14, closedAt: '2026-03-07', custom_fields: { guest_count: 25, table_count: 5, occasion: 'Anniversary', special_request: 'VIP setup + champagne tower' } },
  ],
};
