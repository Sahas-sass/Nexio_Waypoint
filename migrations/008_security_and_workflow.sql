-- ============================================================================
-- Migration 008: Row-level security hardening + store manager / driver workflow
--
--  1. Drops the unused legacy Prisma-style tables (no code references them).
--  2. Adds SECURITY DEFINER helpers so RLS policies can check the caller's
--     role / store / trip without recursive policy evaluation.
--  3. Replaces the broad "any authenticated user" read policies with
--     role-scoped ones and enables RLS on every public table.
--  4. Adds the store-manager flow (place order, confirm receipt) and the
--     driver flow (stop status, proof of delivery, location ping) as RPCs,
--     so clients can never write columns they do not own.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Legacy tables
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public."OrderItem", public."Alert", public."Delivery", public."Order",
  public."Product", public."User", public."Vehicle", public."Store" CASCADE;
DROP TYPE IF EXISTS public."AlertType", public."DeliveryStatus", public."OrderStatus", public."Role";

-- ----------------------------------------------------------------------------
-- 2. Schema additions
-- ----------------------------------------------------------------------------
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS is_van_only BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS item_count INTEGER NOT NULL DEFAULT 0 CHECK (item_count >= 0),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.trip_stops
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Stop statuses were written in mixed case; normalise and constrain them.
UPDATE public.trip_stops SET status = upper(COALESCE(status, 'PENDING'));
ALTER TABLE public.trip_stops ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE public.trip_stops ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.trip_stops DROP CONSTRAINT IF EXISTS trip_stops_status_check;
ALTER TABLE public.trip_stops ADD CONSTRAINT trip_stops_status_check
  CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'));

ALTER TABLE public.proof_of_delivery
  ADD COLUMN IF NOT EXISTS outcome TEXT NOT NULL DEFAULT 'delivered'
    CHECK (outcome IN ('delivered', 'partial', 'failed')),
  ADD COLUMN IF NOT EXISTS captured_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.proof_of_delivery ADD CONSTRAINT proof_of_delivery_stop_id_key UNIQUE (stop_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.store_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  status TEXT NOT NULL CHECK (status IN ('received', 'partial', 'rejected')),
  items_expected INTEGER NOT NULL CHECK (items_expected >= 0),
  items_received INTEGER NOT NULL CHECK (items_received >= 0),
  issue_type TEXT CHECK (issue_type IN ('shortage', 'damaged', 'wrong_item', 'temperature', 'late', 'other')),
  issue_note TEXT,
  confirmed_by UUID NOT NULL REFERENCES public.profiles(id),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Caller helpers (SECURITY DEFINER: read profiles/trips without RLS recursion)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_role() RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.auth_store_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT store_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(public.auth_role() IN ('dispatcher', 'loader'), false)
$$;

CREATE OR REPLACE FUNCTION public.is_my_trip(p_trip_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.trips WHERE id = p_trip_id AND driver_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.trip_serves_my_store(p_trip_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_stops
    WHERE trip_id = p_trip_id AND store_id = public.auth_store_id()
  )
$$;

CREATE OR REPLACE FUNCTION public.order_on_my_trip(p_order_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_stops s JOIN public.trips t ON t.id = s.trip_id
    WHERE s.order_id = p_order_id AND t.driver_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.stop_store_id(p_stop_id UUID) RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT store_id FROM public.trip_stops WHERE id = p_stop_id
$$;

CREATE OR REPLACE FUNCTION public.stop_on_my_trip(p_stop_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_stops s JOIN public.trips t ON t.id = s.trip_id
    WHERE s.id = p_stop_id AND t.driver_id = auth.uid()
  )
$$;

-- ----------------------------------------------------------------------------
-- 4. Profiles: users may edit their own details but never their role or store
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileges() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- auth.uid() is NULL for the service role / migrations, which may change anything
  IF auth.uid() IS NOT NULL AND (
       NEW.role IS DISTINCT FROM OLD.role
    OR NEW.store_id IS DISTINCT FROM OLD.store_id
    OR NEW.id IS DISTINCT FROM OLD.id
  ) THEN
    RAISE EXCEPTION 'Not allowed to change role, store or id' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

-- ----------------------------------------------------------------------------
-- 5. Row level security
-- ----------------------------------------------------------------------------
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;  -- no policies: service role only

-- profiles
DROP POLICY IF EXISTS "Staff view profiles" ON public.profiles;
CREATE POLICY "Staff view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff());

-- stores / store_managers / vehicles: reference data readable by signed-in users
DROP POLICY IF EXISTS "Dispatchers manage stores" ON public.stores;
CREATE POLICY "Dispatchers manage stores" ON public.stores FOR ALL TO authenticated
  USING (public.auth_role() = 'dispatcher') WITH CHECK (public.auth_role() = 'dispatcher');

DROP POLICY IF EXISTS "Authenticated users view store managers" ON public.store_managers;
CREATE POLICY "Authenticated users view store managers" ON public.store_managers FOR SELECT TO authenticated
  USING (true);

-- trips
DROP POLICY IF EXISTS "Warehouse crew view trips" ON public.trips;
CREATE POLICY "Warehouse crew view trips" ON public.trips FOR SELECT TO authenticated
  USING (public.is_staff());
DROP POLICY IF EXISTS "Store managers view trips to their store" ON public.trips;
CREATE POLICY "Store managers view trips to their store" ON public.trips FOR SELECT TO authenticated
  USING (public.auth_role() = 'store_manager' AND public.trip_serves_my_store(id));

-- trip_stops
DROP POLICY IF EXISTS "Authenticated users view trip stops" ON public.trip_stops;
DROP POLICY IF EXISTS "Role scoped view trip stops" ON public.trip_stops;
CREATE POLICY "Role scoped view trip stops" ON public.trip_stops FOR SELECT TO authenticated
  USING (
    public.is_staff()
    OR public.is_my_trip(trip_id)
    OR (public.auth_role() = 'store_manager' AND store_id = public.auth_store_id())
  );

-- orders: store managers read their own (existing policy); drivers read orders on their trip
DROP POLICY IF EXISTS "Drivers view orders on their trip" ON public.orders;
CREATE POLICY "Drivers view orders on their trip" ON public.orders FOR SELECT TO authenticated
  USING (public.order_on_my_trip(id));
DROP POLICY IF EXISTS "Loaders view orders" ON public.orders;
CREATE POLICY "Loaders view orders" ON public.orders FOR SELECT TO authenticated
  USING (public.auth_role() = 'loader');

-- deferral_logs: dispatchers (existing ALL policy) + the affected store
DROP POLICY IF EXISTS "Authenticated users view deferral logs" ON public.deferral_logs;
DROP POLICY IF EXISTS "Store managers view own deferrals" ON public.deferral_logs;
CREATE POLICY "Store managers view own deferrals" ON public.deferral_logs FOR SELECT TO authenticated
  USING (public.auth_role() = 'store_manager' AND store_id = public.auth_store_id());

-- pallets / loading logs / route exceptions: warehouse + dispatch staff only
DROP POLICY IF EXISTS "Authenticated users view pallets" ON public.pallets;
DROP POLICY IF EXISTS "Staff view pallets" ON public.pallets;
CREATE POLICY "Staff view pallets" ON public.pallets FOR SELECT TO authenticated
  USING (public.is_staff() OR public.is_my_trip(trip_id));

DROP POLICY IF EXISTS "Authenticated users view loading logs" ON public.loading_logs;
DROP POLICY IF EXISTS "Staff view loading logs" ON public.loading_logs;
CREATE POLICY "Staff view loading logs" ON public.loading_logs FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users view route exceptions" ON public.route_exceptions;
DROP POLICY IF EXISTS "Staff view route exceptions" ON public.route_exceptions;
CREATE POLICY "Staff view route exceptions" ON public.route_exceptions FOR SELECT TO authenticated
  USING (public.is_staff());

-- proof_of_delivery: written only through submit_proof_of_delivery()
DROP POLICY IF EXISTS "Role scoped view proof of delivery" ON public.proof_of_delivery;
CREATE POLICY "Role scoped view proof of delivery" ON public.proof_of_delivery FOR SELECT TO authenticated
  USING (
    public.is_staff()
    OR public.stop_on_my_trip(stop_id)
    OR (public.auth_role() = 'store_manager' AND public.stop_store_id(stop_id) = public.auth_store_id())
  );

-- store_receipts: written only through confirm_order_receipt()
DROP POLICY IF EXISTS "Role scoped view store receipts" ON public.store_receipts;
CREATE POLICY "Role scoped view store receipts" ON public.store_receipts FOR SELECT TO authenticated
  USING (public.is_staff() OR (public.auth_role() = 'store_manager' AND store_id = public.auth_store_id()));

-- ----------------------------------------------------------------------------
-- 6. Workflow RPCs
-- ----------------------------------------------------------------------------

-- Store manager places an order for their own store. Orders for the next day
-- close at 16:00 Sri Lanka time; later orders must target a later day.
CREATE OR REPLACE FUNCTION public.place_order(
  p_target_date DATE,
  p_temp public.temp_type,
  p_weight_kg NUMERIC,
  p_volume_m3 NUMERIC,
  p_item_count INTEGER,
  p_priority TEXT DEFAULT 'Standard',
  p_notes TEXT DEFAULT NULL
) RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_store UUID := public.auth_store_id();
  v_now TIMESTAMP := (now() AT TIME ZONE 'Asia/Colombo');
  v_earliest DATE;
  v_order public.orders;
BEGIN
  IF public.auth_role() IS DISTINCT FROM 'store_manager' OR v_store IS NULL THEN
    RAISE EXCEPTION 'Only store managers with an assigned store can place orders' USING ERRCODE = '42501';
  END IF;
  IF p_weight_kg <= 0 OR p_volume_m3 <= 0 OR p_item_count <= 0 THEN
    RAISE EXCEPTION 'Weight, volume and item count must be positive' USING ERRCODE = '22023';
  END IF;
  IF p_priority NOT IN ('High', 'Standard', 'Low') THEN
    RAISE EXCEPTION 'Invalid priority' USING ERRCODE = '22023';
  END IF;

  v_earliest := v_now::date + CASE WHEN v_now::time < TIME '16:00' THEN 1 ELSE 2 END;
  IF p_target_date < v_earliest THEN
    RAISE EXCEPTION 'Order cutoff passed: earliest delivery date is %', v_earliest USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.orders (
    order_number, store_id, total_weight_kg, total_volume_m3, temp_requirement,
    status, target_delivery_date, priority, item_count, notes, created_by
  ) VALUES (
    'ORD-' || to_char(v_now, 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5)),
    v_store, p_weight_kg, p_volume_m3, p_temp,
    'pending', p_target_date, p_priority, p_item_count, NULLIF(trim(p_notes), ''), auth.uid()
  ) RETURNING * INTO v_order;

  RETURN v_order;
END $$;

-- Driver moves a stop on their own trip to IN_PROGRESS (arrived / unloading).
CREATE OR REPLACE FUNCTION public.driver_start_stop(p_stop_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.stop_on_my_trip(p_stop_id) THEN
    RAISE EXCEPTION 'Stop is not on your trip' USING ERRCODE = '42501';
  END IF;
  UPDATE public.trip_stops SET status = 'IN_PROGRESS'
  WHERE id = p_stop_id AND status NOT IN ('COMPLETED', 'FAILED');
END $$;

-- Driver records proof of delivery. Idempotent per stop so offline retries are safe.
CREATE OR REPLACE FUNCTION public.submit_proof_of_delivery(
  p_stop_id UUID,
  p_outcome TEXT,
  p_items_expected INTEGER,
  p_items_delivered INTEGER,
  p_signature_url TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_captured_offline BOOLEAN DEFAULT false,
  p_captured_at TIMESTAMPTZ DEFAULT now()
) RETURNS public.proof_of_delivery
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pod public.proof_of_delivery;
BEGIN
  IF NOT public.stop_on_my_trip(p_stop_id) THEN
    RAISE EXCEPTION 'Stop is not on your trip' USING ERRCODE = '42501';
  END IF;
  IF p_outcome NOT IN ('delivered', 'partial', 'failed') THEN
    RAISE EXCEPTION 'Invalid outcome' USING ERRCODE = '22023';
  END IF;
  IF p_items_expected < 0 OR p_items_delivered < 0 OR p_items_delivered > p_items_expected THEN
    RAISE EXCEPTION 'Invalid item counts' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.proof_of_delivery (
    stop_id, items_expected, items_delivered, signature_url, photo_url, notes,
    captured_offline, synced_at, outcome, captured_by, captured_at
  ) VALUES (
    p_stop_id, p_items_expected, p_items_delivered, p_signature_url, p_photo_url,
    NULLIF(trim(p_notes), ''), p_captured_offline, now(), p_outcome, auth.uid(), p_captured_at
  )
  ON CONFLICT (stop_id) DO UPDATE SET
    items_expected = EXCLUDED.items_expected,
    items_delivered = EXCLUDED.items_delivered,
    signature_url = COALESCE(EXCLUDED.signature_url, proof_of_delivery.signature_url),
    photo_url = COALESCE(EXCLUDED.photo_url, proof_of_delivery.photo_url),
    notes = EXCLUDED.notes,
    captured_offline = EXCLUDED.captured_offline,
    synced_at = now(),
    outcome = EXCLUDED.outcome,
    captured_at = EXCLUDED.captured_at
  RETURNING * INTO v_pod;

  UPDATE public.trip_stops
  SET status = CASE WHEN p_outcome = 'failed' THEN 'FAILED' ELSE 'COMPLETED' END,
      completed_at = p_captured_at
  WHERE id = p_stop_id;

  IF p_outcome <> 'failed' THEN
    UPDATE public.orders SET status = 'delivered'
    WHERE id = (SELECT order_id FROM public.trip_stops WHERE id = p_stop_id);
  END IF;

  -- Trip is complete once no stop is left pending / in progress
  UPDATE public.trips t SET status = 'completed'
  WHERE t.id = (SELECT trip_id FROM public.trip_stops WHERE id = p_stop_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.trip_stops s
      WHERE s.trip_id = t.id AND s.status IN ('PENDING', 'IN_PROGRESS')
    );

  RETURN v_pod;
END $$;

-- Driver location ping for the dispatcher's live tracking map.
CREATE OR REPLACE FUNCTION public.driver_update_location(p_trip_id UUID, p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_my_trip(p_trip_id) THEN
    RAISE EXCEPTION 'Trip is not assigned to you' USING ERRCODE = '42501';
  END IF;
  IF p_lat NOT BETWEEN -90 AND 90 OR p_lng NOT BETWEEN -180 AND 180 THEN
    RAISE EXCEPTION 'Invalid coordinates' USING ERRCODE = '22023';
  END IF;
  UPDATE public.trips
  SET current_lat = p_lat, current_lng = p_lng, last_lat = p_lat, last_lng = p_lng,
      last_ping_at = now(), last_updated = now(), connection_status = 'online'
  WHERE id = p_trip_id;
END $$;

-- Store manager confirms what arrived. Issues are raised to dispatch as exceptions.
CREATE OR REPLACE FUNCTION public.confirm_order_receipt(
  p_order_id UUID,
  p_items_received INTEGER,
  p_issue_type TEXT DEFAULT NULL,
  p_issue_note TEXT DEFAULT NULL
) RETURNS public.store_receipts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders;
  v_status TEXT;
  v_receipt public.store_receipts;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND OR public.auth_role() IS DISTINCT FROM 'store_manager'
     OR v_order.store_id IS DISTINCT FROM public.auth_store_id() THEN
    RAISE EXCEPTION 'Order not found for your store' USING ERRCODE = '42501';
  END IF;
  IF v_order.status <> 'delivered' THEN
    RAISE EXCEPTION 'Order has not been delivered yet' USING ERRCODE = '22023';
  END IF;
  IF p_items_received < 0 OR p_items_received > v_order.item_count THEN
    RAISE EXCEPTION 'Items received must be between 0 and %', v_order.item_count USING ERRCODE = '22023';
  END IF;
  IF p_issue_type IS NOT NULL AND p_issue_type NOT IN ('shortage', 'damaged', 'wrong_item', 'temperature', 'late', 'other') THEN
    RAISE EXCEPTION 'Invalid issue type' USING ERRCODE = '22023';
  END IF;

  v_status := CASE
    WHEN p_items_received = 0 THEN 'rejected'
    WHEN p_items_received < v_order.item_count OR p_issue_type IS NOT NULL THEN 'partial'
    ELSE 'received'
  END;

  INSERT INTO public.store_receipts (
    order_id, store_id, status, items_expected, items_received, issue_type, issue_note, confirmed_by
  ) VALUES (
    p_order_id, v_order.store_id, v_status, v_order.item_count, p_items_received,
    p_issue_type, NULLIF(trim(p_issue_note), ''), auth.uid()
  ) RETURNING * INTO v_receipt;

  IF v_status <> 'received' THEN
    INSERT INTO public.exceptions (order_id, store_id, reason_code, action_taken)
    VALUES (
      p_order_id, v_order.store_id, upper(COALESCE(p_issue_type, 'shortage')),
      'Store reported ' || p_items_received || '/' || v_order.item_count || ' items received'
        || COALESCE(': ' || NULLIF(trim(p_issue_note), ''), '')
    );
  END IF;

  RETURN v_receipt;
END $$;

-- Only signed-in users may call helpers / RPCs; each RPC checks the caller's role itself.
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'auth_role()', 'auth_store_id()', 'is_staff()', 'is_my_trip(uuid)', 'trip_serves_my_store(uuid)',
    'order_on_my_trip(uuid)', 'stop_store_id(uuid)', 'stop_on_my_trip(uuid)',
    'place_order(date, public.temp_type, numeric, numeric, integer, text, text)',
    'driver_start_stop(uuid)',
    'submit_proof_of_delivery(uuid, text, integer, integer, text, text, text, boolean, timestamptz)',
    'driver_update_location(uuid, double precision, double precision)',
    'confirm_order_receipt(uuid, integer, text, text)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 7. Private storage bucket for POD photos and signatures
--    Objects are stored as <driver uuid>/<stop uuid>/<file>.
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pod-evidence', 'pod-evidence', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Drivers upload own POD evidence" ON storage.objects;
CREATE POLICY "Drivers upload own POD evidence" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pod-evidence'
    AND public.auth_role() = 'driver'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.stop_on_my_trip(((storage.foldername(name))[2])::uuid)
  );

DROP POLICY IF EXISTS "Role scoped read POD evidence" ON storage.objects;
CREATE POLICY "Role scoped read POD evidence" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'pod-evidence'
    AND (
      public.is_staff()
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR (public.auth_role() = 'store_manager'
          AND public.stop_store_id(((storage.foldername(name))[2])::uuid) = public.auth_store_id())
    )
  );
