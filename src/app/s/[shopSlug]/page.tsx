import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import ShopPageClient from '../../shop/[slug]/ShopPageClient'

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
  accept_orders_anytime?: boolean | null
  opening_time?: string | null
  closing_time?: string | null
  temporarily_closed?: boolean | null
  closed_message?: string | null
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
    shopSlug: string
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

function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

async function getSellerBySlug(shopSlug: string): Promise<SellerProfile | null> {
  const supabase = getServerSupabase()
  if (!supabase) return null

  const requestedSlug = decodeURIComponent(shopSlug).toLowerCase().trim()

  const { data: seller } = await supabase
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
        accept_orders_anytime,
        opening_time,
        closing_time,
        temporarily_closed,
        closed_message,
        delivery_mode,
        delivery_fee,
        delivery_area,
        delivery_note
      `
    )
    .eq('shop_slug', requestedSlug)
    .maybeSingle()

  return (seller as SellerProfile | null) ?? null
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const requestedSlug = decodeURIComponent(params.shopSlug).toLowerCase().trim()
  const seller = await getSellerBySlug(requestedSlug)

  const storeName = seller?.store_name?.trim() || 'BayarLink Shop'
  const description = seller?.temporarily_closed
    ? `${storeName} is currently temporarily closed. View shop details on BayarLink.`
    : `${storeName} on BayarLink. Simple online ordering and payment for WhatsApp sellers.`

  const imageUrl =
    seller?.profile_image && seller.profile_image.trim().length > 0
      ? seller.profile_image
      : 'https://www.bayarlink.my/BayarLink-Logo-01.svg'

  return {
    title: `${storeName} | BayarLink`,
    description,
    openGraph: {
      title: `${storeName} | BayarLink`,
      description,
      url: `https://www.bayarlink.my/s/${requestedSlug}`,
      siteName: 'BayarLink',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${storeName} | BayarLink`,
      description,
      images: [imageUrl],
    },
  }
}

export default async function Page({ params }: PageProps) {
  const supabase = getServerSupabase()

  if (!supabase) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Server configuration error</h2>
          <p style={errorText}>
            Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.
          </p>
        </div>
      </main>
    )
  }

  const requestedSlug = decodeURIComponent(params.shopSlug).toLowerCase().trim()

  let seller: SellerProfile | null = null

  const { data: directSeller, error: sellerError } = await supabase
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
        accept_orders_anytime,
        opening_time,
        closing_time,
        temporarily_closed,
        closed_message,
        delivery_mode,
        delivery_fee,
        delivery_area,
        delivery_note
      `
    )
    .eq('shop_slug', requestedSlug)
    .maybeSingle()

  if (sellerError) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Unable to load shop</h2>
          <p style={errorText}>{sellerError.message}</p>
        </div>
      </main>
    )
  }

  seller = (directSeller as SellerProfile | null) ?? null

  if (!seller) {
    const { data: fallbackProducts, error: fallbackError } = await supabase
      .from('products')
      .select(
        `
          seller_profile_id,
          store_name,
          is_active,
          name,
          slug,
          description,
          price,
          image_1,
          image_2,
          image_3,
          image_4,
          image_5,
          track_stock,
          stock_quantity,
          sold_out,
          created_at
        `
      )
      .eq('is_active', true)

    if (!fallbackError && fallbackProducts && fallbackProducts.length > 0) {
      const matchedProduct = (fallbackProducts as ProductRow[]).find((item) => {
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
              accept_orders_anytime,
              opening_time,
              closing_time,
              temporarily_closed,
              closed_message,
              delivery_mode,
              delivery_fee,
              delivery_area,
              delivery_note
            `
          )
          .eq('id', matchedProduct.seller_profile_id)
          .maybeSingle()

        seller = (fallbackSeller as SellerProfile | null) ?? null
      }
    }
  }

  if (!seller) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Shop not found</h2>
          <p style={errorText}>The shop link may be invalid or unavailable.</p>
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
