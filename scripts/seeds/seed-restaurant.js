// =============================================================
// izhubs ERP — Restaurant / F&B Seed Data v2
// 30 contacts, 30 bookings spanning 2024-2026
// Users: CEO, Ops (Floor Manager), Sales (Events), 1 inactive
// Pipeline: inquiry → reservation → confirmed → seated → completed / cancelled
// =============================================================

module.exports = {
  industry: 'Restaurant / F&B',

  users: [
    { name: 'Marco Chef (CEO)',        email: 'demo_restaurant_ceo@izhubs.com',  password: 'Demo@12345', role: 'admin',  active: true },
    { name: 'Lucy Hall (Ops/Floor)',   email: 'demo_restaurant_ops@izhubs.com',  password: 'Demo@12345', role: 'member', active: true },
    { name: 'Tom Events (Sales)',      email: 'demo_restaurant_sale@izhubs.com', password: 'Demo@12345', role: 'member', active: true },
    { name: 'Dana Former (Resigned)', email: 'dana.former@izhubs-demo.com',     password: 'Demo@12345', role: 'member', active: false },
  ],

  customFields: [
    { entity: 'deal', key: 'guest_count',        label: 'Number of Guests',     type: 'number' },
    { entity: 'deal', key: 'table_count',         label: 'Number of Tables',     type: 'number' },
    { entity: 'deal', key: 'reservation_date',    label: 'Reservation Date',     type: 'date' },
    { entity: 'deal', key: 'occasion',            label: 'Occasion',             type: 'select', options: ['Birthday', 'Anniversary', 'Business Meeting', 'Date Night', 'Family Dinner', 'Corporate Event', 'Wedding', 'Graduation', 'Other'] },
    { entity: 'deal', key: 'special_request',     label: 'Special Request',      type: 'text' },
    { entity: 'deal', key: 'deposit_paid',        label: 'Deposit Paid',         type: 'boolean' },
    { entity: 'contact', key: 'visit_count',      label: 'Total Visits',         type: 'number' },
    { entity: 'contact', key: 'dietary_notes',    label: 'Dietary Notes',        type: 'text' },
    { entity: 'contact', key: 'preferred_table',  label: 'Preferred Table',      type: 'text' },
    { entity: 'contact', key: 'loyalty_tier',     label: 'Loyalty Tier',         type: 'select', options: ['Bronze', 'Silver', 'Gold', 'VIP'] },
  ],

  contacts: [
    { name: 'Alice Hammond',       email: 'alice@email.com',           phone: '+12025550401', title: 'VIP Guest',        status: 'customer', custom_fields: { visit_count: 24, dietary_notes: 'No shellfish', preferred_table: 'Table 5 by window', loyalty_tier: 'VIP' } },
    { name: 'Brian Foster',        email: 'brian@company.com',         phone: '+14155550402', title: 'Director',         status: 'customer', custom_fields: { visit_count: 12, dietary_notes: '', preferred_table: 'Private Room A', loyalty_tier: 'Gold' } },
    { name: 'Claire Stevens',      email: 'claire@personal.com',       phone: '+13105550403', title: 'Guest',            status: 'customer', custom_fields: { visit_count: 8,  dietary_notes: 'Vegetarian', loyalty_tier: 'Silver' } },
    { name: 'Daniel Grant',        email: 'daniel@business.com',       phone: '+16505550404', title: 'CEO',              status: 'customer', custom_fields: { visit_count: 18, dietary_notes: 'Peanut allergy', preferred_table: 'Corner Booth', loyalty_tier: 'VIP' } },
    { name: 'Eleanor Price',       email: 'eleanor@gmail.com',         phone: '+17185550405', title: 'Guest',            status: 'customer', custom_fields: { visit_count: 5,  loyalty_tier: 'Bronze' } },
    { name: 'Frank Hughes',        email: 'frank@corp.com',            phone: '+12125550406', title: 'Sales Director',   status: 'customer', custom_fields: { visit_count: 22, preferred_table: 'Private Room B', dietary_notes: '', loyalty_tier: 'VIP' } },
    { name: 'Grace Turner',        email: 'grace@personal.com',        phone: '+16175550407', title: 'Housewife',        status: 'customer', custom_fields: { visit_count: 7,  dietary_notes: 'No red meat', loyalty_tier: 'Silver' } },
    { name: 'Harry Bennett',       email: 'harry@startup.io',          phone: '+13055550408', title: 'Founder',          status: 'customer', custom_fields: { visit_count: 15, dietary_notes: '', loyalty_tier: 'Gold' } },
    { name: 'Iris Campbell',       email: 'iris@media.com',            phone: '+14085550409', title: 'Marketing Manager',status: 'customer', custom_fields: { visit_count: 9,  loyalty_tier: 'Silver' } },
    { name: 'James Edwards',       email: 'james@import.com',          phone: '+15125550410', title: 'Business Owner',   status: 'customer', custom_fields: { visit_count: 20, preferred_table: 'Table 10 (large)', loyalty_tier: 'Gold' } },
    { name: 'Katherine Hall',      email: 'katherine@international.com',phone:'+17025550411', title: 'International Guest',status:'customer', custom_fields: { visit_count: 4,  dietary_notes: 'Spicy food preferred', loyalty_tier: 'Bronze' } },
    { name: 'Liam Evans',          email: 'liam@teacher.edu',          phone: '+14255550412', title: 'Teacher',          status: 'customer', custom_fields: { visit_count: 11, dietary_notes: 'No onions', loyalty_tier: 'Silver' } },
    { name: 'Mia Collins',         email: 'mia@law.com',               phone: '+12145550413', title: 'Lawyer',           status: 'customer', custom_fields: { visit_count: 16, preferred_table: 'Small Meeting Table', loyalty_tier: 'Gold' } },
    { name: 'Nathaniel Ward',      email: 'nat@gmail.com',             phone: '+14693550414', title: 'Guest',            status: 'lead',     custom_fields: { visit_count: 2,  loyalty_tier: 'Bronze' } },
    { name: 'Olivia Brooks',       email: 'olivia@realestate.com',     phone: '+16193550415', title: 'Director',         status: 'customer', custom_fields: { visit_count: 30, preferred_table: 'Table 1 - Terrace', dietary_notes: '', loyalty_tier: 'VIP' } },
    { name: 'Peter Long',          email: 'peter@longlaw.com',         phone: '+17143550416', title: 'Lawyer',           status: 'customer', custom_fields: { visit_count: 6,  loyalty_tier: 'Silver' } },
    { name: 'Quin Adams',          email: 'quin@startupqa.io',         phone: '+16463550417', title: 'Co-Founder',       status: 'prospect', custom_fields: { visit_count: 1,  loyalty_tier: 'Bronze' } },
    { name: 'Rebecca Morris',      email: 'rebecca@retailco.com',      phone: '+15593550418', title: 'Operations Mgr',   status: 'prospect', custom_fields: { visit_count: 3,  loyalty_tier: 'Bronze' } },
    { name: 'Steve Park',          email: 'steve@technology.io',       phone: '+18163550419', title: 'CTO',              status: 'lead',     custom_fields: { visit_count: 0 } },
    { name: 'Tracy Bell',          email: 'tracy@wellness.com',        phone: '+12023550420', title: 'Wellness Dir',     status: 'lead',     custom_fields: { visit_count: 0 } },
    { name: 'Uma Singh',           email: 'uma@catering.co',           phone: '+14153550421', title: 'Catering Head',    status: 'churned',  custom_fields: { visit_count: 1,  dietary_notes: 'Vegan', loyalty_tier: 'Bronze' } },
    { name: 'Victor Pan',          email: 'victor@foodbiz.com',        phone: '+13103550422', title: 'Restaurant Owner', status: 'churned',  custom_fields: { visit_count: 2 } },
    { name: 'Wendy Cross',         email: 'wendy@events.co',           phone: '+16503550423', title: 'Event Planner',    status: 'customer', custom_fields: { visit_count: 40, preferred_table: 'Banquet Hall', loyalty_tier: 'VIP' } },
    { name: 'Xavier Dunn',         email: 'xavier@finance.com',        phone: '+17183550424', title: 'CFO',              status: 'customer', custom_fields: { visit_count: 8,  loyalty_tier: 'Silver' } },
    { name: 'Yvonne Chen',         email: 'yvonne@media.hk',           phone: '+85222551025', title: 'Media Producer',   status: 'prospect', custom_fields: { visit_count: 1 } },
    { name: 'Zachary Moon',        email: 'zachary@techny.com',        phone: '+12123550426', title: 'Product Manager',  status: 'lead',     custom_fields: { visit_count: 0 } },
    { name: 'Anna White',          email: 'anna@ngocorp.com',          phone: '+16173550427', title: 'Executive',        status: 'customer', custom_fields: { visit_count: 13, dietary_notes: 'Gluten free', loyalty_tier: 'Gold' } },
    { name: 'Ben Xu',              email: 'benxu@import.cn',           phone: '+8620551428',  title: 'Trade Manager',    status: 'lead',     custom_fields: { visit_count: 0 } },
    { name: 'Carla Diaz',          email: 'carla@latinofood.mx',       phone: '+525512551029',title: 'Owner',            status: 'prospect', custom_fields: { visit_count: 2 } },
    { name: 'Derek Stone',         email: 'derek@eventstone.com',      phone: '+18163550430', title: 'Event Director',   status: 'customer', custom_fields: { visit_count: 25, preferred_table: 'VIP Lounge', loyalty_tier: 'VIP' } },
  ],

  deals: [
    // 2024 Historical
    { name: "Alice's 2024 Birthday Gala",       value: 1800,  stage: 'completed', contactIdx: 0,  closedAt: '2024-01-20', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 20, table_count: 4, reservation_date: '2024-01-20', occasion: 'Birthday', special_request: 'Live band + custom cake', deposit_paid: true } },
    { name: 'Brian Q1 Corporate Lunch',          value: 2400,  stage: 'completed', contactIdx: 1,  closedAt: '2024-02-14', ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 30, table_count: 6, reservation_date: '2024-02-14', occasion: 'Corporate Event', deposit_paid: true } },
    { name: "Daniel's Company Anniversary 2024", value: 4500,  stage: 'completed', contactIdx: 3,  closedAt: '2024-03-25', ownerEmail: 'demo_restaurant_ceo@izhubs.com',  custom_fields: { guest_count: 50, table_count: 10, reservation_date: '2024-03-25', occasion: 'Corporate Event', special_request: 'Projector + PA + branded signage', deposit_paid: true } },
    { name: 'Frank Partner Dinner March 2024',   value: 1200,  stage: 'completed', contactIdx: 5,  closedAt: '2024-03-31', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 12, table_count: 2, reservation_date: '2024-03-31', occasion: 'Business Meeting', deposit_paid: true } },
    { name: 'Wendy Corporate Gala 2024',         value: 8000,  stage: 'completed', contactIdx: 22, closedAt: '2024-04-15', ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 80, table_count: 16, reservation_date: '2024-04-15', occasion: 'Corporate Event', special_request: 'Full event setup + catering', deposit_paid: true } },
    { name: "Uma Singh Vegan Lunch — Cancelled", value: 0,     stage: 'cancelled', contactIdx: 20, closedAt: '2024-05-10', ownerEmail: 'dana.former@izhubs-demo.com',     custom_fields: { guest_count: 5, reservation_date: '2024-05-10', occasion: 'Other', special_request: 'Vegan only menu' } },
    { name: "Victor Pan Peer Dinner — No Show",  value: 0,     stage: 'cancelled', contactIdx: 21, closedAt: '2024-06-01', ownerEmail: 'dana.former@izhubs-demo.com',     custom_fields: { guest_count: 4, reservation_date: '2024-06-01', occasion: 'Business Meeting' } },
    { name: "Olivia's VIP Terrace 2024",         value: 3600,  stage: 'completed', contactIdx: 14, closedAt: '2024-06-30', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 30, table_count: 5, reservation_date: '2024-06-30', occasion: 'Anniversary', deposit_paid: true } },
    { name: 'Harry Startup Team Dinner 2024',    value: 1800,  stage: 'completed', contactIdx: 7,  closedAt: '2024-07-20', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 18, table_count: 4, reservation_date: '2024-07-20', occasion: 'Corporate Event', deposit_paid: true } },
    { name: 'Derek Stone Awards Night 2024',     value: 12000, stage: 'completed', contactIdx: 29, closedAt: '2024-08-10', ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 100, table_count: 20, reservation_date: '2024-08-10', occasion: 'Corporate Event', special_request: 'Awards ceremony + gala dinner', deposit_paid: true } },
    { name: "Grace's 10th Anniversary 2024",     value: 450,   stage: 'completed', contactIdx: 6,  closedAt: '2024-09-15', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 6, table_count: 1, reservation_date: '2024-09-15', occasion: 'Anniversary', deposit_paid: true } },
    { name: 'Mia Law Team Closure Dinner',       value: 2000,  stage: 'completed', contactIdx: 12, closedAt: '2024-10-31', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 20, table_count: 3, reservation_date: '2024-10-31', occasion: 'Corporate Event', special_request: 'Private room', deposit_paid: true } },
    { name: "Anna White's Holiday Gathering",    value: 3000,  stage: 'completed', contactIdx: 26, closedAt: '2024-12-20', ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 25, table_count: 5, reservation_date: '2024-12-20', occasion: 'Corporate Event', special_request: 'Christmas theme decor', deposit_paid: true } },
    // 2025
    { name: "Brian's New Year 2025 Launch",      value: 3500,  stage: 'completed', contactIdx: 1,  closedAt: '2025-01-15', ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 40, table_count: 8, reservation_date: '2025-01-15', occasion: 'Corporate Event', deposit_paid: true } },
    { name: "Alice's 2025 Birthday Dinner",      value: 600,   stage: 'completed', contactIdx: 0,  closedAt: '2025-02-10', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 8, table_count: 2, reservation_date: '2025-02-10', occasion: 'Birthday', special_request: 'Custom cake + florals', deposit_paid: true } },
    { name: 'Frank Annual Sales Kickoff 2025',   value: 5000,  stage: 'completed', contactIdx: 5,  closedAt: '2025-03-01', ownerEmail: 'demo_restaurant_ceo@izhubs.com',  custom_fields: { guest_count: 40, table_count: 8, reservation_date: '2025-03-01', occasion: 'Corporate Event', deposit_paid: true } },
    { name: 'Wendy Summer Gala 2025',            value: 9500,  stage: 'completed', contactIdx: 22, closedAt: '2025-07-12', ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 90, table_count: 18, reservation_date: '2025-07-12', occasion: 'Corporate Event', deposit_paid: true } },
    { name: "James's Product Launch Dinner",     value: 2800,  stage: 'completed', contactIdx: 9,  closedAt: '2025-09-20', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 25, table_count: 5, reservation_date: '2025-09-20', occasion: 'Corporate Event', deposit_paid: true } },
    { name: 'Xavier CFO Year-End Dinner',        value: 1600,  stage: 'completed', contactIdx: 23, closedAt: '2025-12-15', ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 12, table_count: 2, reservation_date: '2025-12-15', occasion: 'Corporate Event', deposit_paid: true } },
    // 2026 — Active bookings
    { name: "Alice's Birthday Dinner 2026",      value: 500,   stage: 'reservation',contactIdx:0,  ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 8, table_count: 2, reservation_date: '2026-04-05', occasion: 'Birthday', special_request: 'Custom cake + florals', deposit_paid: true } },
    { name: 'Brian Corporate Lunch 25 pax',      value: 1000,  stage: 'inquiry',   contactIdx: 1,  ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 25, table_count: 5, reservation_date: '2026-04-15', occasion: 'Business Meeting' } },
    { name: "Claire's Family Brunch Easter",     value: 220,   stage: 'confirmed', contactIdx: 2,  ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 10, table_count: 2, reservation_date: '2026-04-20', occasion: 'Family Dinner', deposit_paid: true } },
    { name: 'Daniel Company 30th Anniversary',   value: 6000,  stage: 'negotiation',contactIdx:3,  ownerEmail: 'demo_restaurant_ceo@izhubs.com',  custom_fields: { guest_count: 60, table_count: 12, reservation_date: '2026-05-20', occasion: 'Corporate Event', special_request: 'VIP event + live performance' } },
    { name: 'Quin Startup Party',                value: 800,   stage: 'inquiry',   contactIdx: 16, ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 15, reservation_date: '2026-04-25', occasion: 'Corporate Event' } },
    { name: 'Steve Tech Team Dinner',            value: 400,   stage: 'inquiry',   contactIdx: 18, ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 10, reservation_date: '2026-04-22', occasion: 'Other' } },
    { name: 'Rebecca Retail Team Lunch',         value: 550,   stage: 'reservation',contactIdx:17, ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 12, table_count: 2, reservation_date: '2026-04-18', occasion: 'Corporate Event', deposit_paid: true } },
    { name: 'Wendy Spring Gala 2026',            value: 10000, stage: 'confirmed', contactIdx: 22, ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 100, table_count: 20, reservation_date: '2026-05-01', occasion: 'Corporate Event', special_request: 'Full production event', deposit_paid: true } },
    { name: 'Carla Mexico Food Week',            value: 750,   stage: 'inquiry',   contactIdx: 28, ownerEmail: 'demo_restaurant_sale@izhubs.com', custom_fields: { guest_count: 15, reservation_date: '2026-04-28', occasion: 'Other' } },
    { name: "Derek's Gala Awards '26",           value: 14000, stage: 'negotiation',contactIdx:29, ownerEmail: 'demo_restaurant_ceo@izhubs.com',  custom_fields: { guest_count: 120, table_count: 24, reservation_date: '2026-06-15', occasion: 'Corporate Event', special_request: 'Full venue hire + catering' } },
    { name: 'Peter Long 5-Year Wed Anniversary', value: 350,   stage: 'seated',    contactIdx: 15, ownerEmail: 'demo_restaurant_ops@izhubs.com',  custom_fields: { guest_count: 4, table_count: 1, reservation_date: '2026-03-19', occasion: 'Anniversary', deposit_paid: true } },
  ],
};
