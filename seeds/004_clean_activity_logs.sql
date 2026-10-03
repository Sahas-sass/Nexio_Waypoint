-- ============================================================
-- Waypoint Migration / Seed: 004_clean_activity_logs.sql
-- Description: Cleans out legacy hardcoded static mock strings from
-- public.profiles.activities and initializes clean operational state.
-- ============================================================

-- 1. Store Manager (Kavindu Perera)
UPDATE public.profiles
SET activities = jsonb_build_array(
  jsonb_build_object(
    'title', 'Retail Operations Active',
    'meta', 'Fresh Store 22 (F-042) • System initialized',
    'time', 'Today',
    'type', 'bag'
  )
)
WHERE role = 'store_manager';

-- 2. Dispatcher (Kasun Sandaruwan)
UPDATE public.profiles
SET activities = jsonb_build_array(
  jsonb_build_object(
    'title', 'Central Logistics Hub Online',
    'meta', 'Monitoring fleet routes & dispatch queues',
    'time', 'Today',
    'type', 'truck'
  )
)
WHERE role = 'dispatcher';

-- 3. Driver (Kasun Perera)
UPDATE public.profiles
SET activities = jsonb_build_array(
  jsonb_build_object(
    'title', 'Fleet Itinerary Synchronized',
    'meta', 'Western Fleet Hub • Route daily run',
    'time', 'Today',
    'type', 'truck'
  )
)
WHERE role = 'driver';

-- 4. Dock Loaders (Osal, Sunil, Ruwan)
UPDATE public.profiles
SET activities = jsonb_build_array(
  jsonb_build_object(
    'title', 'Warehouse Dock Online',
    'meta', concat('Assigned ', assigned_bay, ' • Ready for scanning'),
    'time', 'Today',
    'type', 'check'
  )
)
WHERE role = 'loader';
