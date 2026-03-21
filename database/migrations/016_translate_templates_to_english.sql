-- =============================================================
-- izhubs ERP — Migration 016: Translate industry template
-- descriptions and sidebar labels to English.
-- Also fix Restaurant template to use English nav labels.
-- =============================================================

UPDATE industry_templates SET
  description = 'Manage clients, contracts, and service packages for virtual office centers.',
  updated_at  = NOW()
WHERE id = 'virtual-office';

UPDATE industry_templates SET
  description = 'Manage clients, projects, and contracts for digital agencies and marketing teams.',
  nav_config  = jsonb_set(nav_config, '{pipelineStages}', '[
    {"key":"lead",        "label":"New Lead",      "color":"#94a3b8"},
    {"key":"proposal",    "label":"Proposal Sent", "color":"#60a5fa"},
    {"key":"negotiation", "label":"Negotiation",   "color":"#f59e0b"},
    {"key":"onboarding",  "label":"Onboarding",    "color":"#a78bfa"},
    {"key":"active",      "label":"Active",        "color":"#34d399"},
    {"key":"renewal",     "label":"Renewal",       "color":"#f97316"},
    {"key":"won",         "label":"Won",           "color":"#22c55e", "closed":true},
    {"key":"lost",        "label":"Lost",          "color":"#ef4444", "closed":true}
  ]'::jsonb),
  updated_at  = NOW()
WHERE id = 'agency';

UPDATE industry_templates SET
  description = 'Manage clients and projects for independent freelancers and consultants.',
  updated_at  = NOW()
WHERE id = 'freelancer';

UPDATE industry_templates SET
  name        = 'Restaurant / F&B',
  description = 'Manage reservations, loyal customers, and feedback for restaurants and cafes.',
  nav_config  = jsonb_set(
    jsonb_set(
      jsonb_set(
        nav_config,
        '{sidebar}', '[
          {"id":"dashboard", "label":"Dashboard",    "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
          {"id":"contacts",  "label":"Customers",    "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
          {"id":"deals",     "label":"Reservations", "href":"/deals",     "icon":"UtensilsCrossed", "roles":["admin","member"]},
          {"id":"tasks",     "label":"Tasks",        "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
          {"id":"import",    "label":"Import",       "href":"/import",    "icon":"Upload",          "roles":["admin"]}
        ]'::jsonb
      ),
      '{bottomItems}', '[{"id":"settings","label":"Settings","href":"/settings","icon":"Settings","roles":["admin"]}]'::jsonb
    ),
    '{pipelineStages}', '[
      {"key":"new",         "label":"Inquiry",     "color":"#94a3b8"},
      {"key":"contacted",   "label":"Reserved",    "color":"#60a5fa"},
      {"key":"qualified",   "label":"Confirmed",   "color":"#a78bfa"},
      {"key":"negotiation", "label":"Seated",      "color":"#f59e0b"},
      {"key":"won",         "label":"Completed",   "color":"#22c55e", "closed":true},
      {"key":"lost",        "label":"Cancelled",   "color":"#ef4444", "closed":true}
    ]'::jsonb
  ),
  updated_at  = NOW()
WHERE id = 'restaurant';

UPDATE industry_templates SET
  description = 'Manage loyalty programs, regular customers, and events for coffee shops.',
  updated_at  = NOW()
WHERE id = 'cafe';

UPDATE industry_templates SET
  description = 'Manage members, memberships, and shared spaces for coworking spaces.',
  updated_at  = NOW()
WHERE id = 'coworking';
