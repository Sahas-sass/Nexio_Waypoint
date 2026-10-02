-- ============================================================
-- Waypoint Migration / Seed: 002_clean_profiles.sql
-- Description: Clean up '#' symbols and align profile metadata
-- across all operational roles (store_manager, dispatcher, driver, loader).
-- ============================================================

-- 1. Store Manager (Kavindu Perera)
UPDATE public.profiles
SET 
  outlet = 'Fresh Store 22 (F-042)',
  station = 'Station 04',
  assigned_bay = 'Store Dock 01',
  assigned_meta = 'Store hours: 06:00 - 18:00',
  department = 'Retail Operations'
WHERE role = 'store_manager';

-- 2. Dispatcher (Kasun Sandaruwan)
UPDATE public.profiles
SET 
  outlet = 'Central Logistics Hub (Colombo North)',
  assigned_bay = 'Central Dispatch Deck',
  station = 'Station 01',
  assigned_meta = 'Shift: 06:00 - 14:00 (Day Shift)',
  department = 'Logistics Operations'
WHERE role = 'dispatcher';

-- 3. Driver (Kasun Perera)
UPDATE public.profiles
SET 
  employee_id = 'DRV-008',
  department = 'Fleet Operations',
  outlet = 'Western Fleet Hub',
  assigned_bay = 'Fleet Bay 04',
  station = 'Colombo Fleet Hub',
  assigned_meta = 'Route: Colombo - Kandy Daily Shift'
WHERE role = 'driver';

-- 4. Dock Loader (osal)
UPDATE public.profiles
SET 
  outlet = 'Central Distribution Center',
  assigned_bay = 'Bay 04',
  station = 'Central Fulfillment Hub',
  department = 'Dock Operations',
  employee_id = 'LDR-004',
  assigned_meta = 'Shift: Morning (06:00 - 14:00)'
WHERE role = 'loader';
