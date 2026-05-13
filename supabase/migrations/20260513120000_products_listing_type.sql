alter table public.products
  add column if not exists listing_type text not null default 'food';

update public.products
set listing_type = 'food'
where listing_type is null
   or listing_type not in ('food','shop','service');

alter table public.products
  drop constraint if exists products_listing_type_check;

alter table public.products
  add constraint products_listing_type_check
  check (listing_type in ('food','shop','service'));
