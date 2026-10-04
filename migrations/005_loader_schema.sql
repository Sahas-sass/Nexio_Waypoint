-- Migration 005: Loader Schema & Row Level Security (DDL Only)

-- 1. Enhance trips table with loader & dock clearance columns
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS bay TEXT DEFAULT 'Bay 04',
ADD COLUMN IF NOT EXISTS departure_time TEXT DEFAULT '06:30 AM',
ADD COLUMN IF NOT EXISTS cutoff_time TEXT DEFAULT '05:45 AM',
ADD COLUMN IF NOT EXISTS security_seal TEXT,
ADD COLUMN IF NOT EXISTS has_discrepancy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discrepancy_note TEXT,
ADD COLUMN IF NOT EXISTS loader_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ;

-- 2. Create pallets table for warehouse sequence loading
CREATE TABLE IF NOT EXISTS public.pallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES public.trip_stops(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ambient', 'chilled', 'frozen')),
  temp_req TEXT,
  weight_kg NUMERIC NOT NULL DEFAULT 100,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create loading_logs table for audit trail & gatepass verification
CREATE TABLE IF NOT EXISTS public.loading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  trip_number TEXT NOT NULL,
  bay TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  dispatched_at TIMESTAMPTZ DEFAULT now(),
  shift TEXT DEFAULT 'Morning Shift (06:00 - 14:00)',
  seal_number TEXT NOT NULL,
  total_pallets INTEGER NOT NULL DEFAULT 0,
  verified_pallets INTEGER NOT NULL DEFAULT 0,
  total_weight_kg NUMERIC NOT NULL DEFAULT 0,
  stores_count INTEGER NOT NULL DEFAULT 0,
  stores_summary TEXT,
  status TEXT DEFAULT 'dispatched',
  signature TEXT NOT NULL,
  has_discrepancy BOOLEAN DEFAULT false,
  discrepancy_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.pallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Allow authenticated users to view warehouse reference data
DROP POLICY IF EXISTS "Authenticated users view vehicles" ON public.vehicles;
CREATE POLICY "Authenticated users view vehicles" ON public.vehicles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users view stores" ON public.stores;
CREATE POLICY "Authenticated users view stores" ON public.stores
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users view trip stops" ON public.trip_stops;
CREATE POLICY "Authenticated users view trip stops" ON public.trip_stops
  FOR SELECT TO authenticated USING (true);

-- Allow loaders and dispatchers to update trip stops
DROP POLICY IF EXISTS "Loaders and dispatchers update trip stops" ON public.trip_stops;
CREATE POLICY "Loaders and dispatchers update trip stops" ON public.trip_stops
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('loader', 'dispatcher')
    )
  );

-- Trips policies for loaders, dispatchers, drivers
DROP POLICY IF EXISTS "Warehouse crew view trips" ON public.trips;
CREATE POLICY "Warehouse crew view trips" ON public.trips
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('loader', 'dispatcher', 'driver')
    )
  );

DROP POLICY IF EXISTS "Loaders update trips" ON public.trips;
CREATE POLICY "Loaders update trips" ON public.trips
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('loader', 'dispatcher')
    )
  );

-- Pallets policies
DROP POLICY IF EXISTS "Authenticated users view pallets" ON public.pallets;
CREATE POLICY "Authenticated users view pallets" ON public.pallets
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Loaders update pallets" ON public.pallets;
CREATE POLICY "Loaders update pallets" ON public.pallets
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('loader', 'dispatcher')
    )
  );

DROP POLICY IF EXISTS "Loaders insert pallets" ON public.pallets;
CREATE POLICY "Loaders insert pallets" ON public.pallets
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('loader', 'dispatcher')
    )
  );

-- Loading logs policies
DROP POLICY IF EXISTS "Authenticated users view loading logs" ON public.loading_logs;
CREATE POLICY "Authenticated users view loading logs" ON public.loading_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Loaders insert loading logs" ON public.loading_logs;
CREATE POLICY "Loaders insert loading logs" ON public.loading_logs
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('loader', 'dispatcher')
    )
  );
