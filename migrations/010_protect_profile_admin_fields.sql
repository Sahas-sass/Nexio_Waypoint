-- ============================================================================
-- Migration 010: users may not self-edit administrative profile fields
--
-- The "Users can update own profile" policy lets a user update their own row.
-- Besides role / store_id / id (008), verification, permissions, status and
-- employee id are managed by administrators only.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_privileges() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- auth.uid() is NULL for the service role / migrations, which may change anything
  IF auth.uid() IS NOT NULL AND (
       NEW.role IS DISTINCT FROM OLD.role
    OR NEW.store_id IS DISTINCT FROM OLD.store_id
    OR NEW.id IS DISTINCT FROM OLD.id
    OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
    OR NEW.permissions IS DISTINCT FROM OLD.permissions
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
  ) THEN
    RAISE EXCEPTION 'Not allowed to change administrative profile fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
