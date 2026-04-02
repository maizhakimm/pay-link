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
  track_stock: boolean
  stock_quantity: number
  sold_out: boolean
  reserved_quantity?: number | null
  reserved_until?: string | null
}

type ValidItem = {
  product: ProductRow
  quantity: number
  unit_price: number
  line_total: number
}

type BayarcashResponse = {
  id?: string
  url?: string
  message?: string
}

function isReservationExpired(reservedUntil?: string | null) {
  if (!reservedUntil) return true
  return new Date(reservedUntil).getTime() <= Date.now()
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
      return NextResponse.json(
        { ok: false, error: 'Missing seller ID' },
        { status: 400 }
      )
    }

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: 'No items selected' },
        { status: 400 }
      )
    }

    const productIds = items.map((item) => item.product_id)

    let { data: products, error: productError } = await supabase
      .from('products')
      .select(
        'id, name, slug, price, is_active, seller_profile_id, track_stock, stock_quantity, sold_out, reserved_quantity, reserved_until'
      )
      .in('id', productIds)
      .eq('seller_profile_id', sellerId)

    if (productError || !products || products.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Products not found' },
        { status: 404 }
      )
    }

    // 1) RELEASE EXPIRED RESERVATIONS FIRST
    for (const product of products as ProductRow[]) {
      const reservedQty = product.reserved_quantity || 0
      const expired = isReservationExpired(product.reserved_until)

      if (reservedQty > 0 && expired) {
        await supabase
          .from('products')
          .update({
            reserved_quantity: 0,
            reserved_until: null,
          })
          .eq('id', product.id)
      }
    }

    // 2) RELOAD PRODUCTS AFTER RELEASE
    const { data: refreshedProducts, error: refreshedError } = await supabase
      .from('products')
      .select(
        'id, name, slug, price, is_active, seller_profile_id, track_stock, stock_quantity, sold_out, reserved_quantity, reserved_until'
      )
      .in('id', productIds)
      .eq('seller_profile_id', sellerId)

    if (refreshedError || !refreshedProducts || refreshedProducts.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Products not found after refresh' },
        { status: 404 }
      )
    }

    const productMap = new Map(
      (refreshedProducts as ProductRow[]).map((product) => [product.id, product])
    )

    const validItems: ValidItem[] = []

    for (const item of items) {
      const product = productMap.get(item.product_id)
      const qty = Math.floor(item.quantity)

      if (!product || !product.is_active || qty <= 0) continue

      if (product.track_stock) {
        const reserved = product.reserved_quantity || 0
        const availableStock = product.stock_quantity - reserved

        if (product.sold_out || availableStock < qty) {
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

    // 3) RESERVE STOCK FOR 10 MINUTES
    const reserveUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    for (const item of validItems) {
      if (!item.product.track_stock) continue

      const currentReserved = item.product.reserved_quantity || 0

      const { error: reserveError } = await supabase
        .from('products')
        .update({
          reserved_quantity: currentReserved + item.quantity,
          reserved_until: reserveUntil,
        })
        .eq('id', item.product.id)

      if (reserveError) {
        return NextResponse.json(
          { ok: false, error: `Failed to reserve stock for ${item.product.name}` },
          { status: 500 }
        )
      }
    }

    const totalAmount = validItems.reduce((sum, item) => sum + item.line_total, 0)
    const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0)

    const firstProduct = validItems[0].product
    const orderNumber = `ORD-${Date.now()}`
    const amount = totalAmount.toFixed(2)
    const paymentChannel = BAYARCASH_CHANNELS.FPX

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
        amount,
        order_number: orderNumber,

        payment_provider: 'bayarcash',
        payment_channel: paymentChannel,

        status: 'pending',
        fulfillment_status: 'pending',
        payout_status: 'unpaid',
      })
      .select('id')
      .single()

    if (orderInsertError || !insertedOrder) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }

    const orderItemsPayload = validItems.map((item) => ({
      order_id: insertedOrder.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_slug: item.product.slug,
      unit_price: item.unit_price.toFixed(2),
      quantity: item.quantity,
      line_total: item.line_total.toFixed(2),
    }))

    const { error: itemInsertError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)

    if (itemInsertError) {
      await supabase.from('orders').delete().eq('id', insertedOrder.id)

      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to create order items',
        },
        { status: 500 }
      )
    }

    const checksum = createBayarcashPaymentIntentChecksum({
      payment_channel: paymentChannel,
      order_number: orderNumber,
      amount,
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
    })

    const payload = {
      payment_channel: paymentChannel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number: orderNumber,
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

    let parsedResponse: BayarcashResponse | null = null

    try {
      parsedResponse = JSON.parse(text) as BayarcashResponse
    } catch {
      parsedResponse = null
    }

    if (!response.ok) {
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', insertedOrder.id)

      return NextResponse.json(
        {
          ok: false,
          error: parsedResponse?.message || 'Payment failed',
        },
        { status: response.status }
      )
    }

    await supabase
      .from('orders')
      .update({
        gateway_payment_intent_id: parsedResponse?.id || null,
        status: 'awaiting_payment',
        updated_at: new Date().toISOString(),
      })
      .eq('id', insertedOrder.id)

    return NextResponse.json({
      ok: true,
      order_id: insertedOrder.id,
      order_number: orderNumber,
      payment_intent_id: parsedResponse?.id || null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error'

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
