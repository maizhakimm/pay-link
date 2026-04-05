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

export default async function Page({ params }: PageProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const requestedSlug = decodeURIComponent(params.shopSlug).toLowerCase().trim()

  const { data: seller, error: sellerError } = await supabase
    .from('seller_profiles')
    .select('id, store_name, shop_slug, profile_image, email, whatsapp, business_address')
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
      seller={seller as SellerProfile}
      products={(products || []) as ProductRow[]}
      shopSlug={requestedSlug}
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
