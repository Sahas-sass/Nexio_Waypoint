-- Seed 001: Comprehensive Warehouse Ecosystem (Vehicles, Stores, Orders, Multi-Bay Trips, Pallets, and Historical Logs)

-- ============================================================================
-- 1. Ensure Drivers & Loaders exist in profiles
-- ============================================================================
UPDATE public.profiles 
SET full_name = 'Kasun Perera', role = 'driver', assigned_bay = 'Fleet Bay 04', station = 'Colombo Fleet Hub', shift = 'Morning Shift (06:00 - 14:00)', is_verified = true, status = 'active'
WHERE id = '0debb9b8-2be6-4e23-be24-ad11a3211e58';

UPDATE public.profiles 
SET full_name = 'osal', role = 'loader', assigned_bay = 'Bay 04', station = 'Central Fulfillment Hub', shift = 'Morning Shift (06:00 - 14:00)', is_verified = true, status = 'active'
WHERE id = '956872eb-0611-47ef-b9f3-dd719307b81f';

-- ============================================================================
-- 2. Seed 8 Diverse Vehicles (Reefers, Urban Vans, Heavy Freight)
-- ============================================================================
INSERT INTO public.vehicles (id, registration_number, vehicle_type, max_weight_kg, max_volume_m3, is_refrigerated, is_active)
VALUES
  ('715c49d5-ba6c-4eef-879d-04c79a414608', 'TRK-024', 'Isuzu NPR Heavy Freight', 5000.0, 30.0, true, true),
  ('063ea2ca-aeb7-4ea4-aa93-12924b1a802a', 'VAN-012', 'Toyota HiAce Urban Express', 1200.0, 8.5, false, true),
  ('3c80c48e-5cf9-45f8-94cd-4fe34ac2199a', 'TRK-019', 'Mitsubishi Fuso Multi-Temp', 4000.0, 24.0, true, true),
  ('4d91d59f-6da0-56f9-05de-5fe45bd3200b', 'TRK-031', 'Hino 500 Dual-Zone Reefer', 7500.0, 38.0, true, true),
  ('5ea2e60a-7eb1-67a0-16ef-6af56ce4311c', 'VAN-008', 'Nissan NV350 High-Roof Van', 1500.0, 9.5, false, true),
  ('6fb3f71b-8fc2-78b1-27fa-7ba67df5422d', 'TRK-042', 'Isuzu Forward Chilled Liner', 6000.0, 32.0, true, true),
  ('7ac4a82c-9ad3-89c2-38ab-8cb78ea6533e', 'VAN-016', 'Hyundai Porter Chilled Van', 1800.0, 11.0, true, true),
  ('8bd5b93d-0be4-90d3-49bc-9dc89fb7644f', 'TRK-055', 'UD Quester Heavy Hauler', 10000.0, 52.0, false, true)
ON CONFLICT (id) DO UPDATE 
SET registration_number = EXCLUDED.registration_number,
    vehicle_type = EXCLUDED.vehicle_type,
    max_weight_kg = EXCLUDED.max_weight_kg,
    is_refrigerated = EXCLUDED.is_refrigerated;

-- ============================================================================
-- 3. Seed 8 Retail Stores
-- ============================================================================
INSERT INTO public.stores (id, name, brand, address, access_conditions, delivery_window_start, delivery_window_end)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Fresh Store 22', 'Waypoint Fresh', '155 High Level Rd, Nugegoda', 'Rear Dock, Van Access Only', '08:00:00', '08:30:00'),
  ('a2222222-2222-2222-2222-222222222222', 'Fresh Store 18', 'Waypoint Fresh', 'Colombo 07', 'Front Unloading Zone', '07:00:00', '08:00:00'),
  ('a3333333-3333-3333-3333-333333333333', 'Style Store 08', 'Waypoint Style', 'Colombo 03', 'Standard Bay Access', '09:00:00', '10:00:00'),
  ('a4444444-4444-4444-4444-444444444444', 'Daily Market 11', 'Waypoint Daily', 'Galle Rd, Dehiwala', 'Rear Roll-up Door Access', '10:30:00', '11:15:00'),
  ('a5555555-5555-5555-5555-555555555555', 'Fresh Store 05', 'Waypoint Fresh', 'Galle Rd, Bambalapitiya', 'Basement Bay Access (Max 3.2m)', '07:30:00', '08:15:00'),
  ('a6666666-6666-6666-6666-666666666666', 'Daily Market 14', 'Waypoint Daily', 'Main St, Battaramulla', 'Side Unloading Curb', '09:30:00', '10:30:00'),
  ('a7777777-7777-7777-7777-777777777777', 'Style Store 02', 'Waypoint Style', 'York St, Fort Central', 'Strict Gate Clearance Required', '06:30:00', '07:15:00'),
  ('a8888888-8888-8888-8888-888888888888', 'Urban Market 09', 'Waypoint Urban', 'Parliament Rd, Rajagiriya', 'Wide Loading Dock Access', '08:45:00', '09:45:00')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, address = EXCLUDED.address;

-- ============================================================================
-- 4. Seed Orders (All using 'ambient' or 'chilled' as per enum)
-- ============================================================================
INSERT INTO public.orders (id, order_number, store_id, total_weight_kg, total_volume_m3, temp_requirement, status, target_delivery_date)
VALUES
  ('7b7ad280-ac0f-485f-8118-794ceb6e7204', 'ORD-1048', 'a1111111-1111-1111-1111-111111111111', 420.0, 2.4, 'chilled', 'assigned', CURRENT_DATE),
  ('db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 'ORD-1042', 'a2222222-2222-2222-2222-222222222222', 310.0, 1.8, 'chilled', 'assigned', CURRENT_DATE),
  ('ec6bd4c5-60a3-421c-9599-0b09d6157978', 'ORD-1056', 'a3333333-3333-3333-3333-333333333333', 680.0, 5.2, 'ambient', 'assigned', CURRENT_DATE),
  ('7b7ad280-ac0f-485f-8118-794ceb6e7999', 'ORD-1099', 'a4444444-4444-4444-4444-444444444444', 520.0, 3.8, 'chilled', 'assigned', CURRENT_DATE),
  ('8c8be391-bd10-5960-9229-805dfc7f8001', 'ORD-1102', 'a5555555-5555-5555-5555-555555555555', 380.0, 2.1, 'chilled', 'assigned', CURRENT_DATE),
  ('9d9cf402-ce21-6a71-a33a-916e0d8a9112', 'ORD-1105', 'a6666666-6666-6666-6666-666666666666', 740.0, 6.0, 'ambient', 'assigned', CURRENT_DATE),
  ('aeadf513-df32-7b82-b44b-027f1e9ba223', 'ORD-1108', 'a7777777-7777-7777-7777-777777777777', 290.0, 1.5, 'chilled', 'assigned', CURRENT_DATE),
  ('bfbee624-ea43-8c93-c55c-13802facb334', 'ORD-1111', 'a8888888-8888-8888-8888-888888888888', 610.0, 4.4, 'ambient', 'assigned', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. Clear and Seed 6 Active Multi-Bay Warehouse Trips
-- ============================================================================
DELETE FROM public.pallets;
DELETE FROM public.trip_stops;
DELETE FROM public.trips;

-- Trip 1: TRIP 1042 (Bay 04, TRK-024, Kasun Perera) -> status: loading
INSERT INTO public.trips (
  id, trip_number, vehicle_id, driver_id, trip_date, status, bay, departure_time, cutoff_time, loader_id
) VALUES (
  'b1042000-0000-0000-0000-000000000001',
  'TRIP 1042',
  '715c49d5-ba6c-4eef-879d-04c79a414608', -- TRK-024 (Isuzu 5.0T)
  '0debb9b8-2be6-4e23-be24-ad11a3211e58', -- Kasun Perera
  CURRENT_DATE,
  'loading',
  'Bay 04',
  '06:30 AM',
  '05:45 AM',
  '956872eb-0611-47ef-b9f3-dd719307b81f' -- osal (loader)
);

-- Trip 2: TRIP 1045 (Bay 02, VAN-012, Kasun Perera) -> status: planning (Ready to Load)
INSERT INTO public.trips (
  id, trip_number, vehicle_id, driver_id, trip_date, status, bay, departure_time, cutoff_time
) VALUES (
  'b1045000-0000-0000-0000-000000000002',
  'TRIP 1045',
  '063ea2ca-aeb7-4ea4-aa93-12924b1a802a', -- VAN-012 (Toyota HiAce)
  '0debb9b8-2be6-4e23-be24-ad11a3211e58', -- Kasun Perera
  CURRENT_DATE,
  'planning',
  'Bay 02',
  '07:15 AM',
  '06:15 AM'
);

-- Trip 3: TRIP 1049 (Bay 06, TRK-031, Kasun Perera) -> status: planning
INSERT INTO public.trips (
  id, trip_number, vehicle_id, driver_id, trip_date, status, bay, departure_time, cutoff_time
) VALUES (
  'b1049000-0000-0000-0000-000000000003',
  'TRIP 1049',
  '4d91d59f-6da0-56f9-05de-5fe45bd3200b', -- TRK-031 (Hino 7.5T)
  '0debb9b8-2be6-4e23-be24-ad11a3211e58', -- Kasun Perera
  CURRENT_DATE,
  'planning',
  'Bay 06',
  '08:00 AM',
  '07:00 AM'
);

-- Trip 4: TRIP 1052 (Bay 01, VAN-016, Kasun Perera) -> status: loading
INSERT INTO public.trips (
  id, trip_number, vehicle_id, driver_id, trip_date, status, bay, departure_time, cutoff_time, loader_id
) VALUES (
  'b1052000-0000-0000-0000-000000000004',
  'TRIP 1052',
  '7ac4a82c-9ad3-89c2-38ab-8cb78ea6533e', -- VAN-016 (Hyundai Chilled 1.8T)
  '0debb9b8-2be6-4e23-be24-ad11a3211e58', -- Kasun Perera
  CURRENT_DATE,
  'loading',
  'Bay 01',
  '06:45 AM',
  '06:00 AM',
  '956872eb-0611-47ef-b9f3-dd719307b81f'
);

-- Trip 5: TRIP 1055 (Bay 03, TRK-019, Kasun Perera) -> status: planning (Ready)
INSERT INTO public.trips (
  id, trip_number, vehicle_id, driver_id, trip_date, status, bay, departure_time, cutoff_time
) VALUES (
  'b1055000-0000-0000-0000-000000000005',
  'TRIP 1055',
  '3c80c48e-5cf9-45f8-94cd-4fe34ac2199a', -- TRK-019 (Fuso 4.0T)
  '0debb9b8-2be6-4e23-be24-ad11a3211e58',
  CURRENT_DATE,
  'planning',
  'Bay 03',
  '07:30 AM',
  '06:30 AM'
);

-- Trip 6: TRIP 1058 (Bay 05, TRK-042, Kasun Perera) -> status: planning
INSERT INTO public.trips (
  id, trip_number, vehicle_id, driver_id, trip_date, status, bay, departure_time, cutoff_time
) VALUES (
  'b1058000-0000-0000-0000-000000000006',
  'TRIP 1058',
  '6fb3f71b-8fc2-78b1-27fa-7ba67df5422d', -- TRK-042 (Isuzu Chilled 6.0T)
  '0debb9b8-2be6-4e23-be24-ad11a3211e58',
  CURRENT_DATE,
  'planning',
  'Bay 05',
  '08:45 AM',
  '07:45 AM'
);

-- ============================================================================
-- 6. Seed Trip Stops for All Trips (Testing Reverse-Stop Loading Order)
-- ============================================================================

-- Trip 1 Stops (4 Stops: Stop 4 is loaded 1st, Stop 1 loaded last)
INSERT INTO public.trip_stops (id, trip_id, store_id, order_id, stop_sequence, status)
VALUES
  ('c1042004-0000-0000-0000-000000000004', 'b1042000-0000-0000-0000-000000000001', 'a4444444-4444-4444-4444-444444444444', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 4, 'pending'),
  ('c1042003-0000-0000-0000-000000000003', 'b1042000-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 3, 'pending'),
  ('c1042002-0000-0000-0000-000000000002', 'b1042000-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', '7b7ad280-ac0f-485f-8118-794ceb6e7204', 2, 'pending'),
  ('c1042001-0000-0000-0000-000000000001', 'b1042000-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', 'db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 1, 'pending');

-- Trip 2 Stops (2 Stops)
INSERT INTO public.trip_stops (id, trip_id, store_id, order_id, stop_sequence, status)
VALUES
  ('c1045002-0000-0000-0000-000000000002', 'b1045000-0000-0000-0000-000000000002', 'a5555555-5555-5555-5555-555555555555', '8c8be391-bd10-5960-9229-805dfc7f8001', 2, 'pending'),
  ('c1045001-0000-0000-0000-000000000001', 'b1045000-0000-0000-0000-000000000002', 'a7777777-7777-7777-7777-777777777777', 'aeadf513-df32-7b82-b44b-027f1e9ba223', 1, 'pending');

-- Trip 3 Stops (3 Stops)
INSERT INTO public.trip_stops (id, trip_id, store_id, order_id, stop_sequence, status)
VALUES
  ('c1049003-0000-0000-0000-000000000003', 'b1049000-0000-0000-0000-000000000003', 'a6666666-6666-6666-6666-666666666666', '9d9cf402-ce21-6a71-a33a-916e0d8a9112', 3, 'pending'),
  ('c1049002-0000-0000-0000-000000000002', 'b1049000-0000-0000-0000-000000000003', 'a8888888-8888-8888-8888-888888888888', 'bfbee624-ea43-8c93-c55c-13802facb334', 2, 'pending'),
  ('c1049001-0000-0000-0000-000000000001', 'b1049000-0000-0000-0000-000000000003', 'a2222222-2222-2222-2222-222222222222', 'db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 1, 'pending');

-- Trip 4 Stops (2 Stops)
INSERT INTO public.trip_stops (id, trip_id, store_id, order_id, stop_sequence, status)
VALUES
  ('c1052002-0000-0000-0000-000000000002', 'b1052000-0000-0000-0000-000000000004', 'a1111111-1111-1111-1111-111111111111', '7b7ad280-ac0f-485f-8118-794ceb6e7204', 2, 'pending'),
  ('c1052001-0000-0000-0000-000000000001', 'b1052000-0000-0000-0000-000000000004', 'a5555555-5555-5555-5555-555555555555', '8c8be391-bd10-5960-9229-805dfc7f8001', 1, 'pending');

-- Trip 5 Stops (2 Stops)
INSERT INTO public.trip_stops (id, trip_id, store_id, order_id, stop_sequence, status)
VALUES
  ('c1055002-0000-0000-0000-000000000002', 'b1055000-0000-0000-0000-000000000005', 'a3333333-3333-3333-3333-333333333333', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 2, 'pending'),
  ('c1055001-0000-0000-0000-000000000001', 'b1055000-0000-0000-0000-000000000005', 'a4444444-4444-4444-4444-444444444444', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 1, 'pending');

-- Trip 6 Stops (3 Stops)
INSERT INTO public.trip_stops (id, trip_id, store_id, order_id, stop_sequence, status)
VALUES
  ('c1058003-0000-0000-0000-000000000003', 'b1058000-0000-0000-0000-000000000006', 'a8888888-8888-8888-8888-888888888888', 'bfbee624-ea43-8c93-c55c-13802facb334', 3, 'pending'),
  ('c1058002-0000-0000-0000-000000000002', 'b1058000-0000-0000-0000-000000000006', 'a6666666-6666-6666-6666-666666666666', '9d9cf402-ce21-6a71-a33a-916e0d8a9112', 2, 'pending'),
  ('c1058001-0000-0000-0000-000000000001', 'b1058000-0000-0000-0000-000000000006', 'a7777777-7777-7777-7777-777777777777', 'aeadf513-df32-7b82-b44b-027f1e9ba223', 1, 'pending');

-- ============================================================================
-- 7. Seed 44 Pallets with Real SKUs, Weights, Categories & Verification
-- ============================================================================
INSERT INTO public.pallets (trip_id, stop_id, order_id, sku, name, category, temp_req, weight_kg, is_verified)
VALUES
  -- -------------------------------------------------------------
  -- Trip 1 Pallets (TRIP #1042, Bay 04 - 13 Pallets)
  -- -------------------------------------------------------------
  -- Stop 4: Daily Market 11 (Dehiwala) - Load Seq #1 (First into truck)
  ('b1042000-0000-0000-0000-000000000001', 'c1042004-0000-0000-0000-000000000004', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 'FR-9921-A', 'Poultry & Frozen Meats', 'frozen', '-18°C', 580, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042004-0000-0000-0000-000000000004', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 'CH-9921-B', 'Dairy & Chilled Cheeses', 'chilled', '4°C', 420, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042004-0000-0000-0000-000000000004', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 'AM-9921-C', 'Dry Packaged Staples', 'ambient', NULL, 350, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042004-0000-0000-0000-000000000004', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 'AM-9921-D', 'Beverage Crate Stacks', 'ambient', NULL, 610, false),

  -- Stop 3: Style Store 08 (Colombo 03) - Load Seq #2
  ('b1042000-0000-0000-0000-000000000001', 'c1042003-0000-0000-0000-000000000003', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 'AM-8820-A', 'Fresh Orchard Fruits', 'ambient', NULL, 310, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042003-0000-0000-0000-000000000003', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 'FR-8820-B', 'Ice Creams & Confectionery', 'frozen', '-18°C', 280, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042003-0000-0000-0000-000000000003', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 'AM-8820-C', 'Household & Cleaners', 'ambient', NULL, 240, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042003-0000-0000-0000-000000000003', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 'AM-8820-D', 'Bottled Mineral Water', 'ambient', NULL, 450, false),

  -- Stop 2: Fresh Store 22 (Nugegoda) - Load Seq #3
  ('b1042000-0000-0000-0000-000000000001', 'c1042002-0000-0000-0000-000000000002', '7b7ad280-ac0f-485f-8118-794ceb6e7204', 'CH-1048', 'Fresh Milk Crates', 'chilled', '4°C', 310, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042002-0000-0000-0000-000000000002', '7b7ad280-ac0f-485f-8118-794ceb6e7204', 'CH-2072', 'Greek Yogurt Cases', 'chilled', '4°C', 220, false),

  -- Stop 1: Fresh Store 18 (Colombo 07) - Load Seq #4 (Last into truck, near doors!)
  ('b1042000-0000-0000-0000-000000000001', 'c1042001-0000-0000-0000-000000000001', 'db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 'AM-1205-A', 'Daily Vegetable Crates', 'ambient', NULL, 290, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042001-0000-0000-0000-000000000001', 'db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 'CH-3185', 'Cheese Cartons & Cuts', 'chilled', '4°C', 180, false),
  ('b1042000-0000-0000-0000-000000000001', 'c1042001-0000-0000-0000-000000000001', 'db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 'AM-1205-C', 'Bakery Bread Packs', 'ambient', NULL, 160, false),

  -- -------------------------------------------------------------
  -- Trip 2 Pallets (TRIP #1045, Bay 02 - 6 Pallets)
  -- -------------------------------------------------------------
  ('b1045000-0000-0000-0000-000000000002', 'c1045002-0000-0000-0000-000000000002', '8c8be391-bd10-5960-9229-805dfc7f8001', 'AM-2101', 'Canned Fruit & Preserves', 'ambient', NULL, 210, false),
  ('b1045000-0000-0000-0000-000000000002', 'c1045002-0000-0000-0000-000000000002', '8c8be391-bd10-5960-9229-805dfc7f8001', 'CH-2102', 'Fresh Cream Cartons', 'chilled', '4°C', 140, false),
  ('b1045000-0000-0000-0000-000000000002', 'c1045002-0000-0000-0000-000000000002', '8c8be391-bd10-5960-9229-805dfc7f8001', 'AM-2103', 'Snack Foods & Chips', 'ambient', NULL, 180, false),
  ('b1045000-0000-0000-0000-000000000002', 'c1045001-0000-0000-0000-000000000001', 'aeadf513-df32-7b82-b44b-027f1e9ba223', 'AM-2201', 'Paper Towels & Tissues', 'ambient', NULL, 120, false),
  ('b1045000-0000-0000-0000-000000000002', 'c1045001-0000-0000-0000-000000000001', 'aeadf513-df32-7b82-b44b-027f1e9ba223', 'CH-2202', 'Packaged Smoked Ham', 'chilled', '4°C', 160, false),
  ('b1045000-0000-0000-0000-000000000002', 'c1045001-0000-0000-0000-000000000001', 'aeadf513-df32-7b82-b44b-027f1e9ba223', 'AM-2203', 'Coffee & Tea Cartons', 'ambient', NULL, 190, false),

  -- -------------------------------------------------------------
  -- Trip 3 Pallets (TRIP #1049, Bay 06 - 8 Pallets)
  -- -------------------------------------------------------------
  ('b1049000-0000-0000-0000-000000000003', 'c1049003-0000-0000-0000-000000000003', '9d9cf402-ce21-6a71-a33a-916e0d8a9112', 'FR-3101', 'Frozen Seafood Crates', 'frozen', '-18°C', 450, false),
  ('b1049000-0000-0000-0000-000000000003', 'c1049003-0000-0000-0000-000000000003', '9d9cf402-ce21-6a71-a33a-916e0d8a9112', 'FR-3102', 'Ice Cream Tubs Multi-Pack', 'frozen', '-18°C', 380, false),
  ('b1049000-0000-0000-0000-000000000003', 'c1049003-0000-0000-0000-000000000003', '9d9cf402-ce21-6a71-a33a-916e0d8a9112', 'CH-3103', 'Butter & Margarine Blocks', 'chilled', '4°C', 320, false),
  ('b1049000-0000-0000-0000-000000000003', 'c1049002-0000-0000-0000-000000000002', 'bfbee624-ea43-8c93-c55c-13802facb334', 'CH-3201', 'Fresh Pasteurized Milk', 'chilled', '4°C', 410, false),
  ('b1049000-0000-0000-0000-000000000003', 'c1049002-0000-0000-0000-000000000002', 'bfbee624-ea43-8c93-c55c-13802facb334', 'FR-3202', 'Frozen Green Peas & Corn', 'frozen', '-18°C', 290, false),
  ('b1049000-0000-0000-0000-000000000003', 'c1049002-0000-0000-0000-000000000002', 'bfbee624-ea43-8c93-c55c-13802facb334', 'AM-3203', 'Pasta & Spaghetti Cases', 'ambient', NULL, 340, false),
  ('b1049000-0000-0000-0000-000000000003', 'c1049001-0000-0000-0000-000000000001', 'db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 'CH-3301', 'Artisan Cheddar Wheels', 'chilled', '4°C', 250, false),
  ('b1049000-0000-0000-0000-000000000003', 'c1049001-0000-0000-0000-000000000001', 'db5276ab-3426-40ad-b8b2-ba6fdd5f5ab8', 'AM-3302', 'Mineral Water Glass Cases', 'ambient', NULL, 510, false),

  -- -------------------------------------------------------------
  -- Trip 4 Pallets (TRIP #1052, Bay 01 - 5 Pallets)
  -- -------------------------------------------------------------
  ('b1052000-0000-0000-0000-000000000004', 'c1052002-0000-0000-0000-000000000002', '7b7ad280-ac0f-485f-8118-794ceb6e7204', 'CH-4101', 'Yogurt Drink Bottles', 'chilled', '4°C', 240, false),
  ('b1052000-0000-0000-0000-000000000004', 'c1052002-0000-0000-0000-000000000002', '7b7ad280-ac0f-485f-8118-794ceb6e7204', 'CH-4102', 'Chilled Fresh Ricotta', 'chilled', '4°C', 190, false),
  ('b1052000-0000-0000-0000-000000000004', 'c1052001-0000-0000-0000-000000000001', '8c8be391-bd10-5960-9229-805dfc7f8001', 'CH-4201', 'Organic Farm Eggs (Chilled)', 'chilled', '4°C', 170, false),
  ('b1052000-0000-0000-0000-000000000004', 'c1052001-0000-0000-0000-000000000001', '8c8be391-bd10-5960-9229-805dfc7f8001', 'CH-4202', 'Flavored Milk Bottles', 'chilled', '4°C', 280, false),
  ('b1052000-0000-0000-0000-000000000004', 'c1052001-0000-0000-0000-000000000001', '8c8be391-bd10-5960-9229-805dfc7f8001', 'AM-4203', 'Breakfast Muesli & Flakes', 'ambient', NULL, 150, false),

  -- -------------------------------------------------------------
  -- Trip 5 Pallets (TRIP #1055, Bay 03 - 6 Pallets)
  -- -------------------------------------------------------------
  ('b1055000-0000-0000-0000-000000000005', 'c1055002-0000-0000-0000-000000000002', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 'AM-5101', 'Wheat Flour 5kg Sacks', 'ambient', NULL, 480, false),
  ('b1055000-0000-0000-0000-000000000005', 'c1055002-0000-0000-0000-000000000002', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 'AM-5102', 'White Sugar Packets', 'ambient', NULL, 520, false),
  ('b1055000-0000-0000-0000-000000000005', 'c1055002-0000-0000-0000-000000000002', 'ec6bd4c5-60a3-421c-9599-0b09d6157978', 'AM-5103', 'Edible Vegetable Cooking Oil', 'ambient', NULL, 390, false),
  ('b1055000-0000-0000-0000-000000000005', 'c1055001-0000-0000-0000-000000000001', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 'AM-5201', 'Bulk Lentils & Dhal Sacks', 'ambient', NULL, 420, false),
  ('b1055000-0000-0000-0000-000000000005', 'c1055001-0000-0000-0000-000000000001', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 'AM-5202', 'Jasmine & Basmati Rice Sacks', 'ambient', NULL, 600, false),
  ('b1055000-0000-0000-0000-000000000005', 'c1055001-0000-0000-0000-000000000001', '7b7ad280-ac0f-485f-8118-794ceb6e7999', 'AM-5203', 'Rock Salt & Spices', 'ambient', NULL, 280, false),

  -- -------------------------------------------------------------
  -- Trip 6 Pallets (TRIP #1058, Bay 05 - 6 Pallets)
  -- -------------------------------------------------------------
  ('b1058000-0000-0000-0000-000000000006', 'c1058003-0000-0000-0000-000000000003', 'bfbee624-ea43-8c93-c55c-13802facb334', 'CH-6101', 'Fresh Cut Fruit Cups', 'chilled', '4°C', 180, false),
  ('b1058000-0000-0000-0000-000000000006', 'c1058003-0000-0000-0000-000000000003', 'bfbee624-ea43-8c93-c55c-13802facb334', 'CH-6102', 'Chilled Fresh Juice Jugs', 'chilled', '4°C', 260, false),
  ('b1058000-0000-0000-0000-000000000006', 'c1058002-0000-0000-0000-000000000002', '9d9cf402-ce21-6a71-a33a-916e0d8a9112', 'AM-6201', 'Dishwashing Liquid Jugs', 'ambient', NULL, 310, false),
  ('b1058000-0000-0000-0000-000000000006', 'c1058002-0000-0000-0000-000000000002', '9d9cf402-ce21-6a71-a33a-916e0d8a9112', 'AM-6202', 'Laundry Detergent Packs', 'ambient', NULL, 390, false),
  ('b1058000-0000-0000-0000-000000000006', 'c1058001-0000-0000-0000-000000000001', 'aeadf513-df32-7b82-b44b-027f1e9ba223', 'AM-6301', 'Sanitary & Cleaning Rollers', 'ambient', NULL, 150, false),
  ('b1058000-0000-0000-0000-000000000006', 'c1058001-0000-0000-0000-000000000001', 'aeadf513-df32-7b82-b44b-027f1e9ba223', 'AM-6302', 'Trash Bags & Disinfectant', 'ambient', NULL, 190, false);

-- ============================================================================
-- 8. Seed 18 Historical Loading & Dispatch Logs
-- ============================================================================
DELETE FROM public.loading_logs;

INSERT INTO public.loading_logs (
  trip_number, bay, plate_number, vehicle_model, vehicle_type,
  driver_name, driver_phone, dispatched_at, shift, seal_number,
  total_pallets, verified_pallets, total_weight_kg, stores_count,
  stores_summary, status, signature, has_discrepancy, discrepancy_note
) VALUES
  -- Today Morning Shift Dispatches
  (
    'TRIP 1040', 'Bay 04', 'TRK-024', 'Isuzu NPR Heavy Freight', '5.0 Ton Heavy Freight',
    'Kasun Perera', '+94 77 123 4567', NOW() - INTERVAL '1 hour', 'Morning Shift (06:00 - 14:00)',
    'SL-892301-X', 14, 14, 4250, 4,
    'Fresh Store 18 • Fresh Store 22 • Style Store 08 • Daily Market 11',
    'dispatched', 'Loader osal (LDR-004)', false, NULL
  ),
  (
    'TRIP 1038', 'Bay 02', 'VAN-012', 'Toyota HiAce Urban Express', '1.2 Ton Urban Express',
    'Rohan Dias', '+94 71 888 2211', NOW() - INTERVAL '2 hours', 'Morning Shift (06:00 - 14:00)',
    'SL-892302-X', 8, 8, 1720, 2,
    'Fresh Store 05 • Style Store 02',
    'dispatched', 'Loader osal (LDR-004)', false, NULL
  ),
  (
    'TRIP 1036', 'Bay 01', 'VAN-016', 'Hyundai Porter Chilled', '1.8 Ton Urban Cold-Chain',
    'Pradeep Kumara', '+94 72 444 3322', NOW() - INTERVAL '3 hours', 'Morning Shift (06:00 - 14:00)',
    'SL-892303-X', 6, 6, 1150, 2,
    'Fresh Store 22 • Fresh Store 05',
    'dispatched', 'Loader osal (LDR-004)', true, '[CARTON_DAMAGED] 1 carton yogurt cup crushed at staging, replaced with reserve inventory.'
  ),
  (
    'TRIP 1034', 'Bay 03', 'TRK-019', 'Mitsubishi Fuso Multi-Temp', '4.0 Ton Dry Freight',
    'Sunil Wickrama', '+94 76 111 9900', NOW() - INTERVAL '4 hours', 'Morning Shift (06:00 - 14:00)',
    'SL-892304-X', 12, 12, 3600, 3,
    'Daily Market 14 • Urban Market 09 • Style Store 08',
    'dispatched', 'Loader Peter (LDR-8821)', false, NULL
  ),
  (
    'TRIP 1031', 'Bay 06', 'TRK-031', 'Hino 500 Dual-Zone Reefer', '7.5 Ton Reefer Hauler',
    'Sunil Fernando', '+94 76 555 4321', NOW() - INTERVAL '5 hours', 'Morning Shift (06:00 - 14:00)',
    'SL-892305-X', 18, 18, 6800, 4,
    'Negombo Branch • Wattala Express • Ja-Ela Central • Peliyagoda',
    'dispatched', 'Loader Peter (LDR-8821)', false, NULL
  ),
  (
    'TRIP 1029', 'Bay 05', 'TRK-042', 'Isuzu Forward Chilled Liner', '6.0 Ton Temperature Controlled',
    'Dinesh Gamage', '+94 77 999 1122', NOW() - INTERVAL '6 hours', 'Morning Shift (06:00 - 14:00)',
    'SL-892306-X', 15, 15, 5200, 3,
    'Kandy Road Hub • Kiribathgoda • Kelaniya',
    'dispatched', 'Loader Anton (LDR-7702)', false, NULL
  ),

  -- Yesterday Evening Shift Dispatches
  (
    'TRIP 1026', 'Bay 04', 'TRK-024', 'Isuzu NPR Heavy Freight', '5.0 Ton Heavy Freight',
    'Kasun Perera', '+94 77 123 4567', NOW() - INTERVAL '14 hours', 'Evening Shift (14:00 - 22:00)',
    'SL-892290-A', 16, 16, 4400, 4,
    'Fresh Store 18 • Fresh Store 22 • Daily Market 11 • Bambalapitiya',
    'completed', 'Loader osal (LDR-004)', false, NULL
  ),
  (
    'TRIP 1024', 'Bay 02', 'VAN-008', 'Nissan NV350 High-Roof', '1.5 Ton Fast Parcel Dispatch',
    'Chaminda Bandara', '+94 77 345 6789', NOW() - INTERVAL '15 hours', 'Evening Shift (14:00 - 22:00)',
    'SL-892288-B', 7, 7, 1380, 2,
    'Fort Central • Kollupitiya',
    'completed', 'Loader osal (LDR-004)', false, NULL
  ),
  (
    'TRIP 1022', 'Bay 03', 'TRK-019', 'Mitsubishi Fuso Multi-Temp', '4.0 Ton Dry Freight',
    'Sunil Wickrama', '+94 76 111 9900', NOW() - INTERVAL '16 hours', 'Evening Shift (14:00 - 22:00)',
    'SL-892285-C', 11, 11, 3400, 3,
    'Nugegoda Super • Battaramulla • Malabe Express',
    'completed', 'Loader Peter (LDR-8821)', false, NULL
  ),
  (
    'TRIP 1019', 'Bay 01', 'VAN-016', 'Hyundai Porter Chilled', '1.8 Ton Urban Cold-Chain',
    'Pradeep Kumara', '+94 72 444 3322', NOW() - INTERVAL '17 hours', 'Evening Shift (14:00 - 22:00)',
    'SL-892282-D', 6, 6, 1280, 2,
    'Colombo South • Wellawatte Store',
    'completed', 'Loader Peter (LDR-8821)', true, '[LEAKAGE_DETECTED] 1 crate apple juice bottle had loose cap; cleaned dock area.'
  ),
  (
    'TRIP 1017', 'Bay 06', 'TRK-055', 'UD Quester Heavy Hauler', '10.0 Ton Bulk Freight',
    'Mahinda Jayasuriya', '+94 71 222 3344', NOW() - INTERVAL '18 hours', 'Evening Shift (14:00 - 22:00)',
    'SL-892280-E', 24, 24, 9100, 5,
    'Galle Hub • Kalutara Store • Panadura Express • Moratuwa Central',
    'completed', 'Loader Anton (LDR-7702)', false, NULL
  ),
  (
    'TRIP 1015', 'Bay 05', 'TRK-042', 'Isuzu Forward Chilled Liner', '6.0 Ton Temperature Controlled',
    'Dinesh Gamage', '+94 77 999 1122', NOW() - INTERVAL '19 hours', 'Evening Shift (14:00 - 22:00)',
    'SL-892278-F', 14, 14, 4900, 3,
    'Kollupitiya Metro • Bambalapitiya Flagship • Union Place',
    'completed', 'Loader Anton (LDR-7702)', false, NULL
  ),

  -- Night Shift & Past Days Dispatches
  (
    'TRIP 1012', 'Bay 04', 'TRK-024', 'Isuzu NPR Heavy Freight', '5.0 Ton Heavy Freight',
    'Kasun Perera', '+94 77 123 4567', NOW() - INTERVAL '1 day', 'Night Shift (22:00 - 06:00)',
    'SL-892275-G', 15, 15, 4100, 4,
    'Fresh Store 18 • Fresh Store 22 • Style Store 08 • Daily Market 11',
    'completed', 'Loader osal (LDR-004)', false, NULL
  ),
  (
    'TRIP 1009', 'Bay 02', 'VAN-012', 'Toyota HiAce Urban Express', '1.2 Ton Urban Express',
    'Rohan Dias', '+94 71 888 2211', NOW() - INTERVAL '1 day 2 hours', 'Night Shift (22:00 - 06:00)',
    'SL-892272-H', 8, 8, 1680, 2,
    'Fresh Store 05 • Style Store 02',
    'completed', 'Loader Anton (LDR-7702)', false, NULL
  ),
  (
    'TRIP 1007', 'Bay 06', 'TRK-031', 'Hino 500 Dual-Zone Reefer', '7.5 Ton Reefer Hauler',
    'Sunil Fernando', '+94 76 555 4321', NOW() - INTERVAL '1 day 4 hours', 'Night Shift (22:00 - 06:00)',
    'SL-892269-J', 17, 17, 6500, 3,
    'Negombo Hub • Chilaw Central • Wennappuwa Express',
    'completed', 'Loader Anton (LDR-7702)', false, NULL
  ),
  (
    'TRIP 1005', 'Bay 03', 'TRK-019', 'Mitsubishi Fuso Multi-Temp', '4.0 Ton Dry Freight',
    'Sunil Wickrama', '+94 76 111 9900', NOW() - INTERVAL '1 day 6 hours', 'Night Shift (22:00 - 06:00)',
    'SL-892266-K', 13, 13, 3750, 3,
    'Wattala Super • Mabola Branch • Ja-Ela Central',
    'completed', 'Loader Peter (LDR-8821)', false, NULL
  ),
  (
    'TRIP 1002', 'Bay 01', 'VAN-016', 'Hyundai Porter Chilled', '1.8 Ton Urban Cold-Chain',
    'Pradeep Kumara', '+94 72 444 3322', NOW() - INTERVAL '2 days', 'Morning Shift (06:00 - 14:00)',
    'SL-892262-L', 7, 7, 1420, 2,
    'Fresh Store 22 • Daily Market 11',
    'completed', 'Loader Peter (LDR-8821)', false, NULL
  ),
  (
    'TRIP 0998', 'Bay 04', 'TRK-055', 'UD Quester Heavy Hauler', '10.0 Ton Bulk Freight',
    'Mahinda Jayasuriya', '+94 71 222 3344', NOW() - INTERVAL '2 days 3 hours', 'Morning Shift (06:00 - 14:00)',
    'SL-892258-M', 25, 25, 9500, 5,
    'Southern Express Gateway • Matara Hub • Galle Superstore',
    'completed', 'Loader osal (LDR-004)', true, '[TEMPERATURE_EXCURSION] Reefer compartment had 1.2°C temperature deviance before departure, corrected at bay pre-cool.'
  );
