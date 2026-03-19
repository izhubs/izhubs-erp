// =============================================================
// izhubs ERP — Café / Coffee Shop Seed Data v2
// 30 contacts, 30 deals spanning 2024-2026
// Users: Owner/CEO, Floor Manager (Ops), Events & Catering (Sales), 1 inactive barista
// Pipeline: inquiry → reservation → confirmed → seated → completed / cancelled
// =============================================================

module.exports = {
  industry: 'Café / Coffee Shop',

  users: [
    { name: 'Mia Latte (Owner)',      email: 'demo_cafe_ceo@izhubs.com',  password: 'Demo@12345', role: 'admin',  active: true },
    { name: 'Ben Floor (Ops)',        email: 'demo_cafe_ops@izhubs.com',  password: 'Demo@12345', role: 'member', active: true },
    { name: 'Cleo Events (Sales)',    email: 'demo_cafe_sale@izhubs.com', password: 'Demo@12345', role: 'member', active: true },
    { name: 'Jake Old (Left Café)',   email: 'jake.old@izhubs-demo.com',  password: 'Demo@12345', role: 'member', active: false },
  ],

  customFields: [
    { entity: 'deal',    key: 'event_type',        label: 'Event Type',           type: 'select',  options: ['Pop-up', 'Brunch', 'Team Gathering', 'Workshop', 'Product Launch', 'Birthday', 'Other'] },
    { entity: 'deal',    key: 'guest_count',        label: 'Number of Guests',     type: 'number' },
    { entity: 'deal',    key: 'catering_included',  label: 'Catering Included',    type: 'boolean' },
    { entity: 'deal',    key: 'event_date',         label: 'Event Date',           type: 'date' },
    { entity: 'deal',    key: 'menu_type',          label: 'Menu Type',            type: 'select',  options: ['Standard', 'Premium', 'Custom', 'Vegan', 'Mixed'] },
    { entity: 'contact', key: 'visit_frequency',    label: 'Visit Frequency',      type: 'select',  options: ['Daily', 'Weekly', 'Monthly', 'Occasional'] },
    { entity: 'contact', key: 'preferred_drink',    label: 'Preferred Drink',      type: 'text' },
    { entity: 'contact', key: 'loyalty_card',       label: 'Loyalty Card #',       type: 'text' },
  ],

  contacts: [
    { name: 'Sofia Reyes',       email: 'sofia@creativeagency.com',   phone: '+12025550601', title: 'Creative Director',  status: 'customer', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Flat White',   loyalty_card: 'LC-0001' } },
    { name: 'Mateo Cruz',        email: 'mateo@techlabs.io',          phone: '+14155550602', title: 'Developer',          status: 'customer', custom_fields: { visit_frequency: 'Daily',    preferred_drink: 'Espresso',     loyalty_card: 'LC-0002' } },
    { name: 'Emma Hart',         email: 'emma@designstudio.com',      phone: '+13105550603', title: 'Designer',           status: 'customer', custom_fields: { visit_frequency: 'Daily',    preferred_drink: 'Oat Latte',    loyalty_card: 'LC-0003' } },
    { name: 'David Sun',         email: 'david@lawfirm.com',          phone: '+16505550604', title: 'Partner',            status: 'customer', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Americano',    loyalty_card: 'LC-0004' } },
    { name: 'Laura Mills',       email: 'laura@marketingco.com',      phone: '+17185550605', title: 'Marketing Manager',  status: 'customer', custom_fields: { visit_frequency: 'Monthly',  preferred_drink: 'Cappuccino',   loyalty_card: 'LC-0005' } },
    { name: 'Jack Frost',        email: 'jack@hr-solutions.com',      phone: '+12125550606', title: 'HR Director',        status: 'customer', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Cold Brew',    loyalty_card: 'LC-0006' } },
    { name: 'Nora Blake',        email: 'nora@writingpro.com',        phone: '+16175550607', title: 'Copywriter',         status: 'customer', custom_fields: { visit_frequency: 'Daily',    preferred_drink: 'Almond Latte', loyalty_card: 'LC-0007' } },
    { name: 'Eli Vance',         email: 'eli@photostudio.com',        phone: '+13055550608', title: 'Photographer',       status: 'customer', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Black Coffee', loyalty_card: 'LC-0008' } },
    { name: 'Aria Patel',        email: 'aria@yogacenter.com',        phone: '+14085550609', title: 'Yoga Instructor',    status: 'customer', custom_fields: { visit_frequency: 'Daily',    preferred_drink: 'Matcha Latte', loyalty_card: 'LC-0009' } },
    { name: 'Ben Torres',        email: 'ben@startupfund.io',         phone: '+15125550610', title: 'VC Partner',         status: 'customer', custom_fields: { visit_frequency: 'Monthly',  preferred_drink: 'Espresso',     loyalty_card: 'LC-0010' } },
    { name: 'Chloe Adams',       email: 'chloe@bookstore.com',        phone: '+17025550611', title: 'Store Owner',        status: 'customer', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Chai Latte',   loyalty_card: 'LC-0011' } },
    { name: 'Sam Wright',        email: 'sam@podcast.fm',             phone: '+14255550612', title: 'Podcaster',          status: 'customer', custom_fields: { visit_frequency: 'Daily',    preferred_drink: 'Cold Brew' } },
    { name: 'Fina Cross',        email: 'fina@fashionco.com',         phone: '+12145550613', title: 'Fashion Buyer',      status: 'prospect', custom_fields: { visit_frequency: 'Occasional',preferred_drink: 'Flat White' } },
    { name: 'Greg Hall',         email: 'greg@gymlife.com',           phone: '+14693550614', title: 'PT Trainer',         status: 'prospect', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Black Coffee' } },
    { name: 'Helen Marsh',       email: 'helen@nurseschool.com',      phone: '+16193550615', title: 'School Director',    status: 'customer', custom_fields: { visit_frequency: 'Monthly',  preferred_drink: 'Cappuccino',   loyalty_card: 'LC-0015' } },
    { name: 'Ivan Petrov',       email: 'ivan@techhub.co',            phone: '+17143550616', title: 'Developer',          status: 'lead',     custom_fields: { visit_frequency: 'Occasional' } },
    { name: 'Jasmine Lee',       email: 'jasmine@florals.com',        phone: '+16463550617', title: 'Florist',            status: 'lead',     custom_fields: { visit_frequency: 'Weekly' } },
    { name: 'Kevin North',       email: 'kevin@cleaningco.com',       phone: '+15593550618', title: 'Operations Mgr',     status: 'lead',     custom_fields: { visit_frequency: 'Occasional' } },
    { name: 'Lily Stone',        email: 'lily@realestate.io',         phone: '+18163550619', title: 'Real Estate Agent',  status: 'prospect', custom_fields: { visit_frequency: 'Monthly' } },
    { name: 'Mike Burns',        email: 'mike@techco.io',             phone: '+12023550620', title: 'Product Manager',    status: 'lead',     custom_fields: { visit_frequency: 'Occasional' } },
    { name: 'Tina Sour',         email: 'tina@ghostcafe.com',         phone: '+14153550621', title: 'Manager',            status: 'churned',  custom_fields: { visit_frequency: 'Occasional' } },
    { name: 'Paul Ghost',        email: 'paul@nonreturner.com',       phone: '+13103550622', title: 'CEO',                status: 'churned',  custom_fields: { visit_frequency: 'Occasional' } },
    { name: 'Rachel Bloom',      email: 'rachel@events360.com',       phone: '+16503550623', title: 'Event Coordinator',  status: 'customer', custom_fields: { visit_frequency: 'Monthly',  loyalty_card: 'LC-0023' } },
    { name: 'Owen Park',         email: 'owen@studio64.com',          phone: '+17183550624', title: 'Creative Lead',      status: 'customer', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Flat White',  loyalty_card: 'LC-0024' } },
    { name: 'Penny Clark',       email: 'penny@beautyco.com',         phone: '+12123550625', title: 'Salon Owner',        status: 'prospect', custom_fields: { visit_frequency: 'Monthly' } },
    { name: 'Quinn Best',        email: 'quinn@thinkspace.io',        phone: '+16173550626', title: 'Community Manager',  status: 'customer', custom_fields: { visit_frequency: 'Daily',    preferred_drink: 'Oat Latte',   loyalty_card: 'LC-0026' } },
    { name: 'Rita Foss',         email: 'rita@mediagroup.com',        phone: '+15123550627', title: 'Media Buyer',        status: 'prospect', custom_fields: { visit_frequency: 'Occasional' } },
    { name: 'Steve Cork',        email: 'steve@winetaste.com',        phone: '+17023550628', title: 'Sommelier',          status: 'lead',     custom_fields: { visit_frequency: 'Occasional' } },
    { name: 'Tara Webb',         email: 'tara@webagency.io',          phone: '+14693550629', title: 'Web Designer',       status: 'customer', custom_fields: { visit_frequency: 'Weekly',   preferred_drink: 'Matcha',     loyalty_card: 'LC-0029' } },
    { name: 'Uma Green',         email: 'uma@plantbased.co',          phone: '+16193550630', title: 'Nutritionist',       status: 'customer', custom_fields: { visit_frequency: 'Daily',    preferred_drink: 'Matcha Latte',loyalty_card: 'LC-0030' } },
  ],

  deals: [
    // 2024 Historical
    { name: 'CreativeAgency Brand Morning 2024',  value: 450,  stage: 'completed', contactIdx: 0,  closedAt: '2024-01-25', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Workshop',         guest_count: 15, event_date: '2024-01-25', catering_included: true,  menu_type: 'Premium' } },
    { name: 'LawFirm Quarterly Meeting Jan 2024', value: 800,  stage: 'completed', contactIdx: 3,  closedAt: '2024-02-20', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Team Gathering',   guest_count: 20, event_date: '2024-02-20', catering_included: true,  menu_type: 'Standard' } },
    { name: 'Rachel Events Corporate Brunch',     value: 1200, stage: 'completed', contactIdx: 22, closedAt: '2024-03-10', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Brunch',           guest_count: 30, event_date: '2024-03-10', catering_included: true,  menu_type: 'Custom' } },
    { name: 'Tina Sour Pop-up — Cancelled',       value: 0,    stage: 'cancelled', contactIdx: 20, closedAt: '2024-04-01', ownerEmail: 'jake.old@izhubs-demo.com',  custom_fields: { event_type: 'Pop-up',           guest_count: 10, event_date: '2024-04-01' } },
    { name: 'Paul Ghost Workshop — No-show',      value: 0,    stage: 'cancelled', contactIdx: 21, closedAt: '2024-04-15', ownerEmail: 'jake.old@izhubs-demo.com',  custom_fields: { event_type: 'Workshop',         guest_count: 8,  event_date: '2024-04-15' } },
    { name: 'School Director End-of-Year Brunch', value: 900,  stage: 'completed', contactIdx: 14, closedAt: '2024-06-01', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Brunch',           guest_count: 25, event_date: '2024-06-01', catering_included: true, menu_type: 'Mixed' } },
    { name: 'Yoga Studio Monthly Pop-up',         value: 350,  stage: 'completed', contactIdx: 8,  closedAt: '2024-07-05', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Pop-up',           guest_count: 12, event_date: '2024-07-05', menu_type: 'Vegan' } },
    { name: 'Startup Fund Investor Morning',       value: 600,  stage: 'completed', contactIdx: 9,  closedAt: '2024-08-15', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Product Launch',   guest_count: 20, event_date: '2024-08-15', catering_included: true, menu_type: 'Premium' } },
    { name: 'Bookstore Author Book Signing',       value: 250,  stage: 'completed', contactIdx: 10, closedAt: '2024-09-01', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Other',            guest_count: 30, event_date: '2024-09-01', menu_type: 'Standard' } },
    { name: 'Podcast Recording Session',           value: 180,  stage: 'completed', contactIdx: 11, closedAt: '2024-10-10', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Other',            guest_count: 5,  event_date: '2024-10-10', menu_type: 'Standard' } },
    { name: 'Creative Studio Holiday Party',       value: 1800, stage: 'completed', contactIdx: 23, closedAt: '2024-12-20', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Birthday',         guest_count: 40, event_date: '2024-12-20', catering_included: true, menu_type: 'Custom' } },
    { name: 'Tara Web Design Pop-up Shop',         value: 300,  stage: 'completed', contactIdx: 28, closedAt: '2024-11-15', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Pop-up',           guest_count: 15, event_date: '2024-11-15', menu_type: 'Standard' } },
    // 2025
    { name: 'LawFirm Q1 2025 Client Breakfast',   value: 900,  stage: 'completed', contactIdx: 3,  closedAt: '2025-02-01', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Team Gathering',   guest_count: 20, event_date: '2025-02-01', catering_included: true, menu_type: 'Premium' } },
    { name: 'Marketing Rebrand Launch Morning',    value: 700,  stage: 'completed', contactIdx: 4,  closedAt: '2025-03-15', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Product Launch',   guest_count: 18, event_date: '2025-03-15', menu_type: 'Mixed' } },
    { name: 'Yoga Studio Wellness Pop-up Apr 25',  value: 400,  stage: 'completed', contactIdx: 8,  closedAt: '2025-04-10', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Pop-up',           guest_count: 15, event_date: '2025-04-10', menu_type: 'Vegan' } },
    { name: 'ThinkSpace Community Meetup',         value: 350,  stage: 'completed', contactIdx: 25, closedAt: '2025-05-20', ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Team Gathering',   guest_count: 20, event_date: '2025-05-20', menu_type: 'Standard' } },
    { name: 'Uma Plantbased Tea Workshop',         value: 280,  stage: 'completed', contactIdx: 29, closedAt: '2025-06-01', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Workshop',         guest_count: 12, event_date: '2025-06-01', menu_type: 'Vegan' } },
    { name: 'Rachel Events Summer Pop-up',         value: 1500, stage: 'completed', contactIdx: 22, closedAt: '2025-07-10', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Pop-up',           guest_count: 35, event_date: '2025-07-10', catering_included: true, menu_type: 'Custom' } },
    { name: 'Startup Fund Q3 Networking',          value: 800,  stage: 'completed', contactIdx: 9,  closedAt: '2025-09-20', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Product Launch',   guest_count: 25, event_date: '2025-09-20', menu_type: 'Premium' } },
    { name: 'LawFirm End of Year Dinner 2025',     value: 1200, stage: 'completed', contactIdx: 3,  closedAt: '2025-12-18', ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Team Gathering',   guest_count: 25, event_date: '2025-12-18', catering_included: true, menu_type: 'Premium' } },
    // 2026 — Current
    { name: 'CreativeAgency Q1 Team Off-site',     value: 600,  stage: 'confirmed', contactIdx: 0,  ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Workshop',         guest_count: 18, event_date: '2026-04-03', catering_included: true, menu_type: 'Mixed' } },
    { name: 'Florist Spring Pop-up Weekend',       value: 280,  stage: 'inquiry',   contactIdx: 16, ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Pop-up',           guest_count: 20, event_date: '2026-04-25' } },
    { name: 'Bookstore Summer Launch Brunch',      value: 450,  stage: 'reservation',contactIdx:10, ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Product Launch',   guest_count: 30, event_date: '2026-05-10', menu_type: 'Standard' } },
    { name: 'Beauty Salon Team Day Out',           value: 300,  stage: 'inquiry',   contactIdx: 24, ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Team Gathering',   guest_count: 10, event_date: '2026-04-28' } },
    { name: 'Rachel Corporate Brunch May 2026',    value: 1800, stage: 'confirmed', contactIdx: 22, ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Brunch',           guest_count: 40, event_date: '2026-05-15', catering_included: true, menu_type: 'Custom' } },
    { name: 'ThinkSpace Monthly Meetup Apr 2026',  value: 250,  stage: 'reservation',contactIdx:25, ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Team Gathering',   guest_count: 15, event_date: '2026-04-22', menu_type: 'Standard' } },
    { name: 'Web Design Agency Workshop',          value: 420,  stage: 'inquiry',   contactIdx: 28, ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Workshop',         guest_count: 15, event_date: '2026-04-30' } },
    { name: 'Nutritionist Wellness Brunch',        value: 350,  stage: 'seated',    contactIdx: 29, ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Brunch',           guest_count: 12, event_date: '2026-03-19', menu_type: 'Vegan', catering_included: true } },
    { name: 'Owen Studio Product Shoot Brunch',    value: 280,  stage: 'confirmed', contactIdx: 23, ownerEmail: 'demo_cafe_ops@izhubs.com',  custom_fields: { event_type: 'Other',            guest_count: 8,  event_date: '2026-04-08', menu_type: 'Standard' } },
    { name: 'Tech Hub Hackathon Morning',          value: 500,  stage: 'inquiry',   contactIdx: 15, ownerEmail: 'demo_cafe_sale@izhubs.com', custom_fields: { event_type: 'Workshop',         guest_count: 25, event_date: '2026-05-05', menu_type: 'Mixed' } },
  ],
};
