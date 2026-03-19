// =============================================================
// izhubs ERP — Coworking / Serviced Office Seed Data v2
// 30 contacts, 30 deals spanning 2024-2026
// Users: CEO, Sales, Ops/Community Manager, 1 inactive
// Pipeline: inquiry → consulting → site_visit → closing → negotiation → won / lost + member_active/renewal
// =============================================================

module.exports = {
  industry: 'Coworking / Serviced Office',

  users: [
    { name: 'Sam Space (CEO)',           email: 'demo_coworking_ceo@izhubs.com',  password: 'Demo@12345', role: 'admin',  active: true },
    { name: 'Lena Sales',               email: 'demo_coworking_sale@izhubs.com', password: 'Demo@12345', role: 'member', active: true },
    { name: 'Marco Community (Ops)',    email: 'demo_coworking_ops@izhubs.com',  password: 'Demo@12345', role: 'member', active: true },
    { name: 'Rita Former (Resigned)',   email: 'rita.former@izhubs-demo.com',    password: 'Demo@12345', role: 'member', active: false },
  ],

  customFields: [
    { entity: 'deal',    key: 'service_type',      label: 'Service Type',              type: 'select',  options: ['Hot Desk', 'Fixed Desk', 'Private Office', 'Virtual Office', 'Meeting Room', 'Company Registration', 'Mailbox'] },
    { entity: 'deal',    key: 'branch',             label: 'Branch',                    type: 'select',  options: ['Downtown', 'Midtown', 'Tech Hub', 'Westside', 'Airport', 'CBD'] },
    { entity: 'deal',    key: 'contract_months',    label: 'Contract Duration (months)',type: 'number' },
    { entity: 'deal',    key: 'desk_count',         label: 'Number of Desks',           type: 'number' },
    { entity: 'deal',    key: 'start_date',         label: 'Start Date',                type: 'date' },
    { entity: 'contact', key: 'company_name',       label: 'Company Name',              type: 'text' },
    { entity: 'contact', key: 'industry_type',      label: 'Industry',                  type: 'select',  options: ['Tech', 'Finance', 'Media', 'E-commerce', 'Consulting', 'Education', 'Healthcare', 'Legal', 'Other'] },
    { entity: 'contact', key: 'team_size',          label: 'Team Size',                 type: 'select',  options: ['1', '2-5', '6-10', '11-20', '20+'] },
  ],

  contacts: [
    { name: 'Anna Chen',       email: 'anna@virtualoffice.io',     phone: '+12025550301', title: 'CEO',              status: 'customer', custom_fields: { company_name: 'VirtualCo',        industry_type: 'Tech',        team_size: '1' } },
    { name: 'Ben Harrington',  email: 'ben@designer.io',           phone: '+14155550302', title: 'Freelancer',       status: 'customer', custom_fields: { company_name: 'Solo Design',       industry_type: 'Media',       team_size: '1' } },
    { name: 'Chloe Martin',    email: 'chloe@codingteam.io',       phone: '+13105550303', title: 'CTO',              status: 'customer', custom_fields: { company_name: 'CodeTeam',          industry_type: 'Tech',        team_size: '2-5' } },
    { name: 'Daniel Ross',     email: 'daniel@lawoffice.com',      phone: '+16505550304', title: 'Partner',          status: 'customer', custom_fields: { company_name: 'Ross & Partners',   industry_type: 'Legal',       team_size: '2-5' } },
    { name: 'Emily Parker',    email: 'emily@consultco.com',       phone: '+17185550305', title: 'Consultant',       status: 'customer', custom_fields: { company_name: 'Parker Consulting',  industry_type: 'Consulting',  team_size: '1' } },
    { name: 'Frank Nguyen',    email: 'frank@hourlywork.co',       phone: '+12125550306', title: 'PM',               status: 'customer', custom_fields: { company_name: 'HourlyWork',         industry_type: 'Consulting',  team_size: '1' } },
    { name: 'Grace Kim',       email: 'grace@techteam5.io',        phone: '+16175550307', title: 'Team Lead',        status: 'customer', custom_fields: { company_name: 'TechTeam5',          industry_type: 'Tech',        team_size: '6-10' } },
    { name: 'Henry Walsh',     email: 'henry@companereg.com',      phone: '+13055550308', title: 'Director',         status: 'customer', custom_fields: { company_name: 'CompanyReg Ltd',     industry_type: 'Legal',       team_size: '2-5' } },
    { name: 'Isla Thompson',   email: 'isla@westteam.io',          phone: '+14085550309', title: 'COO',              status: 'customer', custom_fields: { company_name: 'WestTeam',           industry_type: 'Finance',     team_size: '6-10' } },
    { name: 'Jack Morrison',   email: 'jack@meetingpro.com',       phone: '+15125550310', title: 'Sales Mgr',        status: 'customer', custom_fields: { company_name: 'MeetingPro',         industry_type: 'Consulting',  team_size: '1' } },
    { name: 'Karen Lee',       email: 'karen@techoffice8.io',      phone: '+17025550311', title: 'CEO',              status: 'customer', custom_fields: { company_name: 'TechOffice8',        industry_type: 'Tech',        team_size: '11-20' } },
    { name: 'Leo Brown',       email: 'leo@mailbox-pro.com',       phone: '+14255550312', title: 'Founder',          status: 'customer', custom_fields: { company_name: 'MailboxPro',         industry_type: 'E-commerce',  team_size: '1' } },
    { name: 'Maya Clark',      email: 'maya@hotdeskers.io',        phone: '+12145550313', title: 'Product Lead',     status: 'customer', custom_fields: { company_name: 'HotDeskers',         industry_type: 'Tech',        team_size: '2-5' } },
    { name: 'Nathan Scott',    email: 'nathan@meetrooms.co',       phone: '+14693550314', title: 'Operations',       status: 'prospect', custom_fields: { company_name: 'MeetRooms',          industry_type: 'Consulting',  team_size: '1' } },
    { name: 'Olivia Adams',    email: 'olivia@startup20.io',       phone: '+16193550315', title: 'Co-Founder',       status: 'customer', custom_fields: { company_name: 'Startup20',          industry_type: 'Tech',        team_size: '11-20' } },
    { name: 'Peter Grant',     email: 'peter@ecommercehub.io',     phone: '+17143550316', title: 'CEO',              status: 'prospect', custom_fields: { company_name: 'eCommerceHub',        industry_type: 'E-commerce',  team_size: '2-5' } },
    { name: 'Quinn Reyes',     email: 'quinn@financeapp.co',       phone: '+16463550317', title: 'CFO',              status: 'lead',     custom_fields: { company_name: 'FinanceApp',          industry_type: 'Finance',     team_size: '2-5' } },
    { name: 'Rachel Burns',    email: 'rachel@mediaproduction.io', phone: '+15593550318', title: 'Producer',         status: 'lead',     custom_fields: { company_name: 'MediaPro',           industry_type: 'Media',       team_size: '6-10' } },
    { name: 'Steve Cole',      email: 'steve@healthclinic.co',     phone: '+18163550319', title: 'Director',         status: 'lead',     custom_fields: { company_name: 'HealthClinic',        industry_type: 'Healthcare',  team_size: '11-20' } },
    { name: 'Tina Morris',     email: 'tina@edtech.io',            phone: '+12023550320', title: 'COO',              status: 'lead',     custom_fields: { company_name: 'EdTech',             industry_type: 'Education',   team_size: '6-10' } },
    { name: 'Uma Knight',      email: 'uma@oldstartup.io',         phone: '+14153550321', title: 'Founder',          status: 'churned',  custom_fields: { company_name: 'OldStartup',         industry_type: 'Tech',        team_size: '2-5' } },
    { name: 'Victor Kwan',     email: 'victor@relocatedco.co',     phone: '+13103550322', title: 'CEO',              status: 'churned',  custom_fields: { company_name: 'RelocatedCo',        industry_type: 'Consulting',  team_size: '1' } },
    { name: 'Wendy Shaw',      email: 'wendy@accounting5.com',     phone: '+16503550323', title: 'Partner',          status: 'customer', custom_fields: { company_name: 'Accounting5',        industry_type: 'Finance',     team_size: '2-5' } },
    { name: 'Xavier Long',     email: 'xavier@designersden.io',    phone: '+17183550324', title: 'Creative Lead',    status: 'customer', custom_fields: { company_name: 'DesignersDen',       industry_type: 'Media',       team_size: '6-10' } },
    { name: 'Yvonne Park',     email: 'yvonne@cbdlaw.com',         phone: '+12123550325', title: 'Lawyer',           status: 'prospect', custom_fields: { company_name: 'CBD Law',            industry_type: 'Legal',       team_size: '2-5' } },
    { name: 'Zachary Wells',   email: 'zach@ailab.io',             phone: '+16173550326', title: 'CTO',              status: 'lead',     custom_fields: { company_name: 'AI Lab',             industry_type: 'Tech',        team_size: '6-10' } },
    { name: 'Amy Bright',      email: 'amy@brightphysio.com',      phone: '+15123550327', title: 'Director',         status: 'prospect', custom_fields: { company_name: 'BrightPhysio',       industry_type: 'Healthcare',  team_size: '2-5' } },
    { name: 'Brian Dunn',      email: 'brian@dropshipco.io',       phone: '+17023550328', title: 'Founder',          status: 'lead',     custom_fields: { company_name: 'DropShipCo',         industry_type: 'E-commerce',  team_size: '1' } },
    { name: 'Carla Fox',       email: 'carla@tutoring.co',         phone: '+14693550329', title: 'CEO',              status: 'lead',     custom_fields: { company_name: 'TutoringCo',         industry_type: 'Education',   team_size: '2-5' } },
    { name: 'Derek Moon',      email: 'derek@airportbiz.com',      phone: '+16193550330', title: 'Operations Mgr',   status: 'prospect', custom_fields: { company_name: 'AirportBiz',         industry_type: 'Consulting',  team_size: '6-10' } },
  ],

  deals: [
    // 2024 Historical
    { name: 'VirtualCo Virtual Office 2024',       value: 1800,  stage: 'won',          contactIdx: 0,  closedAt: '2024-01-15', ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Virtual Office',  branch: 'Downtown', contract_months: 12, start_date: '2024-01-15' } },
    { name: 'CodeTeam Fixed Desks Q1 2024',        value: 5400,  stage: 'won',          contactIdx: 2,  closedAt: '2024-02-01', ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Fixed Desk',      branch: 'Tech Hub', contract_months: 12, desk_count: 3, start_date: '2024-02-01' } },
    { name: 'Ross Partners Private Office 2024',   value: 18000, stage: 'won',          contactIdx: 3,  closedAt: '2024-03-01', ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Private Office',  branch: 'CBD',      contract_months: 12, start_date: '2024-03-01' } },
    { name: 'Uma OldStartup — Left Early',         value: 0,     stage: 'lost',         contactIdx: 20, closedAt: '2024-04-30', ownerEmail: 'rita.former@izhubs-demo.com',    custom_fields: { service_type: 'Fixed Desk',      branch: 'Midtown',  contract_months: 6 } },
    { name: 'Victor RelocatedCo — Moved Away',     value: 900,   stage: 'lost',         contactIdx: 21, closedAt: '2024-05-31', ownerEmail: 'rita.former@izhubs-demo.com',    custom_fields: { service_type: 'Hot Desk',        branch: 'Downtown', contract_months: 3 } },
    { name: 'TechTeam5 Expansion 6 Desks',         value: 10800, stage: 'won',          contactIdx: 6,  closedAt: '2024-06-01', ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Fixed Desk',      branch: 'Tech Hub', contract_months: 12, desk_count: 6, start_date: '2024-06-01' } },
    { name: 'CompanyReg Annual Mailbox',           value: 2160,  stage: 'won',          contactIdx: 7,  closedAt: '2024-07-01', ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Mailbox',          branch: 'Downtown', contract_months: 12 } },
    { name: 'WestTeam Finance 5 Desks 2024',       value: 9000,  stage: 'won',          contactIdx: 8,  closedAt: '2024-08-01', ownerEmail: 'demo_coworking_sales@izhubs.com', custom_fields: { service_type: 'Fixed Desk',     branch: 'Westside', contract_months: 12, desk_count: 5, start_date: '2024-08-01' } },
    { name: 'Accounting5 Virtual + Mailbox',       value: 2400,  stage: 'won',          contactIdx: 22, closedAt: '2024-09-01', ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Virtual Office',  branch: 'CBD',      contract_months: 12 } },
    { name: 'TechOffice8 Private 10-Person',       value: 24000, stage: 'won',          contactIdx: 10, closedAt: '2024-10-01', ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Private Office',  branch: 'Tech Hub', contract_months: 12, desk_count: 10, start_date: '2024-10-01' } },
    { name: 'Startup20 Expansion 12 Desks',        value: 21600, stage: 'won',          contactIdx: 14, closedAt: '2024-11-01', ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Private Office',  branch: 'Tech Hub', contract_months: 12, desk_count: 12, start_date: '2024-11-01' } },
    { name: 'DesignersDen Media Studio 2024',      value: 12000, stage: 'won',          contactIdx: 23, closedAt: '2024-12-01', ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Fixed Desk',      branch: 'Midtown', contract_months: 12, desk_count: 8, start_date: '2024-12-01' } },
    // 2025
    { name: 'Parker Consulting Virtual 2025',      value: 2100,  stage: 'won',          contactIdx: 4,  closedAt: '2025-01-15', ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Virtual Office',  branch: 'Downtown', contract_months: 12 } },
    { name: 'Ben Solo Designer Hot Desk 2025',     value: 1440,  stage: 'member_active',contactIdx: 1,  ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Hot Desk',        branch: 'Midtown', contract_months: 12, start_date: '2025-02-01' } },
    { name: 'MailboxPro Registration 2025',        value: 2160,  stage: 'renewal',      contactIdx: 11, ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Mailbox',          branch: 'Downtown', contract_months: 12 } },
    { name: 'HotDeskers 2 Desks 2025',             value: 3600,  stage: 'member_active',contactIdx: 12, ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Fixed Desk',      branch: 'Downtown', contract_months: 12, desk_count: 2, start_date: '2025-03-01' } },
    { name: 'HourlyWork Meeting Room Pack',        value: 960,   stage: 'member_active',contactIdx: 5,  ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Meeting Room',    branch: 'Midtown', contract_months: 12 } },
    { name: 'HealthClinic Private Office 2025',    value: 28800, stage: 'won',          contactIdx: 18, closedAt: '2025-05-01', ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Private Office',  branch: 'CBD',      contract_months: 12, desk_count: 15, start_date: '2025-05-01' } },
    { name: 'CBD Law Virtual + Reception',         value: 3600,  stage: 'won',          contactIdx: 24, closedAt: '2025-07-01', ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Virtual Office',  branch: 'CBD',      contract_months: 12, start_date: '2025-07-01' } },
    { name: 'BrightPhysio Medical Room 2025',      value: 7200,  stage: 'won',          contactIdx: 26, closedAt: '2025-09-01', ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Private Office',  branch: 'Westside', contract_months: 12, desk_count: 3 } },
    { name: 'AI Lab 5-Desk Expansion 2025',        value: 9000,  stage: 'won',          contactIdx: 25, closedAt: '2025-11-01', ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Fixed Desk',      branch: 'Tech Hub', contract_months: 12, desk_count: 5, start_date: '2025-11-01' } },
    // 2026 — Current pipeline
    { name: 'Anna Chen Virtual Renewal 2026',      value: 1800,  stage: 'renewal',      contactIdx: 0,  ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Virtual Office',  branch: 'Downtown', contract_months: 12 } },
    { name: 'FinanceApp 3-Desk Inquiry',           value: 5400,  stage: 'consulting',   contactIdx: 16, ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Fixed Desk',      branch: 'CBD',      contract_months: 6,  desk_count: 3 } },
    { name: 'MediaPro Studio 6-Desk',              value: 10800, stage: 'site_visit',   contactIdx: 17, ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Fixed Desk',      branch: 'Midtown', contract_months: 6,  desk_count: 6 } },
    { name: 'EdTech Training Room Lease',          value: 14400, stage: 'consulting',   contactIdx: 19, ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Private Office',  branch: 'CBD',      contract_months: 12, desk_count: 8 } },
    { name: 'eCommerceHub 4-Desk Inquiry',         value: 7200,  stage: 'site_visit',   contactIdx: 15, ownerEmail: 'demo_coworking_ops@izhubs.com',  custom_fields: { service_type: 'Fixed Desk',      branch: 'Midtown', contract_months: 12, desk_count: 4 } },
    { name: 'AirportBiz Executive Suite',          value: 36000, stage: 'closing',      contactIdx: 29, ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Private Office',  branch: 'Airport', contract_months: 12, desk_count: 20 } },
    { name: 'DropShipCo Mailbox + Address',        value: 960,   stage: 'inquiry',      contactIdx: 27, ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Virtual Office',  branch: 'Downtown' } },
    { name: 'TutoringCo Training Room Q2',         value: 10800, stage: 'negotiation',  contactIdx: 28, ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Private Office',  branch: 'Tech Hub', contract_months: 12, desk_count: 5 } },
    { name: 'Nathan Meeting Room Pack 2026',       value: 1440,  stage: 'quoted',       contactIdx: 13, ownerEmail: 'demo_coworking_sale@izhubs.com', custom_fields: { service_type: 'Meeting Room',    branch: 'Midtown', contract_months: 12 } },
    { name: 'Startup20 2026 Renewal 20 Desks',    value: 36000, stage: 'renewal',      contactIdx: 14, ownerEmail: 'demo_coworking_ceo@izhubs.com',   custom_fields: { service_type: 'Private Office',  branch: 'Tech Hub', contract_months: 12, desk_count: 20 } },
  ],
};
