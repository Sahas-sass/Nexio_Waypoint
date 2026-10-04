-- ============================================================================
-- Migration 011: stream trip positions and route exceptions to the dispatcher
--
-- The dispatcher tracking page subscribes to postgres_changes on trips and
-- route_exceptions, but neither table was in the supabase_realtime
-- publication, so the live map only refreshed on reload. Realtime applies
-- each subscriber's RLS policies, so only staff receive these rows.
-- ============================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['trips', 'route_exceptions'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
