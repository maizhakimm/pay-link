import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const productSlug = searchParams.get('productSlug')
  const shopSlug = searchParams.get('shopSlug')

  if (!productSlug || !shopSlug) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  // 1. get seller
  const { data: sellers } = await supabase
    .from('seller_profiles')
    .select('*')

  const seller = sellers?.find(
    (s) => slugify(s.store_name || '') === shopSlug
  )

  if (!seller) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  }

  // 2. get product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', productSlug)
    .eq('seller_profile_id', seller.id)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // 3. create order
  const orderNumber = 'ORD-' + Date.now()

  const { data: order } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      product_id: product.id,
      seller_profile_id: seller.id,
      product_name: product.name,
      product_slug: product.slug,
      amount: product.price,
      status: 'pending',
      payment_status: 'pending',
      payout_status: 'unpaid',
    })
    .select()
    .single()

  // 4. call bayarcash (dummy for now)
  return NextResponse.json({
    url: `/payment-success?order=${order?.order_number}`,
  })
}
