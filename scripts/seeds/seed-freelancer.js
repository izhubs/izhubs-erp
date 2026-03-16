// =============================================================
// izhubs ERP — Freelancer / Consultant Seed Data
// Pipeline: lead → proposal → negotiation → active → revision → completed / lost
// Contacts: 15 international clients | Deals: 15 with hourly/project rates
// =============================================================

module.exports = {
  industry: 'Freelancer / Consultant',

  adminUser: {
    name: 'Morgan Freelancer',
    email: 'demo@izhubs.com',
    password: 'Demo@12345',
    role: 'admin',
  },

  customFields: [
    { entity: 'deal', key: 'project_type', label: 'Project Type', type: 'select', options: ['UI/UX Design', 'Web Development', 'Mobile App', 'Copywriting', 'Video Editing', 'Consulting', 'Other'] },
    { entity: 'deal', key: 'hourly_rate', label: 'Hourly Rate (USD)', type: 'number' },
    { entity: 'deal', key: 'estimated_hours', label: 'Estimated Hours', type: 'number' },
    { entity: 'deal', key: 'deadline', label: 'Deadline', type: 'date' },
    { entity: 'contact', key: 'lead_source', label: 'Lead Source', type: 'select', options: ['Upwork', 'Fiverr', 'LinkedIn', 'Referral', 'Cold Email', 'Facebook', 'Other'] },
    { entity: 'contact', key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC+7 (SEA)', 'UTC+8 (SG/HK)', 'UTC+9 (JP/KR)', 'UTC+0 (UK)', 'UTC-5 (US East)', 'UTC-8 (US West)'] },
  ],

  contacts: [
    { name: 'Sarah Johnson', email: 'sarah@techstartup.io', phone: '+12025550121', title: 'Product Manager', custom_fields: { lead_source: 'Upwork', timezone: 'UTC-5 (US East)' } },
    { name: 'David Chen', email: 'david@sgventure.sg', phone: '+6591234567', title: 'CTO', custom_fields: { lead_source: 'LinkedIn', timezone: 'UTC+8 (SG/HK)' } },
    { name: 'Emma Wilson', email: 'emma@agencyuk.co.uk', phone: '+447700900123', title: 'Creative Director', custom_fields: { lead_source: 'Referral', timezone: 'UTC+0 (UK)' } },
    { name: 'Hiroshi Tanaka', email: 'tanaka@corp.jp', phone: '+81312345678', title: 'UX Lead', custom_fields: { lead_source: 'LinkedIn', timezone: 'UTC+9 (JP/KR)' } },
    { name: 'Alex Nguyen', email: 'alex@startup.vn', phone: '+84901234567', title: 'CEO', custom_fields: { lead_source: 'Facebook', timezone: 'UTC+7 (SEA)' } },
    { name: 'Marcus Brown', email: 'marcus@ecom.us', phone: '+13105550199', title: 'Founder', custom_fields: { lead_source: 'Upwork', timezone: 'UTC-8 (US West)' } },
    { name: 'Priya Sharma', email: 'priya@mediahouse.in', phone: '+919876543210', title: 'Marketing Head', custom_fields: { lead_source: 'Fiverr', timezone: 'UTC+7 (SEA)' } },
    { name: 'Ji-ho Kim', email: 'jiho@koreatech.kr', phone: '+821012345678', title: 'Product Owner', custom_fields: { lead_source: 'LinkedIn', timezone: 'UTC+9 (JP/KR)' } },
    { name: 'Tom Nguyen', email: 'tom@agency.vn', phone: '+84912345678', title: 'Agency Owner', custom_fields: { lead_source: 'Referral', timezone: 'UTC+7 (SEA)' } },
    { name: 'Alex Müller', email: 'alex@gmbh.de', phone: '+493012345678', title: 'Digital Manager', custom_fields: { lead_source: 'Cold Email', timezone: 'UTC+0 (UK)' } },
    { name: 'Hana Park', email: 'hana@designco.kr', phone: '+821098765432', title: 'Design Lead', custom_fields: { lead_source: 'LinkedIn', timezone: 'UTC+9 (JP/KR)' } },
    { name: 'Carlos Mendez', email: 'carlos@latam.mx', phone: '+5215512345678', title: 'CMO', custom_fields: { lead_source: 'Upwork', timezone: 'UTC-5 (US East)' } },
    { name: 'Linh Tran', email: 'linh@brand.vn', phone: '+84923456789', title: 'Brand Manager', custom_fields: { lead_source: 'Facebook', timezone: 'UTC+7 (SEA)' } },
    { name: 'James Taylor', email: 'james@nycstudio.com', phone: '+12125550147', title: 'Creative Director', custom_fields: { lead_source: 'Referral', timezone: 'UTC-5 (US East)' } },
    { name: 'Mei Lin', email: 'mei@hkbrand.hk', phone: '+85298765432', title: 'Brand Strategist', custom_fields: { lead_source: 'LinkedIn', timezone: 'UTC+8 (SG/HK)' } },
  ],

  deals: [
    { name: 'TechStartup Landing Page', value: 350, stage: 'lead', contactIdx: 0, custom_fields: { project_type: 'Web Development', hourly_rate: 50, estimated_hours: 20, deadline: '2026-04-15' } },
    { name: 'SGVenture Mobile UI', value: 850, stage: 'lead', contactIdx: 1, custom_fields: { project_type: 'UI/UX Design', hourly_rate: 60, estimated_hours: 40, deadline: '2026-05-01' } },
    { name: 'AgencyUK Brand Identity', value: 1500, stage: 'proposal', contactIdx: 2, custom_fields: { project_type: 'Consulting', hourly_rate: 80, estimated_hours: 50 } },
    { name: 'CorpJP UX Audit', value: 1200, stage: 'proposal', contactIdx: 3, custom_fields: { project_type: 'UI/UX Design', hourly_rate: 70, estimated_hours: 48 } },
    { name: 'VN Startup App MVP', value: 2500, stage: 'negotiation', contactIdx: 4, custom_fields: { project_type: 'Mobile App', estimated_hours: 120, deadline: '2026-06-01' } },
    { name: 'US Ecom Video Ads Pack', value: 900, stage: 'negotiation', contactIdx: 5, custom_fields: { project_type: 'Video Editing', hourly_rate: 45, estimated_hours: 30 } },
    { name: 'MediaHouse Content Pack', value: 600, stage: 'active', contactIdx: 6, custom_fields: { project_type: 'Copywriting', hourly_rate: 30, estimated_hours: 60 } },
    { name: 'KoreaTech Dashboard UI', value: 1800, stage: 'active', contactIdx: 7, custom_fields: { project_type: 'UI/UX Design', hourly_rate: 65, estimated_hours: 80 } },
    { name: 'VN Agency E-commerce Redesign', value: 3500, stage: 'active', contactIdx: 8, custom_fields: { project_type: 'Web Development', hourly_rate: 55, estimated_hours: 150 } },
    { name: 'Pitch Deck Consulting', value: 450, stage: 'revision', contactIdx: 9, custom_fields: { project_type: 'Consulting', hourly_rate: 60, estimated_hours: 20 } },
    { name: 'DesignCo Logo + Brand', value: 700, stage: 'completed', contactIdx: 10, closedAt: '2026-03-01', custom_fields: { project_type: 'UI/UX Design' } },
    { name: 'LATAM Blog Content', value: 550, stage: 'completed', contactIdx: 11, closedAt: '2026-02-25', custom_fields: { project_type: 'Copywriting' } },
    { name: 'VN Brand Social Media Kit', value: 800, stage: 'completed', contactIdx: 12, closedAt: '2026-03-10', custom_fields: { project_type: 'UI/UX Design' } },
    { name: 'NYC Newsletter Sequence', value: 1200, stage: 'won', contactIdx: 13, closedAt: '2026-02-15', custom_fields: { project_type: 'Copywriting' } },
    { name: 'HK Rebranding Project', value: 2200, stage: 'lost', contactIdx: 14, closedAt: '2026-03-08', custom_fields: { project_type: 'UI/UX Design' } },
  ],
};
