-- Migration 004: Add permissions, activities, status, is_verified, and assigned_meta to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS activities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS assigned_meta TEXT;

-- Seed dynamic permissions and activities for existing users based on role
UPDATE public.profiles
SET 
  permissions = jsonb_build_array(
    jsonb_build_object('name', 'Planning', 'enabled', false),
    jsonb_build_object('name', 'Orders', 'enabled', true),
    jsonb_build_object('name', 'Loading', 'enabled', false),
    jsonb_build_object('name', 'Delivery', 'enabled', true),
    jsonb_build_object('name', 'Tracking', 'enabled', true),
    jsonb_build_object('name', 'Reports', 'enabled', true)
  ),
  activities = jsonb_build_array(
    jsonb_build_object('title', 'Receipt confirmed', 'meta', 'ORD-1042 • 28 items', 'time', 'Today • 7:48 AM', 'type', 'check'),
    jsonb_build_object('title', 'Order created', 'meta', 'ORD-1058 • Daily Grocery', 'time', 'Yesterday • 2:14 PM', 'type', 'bag'),
    jsonb_build_object('title', 'Delivery reviewed', 'meta', 'TRK-024 arrival details', 'time', 'Yesterday • 9:06 AM', 'type', 'truck')
  ),
  assigned_meta = 'Store hours : 6:00 - 18:00'
WHERE role = 'store_manager';

UPDATE public.profiles
SET 
  permissions = jsonb_build_array(
    jsonb_build_object('name', 'Planning & Allocation', 'enabled', true),
    jsonb_build_object('name', 'Fleet Command', 'enabled', true),
    jsonb_build_object('name', 'Loading', 'enabled', false),
    jsonb_build_object('name', 'Live Tracking', 'enabled', true),
    jsonb_build_object('name', 'Delivery', 'enabled', true),
    jsonb_build_object('name', 'Reports', 'enabled', true)
  ),
  activities = jsonb_build_array(
    jsonb_build_object('title', 'Fleet route allocated', 'meta', 'Route R-042 dispatched to 8 stores', 'time', 'Today • 8:15 AM', 'type', 'truck'),
    jsonb_build_object('title', 'Manifest confirmed', 'meta', 'TRK-019 arrival verified', 'time', 'Today • 7:30 AM', 'type', 'check'),
    jsonb_build_object('title', 'Order deferred', 'meta', 'ORD-992 deferred to afternoon run', 'time', 'Yesterday • 4:20 PM', 'type', 'bag')
  ),
  assigned_meta = 'Shift : 06:00 - 14:00 (Day Shift)'
WHERE role = 'dispatcher';

UPDATE public.profiles
SET 
  permissions = jsonb_build_array(
    jsonb_build_object('name', 'Planning', 'enabled', false),
    jsonb_build_object('name', 'Trip Queue', 'enabled', true),
    jsonb_build_object('name', 'Pallet Loading', 'enabled', true),
    jsonb_build_object('name', 'Barcode Scan', 'enabled', true),
    jsonb_build_object('name', 'Manifest Check', 'enabled', true),
    jsonb_build_object('name', 'Dispatch Overrides', 'enabled', false)
  ),
  activities = jsonb_build_array(
    jsonb_build_object('title', 'Pallet scan verified', 'meta', 'TRK-088 • 32 crates cold chain', 'time', 'Today • 7:15 AM', 'type', 'check'),
    jsonb_build_object('title', 'Bay assignment ready', 'meta', 'Bay 04 • Temperature OK', 'time', 'Today • 6:30 AM', 'type', 'truck'),
    jsonb_build_object('title', 'Manifest completed', 'meta', 'TRK-019 • 48 crates verified', 'time', 'Yesterday • 1:50 PM', 'type', 'bag')
  ),
  assigned_meta = 'Shift : Morning (06:00 - 14:00)'
WHERE role = 'loader';
