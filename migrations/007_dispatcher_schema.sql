-- ============================================================================
-- Migration 007: Dispatcher Schema, Deferral Auditing & Real-Time Telemetry
-- ============================================================================

-- 1. Enhance public.orders with dispatch priority, delivery windows, and deferral fields
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Standard' CHECK (priority IN ('High', 'Standard', 'Low')),
ADD COLUMN IF NOT EXISTS delivery_window TEXT DEFAULT '08:00 - 10:00 AM',
ADD COLUMN IF NOT EXISTS deferral_reason TEXT,
ADD COLUMN IF NOT EXISTS deferred_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deferred_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS rescheduled_run TEXT,
ADD COLUMN IF NOT EXISTS store_notified BOOLEAN DEFAULT false;

-- 2. Create public.deferral_logs for immutable audit trail and retailer visibility
CREATE TABLE IF NOT EXISTS public.deferral_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  store_name TEXT NOT NULL,
  priority TEXT DEFAULT 'Standard',
  volume_m3 NUMERIC NOT NULL DEFAULT 1.0,
  weight_kg NUMERIC NOT NULL DEFAULT 100,
  delivery_window TEXT,
  reason TEXT NOT NULL, -- e.g., 'Capacity shortage', 'Weight limit', 'Vehicle unavailable', 'Window conflict', 'Reefer shortage'
  rescheduled_run TEXT NOT NULL, -- e.g., 'Tomorrow - 10:00 AM'
  deferred_by UUID REFERENCES public.profiles(id),
  deferred_at TIMESTAMPTZ DEFAULT now(),
  store_notified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enhance public.trips with real-time fleet telemetry & GPS coordinates
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS current_lat NUMERIC DEFAULT 6.9271,
ADD COLUMN IF NOT EXISTS current_lng NUMERIC DEFAULT 79.8612,
ADD COLUMN IF NOT EXISTS current_district TEXT DEFAULT 'Central Market',
ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'online' CHECK (connection_status IN ('online', 'delayed', 'offline')),
ADD COLUMN IF NOT EXISTS last_ping_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS eta_time TEXT DEFAULT '07:42 AM';

-- 4. Create public.route_exceptions for live event stream & incident monitoring
CREATE TABLE IF NOT EXISTS public.route_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  vehicle_plate TEXT NOT NULL,
  event_time TEXT NOT NULL, -- e.g., '07:12', '07:18', '07:22'
  event_type TEXT NOT NULL CHECK (event_type IN ('stop_reached', 'delay', 'connectivity_loss', 'capacity_alert', 'schedule_risk')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'success')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.deferral_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_exceptions ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies
-- Allow authenticated users to view deferral logs and route exceptions
DROP POLICY IF EXISTS "Authenticated users view deferral logs" ON public.deferral_logs;
CREATE POLICY "Authenticated users view deferral logs" ON public.deferral_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Dispatchers manage deferral logs" ON public.deferral_logs;
CREATE POLICY "Dispatchers manage deferral logs" ON public.deferral_logs
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role::text IN ('dispatcher', 'admin')
    )
  );

DROP POLICY IF EXISTS "Authenticated users view route exceptions" ON public.route_exceptions;
CREATE POLICY "Authenticated users view route exceptions" ON public.route_exceptions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Dispatchers manage route exceptions" ON public.route_exceptions;
CREATE POLICY "Dispatchers manage route exceptions" ON public.route_exceptions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role::text IN ('dispatcher', 'admin')
    )
  );

-- Dispatcher policies for orders table
DROP POLICY IF EXISTS "Dispatchers manage orders" ON public.orders;
CREATE POLICY "Dispatchers manage orders" ON public.orders
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role::text IN ('dispatcher', 'admin')
    )
  );

-- Dispatcher policies for trips table
DROP POLICY IF EXISTS "Dispatchers manage trips" ON public.trips;
CREATE POLICY "Dispatchers manage trips" ON public.trips
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role::text IN ('dispatcher', 'admin')
    )
  );

