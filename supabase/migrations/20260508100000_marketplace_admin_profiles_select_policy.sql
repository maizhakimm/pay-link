-- Phase 3A fix: allow admin users to view all marketplace profiles in admin panel
-- additive policy only; public visibility policy remains unchanged

begin;

DROP POLICY IF EXISTS "marketplace_profiles_admin_select" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_admin_select"
ON public.marketplace_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

commit;
