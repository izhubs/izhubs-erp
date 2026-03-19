-- =============================================================
-- izhubs ERP — Seed Industry Templates
-- Inserts all 6 built-in templates from templates/industry/*.ts
-- into the industry_templates DB table so the app can read them.
-- Also sets the demo tenant's industry to 'virtual-office'.
-- =============================================================

INSERT INTO industry_templates (id, name, description, icon, category, nav_config, theme_defaults, required_modules)
VALUES

-- ────────────────────────────────────────────────────────────────
-- 1. VIRTUAL OFFICE
-- ────────────────────────────────────────────────────────────────
('virtual-office', 'Virtual Office Services',
 'Quản lý khách hàng, hợp đồng và gói dịch vụ cho trung tâm văn phòng ảo.',
 '🏢', 'real_estate',
 '{
   "sidebar": [
     {"id":"dashboard",        "label":"Dashboard",        "href":"/dashboard",        "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"leads",            "label":"Leads",            "href":"/leads",            "icon":"UserPlus",        "roles":["admin","member"]},
     {"id":"contacts",         "label":"Contacts",         "href":"/contacts",         "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",            "label":"Pipeline",         "href":"/deals",            "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",            "label":"Tasks",            "href":"/tasks",            "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"service-packages", "label":"Service Packages", "href":"/service-packages", "icon":"Package",         "roles":["admin","member"]},
     {"id":"reports",          "label":"Reports",          "href":"/reports",          "icon":"BarChart2",       "roles":["admin","viewer"]},
     {"id":"import",           "label":"Import",           "href":"/import",           "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":3,  "widgetId":"kpi-mrr"},
       {"colSpan":3,  "widgetId":"kpi-active-clients"},
       {"colSpan":3,  "widgetId":"kpi-renewals-due"},
       {"colSpan":3,  "widgetId":"kpi-churn-rate"},
       {"colSpan":8,  "widgetId":"arr-line-chart"},
       {"colSpan":4,  "widgetId":"revenue-by-package-donut"},
       {"colSpan":7,  "widgetId":"top-customers-table"},
       {"colSpan":5,  "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"New Lead",        "color":"#94a3b8"},
     {"key":"proposal",    "label":"Proposal Sent",   "color":"#60a5fa"},
     {"key":"negotiation", "label":"Negotiation",     "color":"#f59e0b"},
     {"key":"onboarding",  "label":"Onboarding",      "color":"#a78bfa"},
     {"key":"active",      "label":"Active Client",   "color":"#34d399"},
     {"key":"renewal",     "label":"Up for Renewal",  "color":"#f97316"},
     {"key":"won",         "label":"Won",             "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Lost",            "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#6366f1","--color-primary-hover":"#4f46e5","--color-primary-light":"#e0e7ff","--color-primary-muted":"#312e81"}',
 '["crm","contracts","service-packages","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 2. AGENCY
-- ────────────────────────────────────────────────────────────────
('agency', 'Agency / Digital Marketing',
 'Quản lý khách hàng, dự án và hợp đồng cho digital agency, marketing agency.',
 '🎯', 'services',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Dashboard", "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"leads",     "label":"Leads",     "href":"/leads",     "icon":"UserPlus",        "roles":["admin","member"]},
     {"id":"contacts",  "label":"Contacts",  "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Deals",     "href":"/deals",     "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",     "label":"Tasks",     "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"reports",   "label":"Reports",   "href":"/reports",   "icon":"BarChart2",       "roles":["admin","viewer"]},
     {"id":"import",    "label":"Import",    "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":8,  "widgetId":"pipeline-summary"},
       {"colSpan":4,  "widgetId":"tasks-due-today"},
       {"colSpan":6,  "widgetId":"revenue-this-month"},
       {"colSpan":6,  "widgetId":"deals-by-stage"},
       {"colSpan":12, "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"Lead mới",      "color":"#94a3b8"},
     {"key":"proposal",    "label":"Gửi proposal",  "color":"#60a5fa"},
     {"key":"negotiation", "label":"Đàm phán",      "color":"#f59e0b"},
     {"key":"onboarding",  "label":"Onboarding",    "color":"#a78bfa"},
     {"key":"active",      "label":"Đang chạy",     "color":"#34d399"},
     {"key":"renewal",     "label":"Gia hạn",       "color":"#f97316"},
     {"key":"won",         "label":"Chốt",          "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Không chốt",    "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#6366f1","--color-primary-hover":"#4f46e5","--color-primary-light":"#e0e7ff","--color-primary-muted":"#312e81"}',
 '["crm","contracts","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 3. FREELANCER
-- ────────────────────────────────────────────────────────────────
('freelancer', 'Freelancer / Consultant',
 'Quản lý khách hàng và dự án cho freelancer, consultant độc lập.',
 '💼', 'services',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Dashboard", "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"contacts",  "label":"Clients",   "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Projects",  "href":"/deals",     "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",     "label":"Tasks",     "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"import",    "label":"Import",    "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":6, "widgetId":"revenue-this-month"},
       {"colSpan":6, "widgetId":"pipeline-summary"},
       {"colSpan":12,"widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"Inquiry",     "color":"#94a3b8"},
     {"key":"proposal",    "label":"Proposal",    "color":"#60a5fa"},
     {"key":"negotiation", "label":"Negotiation", "color":"#f59e0b"},
     {"key":"active",      "label":"In Progress", "color":"#34d399"},
     {"key":"renewal",     "label":"Revision",    "color":"#f97316"},
     {"key":"won",         "label":"Completed",   "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Dropped",     "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#8b5cf6","--color-primary-hover":"#7c3aed","--color-primary-light":"#ede9fe","--color-primary-muted":"#4c1d95"}',
 '["crm","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 4. RESTAURANT / F&B
-- ────────────────────────────────────────────────────────────────
('restaurant', 'Nhà hàng / F&B',
 'Quản lý đặt bàn, khách hàng thân thiết và phản hồi cho nhà hàng, quán cafe.',
 '🍽️', 'hospitality',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Tổng quan",  "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"contacts",  "label":"Khách hàng", "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Đặt bàn",    "href":"/deals",     "icon":"UtensilsCrossed", "roles":["admin","member"]},
     {"id":"tasks",     "label":"Công việc",  "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"import",    "label":"Import",     "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Cài đặt", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":12, "widgetId":"reservations-today"},
       {"colSpan":6,  "widgetId":"revenue-today"},
       {"colSpan":6,  "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"new",         "label":"Hỏi thông tin", "color":"#94a3b8"},
     {"key":"contacted",   "label":"Đã đặt bàn",    "color":"#60a5fa"},
     {"key":"qualified",   "label":"Xác nhận",      "color":"#a78bfa"},
     {"key":"negotiation", "label":"Đang ngồi",     "color":"#f59e0b"},
     {"key":"won",         "label":"Hoàn thành",    "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Huỷ",           "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#f59e0b","--color-primary-hover":"#d97706","--color-primary-light":"#fef3c7","--color-primary-muted":"#78350f"}',
 '["crm","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 5. CAFÉ / COFFEE SHOP
-- ────────────────────────────────────────────────────────────────
('cafe', 'Café / Coffee Shop',
 'Quản lý loyalty, khách hàng thân thiết và sự kiện cho quán cà phê.',
 '☕', 'hospitality',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Dashboard", "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"contacts",  "label":"Members",   "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Orders",    "href":"/deals",     "icon":"ShoppingCart",    "roles":["admin","member"]},
     {"id":"tasks",     "label":"Tasks",     "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"import",    "label":"Import",    "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":6, "widgetId":"revenue-today"},
       {"colSpan":6, "widgetId":"top-customers-table"},
       {"colSpan":12,"widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"Walk-in",    "color":"#94a3b8"},
     {"key":"contacted",   "label":"Ordering",   "color":"#60a5fa"},
     {"key":"active",      "label":"Served",     "color":"#34d399"},
     {"key":"won",         "label":"Completed",  "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Cancelled",  "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#f97316","--color-primary-hover":"#ea580c","--color-primary-light":"#ffedd5","--color-primary-muted":"#7c2d12"}',
 '["crm","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 6. COWORKING
-- ────────────────────────────────────────────────────────────────
('coworking', 'Coworking / Shared Office',
 'Quản lý thành viên, hợp đồng và không gian cho coworking space.',
 '🤝', 'real_estate',
 '{
   "sidebar": [
     {"id":"dashboard",        "label":"Dashboard",      "href":"/dashboard",        "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"leads",            "label":"Leads",          "href":"/leads",            "icon":"UserPlus",        "roles":["admin","member"]},
     {"id":"contacts",         "label":"Members",        "href":"/contacts",         "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",            "label":"Memberships",    "href":"/deals",            "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",            "label":"Tasks",          "href":"/tasks",            "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"service-packages", "label":"Plans",          "href":"/service-packages", "icon":"Package",         "roles":["admin","member"]},
     {"id":"reports",          "label":"Reports",        "href":"/reports",          "icon":"BarChart2",       "roles":["admin","viewer"]},
     {"id":"import",           "label":"Import",         "href":"/import",           "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":3,  "widgetId":"kpi-mrr"},
       {"colSpan":3,  "widgetId":"kpi-active-clients"},
       {"colSpan":3,  "widgetId":"kpi-renewals-due"},
       {"colSpan":3,  "widgetId":"kpi-churn-rate"},
       {"colSpan":8,  "widgetId":"arr-line-chart"},
       {"colSpan":4,  "widgetId":"revenue-by-package-donut"},
       {"colSpan":12, "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",         "label":"Inquiry",      "color":"#94a3b8"},
     {"key":"proposal",     "label":"Tour Booked",  "color":"#60a5fa"},
     {"key":"negotiation",  "label":"Negotiation",  "color":"#f59e0b"},
     {"key":"onboarding",   "label":"Onboarding",   "color":"#a78bfa"},
     {"key":"active",       "label":"Active Member","color":"#34d399"},
     {"key":"renewal",      "label":"Renewal",      "color":"#f97316"},
     {"key":"won",          "label":"Retained",     "color":"#22c55e", "closed":true},
     {"key":"lost",         "label":"Churned",      "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#10b981","--color-primary-hover":"#059669","--color-primary-light":"#d1fae5","--color-primary-muted":"#064e3b"}',
 '["crm","contracts","service-packages","reports"]'
)

ON CONFLICT (id) DO UPDATE SET
  name           = EXCLUDED.name,
  description    = EXCLUDED.description,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  nav_config     = EXCLUDED.nav_config,
  theme_defaults = EXCLUDED.theme_defaults,
  required_modules = EXCLUDED.required_modules,
  updated_at     = NOW();

-- Set the demo tenant's industry to 'virtual-office'
UPDATE tenants
SET industry = 'virtual-office', updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';
