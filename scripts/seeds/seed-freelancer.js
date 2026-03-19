// =============================================================
// izhubs ERP — Freelancer / Consultant Seed Data v2
// 30 contacts, 30 deals spanning 2024-2026
// Users: CEO (Founder), Sales, Ops, 1 inactive
// Pipeline: lead → proposal → negotiation → revision → completed → won / lost
// =============================================================

module.exports = {
  industry: 'Freelancer / Consultant',

  users: [
    { name: 'Taylor Kim (Founder)',    email: 'demo_freelancer_ceo@izhubs.com',  password: 'Demo@12345', role: 'admin',  active: true },
    { name: 'Jordan Sales',            email: 'demo_freelancer_sale@izhubs.com', password: 'Demo@12345', role: 'member', active: true },
    { name: 'Riley Ops',               email: 'demo_freelancer_ops@izhubs.com',  password: 'Demo@12345', role: 'member', active: true },
    { name: 'Chris Old (Left)',        email: 'chris.old@izhubs-demo.com',       password: 'Demo@12345', role: 'member', active: false },
  ],

  customFields: [
    { entity: 'deal',    key: 'project_type',    label: 'Project Type',            type: 'select',  options: ['Web Development', 'Mobile App', 'UI/UX Design', 'Copywriting', 'Consulting', 'Video Editing', 'Data Analysis', 'Other'] },
    { entity: 'deal',    key: 'hourly_rate',      label: 'Hourly Rate (USD)',        type: 'number' },
    { entity: 'deal',    key: 'estimated_hours',  label: 'Estimated Hours',          type: 'number' },
    { entity: 'deal',    key: 'deadline',         label: 'Project Deadline',         type: 'date' },
    { entity: 'deal',    key: 'revision_rounds',  label: 'Revision Rounds',          type: 'number' },
    { entity: 'contact', key: 'country',          label: 'Country',                  type: 'select',  options: ['USA', 'UK', 'Australia', 'Canada', 'Germany', 'Vietnam', 'Singapore', 'Japan', 'Other'] },
    { entity: 'contact', key: 'platform',         label: 'Platform',                 type: 'select',  options: ['Upwork', 'Fiverr', 'Toptal', 'Direct', 'LinkedIn', 'Referral'] },
  ],

  contacts: [
    { name: 'Connor Blake',     email: 'connor@techstartup.io',    phone: '+12025551001', title: 'CTO',              status: 'customer',  custom_fields: { country: 'USA',       platform: 'Direct' } },
    { name: 'Mei Lin',          email: 'mei@sgventure.com',        phone: '+6587654321',  title: 'Product Manager',  status: 'customer',  custom_fields: { country: 'Singapore', platform: 'LinkedIn' } },
    { name: 'Oliver Shaw',      email: 'oliver@agencyuk.co.uk',   phone: '+4420754321',  title: 'Creative Dir',     status: 'customer',  custom_fields: { country: 'UK',        platform: 'Referral' } },
    { name: 'Yuki Tanaka',      email: 'yuki@corpjapan.co.jp',    phone: '+81312345678', title: 'Digital Lead',     status: 'customer',  custom_fields: { country: 'Japan',     platform: 'Upwork' } },
    { name: 'Anh Nguyen',       email: 'anh@vnstartup.vn',        phone: '+84901234567', title: 'Founder',          status: 'customer',  custom_fields: { country: 'Vietnam',   platform: 'Direct' } },
    { name: 'Sophie Turner',    email: 'sophie@ausdesign.com.au',  phone: '+61291234567', title: 'UX Lead',          status: 'customer',  custom_fields: { country: 'Australia', platform: 'Toptal' } },
    { name: 'Hans Müller',      email: 'hans@germancorp.de',       phone: '+4930123456',  title: 'IT Manager',       status: 'customer',  custom_fields: { country: 'Germany',   platform: 'LinkedIn' } },
    { name: 'Rachel Green',     email: 'rachel@designco.com',      phone: '+12025551008', title: 'Creative Dir',     status: 'customer',  custom_fields: { country: 'USA',       platform: 'Fiverr' } },
    { name: 'Leo Chang',        email: 'leo@latamco.com',          phone: '+5511912345',  title: 'CEO',              status: 'customer',  custom_fields: { country: 'Other',     platform: 'Upwork' } },
    { name: 'Emma Stone',       email: 'emma@nycblog.com',         phone: '+12125551010', title: 'Content Lead',     status: 'customer',  custom_fields: { country: 'USA',       platform: 'Direct' } },
    { name: 'Jake Liu',         email: 'jake@hktrades.hk',         phone: '+85223456789', title: 'CMO',              status: 'prospect',  custom_fields: { country: 'Other',     platform: 'LinkedIn' } },
    { name: 'Sara Beck',        email: 'sara@medicalpubs.com',     phone: '+14155551012', title: 'Publisher',        status: 'prospect',  custom_fields: { country: 'USA',       platform: 'Referral' } },
    { name: 'Alex Kim',         email: 'alex@koreanapp.kr',        phone: '+8225551013',  title: 'CTO',              status: 'prospect',  custom_fields: { country: 'Other',     platform: 'Upwork' } },
    { name: 'Michelle Ford',    email: 'mford@canadacorp.ca',      phone: '+16045551014', title: 'Marketing Mgr',    status: 'lead',      custom_fields: { country: 'Canada',    platform: 'LinkedIn' } },
    { name: 'Dan Pearce',       email: 'dan@startup99.co',         phone: '+4479055515',  title: 'Founder',          status: 'lead',      custom_fields: { country: 'UK',        platform: 'Direct' } },
    { name: 'Ingrid Svensson',  email: 'ingrid@swedentech.se',     phone: '+46812345678', title: 'COO',              status: 'lead',      custom_fields: { country: 'Other',     platform: 'Toptal' } },
    { name: 'Frank Osei',       email: 'frank@africasaas.io',      phone: '+23320551016', title: 'CEO',              status: 'lead',      custom_fields: { country: 'Other',     platform: 'Upwork' } },
    { name: 'Tina Vo',          email: 'tina@vobrand.vn',          phone: '+84901551017', title: 'Creative',         status: 'lead',      custom_fields: { country: 'Vietnam',   platform: 'Direct' } },
    { name: 'Mark Donovan',     email: 'mark@irishfintech.ie',     phone: '+35316551018', title: 'Product',          status: 'lead',      custom_fields: { country: 'Other',     platform: 'Fiverr' } },
    { name: 'Cynthia Okafor',   email: 'cynthia@lagosmedia.ng',    phone: '+23480551019', title: 'Content Mgr',      status: 'lead',      custom_fields: { country: 'Other',     platform: 'Upwork' } },
    { name: 'Ben Carter',       email: 'ben@lostclient.com',       phone: '+12025551020', title: 'Founder',          status: 'churned',   custom_fields: { country: 'USA',       platform: 'Upwork' } },
    { name: 'Yuna Park',        email: 'yuna@ghosted.co',          phone: '+82225551021', title: 'CMO',              status: 'churned',   custom_fields: { country: 'Other',     platform: 'Fiverr' } },
    { name: 'Mark Old',         email: 'mark@oldproject.com',      phone: '+14155551022', title: 'CTO',              status: 'churned',   custom_fields: { country: 'USA',       platform: 'Direct' } },
    { name: 'Alice Cheng',      email: 'alice@sg-growth.com',      phone: '+6591234023',  title: 'Head of Growth',   status: 'customer',  custom_fields: { country: 'Singapore', platform: 'LinkedIn' } },
    { name: 'Nathan Frost',     email: 'nathan@digitalwave.io',    phone: '+12025551024', title: 'Creative Dir',     status: 'customer',  custom_fields: { country: 'USA',       platform: 'Referral' } },
    { name: 'Luna Park',        email: 'luna@kpopapp.kr',          phone: '+8225551025',  title: 'Product Mgr',      status: 'prospect',  custom_fields: { country: 'Other',     platform: 'Upwork' } },
    { name: 'James Porter',     email: 'james@sydneyweb.au',       phone: '+61292551026', title: 'Director',         status: 'prospect',  custom_fields: { country: 'Australia', platform: 'Direct' } },
    { name: 'Hana Ahmed',       email: 'hana@dubaidigital.ae',     phone: '+97145551027', title: 'Marketing Mgr',    status: 'lead',      custom_fields: { country: 'Other',     platform: 'LinkedIn' } },
    { name: 'Paulo Silva',      email: 'paulo@brdesign.com.br',    phone: '+5511978551028',title:'UI Lead',          status: 'lead',      custom_fields: { country: 'Other',     platform: 'Upwork' } },
    { name: 'Grace O\'Brien',   email: 'grace@boston-tech.com',    phone: '+16175551029', title: 'CXO',              status: 'prospect',  custom_fields: { country: 'USA',       platform: 'Toptal' } },
  ],

  deals: [
    // 2024 Historical
    { name: 'TechStartup Landing Page 2024',   value: 1400,  stage: 'completed', contactIdx: 0,  closedAt: '2024-01-30', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Web Development', hourly_rate: 70,  estimated_hours: 20, deadline: '2024-01-30' } },
    { name: 'SGVenture Mobile UI Q1 2024',     value: 3000,  stage: 'completed', contactIdx: 1,  closedAt: '2024-02-28', ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 60,  estimated_hours: 50, deadline: '2024-02-28' } },
    { name: 'AgencyUK Brand Strategy',         value: 4000,  stage: 'completed', contactIdx: 2,  closedAt: '2024-03-20', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Consulting',      hourly_rate: 80,  estimated_hours: 50, deadline: '2024-03-20' } },
    { name: 'CorpJapan UX Audit',              value: 2800,  stage: 'completed', contactIdx: 3,  closedAt: '2024-04-15', ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 70,  estimated_hours: 40, deadline: '2024-04-15' } },
    { name: 'VNStartup App MVP',               value: 7500,  stage: 'completed', contactIdx: 4,  closedAt: '2024-06-30', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Mobile App',      hourly_rate: 50,  estimated_hours: 150,deadline: '2024-06-30' } },
    { name: 'Ben Carter — Lost',               value: 2000,  stage: 'lost',      contactIdx: 20, closedAt: '2024-03-10', ownerEmail: 'chris.old@izhubs-demo.com',      custom_fields: { project_type: 'Web Development', hourly_rate: 50,  estimated_hours: 40 } },
    { name: 'Yuna Park Scope Creep — Lost',    value: 1500,  stage: 'lost',      contactIdx: 21, closedAt: '2024-05-15', ownerEmail: 'chris.old@izhubs-demo.com',      custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 50,  estimated_hours: 30 } },
    { name: 'AusDesign UX System',             value: 5400,  stage: 'completed', contactIdx: 5,  closedAt: '2024-07-31', ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 90,  estimated_hours: 60, deadline: '2024-07-31' } },
    { name: 'GermanCorp IT Consulting',        value: 6400,  stage: 'completed', contactIdx: 6,  closedAt: '2024-08-31', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Consulting',      hourly_rate: 80,  estimated_hours: 80, deadline: '2024-08-31' } },
    { name: 'DesignCo Logo + Brand',           value: 1400,  stage: 'completed', contactIdx: 7,  closedAt: '2024-09-15', ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 70,  estimated_hours: 20 } },
    { name: 'LatamCo Blog Content 2024',       value: 1650,  stage: 'completed', contactIdx: 8,  closedAt: '2024-10-30', ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'Copywriting',    hourly_rate: 55,  estimated_hours: 30, deadline: '2024-10-30' } },
    { name: 'NYC Newsletter Sequence',         value: 2400,  stage: 'won',       contactIdx: 9,  closedAt: '2024-11-15', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Copywriting',    hourly_rate: 80,  estimated_hours: 30 } },
    { name: 'Mark Old — Legacy Site',          value: 3500,  stage: 'lost',      contactIdx: 22, closedAt: '2024-12-01', ownerEmail: 'chris.old@izhubs-demo.com',      custom_fields: { project_type: 'Web Development', hourly_rate: 70,  estimated_hours: 50 } },
    // 2025
    { name: 'HKTrades E-commerce App',         value: 8500,  stage: 'completed', contactIdx: 10, closedAt: '2025-03-31', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Mobile App',      hourly_rate: 85,  estimated_hours: 100,deadline: '2025-03-31' } },
    { name: 'MedicalPubs Content Refresh',     value: 2200,  stage: 'completed', contactIdx: 11, closedAt: '2025-04-30', ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'Copywriting',    hourly_rate: 55,  estimated_hours: 40, deadline: '2025-04-30' } },
    { name: 'KoreanApp Dashboard UI',          value: 4200,  stage: 'completed', contactIdx: 12, closedAt: '2025-06-15', ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 70,  estimated_hours: 60, deadline: '2025-06-15' } },
    { name: 'SG Growth Landing Pages',         value: 3000,  stage: 'completed', contactIdx: 23, closedAt: '2025-08-30', ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'Web Development', hourly_rate: 75,  estimated_hours: 40, deadline: '2025-08-30' } },
    { name: 'DigitalWave Brand Video',         value: 2800,  stage: 'completed', contactIdx: 24, closedAt: '2025-09-30', ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'Video Editing',   hourly_rate: 70,  estimated_hours: 40, deadline: '2025-09-30' } },
    { name: 'SydneyWeb Redesign 2025',         value: 5500,  stage: 'won',       contactIdx: 26, closedAt: '2025-10-31', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Web Development', hourly_rate: 110, estimated_hours: 50 } },
    { name: 'Boston Tech Data Dashboard',      value: 6000,  stage: 'won',       contactIdx: 29, closedAt: '2025-12-15', ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Data Analysis',   hourly_rate: 120, estimated_hours: 50 } },
    // 2026 — Current pipeline
    { name: 'CanadaCorp Website Refresh',      value: 3600,  stage: 'proposal',  contactIdx: 13, ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'Web Development', hourly_rate: 90,  estimated_hours: 40, deadline: '2026-04-30' } },
    { name: 'UK Startup Pitch Deck',           value: 2000,  stage: 'lead',      contactIdx: 14, ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'Consulting',      hourly_rate: 100, estimated_hours: 20, deadline: '2026-05-15' } },
    { name: 'SwedenTech App Audit',            value: 2800,  stage: 'proposal',  contactIdx: 15, ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'Consulting',      hourly_rate: 70,  estimated_hours: 40, deadline: '2026-04-01' } },
    { name: 'AfricaSaaS MVP Build',            value: 9000,  stage: 'negotiation',contactIdx:16, ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Mobile App',      hourly_rate: 60,  estimated_hours: 150,deadline: '2026-07-01' } },
    { name: 'VoBrand Social Kit',              value: 1200,  stage: 'lead',      contactIdx: 17, ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 60,  estimated_hours: 20, deadline: '2026-04-20' } },
    { name: 'IrishFintech Dashboard',          value: 7200,  stage: 'negotiation',contactIdx:18, ownerEmail: 'demo_freelancer_ceo@izhubs.com', custom_fields: { project_type: 'Web Development', hourly_rate: 120, estimated_hours: 60, deadline: '2026-05-30' } },
    { name: 'LagosMedia Content X6',          value: 1800,  stage: 'lead',      contactIdx: 19, ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'Copywriting',    hourly_rate: 50,  estimated_hours: 36, deadline: '2026-04-30' } },
    { name: 'KpopApp Redesign',                value: 4500,  stage: 'revision',  contactIdx: 25, ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 75,  estimated_hours: 60, revision_rounds: 3, deadline: '2026-04-10' } },
    { name: 'DubaiDigital Brand Refresh',      value: 5500,  stage: 'proposal',  contactIdx: 27, ownerEmail: 'demo_freelancer_sale@izhubs.com',custom_fields: { project_type: 'Branding (via ref)',hourly_rate: 110,estimated_hours: 50, deadline: '2026-05-01' } },
    { name: 'BRDesign UI Kit Q2 2026',         value: 2400,  stage: 'negotiation',contactIdx:28, ownerEmail: 'demo_freelancer_ops@izhubs.com', custom_fields: { project_type: 'UI/UX Design',    hourly_rate: 60,  estimated_hours: 40, deadline: '2026-06-01' } },
  ],
};
