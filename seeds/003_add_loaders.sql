-- ============================================================
-- Waypoint Migration / Seed: 003_add_loaders.sql
-- Description: Adds additional warehouse loaders across different bays
-- (Bay 02, Bay 06) for multi-loader collaborative operations.
-- ============================================================

-- Sunil Perera (Loader Bay 02)
INSERT INTO public.profiles (
  id,
  role,
  full_name,
  employee_id,
  assigned_bay,
  station,
  outlet,
  department,
  shift,
  assigned_meta,
  is_verified,
  status
) VALUES (
  '1bee7ce7-9f9f-48b6-bfd2-59152b67e528',
  'loader',
  'Sunil Perera',
  'LDR-002',
  'Bay 02',
  'Central Fulfillment Hub',
  'Central Distribution Center',
  'Dock Operations',
  'Morning Shift (06:00 - 14:00)',
  'Shift: Morning (06:00 - 14:00)',
  true,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  assigned_bay = EXCLUDED.assigned_bay,
  employee_id = EXCLUDED.employee_id,
  full_name = EXCLUDED.full_name;

-- Ruwan Silva (Loader Bay 06)
INSERT INTO public.profiles (
  id,
  role,
  full_name,
  employee_id,
  assigned_bay,
  station,
  outlet,
  department,
  shift,
  assigned_meta,
  is_verified,
  status
) VALUES (
  '582fd567-91f0-4e75-9f7f-3e6523ef8b7f',
  'loader',
  'Ruwan Silva',
  'LDR-006',
  'Bay 06',
  'Central Fulfillment Hub',
  'Central Distribution Center',
  'Dock Operations',
  'Evening Shift (14:00 - 22:00)',
  'Shift: Evening (14:00 - 22:00)',
  true,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  assigned_bay = EXCLUDED.assigned_bay,
  employee_id = EXCLUDED.employee_id,
  full_name = EXCLUDED.full_name;
