import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ListingType = 'food' | 'service' | 'shop'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const debug = searchParams.get('debug') === '1'
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 })
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

  const [{ data: mpRowsRaw, error: mpError }, { data: areaRows, error: areaError }] = await Promise.all([
    supabase
      .from('marketplace_profiles')
      .select('id,seller_profile_id,status,is_marketplace_visible,is_featured,is_verified,area_text,community_text,marketplace_profile_categories(category_id,marketplace_categories(category_name))')
      .order('is_featured', { ascending: false })
      .order('is_verified', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('marketplace_areas').select('area_name').eq('is_enabled', true).order('display_order', { ascending: true }),
  ])

  if (mpError || areaError) {
    return NextResponse.json({ ok: false, error: mpError?.message || areaError?.message || 'Failed to load marketplace data' }, { status: 500 })
  }

  const mpRows = ((mpRowsRaw || []) as any[]).filter((row) => {
    const status = String(row.status || '').toLowerCase()
    const visible = Boolean(row.is_marketplace_visible)
    return visible && (status === 'published' || status === 'approved')
  })

  const profiles = mpRows.map((row) => ({
    id: row.id,
    seller_profile_id: row.seller_profile_id,
    is_featured: Boolean(row.is_featured),
    is_verified: Boolean(row.is_verified),
    area_text: row.area_text || null,
    community_text: row.community_text || null,
    categoryNames: (row.marketplace_profile_categories || [])
      .map((entry: any) => (Array.isArray(entry.marketplace_categories) ? entry.marketplace_categories[0]?.category_name : entry.marketplace_categories?.category_name))
      .filter(Boolean),
  }))

  const sellerIds = profiles.map((p) => p.seller_profile_id)

  const [{ data: sellerRows, error: sellerError }, { data: productRows, error: productError }] = await Promise.all([
    sellerIds.length
      ? supabase.from('seller_profiles').select('id,store_name,shop_slug').in('id', sellerIds)
      : Promise.resolve({ data: [], error: null } as any),
    sellerIds.length
      ? supabase.from('products').select('id,name,price,seller_profile_id,product_image_url,image_1,image_2,image_url,listing_type,is_active,created_at').in('seller_profile_id', sellerIds).eq('is_active', true).order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null } as any),
  ])

  if (sellerError || productError) {
    return NextResponse.json({ ok: false, error: sellerError?.message || productError?.message || 'Failed to load seller/product data' }, { status: 500 })
  }

  const sellerMap: Record<string, { store_name: string | null; shop_slug: string | null }> = {}
  ;(sellerRows || []).forEach((row: any) => {
    sellerMap[String(row.id)] = { store_name: row.store_name || null, shop_slug: row.shop_slug || null }
  })

  const rawProductsCountBeforeVisibilityFilter = ((productRows || []) as any[]).length

  const products = ((productRows || []) as any[])
    .map((p) => {
      const profile = profiles.find((mp) => mp.seller_profile_id === p.seller_profile_id)
      const seller = sellerMap[String(p.seller_profile_id)]
      if (!seller?.store_name) return null
      const listingTypeRaw = String(p.listing_type || '').trim().toLowerCase()
      const listingType: ListingType = listingTypeRaw === 'service' || listingTypeRaw === 'services'
        ? 'service'
        : listingTypeRaw === 'shop' || listingTypeRaw === 'product'
          ? 'shop'
          : 'food'

      return {
        id: p.id,
        name: p.name,
        price: Number(p.price || 0),
        seller_profile_id: p.seller_profile_id,
        image: p.product_image_url || p.image_1 || p.image_2 || p.image_url || null,
        sellerName: seller.store_name,
        shopSlug: seller.shop_slug,
        areaText: profile?.area_text || null,
        communityText: profile?.community_text || null,
        categoryLabel: profile?.categoryNames?.[0] || null,
        isFeatured: Boolean(profile?.is_featured),
        isVerified: Boolean(profile?.is_verified),
        listingType,
      }
    })
    .filter(Boolean)

  const response: Record<string, unknown> = {
    ok: true,
    profiles,
    sellers: sellerMap,
    products,
    areaOptions: (areaRows || []).map((r: any) => r.area_name).filter(Boolean),
  }

  if (debug) {
    const raw = (mpRowsRaw || []) as any[]
    response.debug = {
      marketplaceProfilesRawCount: raw.length,
      marketplaceProfilesAfterFilter: mpRows.length,
      distinctStatusesFound: Array.from(new Set(raw.map((row) => String(row.status || '').toLowerCase()))),
      visibilityValuesFound: Array.from(new Set(raw.map((row) => String(Boolean(row.is_marketplace_visible))))),
      rawProductsCountBeforeVisibilityFilter,
      sanitizedProductsCount: products.length,
    }
  }

  return NextResponse.json(response)
}
