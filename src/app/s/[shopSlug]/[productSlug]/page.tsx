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
  delivery_mode?:
    | 'free_delivery'
    | 'fixed_fee'
    | 'included_in_price'
    | 'pay_rider_separately'
    | null
  delivery_fee?: number | null
  delivery_area?: string | null
  delivery_note?: string | null
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
  store_name?: string | null
  track_stock?: boolean
  stock_quantity?: number
  sold_out?: boolean
  created_at?: string
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

  const { data: sellers, error: sellerError } = await supabase
    .from('seller_profiles')
    .select(
      'id, store_name, shop_slug, profile_image, email, whatsapp, business_address, delivery_mode, delivery_fee, delivery_area, delivery_note'
    )

  if (!sellerError && sellers && sellers.length > 0) {
    seller =
      (sellers as SellerProfile[]).find((item) => {
        if (!item.store_name) return false
        return item.shop_slug === requestedSlug
      }) || null
  }

  if (!seller) {
    const { data: fallbackProducts, error: fallbackError } = await supabase
      .from('products')
      .select(
        'seller_profile_id, store_name, is_active, name, slug, description, price, image_1, image_2, image_3, image_4, image_5, track_stock, stock_quantity, sold_out, created_at'
      )
      .eq('is_active', true)

    if (!fallbackError && fallbackProducts && fallbackProducts.length > 0) {
      const matchedProduct = (fallbackProducts as ProductRow[]).find((item) => {
        if (!item.store_name) return false
        return slugify(item.store_name) === requestedSlug
      })

      if (matchedProduct) {
        const { data: fallbackSeller } = await supabase
          .from('seller_profiles')
          .select(
            'id, store_name, shop_slug, profile_image, email, whatsapp, business_address, delivery_mode, delivery_fee, delivery_area, delivery_note'
          )
          .eq('id', matchedProduct.seller_profile_id || '')
          .maybeSingle()

        if (fallbackSeller) {
          seller = fallbackSeller as SellerProfile
        } else {
          seller = {
            id: matchedProduct.seller_profile_id || '',
            store_name: matchedProduct.store_name || 'Shop',
            shop_slug: requestedSlug,
            profile_image: null,
            email: null,
            whatsapp: null,
            business_address: null,
            delivery_mode: 'pay_rider_separately',
            delivery_fee: 0,
            delivery_area: null,
            delivery_note: null,
          }
        }
      }
    }
  }

  if (!seller) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Shop not found</h2>
          <p style={errorText}>The shop link may be invalid or unavailable.</p>
          <p style={{ ...errorText, marginTop: 8 }}>
            Please check the shop slug or make sure active products exist for this shop.
          </p>
        </div>
      </main>
    )
  }

  const { data: products, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (productError) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Unable to load products</h2>
          <p style={errorText}>{productError.message}</p>
        </div>
      </main>
    )
  }

  return (
    <ShopPageClient
      seller={seller}
      products={(products || []) as ProductRow[]}
      shopSlug={seller.shop_slug || requestedSlug}
    />
  )
}

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
