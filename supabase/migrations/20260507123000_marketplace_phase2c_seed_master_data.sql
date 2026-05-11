-- Phase 2C: Marketplace master data seed (additive only)

begin;

-- 1) marketplace_categories
INSERT INTO public.marketplace_categories (category_key, category_name, display_order, is_enabled)
VALUES
  ('breakfast', 'Breakfast', 1, true),
  ('lunch', 'Lunch', 2, true),
  ('dinner', 'Dinner', 3, true),
  ('dessert', 'Dessert', 4, true),
  ('bakery', 'Bakery', 5, true),
  ('drinks', 'Drinks', 6, true),
  ('frozen_food', 'Frozen Food', 7, true),
  ('catering', 'Catering', 8, true),
  ('kuih_muih', 'Kuih Muih', 9, true),
  ('snacks', 'Snacks', 10, true)
ON CONFLICT (category_key) DO NOTHING;

-- 2) homepage_sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, display_order, is_enabled)
VALUES
  ('hero', 'Discover Local Sellers', 'Fresh homemade meals and products near you.', 1, true),
  ('categories', 'Browse by Category', 'Find what you need faster.', 2, true),
  ('featured_sellers', 'Featured Sellers', 'Trusted and highlighted sellers for this week.', 3, true),
  ('latest_menu', 'Latest Menu', 'Newly listed items from marketplace sellers.', 4, true),
  ('preorder_today', 'Preorder Today', 'Reserve limited daily menu before sold out.', 5, true),
  ('nearby_sellers', 'Nearby Sellers', 'Support sellers in your nearby area.', 6, true),
  ('featured_products', 'Featured Products', 'Curated products picked by the marketplace team.', 7, true),
  ('become_seller', 'Become a Seller', 'Start selling on BayarLink Marketplace.', 8, true)
ON CONFLICT (section_key) DO NOTHING;

-- 3) marketplace_areas
INSERT INTO public.marketplace_areas (area_key, area_name, display_order, is_enabled)
VALUES
  ('shah_alam', 'Shah Alam', 1, true),
  ('setia_alam', 'Setia Alam', 2, true),
  ('klang', 'Klang', 3, true)
ON CONFLICT (area_key) DO NOTHING;

-- 4) marketplace_communities (Shah Alam)
INSERT INTO public.marketplace_communities (area_id, community_key, community_name, community_type, display_order, is_enabled)
SELECT a.id, c.community_key, c.community_name, c.community_type, c.display_order, c.is_enabled
FROM public.marketplace_areas a
JOIN (
  VALUES
    ('seksyen_7', 'Seksyen 7', 'residential_area', 1, true),
    ('seksyen_13', 'Seksyen 13', 'residential_area', 2, true),
    ('seksyen_9', 'Seksyen 9', 'residential_area', 3, true),
    ('denai_alam', 'Denai Alam', 'residential_area', 4, true),
    ('kota_kemuning', 'Kota Kemuning', 'residential_area', 5, true)
) AS c(community_key, community_name, community_type, display_order, is_enabled)
  ON a.area_key = 'shah_alam'
ON CONFLICT (community_key) DO NOTHING;

commit;
