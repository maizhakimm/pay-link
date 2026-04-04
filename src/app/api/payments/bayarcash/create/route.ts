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

type SellerProfileRow = {
  id: string
  store_name?: string | null
}

type BayarcashResponse = {
  id?: string
  url?: string
  message?: string
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function estimateGatewayFee(paymentChannel: number) {
  if (paymentChannel === BAYARCASH_CHANNELS.FPX) {
    return 1.0
  }

  return 1.0
}

function estimatePlatformFee() {
  return 0
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const productSlug = searchParams.get('productSlug')
    const shopSlug = searchParams.get('shopSlug')

    if (!productSlug) {
      return NextResponse.json(
        { ok: false, error: 'Missing product slug' },
        { status: 400 }
      )
    }

    if (!shopSlug) {
      return NextResponse.json(
        { ok: false, error: 'Missing shop slug' },
        { status: 400 }
      )
    }

    const { data: sellers, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('id, store_name')

    if (sellerError || !sellers || sellers.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Seller not found' },
        { status: 404 }
      )
    }

    const matchedSeller =
      (sellers as SellerProfileRow[]).find((seller) => {
        return slugify(seller.store_name || '') === shopSlug
      }) || null

    if (!matchedSeller) {
      return NextResponse.json(
        { ok: false, error: 'Shop not found' },
        { status: 404 }
      )
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', productSlug)
      .eq('seller_profile_id', matchedSeller.id)
      .eq('is_active', true)
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

    const rawQuantity = Number(searchParams.get('quantity') || '1')
    const quantity =
      Number.isFinite(rawQuantity) && rawQuantity > 0
        ? Math.floor(rawQuantity)
        : 1

    const unitPrice = Number(typedProduct.price)
    const subtotal = roundMoney(unitPrice * quantity)
    const totalAmount = subtotal

    const paymentChannel = BAYARCASH_CHANNELS.FPX
    const gatewayFee = roundMoney(estimateGatewayFee(paymentChannel))
    const platformFee = roundMoney(estimatePlatformFee())
    const sellerNet = roundMoney(subtotal - gatewayFee - platformFee)

    const orderNumber = `ORD-${Date.now()}`
    const amount = totalAmount.toFixed(2)

    const payerName = searchParams.get('name') || 'Customer'
    const payerEmail = searchParams.get('email') || 'customer@example.com'
    const payerTelephoneNumber = searchParams.get('phone') || ''

    const needsDelivery = searchParams.get('needs_delivery') === '1'
    const deliveryAddress = searchParams.get('address') || null

    const { data: insertedOrder, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        product_id: typedProduct.id,
        product_slug: typedProduct.slug,
        product_name: typedProduct.name,

        seller_profile_id: typedProduct.seller_profile_id,
        seller_id: typedProduct.seller_profile_id,

        buyer_name: payerName,
        buyer_email: payerEmail,
        buyer_phone: payerTelephoneNumber,
        buyer_address: needsDelivery ? deliveryAddress : null,

        customer_name: payerName,
        customer_email: payerEmail,
        customer_phone: payerTelephoneNumber,

        quantity,
        amount,
        total_amount: totalAmount,
        subtotal,
        gateway_fee: gatewayFee,
        platform_fee: platformFee,
        seller_net: sellerNet,
        currency: 'MYR',

        order_number: orderNumber,
        order_no: orderNumber,

        payment_provider: 'bayarcash',
        payment_channel: paymentChannel,

        delivery_info: needsDelivery
          ? {
              address: deliveryAddress,
            }
          : null,

        status: 'pending',
        payment_status: 'pending',
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

    const { error: itemInsertError } = await supabase
      .from('order_items')
      .insert({
        order_id: insertedOrder.id,
        product_id: typedProduct.id,
        product_name: typedProduct.name,
        product_slug: typedProduct.slug,
        unit_price: unitPrice.toFixed(2),
        quantity,
        line_total: totalAmount.toFixed(2),
      })

    if (itemInsertError) {
      await supabase.from('orders').delete().eq('id', insertedOrder.id)

      return NextResponse.json(
        {
          ok: false,
          error: `Failed to create order item: ${itemInsertError.message}`,
        },
        { status: 500 }
      )
    }

    const checksum = createBayarcashPaymentIntentChecksum({
      payment_channel: paymentChannel,
      order_number: orderNumber,
      amount,
      payer_name: payerName,
      payer_email: payerEmail,
    })

    const payload = {
      payment_channel: paymentChannel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number: orderNumber,
      amount,
      payer_name: payerName,
      payer_email: payerEmail,
      payer_telephone_number: payerTelephoneNumber,
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
          payment_status: 'failed',
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
        payment_status: 'awaiting_payment',
        updated_at: new Date().toISOString(),
      })
      .eq('id', insertedOrder.id)

    return NextResponse.json({
      ok: true,
      status: response.status,
      product: {
        name: typedProduct.name,
        slug: typedProduct.slug,
        price: typedProduct.price,
      },
      order_number: orderNumber,
      payment_intent_id: parsedResponse?.id || null,
      payment_url: parsedResponse?.url || null,
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
