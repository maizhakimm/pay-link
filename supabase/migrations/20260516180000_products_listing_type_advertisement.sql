alter table public.products
  drop constraint if exists products_listing_type_check;

alter table public.products
  add constraint products_listing_type_check
  check (listing_type in ('food', 'shop', 'service', 'advertisement'));
