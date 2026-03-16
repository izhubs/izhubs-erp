// =============================================================
// izhubs ERP — Coworking / Serviced Office Seed Data
// Pipeline: new → contacted → consulting → site_visit → closing → won / lost / referred
// Contacts: 15 business owners | Deals: 15 with service type + contract months
// =============================================================

module.exports = {
  industry: 'Coworking / Serviced Office',

  adminUser: {
    name: 'Space Admin Demo',
    email: 'demo@izhubs.com',
    password: 'Demo@12345',
    role: 'admin',
  },

  customFields: [
    { entity: 'deal', key: 'service_type', label: 'Service Type', type: 'select', options: ['Virtual Office', 'Fixed Desk', 'Hot Desk', 'Meeting Room', 'Company Registration'] },
    { entity: 'deal', key: 'branch', label: 'Branch', type: 'select', options: ['Downtown', 'Midtown', 'Westside', 'Tech Hub', 'Airport'] },
    { entity: 'deal', key: 'contract_months', label: 'Contract Duration (months)', type: 'number' },
    { entity: 'deal', key: 'address_line', label: 'Business Address', type: 'text' },
    { entity: 'contact', key: 'lead_source', label: 'Lead Source', type: 'select', options: ['Google', 'Walk-in', 'Referral', 'Facebook', 'Website', 'Agent'] },
    { entity: 'contact', key: 'business_need', label: 'Business Need', type: 'text' },
    { entity: 'company', key: 'tax_id', label: 'Tax ID / Business Number', type: 'text' },
    { entity: 'company', key: 'legal_rep', label: 'Legal Representative', type: 'text' },
  ],

  contacts: [
    { name: 'Anna Chen', email: 'anna@startup.io', phone: '+12025550201', title: 'Founder', custom_fields: { lead_source: 'Google', business_need: 'Virtual office address in Downtown' } },
    { name: 'Ben Harrington', email: 'ben@freelance.me', phone: '+14155550202', title: 'Freelancer', custom_fields: { lead_source: 'Walk-in', business_need: 'Hot desk 10 days/month' } },
    { name: 'Chloe Martin', email: 'chloe@trading.com', phone: '+13105550203', title: 'CEO', custom_fields: { lead_source: 'Referral', business_need: 'Fixed desk for 2 people' } },
    { name: 'Daniel Ross', email: 'daniel@beauty.com', phone: '+16505550204', title: 'CEO', custom_fields: { lead_source: 'Facebook', business_need: 'Business registration address' } },
    { name: 'Emily Parker', email: 'emily@import.com', phone: '+17185550205', title: 'Business Owner', custom_fields: { lead_source: 'Google', business_need: 'Virtual office + mail handling' } },
    { name: 'Frank Nguyen', email: 'frank@consult.io', phone: '+12125550206', title: 'Consultant', custom_fields: { lead_source: 'Agent', business_need: 'Meeting room by the hour' } },
    { name: 'Grace Kim', email: 'grace@tech24.com', phone: '+16175550207', title: 'CTO', custom_fields: { lead_source: 'Google', business_need: 'Fixed desk for 5 people, fast internet' } },
    { name: 'Henry Walsh', email: 'henry@fashion.com', phone: '+13055550208', title: 'Sales Manager', custom_fields: { lead_source: 'Website', business_need: 'Company registration + virtual office' } },
    { name: 'Isla Thompson', email: 'isla@logistics.com', phone: '+14085550209', title: 'Operations Lead', custom_fields: { lead_source: 'Referral', business_need: 'Fixed desk 3 people, Westside branch' } },
    { name: 'Jack Morrison', email: 'jack@edu.com', phone: '+15125550210', title: 'Principal', custom_fields: { lead_source: 'Walk-in', business_need: 'Business address + large meeting room' } },
    { name: 'Karen Lee', email: 'karen@software.com', phone: '+17025550211', title: 'CEO', custom_fields: { lead_source: 'Google', business_need: 'Fixed desk for 8 people' } },
    { name: 'Leo Brown', email: 'leo@accounting.com', phone: '+14255550212', title: 'Senior Accountant', custom_fields: { lead_source: 'Agent', business_need: 'Virtual office Midtown' } },
    { name: 'Maya Clark', email: 'maya@design.com', phone: '+12145550213', title: 'Creative Director', custom_fields: { lead_source: 'Facebook', business_need: 'Hot desk for 4-person creative team' } },
    { name: 'Nathan Scott', email: 'nathan@pr.com', phone: '+14693550214', title: 'PR Manager', custom_fields: { lead_source: 'Website', business_need: 'Weekly recurring meeting room' } },
    { name: 'Olivia Adams', email: 'olivia@realestate.com', phone: '+16193550215', title: 'Director', custom_fields: { lead_source: 'Google', business_need: 'Fixed desk 10 people, Tech Hub' } },
  ],

  deals: [
    { name: 'Anna Chen — Virtual Office Q2', value: 150, stage: 'new', contactIdx: 0, custom_fields: { service_type: 'Virtual Office', branch: 'Downtown', contract_months: 3, address_line: '123 Main St, Downtown' } },
    { name: 'Ben Harrington — Hot Desk', value: 240, stage: 'new', contactIdx: 1, custom_fields: { service_type: 'Hot Desk', branch: 'Midtown', contract_months: 1 } },
    { name: 'Chloe Martin — Fixed 2 Desks', value: 900, stage: 'contacted', contactIdx: 2, custom_fields: { service_type: 'Fixed Desk', branch: 'Downtown', contract_months: 6 } },
    { name: 'Daniel Ross — Registration Address', value: 180, stage: 'contacted', contactIdx: 3, custom_fields: { service_type: 'Virtual Office', branch: 'Downtown', contract_months: 6 } },
    { name: 'Emily Parker — Virtual + Mail', value: 350, stage: 'consulting', contactIdx: 4, custom_fields: { service_type: 'Virtual Office', branch: 'Downtown', contract_months: 12 } },
    { name: 'Frank Nguyen — Hourly Meeting Room', value: 80, stage: 'consulting', contactIdx: 5, custom_fields: { service_type: 'Meeting Room', branch: 'Midtown', contract_months: 1 } },
    { name: 'Grace Kim — 5-Person Fixed Desk', value: 2250, stage: 'site_visit', contactIdx: 6, custom_fields: { service_type: 'Fixed Desk', branch: 'Tech Hub', contract_months: 6 } },
    { name: 'Henry Walsh — Company Registration', value: 450, stage: 'site_visit', contactIdx: 7, custom_fields: { service_type: 'Company Registration', branch: 'Downtown', contract_months: 12 } },
    { name: 'Isla Thompson — 3-Person Westside', value: 1350, stage: 'closing', contactIdx: 8, custom_fields: { service_type: 'Fixed Desk', branch: 'Westside', contract_months: 6 } },
    { name: 'Jack Morrison — Large Meeting Room', value: 240, stage: 'closing', contactIdx: 9, custom_fields: { service_type: 'Meeting Room', branch: 'Midtown', contract_months: 3 } },
    { name: 'Karen Lee — 8-Person Office', value: 3600, stage: 'won', contactIdx: 10, closedAt: '2026-03-01', custom_fields: { service_type: 'Fixed Desk', branch: 'Tech Hub', contract_months: 12 } },
    { name: 'Leo Brown — Virtual Midtown', value: 360, stage: 'won', contactIdx: 11, closedAt: '2026-03-05', custom_fields: { service_type: 'Virtual Office', branch: 'Midtown', contract_months: 12 } },
    { name: 'Maya Clark — Creative Team Hot Desk', value: 800, stage: 'won', contactIdx: 12, closedAt: '2026-02-20', custom_fields: { service_type: 'Hot Desk', branch: 'Downtown', contract_months: 3 } },
    { name: 'Nathan Scott — Weekly Meeting Room', value: 360, stage: 'lost', contactIdx: 13, closedAt: '2026-03-08', custom_fields: { service_type: 'Meeting Room', branch: 'Midtown' } },
    { name: 'Olivia Adams — 10-Person Tech Hub', value: 4500, stage: 'referred', contactIdx: 14, custom_fields: { service_type: 'Fixed Desk', branch: 'Tech Hub', contract_months: 12 } },
  ],
};
