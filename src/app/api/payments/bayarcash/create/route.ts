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

type DeliveryPayload = {
  address1?: string
  address2?: string
  postcode?: string
  city?: string
  district?: string
  state?: string
} | null

type FeeBreakdown = {
  sellerFeeAmount: number
  gatewayCostAmount: number
  gatewaySstAmount: number
  gatewayTotalCostAmount: number
  platformMarginAmount: number
  sstAmount: number
}

function isReservationExpired(reservedUntil?: string | null) {
  if (!reservedUntil) return true
  return new Date(reservedUntil).getTime() <= Date.now()
}

function buildBuyerAddress(delivery: DeliveryPayload) {
  if (!delivery) return null

  const parts = [
    delivery.address1,
    delivery.address2,
    delivery.postcode,
    delivery.city,
    delivery.district,
    delivery.state,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean)

  return parts.length ? parts.join(', ') : null
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function mapPaymentMethod(channel: number) {
  if (channel === BAYARCASH_CHANNELS.FPX) return 'FPX'
  if (channel === BAYARCASH_CHANNELS.CARD) return 'CARD'
  if (channel === BAYARCASH_CHANNELS.DUITNOW_QR) return 'DUITNOW_QR'
  if (channel === BAYARCASH_CHANNELS.BOOST_PAYFLEX) return 'BOOST_PAYFLEX'
  if (channel === BAYARCASH_CHANNELS.DUITNOW_ONLINE) return 'DUITNOW_ONLINE'
  if (channel === BAYARCASH_CHANNELS.SPAYLATER) return 'SPAYLATER'
  return 'FPX'
}

function getFeeBreakdown(method: string, _plan: string): FeeBreakdown {
  // Current locked model:
  // Seller-facing Basic FPX fee = RM1.50
  // Internal provider cost = RM1.00
  // Internal provider SST = RM0.08
  // Internal platform margin = RM0.42
  // Seller does NOT see SST line
  if (method === 'FPX') {
    const sellerFeeAmount = 1.5
    const gatewayCostAmount = 1.0
    const gatewaySstAmount = 0.08
    const gatewayTotalCostAmount = roundMoney(
      gatewayCostAmount + gatewaySstAmount
    )
    const platformMarginAmount = roundMoney(
      sellerFeeAmount - gatewayTotalCostAmount
    )

    return {
      sellerFeeAmount,
      gatewayCostAmount,
      gatewaySstAmount,
      gatewayTotalCostAmount,
      platformMarginAmount,
      sstAmount: 0,
    }
  }

  // Temporary safe default for other methods until you finalize pricing
  return {
    sellerFeeAmount: 0,
    gatewayCostAmount: 0,
    gatewaySstAmount: 0,
    gatewayTotalCostAmount: 0,
    platformMarginAmount: 0,
    sstAmount: 0,
  }
}

function calculateNetSellerAmount(
  grossAmount: number,
  sellerFeeAmount: number
) {
  return roundMoney(grossAmount - sellerFeeAmount)
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
    const delivery = (body.delivery || null) as DeliveryPayload

    const requestedChannel = Number(body.paymentChannel)
    const paymentChannel = isAllowedPaymentChannel(requestedChannel)
      ? requestedChannel
      : BAYARCASH_CHANNELS.FPX

    if (!sellerId) {
      return NextResponse.json(
        { ok: false, error: 'Missing seller ID' },
        { status: 400 }
      )
    }

    const { data: seller, error: sellerError } = await supabase
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

    if (sellerError || !seller) {
      return NextResponse.json(
        { ok: false, error: 'Seller not found' },
        { status: 404 }
      )
    }

    if (seller.temporarily_closed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            seller.closed_message ||
            'Kedai kini ditutup sementara. Sila cuba lagi nanti.',
        },
        { status: 400 }
      )
    }

    if (!seller.accept_orders_anytime) {
      if (seller.opening_time && seller.closing_time) {
        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        const [openH, openM] = seller.opening_time.split(':').map(Number)
        const [closeH, closeM] = seller.closing_time.split(':').map(Number)

        const open = openH * 60 + openM
        const close = closeH * 60 + closeM

        let isOpen = false

        if (open < close) {
          isOpen = currentMinutes >= open && currentMinutes <= close
        } else {
          isOpen = currentMinutes >= open || currentMinutes <= close
        }

        if (!isOpen) {
          return NextResponse.json(
            {
              ok: false,
              error:
                seller.closed_message ||
                `Kedai hanya menerima tempahan dari ${seller.opening_time} hingga ${seller.closing_time}`,
            },
            { status: 400 }
          )
        }
      }
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

    const subtotal = roundMoney(
      validItems.reduce((sum, item) => sum + item.line_total, 0)
    )
    const totalAmount = subtotal
    const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0)

    const paymentMethod = mapPaymentMethod(paymentChannel)
    const sellerPlan = (seller.plan_type || 'BASIC').toUpperCase()

    const feeBreakdown = getFeeBreakdown(paymentMethod, sellerPlan)
    const sellerNet = calculateNetSellerAmount(
      totalAmount,
      feeBreakdown.sellerFeeAmount
    )

    const firstProduct = validItems[0].product
    const orderNumber = `ORD-${Date.now()}`
    const amount = totalAmount.toFixed(2)
    const buyerAddress = buildBuyerAddress(delivery)

    const itemsSnapshot = validItems.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      product_slug: item.product.slug,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
    }))

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
        seller_id: sellerId,

        buyer_name: name || 'Customer',
        buyer_email: email || 'customer@example.com',
        buyer_phone: phone || '',
        buyer_address: buyerAddress,

        customer_name: name || 'Customer',
        customer_email: email || 'customer@example.com',
        customer_phone: phone || '',

        delivery_info: delivery,
        items: itemsSnapshot,

        quantity: totalQuantity,
        amount,
        total_amount: totalAmount,
        subtotal,

        // Legacy compatibility
        gateway_fee: feeBreakdown.sellerFeeAmount,
        platform_fee: 0,
        sst: 0,
        seller_net: sellerNet,

        // Existing
        seller_plan_type: sellerPlan,
        payment_method: paymentMethod,
        gross_amount: totalAmount,
        platform_fee_amount: 0,
        net_seller_amount: sellerNet,

        // New scalable fields
        seller_fee_amount: feeBreakdown.sellerFeeAmount,
        gateway_cost_amount: feeBreakdown.gatewayCostAmount,
        gateway_sst_amount: feeBreakdown.gatewaySstAmount,
        gateway_total_cost_amount: feeBreakdown.gatewayTotalCostAmount,
        platform_margin_amount: feeBreakdown.platformMarginAmount,
        sst_amount: feeBreakdown.sstAmount,

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

    const safeShopSlug = (shopSlug || '').trim()

    const baseReturnUrl = safeShopSlug
      ? `${process.env.NEXT_PUBLIC_APP_URL}/payment-return?shop=${encodeURIComponent(
          safeShopSlug
        )}&order_number=${encodeURIComponent(orderNumber)}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/payment-return?order_number=${encodeURIComponent(
          orderNumber
        )}`

    const payload = {
      payment_channel: paymentChannel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number: orderNumber,
      amount,
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
      payer_telephone_number: phone || '',
      return_url: baseReturnUrl,
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
        payment_status: 'awaiting_payment',
        updated_at: new Date().toISOString(),
      })
      .eq('id', insertedOrder.id)

    return NextResponse.json({
      ok: true,
      order_id: insertedOrder.id,
      order_number: orderNumber,
      payment_intent_id: parsedResponse?.id || null,
      payment_url: parsedResponse?.url || null,
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
