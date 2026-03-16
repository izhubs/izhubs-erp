// =============================================================
// izhubs ERP — Agency / Digital Marketing Seed Data
// Pipeline: lead → proposal → negotiation → onboarding → active → renewal → won / lost
// Contacts: 15 agency clients | Deals: 15 spread across all stages
// =============================================================

module.exports = {
  industry: 'Agency / Digital Marketing',

  adminUser: {
    name: 'Alex Demo',
    email: 'demo@izhubs.com',
    password: 'Demo@12345',
    role: 'admin',
  },

  customFields: [
    { entity: 'deal', key: 'project_type', label: 'Project Type', type: 'select', options: ['SEO', 'Google Ads', 'Facebook Ads', 'Web Design', 'Content', 'Branding', 'Other'] },
    { entity: 'deal', key: 'monthly_budget', label: 'Monthly Budget (USD)', type: 'number' },
    { entity: 'deal', key: 'contract_duration', label: 'Contract Duration (months)', type: 'number' },
    { entity: 'contact', key: 'lead_source', label: 'Lead Source', type: 'select', options: ['Google', 'Facebook', 'Referral', 'Cold Outreach', 'LinkedIn', 'Other'] },
    { entity: 'contact', key: 'company_size', label: 'Company Size', type: 'select', options: ['1-10', '11-50', '51-200', '200+'] },
  ],

  contacts: [
    { name: 'James Mitchell', email: 'james@freshtech.io', phone: '+12025550101', title: 'CEO', custom_fields: { lead_source: 'Referral', company_size: '11-50' } },
    { name: 'Sarah Collins', email: 'sarah@starbrand.co', phone: '+14155550102', title: 'Marketing Manager', custom_fields: { lead_source: 'Google', company_size: '1-10' } },
    { name: 'Ryan Torres', email: 'ryan@buildfast.io', phone: '+13105550103', title: 'Founder', custom_fields: { lead_source: 'LinkedIn', company_size: '1-10' } },
    { name: 'Emma Lawson', email: 'emma@retailmax.com', phone: '+16505550104', title: 'Head of Marketing', custom_fields: { lead_source: 'Facebook', company_size: '51-200' } },
    { name: 'David Park', email: 'david@medgroup.com', phone: '+17185550105', title: 'CMO', custom_fields: { lead_source: 'Cold Outreach', company_size: '200+' } },
    { name: 'Olivia Chen', email: 'olivia@shophouse.com', phone: '+12125550106', title: 'Owner', custom_fields: { lead_source: 'Referral', company_size: '1-10' } },
    { name: 'Noah Williams', email: 'noah@eduhub.edu', phone: '+16175550107', title: 'Director', custom_fields: { lead_source: 'Google', company_size: '11-50' } },
    { name: 'Ava Johnson', email: 'ava@luxbeauty.com', phone: '+13055550108', title: 'CEO', custom_fields: { lead_source: 'Instagram', company_size: '1-10' } },
    { name: 'Liam Thompson', email: 'liam@logistics24.com', phone: '+14085550109', title: 'Business Dev', custom_fields: { lead_source: 'LinkedIn', company_size: '51-200' } },
    { name: 'Mia Robinson', email: 'mia@foodchain.com', phone: '+15125550110', title: 'Marketing Lead', custom_fields: { lead_source: 'Referral', company_size: '11-50' } },
    { name: 'Ethan Clark', email: 'ethan@proptech.io', phone: '+17025550111', title: 'CEO', custom_fields: { lead_source: 'Cold Outreach', company_size: '1-10' } },
    { name: 'Isabella Lewis', email: 'isabella@skincareco.com', phone: '+14255550112', title: 'Brand Manager', custom_fields: { lead_source: 'Google', company_size: '11-50' } },
    { name: 'Lucas Walker', email: 'lucas@manufacture.com', phone: '+12145550113', title: 'Factory Director', custom_fields: { lead_source: 'Referral', company_size: '200+' } },
    { name: 'Harper Hall', email: 'harper@fintechco.com', phone: '+14693550114', title: 'Growth Lead', custom_fields: { lead_source: 'LinkedIn', company_size: '51-200' } },
    { name: 'Chloe Young', email: 'chloe@fashionstore.com', phone: '+16193550115', title: 'Owner', custom_fields: { lead_source: 'Facebook', company_size: '1-10' } },
  ],

  deals: [
    { name: 'FreshTech Q3 SEO Package', value: 2500, stage: 'lead', contactIdx: 0, custom_fields: { project_type: 'SEO', monthly_budget: 800, contract_duration: 3 } },
    { name: 'StarBrand Facebook Ads July', value: 1800, stage: 'lead', contactIdx: 1, custom_fields: { project_type: 'Facebook Ads', monthly_budget: 600, contract_duration: 1 } },
    { name: 'BuildFast Website Redesign', value: 4500, stage: 'proposal', contactIdx: 2, custom_fields: { project_type: 'Web Design', monthly_budget: 0, contract_duration: 0 } },
    { name: 'RetailMax Google Ads', value: 3200, stage: 'proposal', contactIdx: 3, custom_fields: { project_type: 'Google Ads', monthly_budget: 1600, contract_duration: 2 } },
    { name: 'MedGroup Full Rebrand', value: 12000, stage: 'negotiation', contactIdx: 4, custom_fields: { project_type: 'Branding', monthly_budget: 0, contract_duration: 0 } },
    { name: 'ShopHouse Content Marketing', value: 1500, stage: 'negotiation', contactIdx: 5, custom_fields: { project_type: 'Content', monthly_budget: 500, contract_duration: 3 } },
    { name: 'EduHub Social Media', value: 2400, stage: 'onboarding', contactIdx: 6, custom_fields: { project_type: 'Facebook Ads', monthly_budget: 800, contract_duration: 3 } },
    { name: 'LuxBeauty Summer Ads', value: 3600, stage: 'active', contactIdx: 7, custom_fields: { project_type: 'Facebook Ads', monthly_budget: 1200, contract_duration: 3 } },
    { name: 'Logistics24 SEO + Ads', value: 4800, stage: 'active', contactIdx: 8, custom_fields: { project_type: 'Google Ads', monthly_budget: 1600, contract_duration: 3 } },
    { name: 'FoodChain Q2 Content', value: 2000, stage: 'renewal', contactIdx: 9, custom_fields: { project_type: 'Content', monthly_budget: 700, contract_duration: 3 } },
    { name: 'PropTech Portfolio Website', value: 5500, stage: 'won', contactIdx: 10, closedAt: '2026-03-01', custom_fields: { project_type: 'Web Design', contract_duration: 0 } },
    { name: 'SkinCareCo 6-Month SEO', value: 7200, stage: 'won', contactIdx: 11, closedAt: '2026-03-05', custom_fields: { project_type: 'SEO', monthly_budget: 1200, contract_duration: 6 } },
    { name: 'Manufacture Brand Identity', value: 8500, stage: 'won', contactIdx: 12, closedAt: '2026-02-20', custom_fields: { project_type: 'Branding', contract_duration: 0 } },
    { name: 'Fintech Growth Campaign', value: 6000, stage: 'lost', contactIdx: 13, closedAt: '2026-03-10', custom_fields: { project_type: 'Google Ads', monthly_budget: 2000 } },
    { name: 'FashionStore Social Package', value: 1200, stage: 'lost', contactIdx: 14, closedAt: '2026-03-08', custom_fields: { project_type: 'Facebook Ads', monthly_budget: 400 } },
  ],
};
