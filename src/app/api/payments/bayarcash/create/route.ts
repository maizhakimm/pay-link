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

type ProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  is_active: boolean
  store_name: string | null
  seller_profile_id: string | null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: 'Missing product slug' },
        { status: 400 }
      )
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (productError || !product) {
      return NextResponse.json(
        { ok: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const typedProduct = product as ProductRow

    if (!typedProduct.is_active) {
      return NextResponse.json(
        { ok: false, error: 'Product is inactive' },
        { status: 400 }
      )
    }

    const order_number = `ORD-${Date.now()}`
    const amount = Number(typedProduct.price).toFixed(2)
    const payer_name = searchParams.get('name') || 'Customer'
    const payer_email = searchParams.get('email') || 'customer@example.com'
    const payer_telephone_number = searchParams.get('phone') || ''
    const payment_channel = BAYARCASH_CHANNELS.FPX

    const { error: orderInsertError } = await supabase.from('orders').insert({
      product_id: typedProduct.id,
      product_slug: typedProduct.slug,
      product_name: typedProduct.name,
      seller_profile_id: typedProduct.seller_profile_id,
      buyer_name: payer_name,
      buyer_email: payer_email,
      buyer_phone: payer_telephone_number,
      amount: amount,
      order_number: order_number,
      payment_provider: 'bayarcash',
      payment_channel: payment_channel,
      status: 'pending',
    })

    if (orderInsertError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to create order: ${orderInsertError.message}`,
        },
        { status: 500 }
      )
    }

    const checksum = createBayarcashPaymentIntentChecksum({
      payment_channel,
      order_number,
      amount,
      payer_name,
      payer_email,
    })

    const payload = {
      payment_channel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number,
      amount,
      payer_name,
      payer_email,
      payer_telephone_number,
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
    } | null = null

    try {
      parsedResponse = JSON.parse(text) as {
        id?: string
        url?: string
      }
    } catch {
      parsedResponse = null
    }

    if (response.ok && parsedResponse?.id) {
      await supabase
        .from('orders')
        .update({
          gateway_payment_intent_id: parsedResponse.id,
          status: 'awaiting_payment',
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', order_number)
    }

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      product: {
        name: typedProduct.name,
        slug: typedProduct.slug,
        price: typedProduct.price,
      },
      order_number,
      sent_payload: payload,
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
