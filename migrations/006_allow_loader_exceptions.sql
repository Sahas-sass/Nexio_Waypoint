-- Migration 006: Allow loaders and dispatchers to insert and view exceptions

ALTER TABLE public.exceptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Loaders and dispatchers create exceptions" ON public.exceptions;
CREATE POLICY "Loaders and dispatchers create exceptions" ON public.exceptions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('loader', 'dispatcher')
    )
  );

DROP POLICY IF EXISTS "Loaders and dispatchers view exceptions" ON public.exceptions;
CREATE POLICY "Loaders and dispatchers view exceptions" ON public.exceptions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('loader', 'dispatcher')
    )
  );
