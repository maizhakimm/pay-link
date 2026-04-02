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

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, price, is_active, seller_profile_id')
      .in('id', productIds)
      .eq('seller_profile_id', sellerId)

    if (productError || !products || products.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Products not found' },
        { status: 404 }
      )
    }

    const productMap = new Map(
      (products as ProductRow[]).map((product) => [product.id, product])
    )

    const validItems = items
      .filter((item) => Number.isFinite(item.quantity) && item.quantity > 0)
      .map((item) => {
        const product = productMap.get(item.product_id)
        if (!product || !product.is_active) return null

        return {
          product,
          quantity: Math.floor(item.quantity),
          unit_price: Number(product.price),
          line_total: Number(product.price) * Math.floor(item.quantity),
        }
      })
      .filter(Boolean) as {
      product: ProductRow
      quantity: number
      unit_price: number
      line_total: number
    }[]

    if (!validItems.length) {
      return NextResponse.json(
        { ok: false, error: 'No valid products selected' },
        { status: 400 }
      )
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
          error: `Failed to create order: ${orderInsertError?.message || 'Unknown error'}`,
        },
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
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to create order items: ${itemInsertError.message}`,
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

    let parsedResponse: {
      id?: string
      url?: string
      message?: string
    } | null = null

    try {
      parsedResponse = JSON.parse(text) as {
        id?: string
        url?: string
        message?: string
      }
    } catch {
      parsedResponse = null
    }

    if (!response.ok) {
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          gateway_status_description:
            parsedResponse?.message || `Bayarcash error (${response.status})`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', insertedOrder.id)

      return NextResponse.json(
        {
          ok: false,
          error: parsedResponse?.message || 'Failed to create Bayarcash payment intent',
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
      order_number,
      payment_intent_id: parsedResponse?.id || null,
      raw_response: text,
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
