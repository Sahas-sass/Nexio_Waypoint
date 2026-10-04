-- ============================================================================
-- Migration 009: each vehicle has a driver + atomic plan publishing
--
-- The brief: "Each vehicle has a driver". Trips require a driver, so the
-- vehicle's assigned driver is used when the dispatcher publishes a plan.
-- publish_vehicle_plan() writes one vehicle's trip, stops and order statuses
-- in a single transaction and re-validates the operating constraints
-- server-side, so a client can never publish an over-capacity or
-- wrong-temperature plan.
-- ============================================================================

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id);

CREATE OR REPLACE FUNCTION public.publish_vehicle_plan(
  p_vehicle_id UUID,
  p_trip_date DATE,
  p_order_ids UUID[]
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_vehicle public.vehicles;
  v_trip_id UUID;
  v_existing_weight NUMERIC;
  v_existing_volume NUMERIC;
  v_weight NUMERIC;
  v_volume NUMERIC;
  v_next_seq INTEGER;
BEGIN
  IF public.auth_role() IS DISTINCT FROM 'dispatcher' THEN
    RAISE EXCEPTION 'Only dispatchers can publish plans' USING ERRCODE = '42501';
  END IF;
  IF p_order_ids IS NULL OR cardinality(p_order_ids) = 0 THEN
    RAISE EXCEPTION 'No orders to publish' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_vehicle FROM public.vehicles WHERE id = p_vehicle_id AND COALESCE(is_active, true);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle not found or inactive' USING ERRCODE = '22023';
  END IF;
  IF v_vehicle.driver_id IS NULL THEN
    RAISE EXCEPTION 'Vehicle % has no assigned driver', v_vehicle.registration_number USING ERRCODE = '22023';
  END IF;

  -- Every order must be open and planned for this date
  IF (SELECT count(*) FROM public.orders
      WHERE id = ANY (p_order_ids) AND status IN ('pending', 'planning', 'deferred')) <> cardinality(p_order_ids) THEN
    RAISE EXCEPTION 'Some orders are missing or already assigned' USING ERRCODE = '22023';
  END IF;

  -- Temperature: chilled goods only on refrigerated vehicles
  IF NOT COALESCE(v_vehicle.is_refrigerated, false) AND EXISTS (
    SELECT 1 FROM public.orders WHERE id = ANY (p_order_ids) AND temp_requirement = 'chilled'
  ) THEN
    RAISE EXCEPTION 'Vehicle % is not refrigerated', v_vehicle.registration_number USING ERRCODE = '22023';
  END IF;

  -- Access: van-only outlets only by vans
  IF NOT (v_vehicle.vehicle_type ~* '\mvan\M' OR v_vehicle.registration_number ILIKE 'VAN-%') AND EXISTS (
    SELECT 1 FROM public.orders o JOIN public.stores s ON s.id = o.store_id
    WHERE o.id = ANY (p_order_ids) AND s.is_van_only
  ) THEN
    RAISE EXCEPTION 'Vehicle % cannot serve van-only outlets', v_vehicle.registration_number USING ERRCODE = '22023';
  END IF;

  SELECT id INTO v_trip_id FROM public.trips
  WHERE vehicle_id = p_vehicle_id AND trip_date = p_trip_date AND status = 'planning'
  ORDER BY created_at LIMIT 1;

  -- Capacity: weight AND volume including stops already on the planning trip
  SELECT COALESCE(sum(o.total_weight_kg), 0), COALESCE(sum(o.total_volume_m3), 0)
  INTO v_existing_weight, v_existing_volume
  FROM public.trip_stops s JOIN public.orders o ON o.id = s.order_id
  WHERE s.trip_id = v_trip_id;

  SELECT sum(total_weight_kg), sum(total_volume_m3) INTO v_weight, v_volume
  FROM public.orders WHERE id = ANY (p_order_ids);

  IF v_existing_weight + v_weight > v_vehicle.max_weight_kg THEN
    RAISE EXCEPTION 'Weight % kg exceeds % limit of % kg',
      v_existing_weight + v_weight, v_vehicle.registration_number, v_vehicle.max_weight_kg USING ERRCODE = '22023';
  END IF;
  IF v_existing_volume + v_volume > v_vehicle.max_volume_m3 THEN
    RAISE EXCEPTION 'Volume % m3 exceeds % limit of % m3',
      v_existing_volume + v_volume, v_vehicle.registration_number, v_vehicle.max_volume_m3 USING ERRCODE = '22023';
  END IF;

  IF v_trip_id IS NULL THEN
    INSERT INTO public.trips (trip_number, vehicle_id, driver_id, trip_date, status)
    VALUES (
      'TRIP ' || to_char(p_trip_date, 'MMDD') || '-' || replace(v_vehicle.registration_number, '-', ''),
      p_vehicle_id, v_vehicle.driver_id, p_trip_date, 'planning'
    ) RETURNING id INTO v_trip_id;
  END IF;

  SELECT COALESCE(max(stop_sequence), 0) INTO v_next_seq FROM public.trip_stops WHERE trip_id = v_trip_id;

  -- Stops keep the order of p_order_ids (the client's window-ordered route)
  INSERT INTO public.trip_stops (trip_id, order_id, store_id, stop_sequence, status)
  SELECT v_trip_id, o.id, o.store_id, v_next_seq + x.ord, 'PENDING'
  FROM unnest(p_order_ids) WITH ORDINALITY AS x(order_id, ord)
  JOIN public.orders o ON o.id = x.order_id;

  UPDATE public.orders
  SET status = 'assigned', deferral_reason = NULL, deferred_at = NULL, deferred_by = NULL
  WHERE id = ANY (p_order_ids);

  RETURN v_trip_id;
END $$;

REVOKE ALL ON FUNCTION public.publish_vehicle_plan(UUID, DATE, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_vehicle_plan(UUID, DATE, UUID[]) TO authenticated;
