-- ============================================================================
-- Seed 006: Realistic demo delivery day (idempotent)
--
-- Run after scripts/seed-auth.js (drivers are looked up by email).
-- Every date is relative to CURRENT_DATE in Asia/Colombo, so the judge
-- walkthrough works on whatever day the system is installed.
-- ============================================================================

-- 1. Store geography & access rules -------------------------------------------
UPDATE public.stores s SET
  latitude = v.lat, longitude = v.lng, district = v.district, is_van_only = v.van_only
FROM (VALUES
  ('a1111111-1111-1111-1111-111111111111'::uuid, 6.8724, 79.8895, 'Colombo', true),
  ('a2222222-2222-2222-2222-222222222222'::uuid, 6.9112, 79.8688, 'Colombo', false),
  ('a3333333-3333-3333-3333-333333333333'::uuid, 6.9055, 79.8512, 'Colombo', false),
  ('a4444444-4444-4444-4444-444444444444'::uuid, 6.8521, 79.8654, 'Colombo', false),
  ('a5555555-5555-5555-5555-555555555555'::uuid, 6.8920, 79.8550, 'Colombo', false),
  ('a6666666-6666-6666-6666-666666666666'::uuid, 6.8980, 79.9190, 'Colombo', false),
  ('a7777777-7777-7777-7777-777777777777'::uuid, 6.9362, 79.8450, 'Colombo', false),
  ('a8888888-8888-8888-8888-888888888888'::uuid, 6.9110, 79.8970, 'Colombo', false)
) AS v(id, lat, lng, district, van_only)
WHERE s.id = v.id;

-- Remove the leftover manual test store (only when nothing references it)
DELETE FROM public.stores s
WHERE s.name = 'test'
  AND NOT EXISTS (SELECT 1 FROM public.orders o WHERE o.store_id = s.id)
  AND NOT EXISTS (SELECT 1 FROM public.trip_stops t WHERE t.store_id = s.id)
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.store_id = s.id);

-- 2. Existing orders get an item count (cases), derived from weight -----------
UPDATE public.orders SET item_count = GREATEST(1, round(total_weight_kg / 20)::int)
WHERE item_count = 0;

-- Open orders roll forward to tomorrow so the dispatcher has a queue to plan
UPDATE public.orders
SET target_delivery_date = (now() AT TIME ZONE 'Asia/Colombo')::date + 1
WHERE status = 'pending';

-- 3. Today's orders for TRIP 1042 (one dedicated order per stop) --------------
INSERT INTO public.orders (id, order_number, store_id, total_weight_kg, total_volume_m3, temp_requirement,
                           status, target_delivery_date, priority, delivery_window, item_count)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'ORD-3001', 'a2222222-2222-2222-2222-222222222222', 310, 2.4, 'chilled', 'assigned', (now() AT TIME ZONE 'Asia/Colombo')::date, 'High', '07:00 - 08:00 AM', 16),
  ('d0000000-0000-0000-0000-000000000002', 'ORD-3002', 'a1111111-1111-1111-1111-111111111111', 420, 3.1, 'chilled', 'assigned', (now() AT TIME ZONE 'Asia/Colombo')::date, 'High', '08:00 - 08:30 AM', 28),
  ('d0000000-0000-0000-0000-000000000003', 'ORD-3003', 'a3333333-3333-3333-3333-333333333333', 680, 6.8, 'ambient', 'assigned', (now() AT TIME ZONE 'Asia/Colombo')::date, 'Standard', '09:00 - 10:00 AM', 34),
  ('d0000000-0000-0000-0000-000000000004', 'ORD-3004', 'a4444444-4444-4444-4444-444444444444', 520, 4.2, 'chilled', 'assigned', (now() AT TIME ZONE 'Asia/Colombo')::date, 'Standard', '10:30 - 11:15 AM', 22),
  -- Delivered yesterday to Fresh Store #22, awaiting the store manager's receipt confirmation
  ('d0000000-0000-0000-0000-000000000005', 'ORD-2999', 'a1111111-1111-1111-1111-111111111111', 260, 2.0, 'ambient', 'delivered', (now() AT TIME ZONE 'Asia/Colombo')::date - 1, 'Standard', '08:00 - 08:30 AM', 14)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  target_delivery_date = EXCLUDED.target_delivery_date,
  item_count = EXCLUDED.item_count;

UPDATE public.trip_stops s SET
  order_id = v.order_id, status = 'PENDING', completed_at = NULL,
  estimated_arrival = ((now() AT TIME ZONE 'Asia/Colombo')::date + v.eta) AT TIME ZONE 'Asia/Colombo'
FROM (VALUES
  ('c1042001-0000-0000-0000-000000000001'::uuid, 'd0000000-0000-0000-0000-000000000001'::uuid, TIME '07:20'),
  ('c1042002-0000-0000-0000-000000000002'::uuid, 'd0000000-0000-0000-0000-000000000002'::uuid, TIME '08:05'),
  ('c1042003-0000-0000-0000-000000000003'::uuid, 'd0000000-0000-0000-0000-000000000003'::uuid, TIME '09:15'),
  ('c1042004-0000-0000-0000-000000000004'::uuid, 'd0000000-0000-0000-0000-000000000004'::uuid, TIME '10:40')
) AS v(id, order_id, eta)
WHERE s.id = v.id;

DELETE FROM public.proof_of_delivery
WHERE stop_id IN (SELECT id FROM public.trip_stops WHERE trip_id = 'b1042000-0000-0000-0000-000000000001');

-- 4. Trips run today, one driver per vehicle ------------------------------------
UPDATE public.trips t SET
  trip_date = (now() AT TIME ZONE 'Asia/Colombo')::date,
  driver_id = (SELECT id FROM auth.users WHERE email = v.driver_email)
FROM (VALUES
  ('b1042000-0000-0000-0000-000000000001'::uuid, 'driver@waypoint.com'),
  ('b1045000-0000-0000-0000-000000000002'::uuid, 'driver2@waypoint.com'),
  ('b1049000-0000-0000-0000-000000000003'::uuid, 'driver3@waypoint.com'),
  ('b1052000-0000-0000-0000-000000000004'::uuid, 'driver4@waypoint.com'),
  ('b1055000-0000-0000-0000-000000000005'::uuid, 'driver2@waypoint.com'),
  ('b1058000-0000-0000-0000-000000000006'::uuid, 'driver3@waypoint.com')
) AS v(id, driver_email)
WHERE t.id = v.id
  AND EXISTS (SELECT 1 FROM auth.users WHERE email = v.driver_email);

UPDATE public.trips SET status = 'en_route', departure_time = '06:30 AM'
WHERE id = 'b1042000-0000-0000-0000-000000000001';

-- 5. Receipts are re-done in the walkthrough -------------------------------------
DELETE FROM public.store_receipts WHERE order_id = 'd0000000-0000-0000-0000-000000000005';

-- 6. Yesterday's completed run that delivered ORD-2999, with its proof of delivery
INSERT INTO public.trips (id, trip_number, vehicle_id, driver_id, trip_date, status, bay, departure_time, dispatched_at)
SELECT 'b1038000-0000-0000-0000-000000000007', 'TRIP 1038', '715c49d5-ba6c-4eef-879d-04c79a414608',
       u.id, (now() AT TIME ZONE 'Asia/Colombo')::date - 1, 'completed', 'Bay 01', '06:15 AM',
       (((now() AT TIME ZONE 'Asia/Colombo')::date - 1) + TIME '06:15') AT TIME ZONE 'Asia/Colombo'
FROM auth.users u WHERE u.email = 'driver@waypoint.com'
ON CONFLICT (id) DO UPDATE SET trip_date = EXCLUDED.trip_date, status = 'completed', dispatched_at = EXCLUDED.dispatched_at,
  vehicle_id = EXCLUDED.vehicle_id, driver_id = EXCLUDED.driver_id;

INSERT INTO public.trip_stops (id, trip_id, order_id, store_id, stop_sequence, estimated_arrival, status, completed_at)
VALUES ('c1038001-0000-0000-0000-000000000001', 'b1038000-0000-0000-0000-000000000007',
        'd0000000-0000-0000-0000-000000000005', 'a1111111-1111-1111-1111-111111111111', 1,
        (((now() AT TIME ZONE 'Asia/Colombo')::date - 1) + TIME '08:05') AT TIME ZONE 'Asia/Colombo', 'COMPLETED',
        (((now() AT TIME ZONE 'Asia/Colombo')::date - 1) + TIME '08:12') AT TIME ZONE 'Asia/Colombo')
ON CONFLICT (id) DO UPDATE SET estimated_arrival = EXCLUDED.estimated_arrival, status = 'COMPLETED', completed_at = EXCLUDED.completed_at;

INSERT INTO public.proof_of_delivery (stop_id, items_expected, items_delivered, notes, captured_offline, synced_at, outcome, captured_by, captured_at)
SELECT 'c1038001-0000-0000-0000-000000000001', 14, 13,
       'One case of soft drinks short at loading; noted with store staff.', true,
       (((now() AT TIME ZONE 'Asia/Colombo')::date - 1) + TIME '08:40') AT TIME ZONE 'Asia/Colombo',
       'partial', u.id,
       (((now() AT TIME ZONE 'Asia/Colombo')::date - 1) + TIME '08:12') AT TIME ZONE 'Asia/Colombo'
FROM auth.users u WHERE u.email = 'driver@waypoint.com'
ON CONFLICT (stop_id) DO UPDATE SET captured_at = EXCLUDED.captured_at, synced_at = EXCLUDED.synced_at;

-- 7. Each vehicle has its own driver (brief: "Each vehicle has a driver")
UPDATE public.vehicles v SET driver_id = u.id
FROM (VALUES
  ('TRK-024', 'driver@waypoint.com'),
  ('VAN-012', 'driver2@waypoint.com'),
  ('TRK-019', 'driver3@waypoint.com'),
  ('VAN-016', 'driver4@waypoint.com'),
  ('TRK-031', 'driver5@waypoint.com'),
  ('VAN-008', 'driver6@waypoint.com'),
  ('TRK-042', 'driver7@waypoint.com'),
  ('TRK-055', 'driver8@waypoint.com')
) AS m(plate, email)
JOIN auth.users u ON u.email = m.email
WHERE v.registration_number = m.plate;

-- Trips are driven by their vehicle's assigned driver
UPDATE public.trips t SET driver_id = v.driver_id
FROM public.vehicles v
WHERE t.vehicle_id = v.id AND v.driver_id IS NOT NULL AND t.driver_id IS DISTINCT FROM v.driver_id;

-- 8. Tomorrow's order queue: chilled demand exceeds refrigerated capacity, so the
--    dispatcher's allocation must defer some orders (brief: "a day when demand
--    exceeds available capacity").
DELETE FROM public.trip_stops WHERE order_id IN (
  SELECT id FROM public.orders WHERE order_number LIKE 'ORD-4%' AND id::text LIKE 'd2000000-%'
);
INSERT INTO public.orders (id, order_number, store_id, total_weight_kg, total_volume_m3, temp_requirement,
                           status, target_delivery_date, priority, item_count, delivery_window)
SELECT
  ('d2000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
  'ORD-' || (4000 + i),
  s.id,
  CASE WHEN i % 3 = 0 THEN 900 ELSE 650 END,
  CASE WHEN i % 4 = 0 THEN 4.5 ELSE 9.5 END,
  (CASE WHEN i % 4 = 0 THEN 'ambient' ELSE 'chilled' END)::public.temp_type,
  'pending',
  (now() AT TIME ZONE 'Asia/Colombo')::date + 1,
  (ARRAY['High', 'Standard', 'Low'])[1 + i % 3],
  CASE WHEN i % 3 = 0 THEN 45 ELSE 32 END,
  to_char(s.delivery_window_start, 'HH24:MI') || ' - ' || to_char(s.delivery_window_end, 'HH24:MI')
FROM generate_series(1, 20) AS i
JOIN LATERAL (
  SELECT id, delivery_window_start, delivery_window_end FROM public.stores
  WHERE latitude IS NOT NULL ORDER BY id OFFSET (i % 8) LIMIT 1
) s ON true
ON CONFLICT (id) DO UPDATE SET
  status = 'pending', target_delivery_date = EXCLUDED.target_delivery_date,
  deferral_reason = NULL, deferred_at = NULL, deferred_by = NULL;
