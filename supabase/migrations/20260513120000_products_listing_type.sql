-- Add listing_type for Bazar marketplace filtering
alter table public.products
  add column if not exists listing_type text not null default 'food';

update public.products
set listing_type = 'food'
where listing_type is null or trim(listing_type) = '';

alter table public.products
  add constraint products_listing_type_check
  check (listing_type in ('food', 'shop', 'service'));
