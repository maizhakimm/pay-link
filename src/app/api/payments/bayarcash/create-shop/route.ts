import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createBayarcashPaymentIntentChecksum,
  BAYARCASH_CHANNELS,
} from '../../../../../lib/bayarcash'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type RequestItem = {
  product_id: string
  quantity: number
}

type ProductRow = {
  id: string
  name: string
  slug: string
  price: number
  is_active: boolean
  seller_profile_id: string | null

  // NEW
  track_stock: boolean
  stock_quantity: number
  sold_out: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const sellerId = body.sellerId as string
    const name = body.name as string
    const email = body.email as string
    const phone = body.phone as string
    const items = (body.items || []) as RequestItem[]

    if (!sellerId) {
      return NextResponse.json({ ok: false, error: 'Missing seller ID' }, { status: 400 })
    }

    if (!items.length) {
      return NextResponse.json({ ok: false, error: 'No items selected' }, { status: 400 })
    }

    const productIds = items.map((item) => item.product_id)

    // 🔥 GET PRODUCT + STOCK
    const { data: products, error: productError } = await supabase
      .from('products')
      .select(
        'id, name, slug, price, is_active, seller_profile_id, track_stock, stock_quantity, sold_out'
      )
      .in('id', productIds)
      .eq('seller_profile_id', sellerId)

    if (productError || !products || products.length === 0) {
      return NextResponse.json({ ok: false, error: 'Products not found' }, { status: 404 })
    }

    const productMap = new Map(
      (products as ProductRow[]).map((product) => [product.id, product])
    )

    // 🔥 VALIDATE + CHECK STOCK
    const validItems = []

    for (const item of items) {
      const product = productMap.get(item.product_id)
      const qty = Math.floor(item.quantity)

      if (!product || !product.is_active || qty <= 0) continue

      // ❌ PREVENT OVERSELL
      if (product.track_stock) {
        if (product.stock_quantity < qty) {
          return NextResponse.json(
            {
              ok: false,
              error: `${product.name} stock not enough`,
            },
            { status: 400 }
          )
        }
      }

      validItems.push({
        product,
        quantity: qty,
        unit_price: Number(product.price),
        line_total: Number(product.price) * qty,
      })
    }

    if (!validItems.length) {
      return NextResponse.json(
        { ok: false, error: 'No valid products selected' },
        { status: 400 }
      )
    }

    // 🔥 REDUCE STOCK IMMEDIATELY
    for (const item of validItems) {
      if (item.product.track_stock) {
        const newStock = item.product.stock_quantity - item.quantity
        const newSoldOut = newStock <= 0

        await supabase
          .from('products')
          .update({
            stock_quantity: newStock,
            sold_out: newSoldOut,
          })
          .eq('id', item.product.id)
      }
    }

    const totalAmount = validItems.reduce((sum, item) => sum + item.line_total, 0)
    const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0)

    const firstProduct = validItems[0].product
    const order_number = `ORD-${Date.now()}`
    const amount = totalAmount.toFixed(2)
    const payment_channel = BAYARCASH_CHANNELS.FPX

    const { data: insertedOrder, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        product_id: firstProduct.id,
        product_slug: firstProduct.slug,
        product_name:
          validItems.length === 1
            ? firstProduct.name
            : `${validItems.length} menu items`,
        seller_profile_id: sellerId,

        buyer_name: name || 'Customer',
        buyer_email: email || 'customer@example.com',
        buyer_phone: phone || '',

        quantity: totalQuantity,
        amount: amount,
        order_number: order_number,

        payment_provider: 'bayarcash',
        payment_channel: payment_channel,

        status: 'pending',
        fulfillment_status: 'pending',
        payout_status: 'unpaid',
      })
      .select('id')
      .single()

    if (orderInsertError || !insertedOrder) {
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to create order`,
        },
        { status: 500 }
      )
    }

    const checksum = createBayarcashPaymentIntentChecksum({
      payment_channel,
      order_number,
      amount,
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
    })

    const payload = {
      payment_channel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number,
      amount,
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
      payer_telephone_number: phone || '',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-return`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/bayarcash/webhook`,
      checksum,
    }

    const response = await fetch(`${process.env.BAYARCASH_BASE_URL}/payment-intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BAYARCASH_PAT}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const text = await response.text()

    let parsedResponse: any = null
    try {
      parsedResponse = JSON.parse(text)
    } catch {}

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedResponse?.message || 'Payment failed',
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      ok: true,
      raw_response: text,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Unexpected error',
      },
      { status: 500 }
    )
  }
}
