// =============================================================
// izhubs ERP — Virtual Office Seed Data (Bilingual: EN + VI)
// Pipeline: 8 stages from agency.ts
// Contacts: 15 | Deals: 15 — available in both English and Vietnamese
// Usage:
//   npm run seed:virtual-office        → inserts EN data (default)
//   npm run seed:virtual-office:vi     → inserts VI data
// =============================================================

module.exports = {
  industry: 'Virtual Office Services',

  adminUser: {
    name: 'Alex Demo',
    email: 'demo@izhubs.com',
    password: 'Demo@12345',
    role: 'admin',
  },

  customFields: [
    { entity: 'deal',    key: 'goi_dich_vu',         label: 'Service Package',       type: 'select', options: ['Basic', 'Pro', 'Enterprise'] },
    { entity: 'deal',    key: 'thoi_han_hop_dong',    label: 'Contract Duration (months)', type: 'number' },
    { entity: 'deal',    key: 'ngay_ky_hop_dong',     label: 'Contract Signed Date',  type: 'date' },
    { entity: 'contact', key: 'nguon_lead',            label: 'Lead Source',           type: 'select', options: ['Google', 'Facebook', 'Referral', 'Cold Outreach', 'Other'] },
    { entity: 'company', key: 'dia_chi_dang_ky',       label: 'Registered Address',    type: 'text' },
    { entity: 'company', key: 'loai_doanh_nghiep',     label: 'Business Type',         type: 'select', options: ['LLC', 'JSC', 'Sole Proprietor', 'Other'] },
    { entity: 'company', key: 'ma_so_thue',             label: 'Tax ID',                type: 'text' },
  ],

  // ── ENGLISH DATA ──────────────────────────────────────────────
  contacts_en: [
    { name: 'James Nguyen',    email: 'james@freshstart.io',   phone: '+84901110001', title: 'CEO',              custom_fields: { nguon_lead: 'Google' } },
    { name: 'Sarah Mitchell',  email: 'sarah@innovatech.co',   phone: '+84901110002', title: 'Founder',          custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Ryan Pham',       email: 'ryan@buildfast.io',     phone: '+84901110003', title: 'COO',              custom_fields: { nguon_lead: 'LinkedIn' } },
    { name: 'Emma Tran',       email: 'emma@retailhub.com',    phone: '+84901110004', title: 'Operations Lead',  custom_fields: { nguon_lead: 'Facebook' } },
    { name: 'David Le',        email: 'david@medgroup.com',    phone: '+84901110005', title: 'CMO',              custom_fields: { nguon_lead: 'Cold Outreach' } },
    { name: 'Olivia Do',       email: 'olivia@shophouse.com',  phone: '+84901110006', title: 'Director',         custom_fields: { nguon_lead: 'Google' } },
    { name: 'Noah Vo',         email: 'noah@eduvine.edu',      phone: '+84901110007', title: 'Managing Director',custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Ava Hoang',       email: 'ava@luxspace.com',      phone: '+84901110008', title: 'CEO',              custom_fields: { nguon_lead: 'Facebook' } },
    { name: 'Liam Bui',        email: 'liam@logistics24.com',  phone: '+84901110009', title: 'GM',               custom_fields: { nguon_lead: 'Google' } },
    { name: 'Mia Truong',      email: 'mia@foodchain.com',     phone: '+84901110010', title: 'Procurement',      custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Ethan Dang',      email: 'ethan@proptech.io',     phone: '+84901110011', title: 'CEO',              custom_fields: { nguon_lead: 'Google' } },
    { name: 'Isabella Ly',     email: 'isabella@artco.com',    phone: '+84901110012', title: 'Creative Dir',     custom_fields: { nguon_lead: 'Other' } },
    { name: 'Lucas Phan',      email: 'lucas@tradesup.com',    phone: '+84901110013', title: 'CFO',              custom_fields: { nguon_lead: 'Cold Outreach' } },
    { name: 'Harper Mai',      email: 'harper@finrise.com',    phone: '+84901110014', title: 'Growth Lead',      custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Chloe Lam',       email: 'chloe@stylestore.com',  phone: '+84901110015', title: 'Owner',            custom_fields: { nguon_lead: 'Facebook' } },
  ],

  deals_en: [
    { name: 'FreshStart Basic Office Package',     value: 1800000,  stage: 'lead',        contactIdx: 0,  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6  } },
    { name: 'Innovatech Pro Office Setup',          value: 3600000,  stage: 'lead',        contactIdx: 1,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'BuildFast Enterprise Address',         value: 7200000,  stage: 'proposal',    contactIdx: 2,  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
    { name: 'RetailHub Basic Registration',         value: 1800000,  stage: 'proposal',    contactIdx: 3,  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6  } },
    { name: 'MedGroup Corporate Address',           value: 5400000,  stage: 'negotiation', contactIdx: 4,  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
    { name: 'ShopHouse Pro Office Bundle',          value: 3600000,  stage: 'negotiation', contactIdx: 5,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'EduVine Basic Address Package',        value: 1800000,  stage: 'onboarding',  contactIdx: 6,  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6  } },
    { name: 'LuxSpace Enterprise HQ',               value: 7200000,  stage: 'active',      contactIdx: 7,  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
    { name: 'Logistics24 Pro Address',              value: 3600000,  stage: 'active',      contactIdx: 8,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'FoodChain Annual Renewal',             value: 3600000,  stage: 'renewal',     contactIdx: 9,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'PropTech Pro Office Contract',         value: 3600000,  stage: 'won',         contactIdx: 10, closedAt: '2026-03-01', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'ArtCo Basic 2-Year Deal',              value: 3600000,  stage: 'won',         contactIdx: 11, closedAt: '2026-03-05', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 24 } },
    { name: 'TradeSupply Enterprise Bundle',        value: 7200000,  stage: 'won',         contactIdx: 12, closedAt: '2026-02-20', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
    { name: 'FinRise Pro Package (Lost)',           value: 3600000,  stage: 'lost',        contactIdx: 13, closedAt: '2026-03-10', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 6  } },
    { name: 'StyleStore Basic Package (Lost)',      value: 1800000,  stage: 'lost',        contactIdx: 14, closedAt: '2026-03-08', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 3  } },
  ],

  // ── TIẾNG VIỆT DATA ───────────────────────────────────────────
  contacts_vi: [
    { name: 'Nguyễn Minh Tuấn',  email: 'tuan@freshstart.vn',    phone: '+84901220001', title: 'Giám đốc',          custom_fields: { nguon_lead: 'Google' } },
    { name: 'Trần Thị Lan',       email: 'lan@innovatech.vn',     phone: '+84901220002', title: 'Nhà sáng lập',      custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Phạm Quốc Bảo',     email: 'bao@buildfast.vn',      phone: '+84901220003', title: 'Phó GĐ',            custom_fields: { nguon_lead: 'LinkedIn' } },
    { name: 'Lê Thị Hương',       email: 'huong@retailhub.vn',    phone: '+84901220004', title: 'Trưởng phòng Vận hành', custom_fields: { nguon_lead: 'Facebook' } },
    { name: 'Vũ Đức Nam',         email: 'nam@medgroup.vn',       phone: '+84901220005', title: 'Giám đốc Marketing', custom_fields: { nguon_lead: 'Cold Outreach' } },
    { name: 'Đinh Thị Ngọc',      email: 'ngoc@shophouse.vn',     phone: '+84901220006', title: 'Giám đốc Chi nhánh', custom_fields: { nguon_lead: 'Google' } },
    { name: 'Hoàng Văn Khoa',     email: 'khoa@eduvine.vn',       phone: '+84901220007', title: 'Tổng Giám đốc',     custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Bùi Thị Thu',        email: 'thu@luxspace.vn',       phone: '+84901220008', title: 'CEO',               custom_fields: { nguon_lead: 'Facebook' } },
    { name: 'Phan Hải Long',      email: 'long@logistics24.vn',   phone: '+84901220009', title: 'Tổng Giám đốc',     custom_fields: { nguon_lead: 'Google' } },
    { name: 'Ngô Thị Phương',     email: 'phuong@foodchain.vn',   phone: '+84901220010', title: 'Trưởng phòng Mua hàng', custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Đặng Quang Hải',     email: 'hai@proptech.vn',       phone: '+84901220011', title: 'CEO',               custom_fields: { nguon_lead: 'Google' } },
    { name: 'Lý Thị Bé',          email: 'be@artco.vn',           phone: '+84901220012', title: 'Giám đốc Sáng tạo', custom_fields: { nguon_lead: 'Other' } },
    { name: 'Trương Minh Dũng',   email: 'dung@tradesup.vn',      phone: '+84901220013', title: 'Giám đốc Tài chính', custom_fields: { nguon_lead: 'Cold Outreach' } },
    { name: 'Mai Thị Yến',        email: 'yen@finrise.vn',        phone: '+84901220014', title: 'Trưởng phòng Phát triển', custom_fields: { nguon_lead: 'Referral' } },
    { name: 'Lâm Thị Kim',        email: 'kim@stylestore.vn',     phone: '+84901220015', title: 'Chủ doanh nghiệp',  custom_fields: { nguon_lead: 'Facebook' } },
  ],

  deals_vi: [
    { name: 'Gói Cơ bản FreshStart',           value: 1800000,  stage: 'lead',        contactIdx: 0,  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6  } },
    { name: 'Gói Pro Innovatech',               value: 3600000,  stage: 'lead',        contactIdx: 1,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'Địa chỉ Enterprise BuildFast',     value: 7200000,  stage: 'proposal',    contactIdx: 2,  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
    { name: 'Đăng ký Cơ bản RetailHub',        value: 1800000,  stage: 'proposal',    contactIdx: 3,  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6  } },
    { name: 'Địa chỉ Doanh nghiệp MedGroup',   value: 5400000,  stage: 'negotiation', contactIdx: 4,  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
    { name: 'Gói Pro ShopHouse',                value: 3600000,  stage: 'negotiation', contactIdx: 5,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'Gói Cơ bản EduVine',              value: 1800000,  stage: 'onboarding',  contactIdx: 6,  custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 6  } },
    { name: 'Trụ sở Enterprise LuxSpace',       value: 7200000,  stage: 'active',      contactIdx: 7,  custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 24 } },
    { name: 'Địa chỉ Pro Logistics24',          value: 3600000,  stage: 'active',      contactIdx: 8,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'Gia hạn hàng năm FoodChain',       value: 3600000,  stage: 'renewal',     contactIdx: 9,  custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'Hợp đồng Pro PropTech',            value: 3600000,  stage: 'won',         contactIdx: 10, closedAt: '2026-03-01', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 12 } },
    { name: 'Gói Cơ bản 2 năm ArtCo',          value: 3600000,  stage: 'won',         contactIdx: 11, closedAt: '2026-03-05', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 24 } },
    { name: 'Gói Enterprise TradeSupply',       value: 7200000,  stage: 'won',         contactIdx: 12, closedAt: '2026-02-20', custom_fields: { goi_dich_vu: 'Enterprise', thoi_han_hop_dong: 12 } },
    { name: 'Gói Pro FinRise (Không thành)',    value: 3600000,  stage: 'lost',        contactIdx: 13, closedAt: '2026-03-10', custom_fields: { goi_dich_vu: 'Pro',        thoi_han_hop_dong: 6  } },
    { name: 'Gói Cơ bản StyleStore (Không thành)', value: 1800000, stage: 'lost',     contactIdx: 14, closedAt: '2026-03-08', custom_fields: { goi_dich_vu: 'Basic',      thoi_han_hop_dong: 3  } },
  ],
};
