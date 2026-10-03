-- ============================================================================
-- Seed 005: Dispatcher Ecosystem Seed (Unassigned Orders, Telemetry & Exceptions)
-- ============================================================================

-- 1. Ensure required stores exist for Dispatcher Allocation & Planning
INSERT INTO public.stores (id, name, brand, address, access_conditions, delivery_window_start, delivery_window_end)
VALUES
  ('a2222222-2222-2222-2222-222222222222', 'Fresh Store #18', 'Waypoint Fresh', 'Colombo 07', 'Front Unloading Zone', '07:00:00', '08:00:00'),
  ('a4444444-4444-4444-4444-444444444444', 'Metro Market #11', 'Waypoint Daily', 'Galle Rd, Dehiwala', 'Rear Roll-up Door Access', '09:00:00', '09:30:00'),
  ('a7777777-7777-7777-7777-777777777777', 'Style Store #04', 'Waypoint Style', 'York St, Fort Central', 'Standard Bay Access', '08:00:00', '10:00:00'),
  ('a8888888-8888-8888-8888-888888888888', 'Home Store #22', 'Waypoint Home', 'High Level Rd, Nugegoda', 'Van Access Only', '10:00:00', '12:00:00'),
  ('a1111111-1111-1111-1111-111111111111', 'Fresh Store #22', 'Waypoint Fresh', '155 High Level Rd, Nugegoda', 'Rear Dock, Van Access Only', '08:00:00', '08:30:00')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, brand = EXCLUDED.brand;

-- 2. Seed Unassigned Confirmed Orders (Awaiting Allocation on /allocation)
INSERT INTO public.orders (
  id, order_number, store_id, total_weight_kg, total_volume_m3, temp_requirement, priority, delivery_window, status, target_delivery_date
) VALUES
  ('d1000001-0000-0000-0000-000000000001', 'ORD-2441', 'a2222222-2222-2222-2222-222222222222', 420.0, 2.4, 'chilled', 'High', 'Before 8:00 AM', 'pending', CURRENT_DATE),
  ('d1000002-0000-0000-0000-000000000002', 'ORD-2442', 'a4444444-4444-4444-4444-444444444444', 310.0, 1.2, 'chilled', 'High', 'Before 9:30 AM', 'pending', CURRENT_DATE),
  ('d1000003-0000-0000-0000-000000000003', 'ORD-2475', 'a7777777-7777-7777-7777-777777777777', 680.0, 1.8, 'ambient', 'Standard', '8:00 - 10:00 AM', 'pending', CURRENT_DATE),
  ('d1000004-0000-0000-0000-000000000004', 'ORD-2438', 'a8888888-8888-8888-8888-888888888888', 190.0, 0.9, 'ambient', 'Standard', 'Before 12:00 PM', 'pending', CURRENT_DATE),
  ('d1000005-0000-0000-0000-000000000005', 'ORD-2489', 'a1111111-1111-1111-1111-111111111111', 350.0, 1.5, 'chilled', 'High', 'Before 8:00 AM', 'pending', CURRENT_DATE),
  ('d1000006-0000-0000-0000-000000000006', 'ORD-2491', 'a2222222-2222-2222-2222-222222222222', 280.0, 1.1, 'ambient', 'Standard', '10:00 - 11:30 AM', 'pending', CURRENT_DATE)
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    delivery_window = EXCLUDED.delivery_window;

-- 3. Update Active Trips with Live Telemetry (Powers /tracking)
-- Trip 1: TRK-024 (Kasun Perera) -> On Schedule in Central Market
UPDATE public.trips 
SET 
  status = 'en_route',
  current_district = 'Central Market',
  current_lat = 6.9271,
  current_lng = 79.8612,
  delay_minutes = 0,
  connection_status = 'online',
  eta_time = '7:42 AM',
  last_ping_at = now()
WHERE vehicle_id = '715c49d5-ba6c-4eef-879d-04c79a414608'; -- TRK-024

-- Trip 2: VAN-012 -> Delayed in Harbor Point
UPDATE public.trips 
SET 
  status = 'en_route',
  current_district = 'Harbor Point',
  current_lat = 6.9380,
  current_lng = 79.8500,
  delay_minutes = 12,
  connection_status = 'delayed',
  eta_time = '9:18 AM',
  last_ping_at = now() - interval '2 minutes'
WHERE vehicle_id = '063ea2ca-aeb7-4ea4-aa93-12924b1a802a'; -- VAN-012

-- Trip 3: TRK-019 -> Offline in North District
UPDATE public.trips 
SET 
  status = 'en_route',
  current_district = 'North District',
  current_lat = 6.9600,
  current_lng = 79.8700,
  delay_minutes = 0,
  connection_status = 'offline',
  eta_time = 'Last update 6 min ago',
  last_ping_at = now() - interval '6 minutes'
WHERE vehicle_id = '3c80c48e-5cf9-45f8-94cd-4fe34ac2199a'; -- TRK-019

-- 4. Seed Live Route Exceptions (Powers /tracking feed)
DELETE FROM public.route_exceptions;

INSERT INTO public.route_exceptions (
  trip_id, vehicle_id, vehicle_plate, event_time, event_type, title, description, severity
) VALUES
  (
    'b1042000-0000-0000-0000-000000000001',
    '715c49d5-ba6c-4eef-879d-04c79a414608',
    'TRK-024',
    '07:12',
    'stop_reached',
    'TRK-024 reached Stop 3',
    'Fresh Store #18 · Delivered on schedule',
    'success'
  ),
  (
    'b1045000-0000-0000-0000-000000000002',
    '063ea2ca-aeb7-4ea4-aa93-12924b1a802a',
    'VAN-012',
    '07:18',
    'delay',
    'VAN-012 delayed by 12 minutes',
    'Heavy traffic near Central Market',
    'warning'
  ),
  (
    'b1055000-0000-0000-0000-000000000005',
    '3c80c48e-5cf9-45f8-94cd-4fe34ac2199a',
    'TRK-019',
    '07:22',
    'connectivity_loss',
    'TRK-019 lost connectivity',
    'Last known location: Harbor Point',
    'critical'
  );

-- 5. Seed Historical / Initial Deferral Logs (Powers /deferrals & Store Notifications)
DELETE FROM public.deferral_logs;

INSERT INTO public.deferral_logs (
  order_id, order_number, store_id, store_name, priority, volume_m3, weight_kg, delivery_window, reason, rescheduled_run, store_notified
) VALUES
  (
    'd1000001-0000-0000-0000-000000000001',
    'ORD-2441',
    'a2222222-2222-2222-2222-222222222222',
    'Fresh Store #18',
    'High',
    2.4,
    420.0,
    'Before 8 AM',
    'Capacity shortage',
    'Tomorrow - 10:00 AM',
    true
  ),
  (
    'd1000002-0000-0000-0000-000000000002',
    'ORD-2442',
    'a4444444-4444-4444-4444-444444444444',
    'Metro Market #11',
    'High',
    1.2,
    310.0,
    'Before 9:30 AM',
    'Weight limit',
    'Tomorrow - 10:00 AM',
    true
  ),
  (
    'd1000003-0000-0000-0000-000000000003',
    'ORD-2475',
    'a7777777-7777-7777-7777-777777777777',
    'Style Store #04',
    'Standard',
    1.8,
    680.0,
    '8 - 10 AM',
    'Vehicle unavailable',
    'Tomorrow - 02:00 PM',
    true
  ),
  (
    'd1000004-0000-0000-0000-000000000004',
    'ORD-2438',
    'a8888888-8888-8888-8888-888888888888',
    'Home Store #22',
    'Standard',
    0.9,
    190.0,
    'Before 12 PM',
    'Window conflict',
    'Day After - 08:00 AM',
    true
  );
