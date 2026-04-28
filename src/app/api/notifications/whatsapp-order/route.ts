import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type OrderRow = {
  id: string
  order_number: string | null
  buyer_name: string | null
  buyer_phone: string | null
  buyer_address: string | null
  customer_name: string | null
  customer_phone: string | null
  total_amount: number | null
  amount: number | null
  delivery_info: any
  items: any
  checkout_items: any
  seller_profile_id: string | null
  delivery_slot_label: string | null
  receipt_token: string | null
  whatsapp_notified_at: string | null
}

type SellerRow = {
  store_name: string | null
  whatsapp: string | null
}

function normalizeWhatsAppPhone(phone?: string | null) {
  const cleaned = String(phone || '').replace(/\D/g, '')

  if (!cleaned) return ''

  if (cleaned.startsWith('0')) return `6${cleaned}`
  if (cleaned.startsWith('60')) return cleaned

  return cleaned
}

function formatItems(order: OrderRow) {
  const sourceItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.checkout_items)
      ? order.checkout_items
      : []

  if (!sourceItems.length) return '-'

  return sourceItems
    .map((item: any) => {
      const name =
        item.product_name ||
        item.name ||
        item.product?.name ||
        'Item'

      const quantity = Number(item.quantity || 1)

      const addons = Array.isArray(item.addons)
        ? item.addons
            .map((addon: any) => addon.option_name || addon.name || '')
            .filter(Boolean)
            .join(', ')
        : ''

      const addonText = addons ? ` + ${addons}` : ''
      const note = item.note ? ` (${item.note})` : ''

      return `• ${name}${addonText} x${quantity}${note}`
    })
    .join('\n')
}

function formatDelivery(order: OrderRow) {
  const deliveryInfo = order.delivery_info

  if (!deliveryInfo) {
    return order.buyer_address || '-'
  }

  const deliveryRequired = Boolean(deliveryInfo.delivery_required)

  if (!deliveryRequired) {
    return 'Pickup / No delivery'
  }

  const mode = deliveryInfo.delivery_mode || 'Delivery'
  const fee = Number(deliveryInfo.delivery_fee || 0)

  const address =
    deliveryInfo.resolved_address ||
    order.buyer_address ||
    [
      deliveryInfo.address?.address1,
      deliveryInfo.address?.address2,
      deliveryInfo.address?.postcode,
      deliveryInfo.address?.city,
      deliveryInfo.address?.district,
      deliveryInfo.address?.state,
    ]
      .filter(Boolean)
      .join(', ')

  const distanceText =
    deliveryInfo.distance_km !== null &&
    deliveryInfo.distance_km !== undefined
      ? ` | ${Number(deliveryInfo.distance_km).toFixed(2)}km`
      : ''

  return `${mode} | RM ${fee.toFixed(2)}${distanceText} | ${address || '-'}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const orderNumber = String(body?.order_number || '').trim()

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: 'Missing order_number' },
        { status: 400 }
      )
    }

    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'Missing WHATSAPP_ACCESS_TOKEN' },
        { status: 500 }
      )
    }

    if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return NextResponse.json(
        { ok: false, error: 'Missing WHATSAPP_PHONE_NUMBER_ID' },
        { status: 500 }
      )
    }

    const templateName =
      process.env.WHATSAPP_TEMPLATE_SELLER_NEW_ORDER || 'seller_new_order'

    const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en'

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        buyer_name,
        buyer_phone,
        buyer_address,
        customer_name,
        customer_phone,
        total_amount,
        amount,
        delivery_info,
        items,
        checkout_items,
        seller_profile_id,
        delivery_slot_label,
        receipt_token,
        whatsapp_notified_at
      `)
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (orderError) {
      return NextResponse.json(
        { ok: false, error: orderError.message },
        { status: 500 }
      )
    }

    if (!orderData) {
      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderData as OrderRow

    if (order.whatsapp_notified_at) {
      return NextResponse.json({
        ok: true,
        skipped: 'Already notified',
      })
    }

    if (!order.seller_profile_id) {
      return NextResponse.json(
        { ok: false, error: 'Missing seller_profile_id' },
        { status: 400 }
      )
    }

    const { data: sellerData, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('store_name, whatsapp')
      .eq('id', order.seller_profile_id)
      .maybeSingle()

    if (sellerError) {
      return NextResponse.json(
        { ok: false, error: sellerError.message },
        { status: 500 }
      )
    }

    const seller = sellerData as SellerRow | null
    const sellerPhone = normalizeWhatsAppPhone(seller?.whatsapp)

    if (!sellerPhone) {
      return NextResponse.json(
        { ok: false, error: 'Seller WhatsApp not found' },
        { status: 400 }
      )
    }

    const customerName =
      order.buyer_name ||
      order.customer_name ||
      '-'

    const itemsText = formatItems(order)
    const deliveryText = formatDelivery(order)
    const slotText = order.delivery_slot_label || '-'
    const total = Number(order.total_amount ?? order.amount ?? 0).toFixed(2)

    const waRes = await fetch(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: sellerPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: order.order_number || orderNumber },
                  { type: 'text', text: customerName },
                  { type: 'text', text: itemsText || '-' },
                  { type: 'text', text: total },
                  { type: 'text', text: deliveryText || '-' },
                  { type: 'text', text: slotText },
                ],
              },
            ],
          },
        }),
        cache: 'no-store',
      }
    )

    const waJson = await waRes.json()

    if (!waRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'WhatsApp send failed',
          details: waJson,
        },
        { status: 500 }
      )
    }

    await supabase
      .from('orders')
      .update({
        whatsapp_notified_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    return NextResponse.json({
      ok: true,
      sent_to: sellerPhone,
      result: waJson,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
