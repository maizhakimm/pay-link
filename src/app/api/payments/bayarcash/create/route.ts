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

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

// ================= NEW =================
function mapPaymentMethod(channel: number) {
  if (channel === BAYARCASH_CHANNELS.FPX) return 'FPX'
  if (channel === BAYARCASH_CHANNELS.CARD) return 'CARD'
  if (channel === BAYARCASH_CHANNELS.DUITNOW_QR) return 'DUITNOW_QR'
  if (channel === BAYARCASH_CHANNELS.BOOST_PAYFLEX) return 'BOOST_PAYFLEX'
  return 'FPX'
}

// ================= NEW =================
function calculatePlatformFee(
  amount: number,
  method: string,
  plan: string
) {
  if (plan !== 'BASIC') return 0

  if (method === 'FPX') return 1.5
  if (method === 'DUITNOW_QR') return roundMoney(amount * 0.025)
  if (method === 'BOOST_PAYFLEX') return roundMoney(amount * 0.025)
  if (method === 'CARD') return roundMoney(1 + amount * 0.025)

  return 0
}

// ================= EXISTING =================
function estimateGatewayFee() {
  return 1.0
}

function isAllowedPaymentChannel(channel: number) {
  const allowedChannels: number[] = [
    BAYARCASH_CHANNELS.FPX,
    BAYARCASH_CHANNELS.CARD,
    BAYARCASH_CHANNELS.DUITNOW_QR,
    BAYARCASH_CHANNELS.BOOST_PAYFLEX,
  ]
  return allowedChannels.includes(channel)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const sellerId = body.sellerId as string
    const shopSlug = body.shopSlug as string
    const name = body.name as string
    const email = body.email as string
    const phone = body.phone as string
    const items = (body.items || []) as RequestItem[]
    const delivery = body.delivery || null

    const requestedChannel = Number(body.paymentChannel)
    const paymentChannel = isAllowedPaymentChannel(requestedChannel)
      ? requestedChannel
      : BAYARCASH_CHANNELS.FPX

    // ================= UPDATED =================
    const { data: seller } = await supabase
      .from('seller_profiles')
      .select(`
        accept_orders_anytime,
        opening_time,
        closing_time,
        temporarily_closed,
        closed_message,
        plan_type
      `)
      .eq('id', sellerId)
      .maybeSingle()

    if (!seller) {
      return NextResponse.json({ ok: false, error: 'Seller not found' })
    }

    if (!items.length) {
      return NextResponse.json({ ok: false, error: 'No items' })
    }

    const productIds = items.map((i) => i.product_id)

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!products || products.length === 0) {
      return NextResponse.json({ ok: false, error: 'Products not found' })
    }

    const validItems: ValidItem[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) continue

      validItems.push({
        product,
        quantity: item.quantity,
        unit_price: Number(product.price),
        line_total: Number(product.price) * item.quantity,
      })
    }

    const subtotal = roundMoney(
      validItems.reduce((sum, i) => sum + i.line_total, 0)
    )

    const totalAmount = subtotal

    // ================= NEW LOGIC =================
    const paymentMethod = mapPaymentMethod(paymentChannel)
    const sellerPlan = seller.plan_type || 'BASIC'

    const gatewayFee = roundMoney(estimateGatewayFee())

    const platformFee = calculatePlatformFee(
      subtotal,
      paymentMethod,
      sellerPlan
    )

    const sellerNet = roundMoney(subtotal - gatewayFee - platformFee)

    const orderNumber = `ORD-${Date.now()}`

    const { data: insertedOrder } = await supabase
      .from('orders')
      .insert({
        seller_profile_id: sellerId,
        seller_id: sellerId,

        product_name: validItems[0].product.name,
        product_slug: validItems[0].product.slug,
        product_id: validItems[0].product.id,

        amount: totalAmount,
        total_amount: totalAmount,
        subtotal,

        gateway_fee: gatewayFee,
        platform_fee: platformFee,
        seller_net: sellerNet,

        // ================= NEW SNAPSHOT =================
        seller_plan_type: sellerPlan,
        payment_method: paymentMethod,
        gross_amount: totalAmount,
        platform_fee_amount: platformFee,
        net_seller_amount: sellerNet,

        currency: 'MYR',

        order_number: orderNumber,
        order_no: orderNumber,

        payment_provider: 'bayarcash',
        payment_channel: paymentChannel,

        status: 'pending',
        payment_status: 'pending',
        fulfillment_status: 'pending',
        payout_status: 'unpaid',
      })
      .select('id')
      .single()

    if (!insertedOrder) {
      return NextResponse.json({ ok: false, error: 'Order failed' })
    }

    const checksum = createBayarcashPaymentIntentChecksum({
      payment_channel: paymentChannel,
      order_number: orderNumber,
      amount: totalAmount.toFixed(2),
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
    })

    const payload = {
      payment_channel: paymentChannel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number: orderNumber,
      amount: totalAmount.toFixed(2),
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
      payer_telephone_number: phone || '',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-return?order_number=${orderNumber}`,
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
    })

    const parsed = await response.json()

    return NextResponse.json({
      ok: true,
      payment_url: parsed.url,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error' })
  }
}
