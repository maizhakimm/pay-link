alter table public.menu_categories
  add column if not exists listing_type text;

update public.menu_categories
set listing_type = 'food'
where listing_type is null or trim(listing_type) = '';
