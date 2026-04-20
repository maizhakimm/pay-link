import { createClient } from '@supabase/supabase-js'
import ShopPageClient from './ShopPageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SellerProfile = {
  id: string
  store_name: string | null
  shop_slug?: string | null
  profile_image?: string | null
  email?: string | null
  whatsapp?: string | null
  business_address?: string | null
  shop_description?: string | null
  accept_orders_anytime?: boolean | null
  opening_time?: string | null
  closing_time?: string | null
  temporarily_closed?: boolean | null
  closed_message?: string | null
  operating_days?: Record<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
    {
      enabled: boolean
      opening_time: string
      closing_time: string
    }
  > | null
  delivery_mode?:
    | 'free_delivery'
    | 'fixed_fee'
    | 'included_in_price'
    | 'pay_rider_separately'
    | 'distance_based'
    | null
  delivery_fee?: number | null
  delivery_area?: string | null
  delivery_note?: string | null
  delivery_radius_km?: number | null
  delivery_rate_per_km?: number | null
  delivery_min_fee?: number | null
  pickup_address?: string | null
  latitude?: number | null
  longitude?: number | null
  daily_note?: string | null
  share_image_mode?: 'product' | 'logo' | 'poster' | null
  share_poster_url?: string | null
  order_mode?: 'anytime' | 'scheduled' | 'preorder' | null
  preorder_days?: number | null
}

type MenuCategory = {
  id: string
  name: string
  sort_order?: number | null
  is_active?: boolean | null
}

type ProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
  is_active?: boolean | null
  seller_profile_id?: string | null
  track_stock?: boolean
  stock_quantity?: number
  sold_out?: boolean
  created_at?: string
  menu_category_id?: string | null // ✅ NEW
}

type PageProps = {
  params: {
    slug: string
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default async function Page({ params }: PageProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const requestedSlug = params.slug.toLowerCase().trim()

  let seller: SellerProfile | null = null

  // 🔹 GET SELLER
  const { data: sellers } = await supabase
    .from('seller_profiles')
    .select(
  `
    id,
    store_name,
    shop_slug,
    profile_image,
    email,
    whatsapp,
    business_address,
    shop_description,
    accept_orders_anytime,
    opening_time,
    closing_time,
    temporarily_closed,
    closed_message,
    operating_days,
    delivery_mode,
    delivery_fee,
    delivery_area,
    delivery_note,
    delivery_radius_km,
    delivery_rate_per_km,
    delivery_min_fee,
    pickup_address,
    latitude,
    longitude,
    daily_note,
    share_image_mode,
    share_poster_url,
    order_mode,
    preorder_days
  `
    )

  if (sellers && sellers.length > 0) {
    seller =
      (sellers as SellerProfile[]).find((item) => {
        if (!item.store_name) return false
        return item.shop_slug === requestedSlug
      }) || null
  }

  // 🔹 FALLBACK SELLER FROM PRODUCT
if (!seller) {
  const { data: fallbackProducts } = await supabase
    .from('products')
    .select(
      'seller_profile_id, store_name, is_active, name, slug, description, price'
    )
    .eq('is_active', true)

  if (fallbackProducts && fallbackProducts.length > 0) {
    const matchedProduct = (fallbackProducts as any[]).find((item) => {
      if (!item.store_name) return false
      return slugify(item.store_name) === requestedSlug
    })

    if (matchedProduct?.seller_profile_id) {
      const { data: fallbackSeller } = await supabase
        .from('seller_profiles')
        .select(
          `
            id,
            store_name,
            shop_slug,
            profile_image,
            email,
            whatsapp,
            business_address,
            shop_description,
            accept_orders_anytime,
            opening_time,
            closing_time,
            temporarily_closed,
            closed_message,
            operating_days,
            delivery_mode,
            delivery_fee,
            delivery_area,
            delivery_note,
            delivery_radius_km,
            delivery_rate_per_km,
            delivery_min_fee,
            pickup_address,
            latitude,
            longitude,
            daily_note,
            share_image_mode,
            share_poster_url,
            order_mode,
            preorder_days
          `
        )
        .eq('id', matchedProduct.seller_profile_id)
        .maybeSingle()

      seller = (fallbackSeller as SellerProfile | null) || null
    }
  }
}

  // ❌ NO SELLER
  if (!seller) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Shop not found</h2>
          <p style={errorText}>
            The shop link may be invalid or unavailable.
          </p>
        </div>
      </main>
    )
  }

  // 🔹 GET PRODUCTS (UPDATED)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // 🔥 NEW — GET MENU CATEGORIES
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id, name, sort_order, is_active')
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <ShopPageClient
      seller={seller}
      products={(products || []) as ProductRow[]}
      categories={(categories || []) as MenuCategory[]} // ✅ PASS HERE
      shopSlug={seller.shop_slug || requestedSlug}
    />
  )
}

// 🔹 ERROR UI (same as before)

const errorMain = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8fafc',
  padding: '20px',
} as const

const errorBox = {
  background: '#fff',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  textAlign: 'center' as const,
} as const

const errorTitle = {
  marginBottom: '8px',
  color: '#0f172a',
  fontWeight: 800,
} as const

const errorText = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
} as const
