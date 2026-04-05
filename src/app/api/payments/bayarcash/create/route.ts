import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type SellerProfileRow = {
  id: string
  store_name?: string | null
  shop_slug?: string | null
}

type ProductRow = {
  id: string
  name: string
  slug: string
  price: number
  seller_profile_id: string | null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const productSlug = searchParams.get('productSlug')
  const shopSlug = searchParams.get('shopSlug')

  if (!productSlug || !shopSlug) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  // 1. get seller by permanent shop_slug
  const { data: sellers, error: sellerError } = await supabase
    .from('seller_profiles')
    .select('id, store_name, shop_slug')

  if (sellerError || !sellers) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  }

  const seller =
    (sellers as SellerProfileRow[]).find(
      (s) => s.shop_slug === shopSlug
    ) || null

  if (!seller) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  }

  // 2. get product under that seller
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, slug, price, seller_profile_id')
    .eq('slug', productSlug)
    .eq('seller_profile_id', seller.id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const typedProduct = product as ProductRow

  // 3. create order
  const orderNumber = 'ORD-' + Date.now()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      order_no: orderNumber,
      product_id: typedProduct.id,
      seller_profile_id: seller.id,
      seller_id: seller.id,
      product_name: typedProduct.name,
      product_slug: typedProduct.slug,
      amount: typedProduct.price,
      total_amount: typedProduct.price,
      subtotal: typedProduct.price,
      gateway_fee: 0,
      platform_fee: 0,
      seller_net: typedProduct.price,
      currency: 'MYR',
      status: 'pending',
      payment_status: 'pending',
      fulfillment_status: 'pending',
      payout_status: 'unpaid',
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // 4. dummy response for now
  return NextResponse.json({
    url: `/payment-success?order=${order.order_number}`,
  })
}
