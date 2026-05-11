-- Phase 1: Marketplace architecture (additive only)
-- Safe to run alongside existing checkout/payment/shop/onboarding flows.

begin;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_profile_status') THEN
    CREATE TYPE public.marketplace_profile_status AS ENUM (
      'draft',
      'pending_review',
      'published',
      'rejected',
      'hidden',
      'suspended'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_verification_status') THEN
    CREATE TYPE public.marketplace_verification_status AS ENUM (
      'pending',
      'verified',
      'rejected',
      'suspended'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_feature_type') THEN
    CREATE TYPE public.marketplace_feature_type AS ENUM (
      'featured',
      'trending',
      'preorder',
      'sponsored',
      'admin_pick'
    );
  END IF;
END $$;

-- Reference tables
CREATE TABLE IF NOT EXISTS public.marketplace_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_key text NOT NULL UNIQUE,
  area_name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES public.marketplace_areas(id) ON DELETE RESTRICT,
  community_key text NOT NULL UNIQUE,
  community_name text NOT NULL,
  community_type text,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text NOT NULL UNIQUE,
  category_name text NOT NULL,
  description text,
  icon_name text,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Core marketplace profile (1:1 with seller_profiles)
CREATE TABLE IF NOT EXISTS public.marketplace_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_profile_id uuid NOT NULL UNIQUE REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  status public.marketplace_profile_status NOT NULL DEFAULT 'draft',
  is_marketplace_visible boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  verification_status public.marketplace_verification_status NOT NULL DEFAULT 'pending',
  verification_note text,
  published_at timestamptz,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tagline text,
  marketplace_description text,
  marketplace_banner_image text,
  area_text text,
  community_text text,
  area_id uuid REFERENCES public.marketplace_areas(id) ON DELETE SET NULL,
  community_id uuid REFERENCES public.marketplace_communities(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_verified_consistency CHECK (
    (is_verified = true AND verification_status = 'verified')
    OR (is_verified = false)
  )
);

CREATE TABLE IF NOT EXISTS public.marketplace_profile_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_profile_id uuid NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (marketplace_profile_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_featured_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_profile_id uuid NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  feature_type public.marketplace_feature_type NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  start_at timestamptz,
  end_at timestamptz,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_featured_products_window_check CHECK (
    end_at IS NULL OR start_at IS NULL OR end_at > start_at
  ),
  UNIQUE (marketplace_profile_id, product_id, feature_type)
);

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  title text,
  subtitle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_status ON public.marketplace_profiles(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_visibility ON public.marketplace_profiles(is_marketplace_visible);
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_area_id ON public.marketplace_profiles(area_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_community_id ON public.marketplace_profiles(community_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_communities_area_id ON public.marketplace_communities(area_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_enabled_order ON public.marketplace_categories(is_enabled, display_order);

CREATE INDEX IF NOT EXISTS idx_mkt_profile_categories_profile_id ON public.marketplace_profile_categories(marketplace_profile_id);
CREATE INDEX IF NOT EXISTS idx_mkt_profile_categories_category_id ON public.marketplace_profile_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_mkt_featured_products_profile ON public.marketplace_featured_products(marketplace_profile_id);
CREATE INDEX IF NOT EXISTS idx_mkt_featured_products_product ON public.marketplace_featured_products(product_id);
CREATE INDEX IF NOT EXISTS idx_mkt_featured_products_type_enabled ON public.marketplace_featured_products(feature_type, is_enabled);
CREATE INDEX IF NOT EXISTS idx_mkt_featured_products_window ON public.marketplace_featured_products(start_at, end_at);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_enabled_order ON public.homepage_sections(is_enabled, display_order);

-- updated_at trigger helper (dedicated, additive)
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketplace_areas_updated_at ON public.marketplace_areas;
CREATE TRIGGER trg_marketplace_areas_updated_at
BEFORE UPDATE ON public.marketplace_areas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_marketplace_communities_updated_at ON public.marketplace_communities;
CREATE TRIGGER trg_marketplace_communities_updated_at
BEFORE UPDATE ON public.marketplace_communities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_marketplace_categories_updated_at ON public.marketplace_categories;
CREATE TRIGGER trg_marketplace_categories_updated_at
BEFORE UPDATE ON public.marketplace_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_marketplace_profiles_updated_at ON public.marketplace_profiles;
CREATE TRIGGER trg_marketplace_profiles_updated_at
BEFORE UPDATE ON public.marketplace_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_marketplace_featured_products_updated_at ON public.marketplace_featured_products;
CREATE TRIGGER trg_marketplace_featured_products_updated_at
BEFORE UPDATE ON public.marketplace_featured_products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_homepage_sections_updated_at ON public.homepage_sections;
CREATE TRIGGER trg_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Enable RLS
ALTER TABLE public.marketplace_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_profile_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public read-only for master data and homepage config
DROP POLICY IF EXISTS "marketplace_areas_public_read" ON public.marketplace_areas;
CREATE POLICY "marketplace_areas_public_read"
ON public.marketplace_areas
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "marketplace_communities_public_read" ON public.marketplace_communities;
CREATE POLICY "marketplace_communities_public_read"
ON public.marketplace_communities
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "marketplace_categories_public_read" ON public.marketplace_categories;
CREATE POLICY "marketplace_categories_public_read"
ON public.marketplace_categories
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "homepage_sections_public_read" ON public.homepage_sections;
CREATE POLICY "homepage_sections_public_read"
ON public.homepage_sections
FOR SELECT
TO anon, authenticated
USING (true);

-- Marketplace profiles: public sees only visible + published; seller manages own
DROP POLICY IF EXISTS "marketplace_profiles_public_visible" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_public_visible"
ON public.marketplace_profiles
FOR SELECT
TO anon, authenticated
USING (is_marketplace_visible = true AND status = 'published');

DROP POLICY IF EXISTS "marketplace_profiles_owner_select" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_owner_select"
ON public.marketplace_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.seller_profiles sp
    WHERE sp.id = marketplace_profiles.seller_profile_id
      AND sp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "marketplace_profiles_owner_insert" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_owner_insert"
ON public.marketplace_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.seller_profiles sp
    WHERE sp.id = marketplace_profiles.seller_profile_id
      AND sp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "marketplace_profiles_owner_update" ON public.marketplace_profiles;
CREATE POLICY "marketplace_profiles_owner_update"
ON public.marketplace_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.seller_profiles sp
    WHERE sp.id = marketplace_profiles.seller_profile_id
      AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.seller_profiles sp
    WHERE sp.id = marketplace_profiles.seller_profile_id
      AND sp.user_id = auth.uid()
  )
);

-- Junction table: seller can manage own mappings; public can read via visible profiles
DROP POLICY IF EXISTS "marketplace_profile_categories_public_read" ON public.marketplace_profile_categories;
CREATE POLICY "marketplace_profile_categories_public_read"
ON public.marketplace_profile_categories
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.marketplace_profiles mp
    WHERE mp.id = marketplace_profile_categories.marketplace_profile_id
      AND mp.is_marketplace_visible = true
      AND mp.status = 'published'
  )
);

DROP POLICY IF EXISTS "marketplace_profile_categories_owner_manage" ON public.marketplace_profile_categories;
CREATE POLICY "marketplace_profile_categories_owner_manage"
ON public.marketplace_profile_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.marketplace_profiles mp
    JOIN public.seller_profiles sp ON sp.id = mp.seller_profile_id
    WHERE mp.id = marketplace_profile_categories.marketplace_profile_id
      AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.marketplace_profiles mp
    JOIN public.seller_profiles sp ON sp.id = mp.seller_profile_id
    WHERE mp.id = marketplace_profile_categories.marketplace_profile_id
      AND sp.user_id = auth.uid()
  )
);

-- Featured products: public read only for visible+published profiles and enabled rows; owner manages own rows
DROP POLICY IF EXISTS "marketplace_featured_products_public_read" ON public.marketplace_featured_products;
CREATE POLICY "marketplace_featured_products_public_read"
ON public.marketplace_featured_products
FOR SELECT
TO anon, authenticated
USING (
  is_enabled = true
  AND EXISTS (
    SELECT 1
    FROM public.marketplace_profiles mp
    WHERE mp.id = marketplace_featured_products.marketplace_profile_id
      AND mp.is_marketplace_visible = true
      AND mp.status = 'published'
  )
);

DROP POLICY IF EXISTS "marketplace_featured_products_owner_manage" ON public.marketplace_featured_products;
CREATE POLICY "marketplace_featured_products_owner_manage"
ON public.marketplace_featured_products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.marketplace_profiles mp
    JOIN public.seller_profiles sp ON sp.id = mp.seller_profile_id
    WHERE mp.id = marketplace_featured_products.marketplace_profile_id
      AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.marketplace_profiles mp
    JOIN public.seller_profiles sp ON sp.id = mp.seller_profile_id
    WHERE mp.id = marketplace_featured_products.marketplace_profile_id
      AND sp.user_id = auth.uid()
  )
);

commit;
