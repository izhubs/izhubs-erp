// =============================================================
// izhubs ERP — Agency / Digital Marketing Seed Data v2
// Rich demo: 30 contacts, 30 deals spanning 2024-2026
// Users: CEO, Sales, Ops, 1 inactive (resigned)
// Pipeline: lead → proposal → negotiation → onboarding → active → renewal → won / lost
// =============================================================

module.exports = {
  industry: 'Agency / Digital Marketing',

  users: [
    { name: 'Alex Morgan (CEO)',    email: 'demo_agency_ceo@izhubs.com',   password: 'Demo@12345', role: 'admin',  active: true },
    { name: 'Jessica Sales',        email: 'demo_agency_sale@izhubs.com',  password: 'Demo@12345', role: 'member', active: true },
    { name: 'Kevin Ops',            email: 'demo_agency_ops@izhubs.com',   password: 'Demo@12345', role: 'member', active: true },
    { name: 'Tom Former (Resigned)',email: 'tom.former@izhubs-demo.com',   password: 'Demo@12345', role: 'member', active: false },
  ],

  customFields: [
    { entity: 'deal',    key: 'project_type',       label: 'Project Type',             type: 'select', options: ['SEO', 'Google Ads', 'Facebook Ads', 'Web Design', 'Content', 'Branding', 'Email Marketing', 'Other'] },
    { entity: 'deal',    key: 'monthly_budget',      label: 'Monthly Budget (USD)',      type: 'number' },
    { entity: 'deal',    key: 'contract_duration',   label: 'Contract Duration (months)',type: 'number' },
    { entity: 'deal',    key: 'start_date',          label: 'Project Start Date',        type: 'date' },
    { entity: 'contact', key: 'lead_source',         label: 'Lead Source',               type: 'select', options: ['Google', 'Facebook', 'Referral', 'Cold Outreach', 'LinkedIn', 'Other'] },
    { entity: 'contact', key: 'company_size',        label: 'Company Size',              type: 'select', options: ['1-10', '11-50', '51-200', '200+'] },
    { entity: 'contact', key: 'industry_vertical',   label: 'Industry Vertical',         type: 'select', options: ['E-commerce', 'SaaS', 'Healthcare', 'Real Estate', 'Education', 'F&B', 'Fashion', 'Finance', 'Other'] },
  ],

  contacts: [
    // Customers (active)
    { name: 'James Mitchell',   email: 'james@freshtech.io',       phone: '+12025550101', title: 'CEO',              status: 'customer',  custom_fields: { lead_source: 'Referral',     company_size: '11-50', industry_vertical: 'SaaS' } },
    { name: 'Sarah Collins',    email: 'sarah@starbrand.co',       phone: '+14155550102', title: 'Marketing Dir',    status: 'customer',  custom_fields: { lead_source: 'Google',       company_size: '1-10',  industry_vertical: 'E-commerce' } },
    { name: 'Ryan Torres',      email: 'ryan@buildfast.io',        phone: '+13105550103', title: 'Founder',          status: 'customer',  custom_fields: { lead_source: 'LinkedIn',     company_size: '1-10',  industry_vertical: 'SaaS' } },
    { name: 'Emma Lawson',      email: 'emma@retailmax.com',       phone: '+16505550104', title: 'Head of Marketing',status: 'customer',  custom_fields: { lead_source: 'Facebook',     company_size: '51-200',industry_vertical: 'E-commerce' } },
    { name: 'David Park',       email: 'david@medgroup.com',       phone: '+17185550105', title: 'CMO',              status: 'customer',  custom_fields: { lead_source: 'Cold Outreach',company_size: '200+',  industry_vertical: 'Healthcare' } },
    { name: 'Olivia Chen',      email: 'olivia@shophouse.com',     phone: '+12125550106', title: 'Owner',            status: 'customer',  custom_fields: { lead_source: 'Referral',     company_size: '1-10',  industry_vertical: 'E-commerce' } },
    { name: 'Noah Williams',    email: 'noah@eduhub.edu',          phone: '+16175550107', title: 'Director',         status: 'customer',  custom_fields: { lead_source: 'Google',       company_size: '11-50', industry_vertical: 'Education' } },
    { name: 'Ava Johnson',      email: 'ava@luxbeauty.com',        phone: '+13055550108', title: 'CEO',              status: 'customer',  custom_fields: { lead_source: 'Referral',     company_size: '1-10',  industry_vertical: 'Fashion' } },
    { name: 'Liam Thompson',    email: 'liam@logistics24.com',     phone: '+14085550109', title: 'Business Dev',     status: 'customer',  custom_fields: { lead_source: 'LinkedIn',     company_size: '51-200',industry_vertical: 'Other' } },
    { name: 'Mia Robinson',     email: 'mia@foodchain.com',        phone: '+15125550110', title: 'Marketing Lead',   status: 'customer',  custom_fields: { lead_source: 'Referral',     company_size: '11-50', industry_vertical: 'F&B' } },
    // Active prospects
    { name: 'Ethan Clark',      email: 'ethan@proptech.io',        phone: '+17025550111', title: 'CEO',              status: 'prospect',  custom_fields: { lead_source: 'Cold Outreach',company_size: '1-10',  industry_vertical: 'Real Estate' } },
    { name: 'Isabella Lewis',   email: 'isabella@skincareco.com',  phone: '+14255550112', title: 'Brand Manager',    status: 'prospect',  custom_fields: { lead_source: 'Google',       company_size: '11-50', industry_vertical: 'Fashion' } },
    { name: 'Lucas Walker',     email: 'lucas@manufacture.com',    phone: '+12145550113', title: 'Factory Director', status: 'prospect',  custom_fields: { lead_source: 'Referral',     company_size: '200+',  industry_vertical: 'Other' } },
    { name: 'Harper Hall',      email: 'harper@fintechco.com',     phone: '+14693550114', title: 'Growth Lead',      status: 'prospect',  custom_fields: { lead_source: 'LinkedIn',     company_size: '51-200',industry_vertical: 'Finance' } },
    { name: 'Chloe Young',      email: 'chloe@fashionstore.com',   phone: '+16193550115', title: 'Owner',            status: 'lead',      custom_fields: { lead_source: 'Facebook',     company_size: '1-10',  industry_vertical: 'Fashion' } },
    // New leads
    { name: 'Samuel Price',     email: 'sam@growthco.io',          phone: '+15303550116', title: 'CEO',              status: 'lead',      custom_fields: { lead_source: 'LinkedIn',     company_size: '11-50', industry_vertical: 'SaaS' } },
    { name: 'Natalie Brooks',   email: 'natalie@organicshop.com',  phone: '+17143550117', title: 'Marketing Mgr',    status: 'lead',      custom_fields: { lead_source: 'Google',       company_size: '1-10',  industry_vertical: 'E-commerce' } },
    { name: 'Dylan Foster',     email: 'dylan@techventure.co',     phone: '+16463550118', title: 'Founder',          status: 'lead',      custom_fields: { lead_source: 'Referral',     company_size: '1-10',  industry_vertical: 'SaaS' } },
    { name: 'Zoe Campbell',     email: 'zoe@wellness360.com',      phone: '+15593550119', title: 'Director',         status: 'lead',      custom_fields: { lead_source: 'Cold Outreach',company_size: '11-50', industry_vertical: 'Healthcare' } },
    { name: 'Brandon Reyes',    email: 'brandon@urbanfood.com',    phone: '+18163550120', title: 'Owner',            status: 'lead',      custom_fields: { lead_source: 'Facebook',     company_size: '1-10',  industry_vertical: 'F&B' } },
    // Churned (lost customers)
    { name: 'Marcus Lee',       email: 'marcus@oldcorp.com',       phone: '+12023550121', title: 'CMO',              status: 'churned',   custom_fields: { lead_source: 'Cold Outreach',company_size: '51-200',industry_vertical: 'Finance' } },
    { name: 'Priya Sharma',     email: 'priya@indiaexports.in',    phone: '+14153550122', title: 'Founder',          status: 'churned',   custom_fields: { lead_source: 'Referral',     company_size: '11-50', industry_vertical: 'E-commerce' } },
    { name: 'Tom Birch',        email: 'tom@birchtrading.com',     phone: '+13103550123', title: 'Sales Dir',        status: 'churned',   custom_fields: { lead_source: 'LinkedIn',     company_size: '200+',  industry_vertical: 'Other' } },
    // More customers
    { name: 'Sonia Ruiz',       email: 'sonia@ecobrands.com',      phone: '+16503550124', title: 'Marketing Mgr',    status: 'customer',  custom_fields: { lead_source: 'Google',       company_size: '11-50', industry_vertical: 'Fashion' } },
    { name: 'Andre Volt',       email: 'andre@voltmedia.com',      phone: '+17183550125', title: 'Creative Dir',     status: 'customer',  custom_fields: { lead_source: 'Referral',     company_size: '1-10',  industry_vertical: 'Other' } },
    { name: 'Nina Watts',       email: 'nina@cloudmeal.co',        phone: '+12123550126', title: 'CEO',              status: 'prospect',  custom_fields: { lead_source: 'Cold Outreach',company_size: '11-50', industry_vertical: 'F&B' } },
    { name: 'James Okafor',     email: 'jokafor@logodesign.com',   phone: '+16173550127', title: 'Creative Lead',    status: 'lead',      custom_fields: { lead_source: 'Facebook',     company_size: '1-10',  industry_vertical: 'Other' } },
    { name: 'Lily Nguyen',      email: 'lily@vntech.vn',           phone: '+84901554401', title: 'CTO',              status: 'prospect',  custom_fields: { lead_source: 'LinkedIn',     company_size: '51-200',industry_vertical: 'SaaS' } },
    { name: 'Carlos Mendez',    email: 'carlos@latamgrow.co',      phone: '+15123550129', title: 'COO',              status: 'lead',      custom_fields: { lead_source: 'Google',       company_size: '11-50', industry_vertical: 'E-commerce' } },
    { name: 'Fiona Walsh',      email: 'fiona@irelandseo.ie',      phone: '+35318550130', title: 'Founder',          status: 'churned',   custom_fields: { lead_source: 'Referral',     company_size: '1-10',  industry_vertical: 'SaaS' } },
  ],

  deals: [
    // 2024 — Historical won/lost
    { name: 'FreshTech SEO Q1 2024',          value: 9600,   stage: 'won',         contactIdx: 0,  closedAt: '2024-01-15', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'SEO',          monthly_budget: 800,  contract_duration: 12, start_date: '2024-01-15' } },
    { name: 'StarBrand Facebook Ads 2024',    value: 7200,   stage: 'won',         contactIdx: 1,  closedAt: '2024-02-20', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Facebook Ads', monthly_budget: 600,  contract_duration: 12, start_date: '2024-02-01' } },
    { name: 'RetailMax Google Ads 2024',      value: 19200,  stage: 'won',         contactIdx: 3,  closedAt: '2024-03-10', ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Google Ads',   monthly_budget: 1600, contract_duration: 12, start_date: '2024-03-10' } },
    { name: 'MedGroup Branding 2024',         value: 22000,  stage: 'won',         contactIdx: 4,  closedAt: '2024-04-01', ownerEmail: 'demo_agency_ceo@izhubs.com',  custom_fields: { project_type: 'Branding',     monthly_budget: 0,    contract_duration: 0,  start_date: '2024-04-01' } },
    { name: 'Marcus OldCorp — Lost Deal',     value: 5000,   stage: 'lost',        contactIdx: 20, closedAt: '2024-03-15', ownerEmail: 'tom.former@izhubs-demo.com',  custom_fields: { project_type: 'Google Ads',   monthly_budget: 1000, contract_duration: 6 } },
    { name: 'Priya India Export SEO',         value: 3600,   stage: 'lost',        contactIdx: 21, closedAt: '2024-05-20', ownerEmail: 'tom.former@izhubs-demo.com',  custom_fields: { project_type: 'SEO',          monthly_budget: 300,  contract_duration: 12 } },
    { name: 'Tom Birch — Budget Cut',         value: 12000,  stage: 'lost',        contactIdx: 22, closedAt: '2024-06-15', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Content',       monthly_budget: 1000, contract_duration: 12 } },
    { name: 'EcobrAnds Content Package',      value: 8400,   stage: 'won',         contactIdx: 23, closedAt: '2024-07-01', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Content',       monthly_budget: 700,  contract_duration: 12, start_date: '2024-07-01' } },
    { name: 'VoltMedia Creative 6M',          value: 4200,   stage: 'won',         contactIdx: 24, closedAt: '2024-08-10', ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Branding',     monthly_budget: 700,  contract_duration: 6,  start_date: '2024-08-10' } },
    { name: 'Fiona IrelandSEO — Churned',     value: 2400,   stage: 'lost',        contactIdx: 29, closedAt: '2024-09-30', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'SEO',          monthly_budget: 800,  contract_duration: 3 } },
    // 2024 Q3-Q4 — Won + Active
    { name: 'LogiTrans Google Ads H2 2024',  value: 9600,   stage: 'won',         contactIdx: 8,  closedAt: '2024-10-01', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Google Ads',   monthly_budget: 1600, contract_duration: 6,  start_date: '2024-10-01' } },
    { name: 'FoodChain Content 2024',         value: 8400,   stage: 'won',         contactIdx: 9,  closedAt: '2024-11-15', ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Content',       monthly_budget: 700,  contract_duration: 12, start_date: '2024-11-15' } },
    // 2025 — Active & in-progress
    { name: 'BuildFast Website 2025',         value: 5500,   stage: 'won',         contactIdx: 2,  closedAt: '2025-01-15', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Web Design',   monthly_budget: 0,    contract_duration: 0,  start_date: '2025-01-15' } },
    { name: 'EduHub Social Media 2025',       value: 7200,   stage: 'active',      contactIdx: 6,  ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Facebook Ads', monthly_budget: 600,  contract_duration: 12, start_date: '2025-02-01' } },
    { name: 'LuxBeauty Brand Identity',       value: 14000,  stage: 'won',         contactIdx: 7,  closedAt: '2025-03-10', ownerEmail: 'demo_agency_ceo@izhubs.com',  custom_fields: { project_type: 'Branding',     monthly_budget: 0,    contract_duration: 0,  start_date: '2025-03-10' } },
    { name: 'ShopHouse Content 2025',         value: 6000,   stage: 'active',      contactIdx: 5,  ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Content',       monthly_budget: 500,  contract_duration: 12, start_date: '2025-04-01' } },
    { name: 'SkinCareCo Email Campaign',      value: 3600,   stage: 'renewal',     contactIdx: 11, ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Email Marketing',monthly_budget:600,  contract_duration: 6,  start_date: '2025-06-01' } },
    { name: 'Manufacture Brand Refresh',      value: 9500,   stage: 'renewal',     contactIdx: 12, ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Branding',     monthly_budget: 0,    contract_duration: 0,  start_date: '2025-07-01' } },
    { name: 'FintechCo Growth Q3 2025',       value: 7200,   stage: 'active',      contactIdx: 13, ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Google Ads',   monthly_budget: 1200, contract_duration: 6,  start_date: '2025-07-15' } },
    // 2025 Q4 — Recent wins
    { name: 'FreshTech SEO Renewal 2025',     value: 10800,  stage: 'won',         contactIdx: 0,  closedAt: '2025-11-01', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'SEO',          monthly_budget: 900,  contract_duration: 12, start_date: '2025-11-01' } },
    { name: 'CloudMeal Ads Launch',           value: 3200,   stage: 'won',         contactIdx: 25, closedAt: '2025-12-10', ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Facebook Ads', monthly_budget: 800,  contract_duration: 4 } },
    // 2026 — Current pipeline
    { name: 'GrowthCo SEO Package',          value: 4800,   stage: 'proposal',    contactIdx: 15, ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'SEO',          monthly_budget: 800,  contract_duration: 6 } },
    { name: 'OrganicShop Google Ads',         value: 2400,   stage: 'lead',        contactIdx: 16, ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Google Ads',   monthly_budget: 600,  contract_duration: 4 } },
    { name: 'TechVenture Branding',           value: 11000,  stage: 'negotiation', contactIdx: 17, ownerEmail: 'demo_agency_ceo@izhubs.com',  custom_fields: { project_type: 'Branding',     monthly_budget: 0,    contract_duration: 0 } },
    { name: 'Wellness360 Content Strategy',   value: 5400,   stage: 'proposal',    contactIdx: 18, ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Content',       monthly_budget: 900,  contract_duration: 6 } },
    { name: 'UrbanFood Social Package',       value: 1800,   stage: 'lead',        contactIdx: 19, ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Facebook Ads', monthly_budget: 600,  contract_duration: 3 } },
    { name: 'LogoDesign Campaign Q1',         value: 900,    stage: 'lead',        contactIdx: 26, ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Facebook Ads', monthly_budget: 300,  contract_duration: 3 } },
    { name: 'VNTech LinkedIn Ads Q1 2026',    value: 6000,   stage: 'negotiation', contactIdx: 27, ownerEmail: 'demo_agency_sale@izhubs.com', custom_fields: { project_type: 'Other',         monthly_budget: 1000, contract_duration: 6 } },
    { name: 'LatamGrow SEO Kickoff',          value: 3600,   stage: 'onboarding',  contactIdx: 28, ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'SEO',           monthly_budget: 600,  contract_duration: 6,  start_date: '2026-03-01' } },
    { name: 'RetailMax Google Ads 2026',      value: 24000,  stage: 'active',      contactIdx: 3,  ownerEmail: 'demo_agency_ops@izhubs.com',  custom_fields: { project_type: 'Google Ads',   monthly_budget: 2000, contract_duration: 12, start_date: '2026-01-01' } },
    { name: 'MedGroup Full Rebrand 2026',     value: 35000,  stage: 'negotiation', contactIdx: 4,  ownerEmail: 'demo_agency_ceo@izhubs.com',  custom_fields: { project_type: 'Branding',     monthly_budget: 0,    contract_duration: 0 } },
  ],
};
