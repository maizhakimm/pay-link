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
  product_image_url?: string | null
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
  menu_category_id?: string | null
}

type ProductAddonGroup = {
  id: string
  product_id: string
  seller_profile_id: string
  name: string
  selection_type: 'single' | 'multiple'
  is_required: boolean
  min_select: number
  max_select: number | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  options: ProductAddonOption[]
}

type ProductAddonOption = {
  id: string
  addon_group_id: string
  product_id: string
  seller_profile_id: string
  name: string
  price_delta: number
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

type ProductAddonsMap = Record<string, ProductAddonGroup[]>

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

function normalizePublicImage(path?: string | null) {
  if (!path) return ''

  const trimmed = path.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return trimmed

  let cleanPath = trimmed
    .replace(/^storage\/v1\/object\/public\//, '')
    .replace(/^\/+/, '')

  const knownBuckets = ['product-images', 'product-assets']

  if (!knownBuckets.some((bucket) => cleanPath.startsWith(`${bucket}/`))) {
    cleanPath = `product-images/${cleanPath}`
  }

  return `${baseUrl}/storage/v1/object/public/${cleanPath}`
}

function getProductPreviewImage(product?: ProductRow | null) {
  if (!product) return ''

  const directProductImage = normalizePublicImage(product.product_image_url)
  if (directProductImage) return directProductImage

  const galleryImages = [
    product.image_1,
    product.image_2,
    product.image_3,
    product.image_4,
    product.image_5,
  ]
    .map((img) => normalizePublicImage(img))
    .filter(Boolean)

  return galleryImages[0] || ''
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
        share_poster_url
      `
    )
    .eq('shop_slug', requestedSlug)
    .maybeSingle()

  return (seller as SellerProfile | null) ?? null
}

async function getFirstActiveProductImage(
  sellerId: string
): Promise<string> {
  const supabase = getServerSupabase()
  if (!supabase) return ''

  const { data: products } = await supabase
    .from('products')
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        product_image_url,
        image_1,
        image_2,
        image_3,
        image_4,
        image_5,
        is_active,
        seller_profile_id,
        created_at
      `
    )
    .eq('seller_profile_id', sellerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const firstProduct = (products as ProductRow[] | null)?.find((item) => {
    return Boolean(
      item.product_image_url ||
        item.image_1 ||
        item.image_2 ||
        item.image_3 ||
        item.image_4 ||
        item.image_5
    )
  })

  return getProductPreviewImage(firstProduct || null)
}

async function getShareImageUrl(seller: SellerProfile | null): Promise<string> {
  if (!seller) {
    return 'https://www.bayarlink.my/BayarLink-Logo-01.svg'
  }

  if (
    seller.share_image_mode === 'poster' &&
    seller.share_poster_url &&
    seller.share_poster_url.trim().length > 0
  ) {
    return normalizePublicImage(seller.share_poster_url)
  }

  if (seller.share_image_mode === 'logo') {
    const logoUrl = normalizePublicImage(seller.profile_image)
    if (logoUrl) return logoUrl
  }

  const productImage = await getFirstActiveProductImage(seller.id)
  if (productImage) return productImage

  const logoUrl = normalizePublicImage(seller.profile_image)
  if (logoUrl) return logoUrl

  return 'https://www.bayarlink.my/BayarLink-Logo-01.svg'
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const requestedSlug = decodeURIComponent(params.shopSlug).toLowerCase().trim()
  const seller = await getSellerBySlug(requestedSlug)

  const storeName = seller?.store_name?.trim() || 'BayarLink Shop'
  const description =
    seller?.daily_note?.trim() ||
    (seller?.temporarily_closed
      ? 'Kedai ini ditutup sementara. Sila cuba lagi nanti.'
      : 'Order online dengan mudah. Senarai menu lengkap tersedia di sini.')

  const imageUrl = await getShareImageUrl(seller)

  return {
    title: storeName,
    description,
    openGraph: {
      title: storeName,
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
      card: 'summary_large_image',
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
        share_poster_url
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
          product_image_url,
          image_1,
          image_2,
          image_3,
          image_4,
          image_5,
          track_stock,
          stock_quantity,
          sold_out,
          created_at,
          menu_category_id
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
              delivery_note,
              delivery_radius_km,
              delivery_rate_per_km,
              delivery_min_fee,
              pickup_address,
              latitude,
              longitude,
              daily_note,
              share_image_mode,
              share_poster_url
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

  const productRows = (products || []) as ProductRow[]
  const productIds = productRows.map((item) => item.id)

  const { data: categories, error: categoryError } = await supabase
    .from('menu_categories')
    .select('id, name, sort_order, is_active')
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (categoryError) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Unable to load categories</h2>
          <p style={errorText}>{categoryError.message}</p>
        </div>
      </main>
    )
  }

  let productAddons: ProductAddonsMap = {}

  if (productIds.length > 0) {
    const { data: addonGroups, error: addonGroupsError } = await supabase
      .from('product_addon_groups')
      .select(
        `
          id,
          product_id,
          seller_profile_id,
          name,
          selection_type,
          is_required,
          min_select,
          max_select,
          sort_order,
          is_active,
          created_at,
          updated_at
        `
      )
      .eq('seller_profile_id', seller.id)
      .eq('is_active', true)
      .in('product_id', productIds)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (addonGroupsError) {
      return (
        <main style={errorMain}>
          <div style={errorBox}>
            <h2 style={errorTitle}>Unable to load add-on groups</h2>
            <p style={errorText}>{addonGroupsError.message}</p>
          </div>
        </main>
      )
    }

    const addonGroupRows = (addonGroups || []) as Omit<ProductAddonGroup, 'options'>[]

    const addonGroupIds = addonGroupRows.map((group) => group.id)

    let addonOptionsRows: ProductAddonOption[] = []

    if (addonGroupIds.length > 0) {
      const { data: addonOptions, error: addonOptionsError } = await supabase
        .from('product_addon_options')
        .select(
          `
            id,
            addon_group_id,
            product_id,
            seller_profile_id,
            name,
            price_delta,
            sort_order,
            is_active,
            created_at,
            updated_at
          `
        )
        .eq('seller_profile_id', seller.id)
        .eq('is_active', true)
        .in('addon_group_id', addonGroupIds)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (addonOptionsError) {
        return (
          <main style={errorMain}>
            <div style={errorBox}>
              <h2 style={errorTitle}>Unable to load add-on options</h2>
              <p style={errorText}>{addonOptionsError.message}</p>
            </div>
          </main>
        )
      }

      addonOptionsRows = (addonOptions || []) as ProductAddonOption[]
    }

    const optionsByGroupId = new Map<string, ProductAddonOption[]>()

    for (const option of addonOptionsRows) {
      const existing = optionsByGroupId.get(option.addon_group_id) || []
      existing.push({
        ...option,
        price_delta: Number(option.price_delta || 0),
        sort_order: Number(option.sort_order || 0),
      })
      optionsByGroupId.set(option.addon_group_id, existing)
    }

    for (const group of addonGroupRows) {
      const normalizedGroup: ProductAddonGroup = {
        ...group,
        selection_type:
          group.selection_type === 'multiple' ? 'multiple' : 'single',
        is_required: Boolean(group.is_required),
        min_select: Number(group.min_select || 0),
        max_select:
          group.max_select === null || group.max_select === undefined
            ? null
            : Number(group.max_select),
        sort_order: Number(group.sort_order || 0),
        is_active: Boolean(group.is_active),
        options: optionsByGroupId.get(group.id) || [],
      }

      if (!productAddons[normalizedGroup.product_id]) {
        productAddons[normalizedGroup.product_id] = []
      }

      productAddons[normalizedGroup.product_id].push(normalizedGroup)
    }
  }

  return (
    <ShopPageClient
      seller={seller}
      products={productRows}
      categories={(categories || []) as MenuCategory[]}
      shopSlug={seller.shop_slug || requestedSlug}
      productAddons={productAddons}
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
