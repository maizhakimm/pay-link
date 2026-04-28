import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import ShopPageClient from '../../shop/[slug]/ShopPageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  params: {
    shopSlug: string
  }
}

/* =========================
   ✅ FIX: gunakan ANON KEY
========================= */
function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return null
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/* =========================
   🔥 HELPER
========================= */
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/* =========================
   ✅ METADATA (fix duplicate heavy calls)
========================= */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = getServerSupabase()
  if (!supabase) return {}

  const slug = decodeURIComponent(params.shopSlug).toLowerCase().trim()

  const { data: seller } = await supabase
    .from('seller_profiles')
    .select('store_name')
    .eq('shop_slug', slug)
    .maybeSingle()

  const storeName = seller?.store_name || 'BayarLink Shop'

  return {
    title: { absolute: storeName },
    description: 'Order & bayar dengan mudah melalui BayarLink',
  }
}

/* =========================
   🚀 MAIN PAGE
========================= */
export default async function Page({ params }: PageProps) {
  const supabase = getServerSupabase()

  if (!supabase) {
    return <div>Supabase config error</div>
  }

  const slug = decodeURIComponent(params.shopSlug).toLowerCase().trim()

  /* =========================
     ✅ SINGLE SELLER FETCH
  ========================= */
  const { data: seller, error: sellerError } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('shop_slug', slug)
    .maybeSingle()

  if (sellerError || !seller) {
    return <div>Shop not found</div>
  }

  /* =========================
     PRODUCTS
  ========================= */
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  /* =========================
     DELIVERY SLOTS
  ========================= */
  const { data: deliverySlots } = await supabase
    .from('delivery_slots')
    .select('id,label')
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)

  /* =========================
     CATEGORIES
  ========================= */
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)

  /* =========================
     ADDONS
  ========================= */
  const productIds = (products || []).map((p) => p.id)

  let productAddons: Record<string, any[]> = {}

  if (productIds.length > 0) {
    const { data: groups } = await supabase
      .from('product_addon_groups')
      .select('*')
      .in('product_id', productIds)
      .eq('is_active', true)

    const groupIds = (groups || []).map((g) => g.id)

    const { data: options } = await supabase
      .from('product_addon_options')
      .select('*')
      .in('addon_group_id', groupIds)
      .eq('is_active', true)

    const map = new Map()

    for (const opt of options || []) {
      const arr = map.get(opt.addon_group_id) || []
      arr.push(opt)
      map.set(opt.addon_group_id, arr)
    }

    for (const g of groups || []) {
      if (!productAddons[g.product_id]) {
        productAddons[g.product_id] = []
      }

      productAddons[g.product_id].push({
        ...g,
        options: map.get(g.id) || [],
      })
    }
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <ShopPageClient
      seller={seller}
      products={products || []}
      shopSlug={slug}
      categories={categories || []}
      productAddons={productAddons}
      deliverySlots={deliverySlots || []}
      enableDeliverySlots={Boolean(seller.enable_delivery_slots)}
    />
  )
}
