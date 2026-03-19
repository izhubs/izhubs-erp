// =============================================================
// izhubs ERP — Virtual Office Services Seed Data v2
// 30 contacts, 30 deals spanning 2024-2026 (EN + VI)
// Users: CEO, Sales, Ops, 1 inactive
// Pipeline: lead → proposal → negotiation → onboarding → active → renewal → won / lost
// =============================================================

const contacts_en = [
  { name: 'James Forster',    email: 'james@freshstartco.com',   phone: '+12025550501', title: 'CEO',              status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 12 } },
  { name: 'Sophia Cheng',     email: 'sophia@innovatech.io',     phone: '+14155550502', title: 'Founder',          status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 24 } },
  { name: 'Marcus Lane',      email: 'marcus@buildfast.net',     phone: '+13105550503', title: 'Operations Dir',   status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
  { name: 'Linda Vu',         email: 'linda@retailhub.co',       phone: '+16505550504', title: 'E-commerce Mgr',   status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Chris Harper',     email: 'chris@medgroup.org',       phone: '+17185550505', title: 'COO',              status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Amy Shelton',      email: 'amy@shophouse.io',         phone: '+12125550506', title: 'Owner',            status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Nathan Cole',      email: 'nathan@eduvine.io',        phone: '+16175550507', title: 'Director',         status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Diana Fox',        email: 'diana@luxspace.com',       phone: '+13055550508', title: 'CEO',              status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Owen Price',       email: 'owen@logistics24.io',      phone: '+14085550509', title: 'Logistics Dir',    status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Laura Ross',       email: 'laura@foodchain.com',      phone: '+15125550510', title: 'Marketing Lead',   status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Ryan Stone',       email: 'ryan@proptech.io',         phone: '+17025550511', title: 'CEO',              status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Emma Grace',       email: 'emma@artco.io',            phone: '+14255550512', title: 'Creative Dir',     status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 24 } },
  { name: 'Victor Park',      email: 'victor@tradesupply.com',   phone: '+12145550513', title: 'Supply Dir',       status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
  { name: 'Sarah Finn',       email: 'sarah@finrise.com',        phone: '+14693550514', title: 'CFO',              status: 'churned',  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 6 } },
  { name: 'Kevin Clark',      email: 'kevin@stylestore.com',     phone: '+16193550515', title: 'Owner',            status: 'churned',  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 3 } },
  { name: 'Olivia Hunt',      email: 'olivia@techventure.io',    phone: '+17143550516', title: 'CTO',              status: 'prospect', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Ethan Cross',      email: 'ethan@growthco.io',        phone: '+16463550517', title: 'CEO',              status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Chloe Black',      email: 'chloe@organicshop.com',   phone: '+15593550518', title: 'Marketing Mgr',   status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Noah Wells',       email: 'noah@wellness360.io',      phone: '+18163550519', title: 'Director',         status: 'lead',     custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Mia Lane',         email: 'mia@urbanfood.io',         phone: '+12023550520', title: 'Owner',            status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Lucas Moore',      email: 'lucas@sgventure.com',      phone: '+6591234501',  title: 'COO',              status: 'prospect', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Sophie Nguyen',    email: 'sophie@vnbrand.vn',        phone: '+84901234501', title: 'Creative Lead',    status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'David Kim',        email: 'david@krconsult.co.kr',    phone: '+82212345501', title: 'Director',         status: 'prospect', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Grace White',      email: 'grace@ukagency.co.uk',     phone: '+44207554501', title: 'Managing Dir',     status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Finn O\'Brien',    email: 'finn@irishtech.ie',        phone: '+35316554501', title: 'CTO',              status: 'prospect', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Maya Singh',       email: 'maya@indiasaas.in',        phone: '+91112345501', title: 'Founder',          status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Carlos Ruiz',      email: 'carlos@latamgrow.co',      phone: '+5511912345',  title: 'COO',              status: 'lead',     custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Elena Volkov',     email: 'elena@eurohub.eu',         phone: '+497612345501',title: 'VP Operations',    status: 'prospect', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Ahmed Hassan',     email: 'ahmed@dubaioffice.ae',     phone: '+97145554501', title: 'Managing Dir',     status: 'lead',     custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Tom Larson',       email: 'tom@aussieexport.com.au',  phone: '+61291234501', title: 'Sales Dir',        status: 'prospect', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
];

const contacts_vi = [
  { name: 'Nguyễn Văn Thắng', email: 'thang@freshstartco.vn',   phone: '+84901234502', title: 'Giám Đốc',         status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 12 } },
  { name: 'Trần Thị Lan',      email: 'lan@innovatech.vn',        phone: '+84912234502', title: 'Nhà Sáng Lập',     status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 24 } },
  { name: 'Lê Văn Minh',       email: 'minh@buildfast.vn',        phone: '+84921234502', title: 'Giám Đốc Ops',     status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
  { name: 'Phạm Thị Hoa',      email: 'hoa@retailhub.vn',         phone: '+84931234502', title: 'Quản Lý',          status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Vũ Đức Anh',        email: 'anh@medgroup.vn',          phone: '+84941234502', title: 'COO',              status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Đặng Thị Mai',      email: 'mai@shophouse.vn',         phone: '+84951234502', title: 'Chủ Sở Hữu',       status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Bùi Văn Nam',       email: 'nam@eduvine.vn',           phone: '+84961234502', title: 'Giám Đốc',         status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Hoàng Thị Linh',    email: 'linh@luxspace.vn',         phone: '+84971234502', title: 'CEO',              status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Phan Văn Đức',       email: 'duc@logistics24.vn',       phone: '+84981234502', title: 'Giám Đốc',         status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Ngô Thị Thuỷ',      email: 'thuy@foodchain.vn',        phone: '+84991234502', title: 'Marketing Lead',   status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Đinh Văn Hưng',     email: 'hung@proptech.vn',         phone: '+84911234503', title: 'CEO',              status: 'customer', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Lý Thị Hằng',       email: 'hang@artco.vn',            phone: '+84922234503', title: 'Creative Dir',     status: 'customer', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 24 } },
  { name: 'Trương Văn Sơn',    email: 'son@tradesupply.vn',       phone: '+84933234503', title: 'Supply Dir',       status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
  { name: 'Võ Thị Phương',     email: 'phuong@finrise.vn',        phone: '+84944234503', title: 'CFO',              status: 'churned',  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 6 } },
  { name: 'Hồ Văn Khánh',      email: 'khanh@stylestore.vn',      phone: '+84955234503', title: 'Chủ SH',           status: 'churned',  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 3 } },
  { name: 'Mai Thị Thu',        email: 'thu@techventure.vn',       phone: '+84966234503', title: 'CTO',              status: 'prospect', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Cao Văn Bình',       email: 'binh@growthco.vn',         phone: '+84977234503', title: 'CEO',              status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Đỗ Thị Ngọc',       email: 'ngoc@organicshop.vn',      phone: '+84988234503', title: 'Marketing Mgr',    status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Lâm Văn Khoa',       email: 'khoa@wellness360.vn',      phone: '+84999234503', title: 'Giám Đốc',         status: 'lead',     custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Trần Như Ý',         email: 'y@urbanfood.vn',           phone: '+84910234504', title: 'Chủ SH',           status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Nguyễn Đức Tài',     email: 'tai@sgventure.vn',         phone: '+84921234504', title: 'COO',              status: 'prospect', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Phùng Thị Cẩm',     email: 'cam@vnbrand.vn',           phone: '+84932234504', title: 'Creative Lead',    status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Đặng Văn Quang',     email: 'quang@krconsult.vn',       phone: '+84943234504', title: 'Giám Đốc',         status: 'prospect', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Lê Ngọc Bảo',       email: 'bao@ukagency.vn',          phone: '+84954234504', title: 'Managing Dir',     status: 'customer', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Vương Thị Nga',      email: 'nga@irishtech.vn',         phone: '+84965234504', title: 'CTO',              status: 'prospect', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Huỳnh Bảo Long',     email: 'long@indiasaas.vn',        phone: '+84976234504', title: 'Nhà Sáng Lập',     status: 'lead',     custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Lưu Thị Tuyết',      email: 'tuyet@latamgrow.vn',       phone: '+84987234504', title: 'COO',              status: 'lead',     custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'Hà Văn Dũng',        email: 'dung@eurohub.vn',          phone: '+84998234504', title: 'VP Vận Hành',      status: 'prospect', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Bạch Thị Huyền',    email: 'huyen@dubaioffice.vn',     phone: '+84909234504', title: 'Managing Dir',     status: 'lead',     custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Tạ Hữu Phúc',        email: 'phuc@aussieexport.vn',     phone: '+84920234505', title: 'Giám Đốc Kinh Doanh',status:'prospect',custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
];

// Deals are the same structure for both languages (values are universal)
const deals_en = [
  // 2024 Historical — Won
  { name: 'FreshStartCo Basic Package 2024',     value: 1800000, stage: 'won',       contactIdx: 0,  closedAt: '2024-01-15', ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 12 } },
  { name: 'InnovaTech Pro Office 2024',           value: 3600000, stage: 'won',       contactIdx: 1,  closedAt: '2024-02-20', ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 24 } },
  { name: 'BuildFast Enterprise HQ 2024',         value: 7200000, stage: 'won',       contactIdx: 2,  closedAt: '2024-03-01', ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
  { name: 'RetailHub Basic Registration 2024',    value: 1800000, stage: 'won',       contactIdx: 3,  closedAt: '2024-04-01', ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'FinRise Pro Package — Churned',        value: 3600000, stage: 'lost',      contactIdx: 13, closedAt: '2024-05-10', ownerEmail: 'former.vo@izhubs-demo.com',    custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 6 } },
  { name: 'StyleStore Basic — Short Contract',    value: 1800000, stage: 'lost',      contactIdx: 14, closedAt: '2024-06-30', ownerEmail: 'former.vo@izhubs-demo.com',    custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 3 } },
  { name: 'MedGroup Enterprise Corp 2024',        value: 5400000, stage: 'won',       contactIdx: 4,  closedAt: '2024-07-01', ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'ShopHouse Pro Bundle 2024',            value: 3600000, stage: 'won',       contactIdx: 5,  closedAt: '2024-08-01', ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'EduVine Basic Address 2024',           value: 1800000, stage: 'won',       contactIdx: 6,  closedAt: '2024-09-01', ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'LuxSpace Enterprise HQ 2024',          value: 7200000, stage: 'won',       contactIdx: 7,  closedAt: '2024-10-01', ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'Logistics24 Pro Address 2024',         value: 3600000, stage: 'won',       contactIdx: 8,  closedAt: '2024-11-01', ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'FoodChain Annual Renewal 2024',        value: 3600000, stage: 'won',       contactIdx: 9,  closedAt: '2024-12-01', ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  // 2025
  { name: 'PropTech Pro Contract 2025',           value: 3600000, stage: 'won',       contactIdx: 10, closedAt: '2025-01-15', ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'ArtCo Basic 2-Year 2025',             value: 3600000, stage: 'active',    contactIdx: 11, ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 24 } },
  { name: 'TradeSupply Enterprise 2025',          value: 7200000, stage: 'active',    contactIdx: 12, ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
  { name: 'Grace UK Agency Enterprise 2025',      value: 7200000, stage: 'won',       contactIdx: 23, closedAt: '2025-03-01', ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'SGVenture Enterprise 2025',            value: 5400000, stage: 'active',    contactIdx: 20, ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'EuroHub Enterprise 2025',              value: 7200000, stage: 'won',       contactIdx: 27, closedAt: '2025-06-01', ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'KRConsult Pro 2025',                   value: 3600000, stage: 'active',    contactIdx: 22, ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'DubaiOffice Enterprise 2025',          value: 9000000, stage: 'active',    contactIdx: 28, ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
  { name: 'AussieExport Pro 2025',                value: 3600000, stage: 'won',       contactIdx: 29, closedAt: '2025-09-01', ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  // 2026 — Current pipeline
  { name: 'FreshStartCo Basic Renewal 2026',      value: 1800000, stage: 'renewal',   contactIdx: 0,  ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 12 } },
  { name: 'TechVenture Pro 2026',                 value: 3600000, stage: 'proposal',  contactIdx: 15, ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'GrowthCo Basic Inquiry',               value: 1800000, stage: 'lead',      contactIdx: 16, ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'OrganicShop Basic Package',            value: 1800000, stage: 'lead',      contactIdx: 17, ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'Wellness360 Pro Address',              value: 3600000, stage: 'negotiation',contactIdx:18, ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'UrbanFood Basic + Mailbox',            value: 2160000, stage: 'proposal',  contactIdx: 19, ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 12 } },
  { name: 'VNBrand Basic 2026',                   value: 1800000, stage: 'onboarding',contactIdx: 21, ownerEmail: 'demo_virtual_ops@izhubs.com',  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 12 } },
  { name: 'IndiaSaaS Basic Package',              value: 1800000, stage: 'lead',      contactIdx: 25, ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6 } },
  { name: 'LatamGrow Pro 2026',                   value: 3600000, stage: 'negotiation',contactIdx:26, ownerEmail: 'demo_virtual_ceo@izhubs.com',  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
  { name: 'IrishTech Pro Package 2026',           value: 3600000, stage: 'proposal',  contactIdx: 24, ownerEmail: 'demo_virtual_sale@izhubs.com', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
];

// Reuse same deals structure with Vietnamese names
const deals_vi = deals_en.map((d, i) => {
  const viNames = [
    'Gói Cơ bản FreshStart 2024', 'Gói Pro InnovaTech 2024', 'Địa chỉ Enterprise BuildFast 2024',
    'Đăng ký Cơ bản RetailHub 2024', 'Gói Pro FinRise — Hợp đồng kết thúc', 'Gói Basic StyleStore — Ngắn hạn',
    'Địa chỉ Doanh nghiệp MedGroup 2024', 'Gói Pro ShopHouse 2024', 'Gói Basic EduVine 2024',
    'Trụ sở Enterprise LuxSpace 2024', 'Địa chỉ Pro Logistics24 2024', 'Gia hạn FoodChain 2024',
    'Hợp đồng Pro PropTech 2025', 'Gói Basic 2 năm ArtCo 2025', 'Gói Enterprise TradeSupply 2025',
    'UK Agency Enterprise 2025', 'SGVenture Enterprise 2025', 'EuroHub Enterprise 2025',
    'KRConsult Pro 2025', 'DubaiOffice Enterprise 2025', 'AussieExport Pro 2025',
    'Gia hạn Cơ bản FreshStart 2026', 'TechVenture Pro 2026', 'Yêu cầu Cơ bản GrowthCo',
    'Gói Basic OrganicShop', 'Địa chỉ Pro Wellness360', 'Basic + Mailbox UrbanFood',
    'Basic VNBrand 2026', 'Gói Basic IndiaSaaS', 'Pro LatamGrow 2026', 'Gói Pro IrishTech 2026',
  ];
  return { ...d, name: viNames[i] || d.name };
});

module.exports = {
  industry: 'Virtual Office Services',

  users: [
    { name: 'Alex CEO (Virtual Office)',    email: 'demo_virtual_ceo@izhubs.com',  password: 'Demo@12345', role: 'admin',  active: true },
    { name: 'Kim Sales (Virtual)',          email: 'demo_virtual_sale@izhubs.com', password: 'Demo@12345', role: 'member', active: true },
    { name: 'Pat Ops (Virtual)',            email: 'demo_virtual_ops@izhubs.com',  password: 'Demo@12345', role: 'member', active: true },
    { name: 'Former VO Employee',           email: 'former.vo@izhubs-demo.com',    password: 'Demo@12345', role: 'member', active: false },
  ],

  customFields: [
    { entity: 'deal',    key: 'goi_dich_vu',        label: 'Service Package',          type: 'select', options: ['Basic', 'Pro', 'Enterprise'] },
    { entity: 'deal',    key: 'thoi_han_hop_dong',   label: 'Contract Duration (months)',type: 'number' },
    { entity: 'deal',    key: 'dia_chi_chi_nhanh',   label: 'Branch Address',           type: 'select', options: ['Hồ Chí Minh — Quận 1', 'Hà Nội — Ba Đình', 'Đà Nẵng — Hải Châu', 'London — City', 'Singapore — CBD'] },
    { entity: 'contact', key: 'loai_cong_ty',        label: 'Company Type',             type: 'select', options: ['Startup', 'SME', 'Enterprise', 'Freelancer', 'NGO'] },
    { entity: 'contact', key: 'nguon_khach',         label: 'Lead Source',              type: 'select', options: ['Google', 'LinkedIn', 'Referral', 'Walk-in', 'Social Media'] },
  ],

  contacts_en,
  contacts_vi,
  deals_en,
  deals_vi,
};
