-- Phase 3B: prevent duplicate marketplace profiles per seller (additive)

begin;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'marketplace_profiles_seller_profile_id_key'
      AND conrelid = 'public.marketplace_profiles'::regclass
  ) THEN
    IF EXISTS (
      SELECT seller_profile_id
      FROM public.marketplace_profiles
      GROUP BY seller_profile_id
      HAVING COUNT(*) > 1
    ) THEN
      RAISE NOTICE 'Duplicate marketplace_profiles rows exist; unique constraint not added.';
    ELSE
      ALTER TABLE public.marketplace_profiles
      ADD CONSTRAINT marketplace_profiles_seller_profile_id_key UNIQUE (seller_profile_id);
    END IF;
  END IF;
END $$;

commit;
