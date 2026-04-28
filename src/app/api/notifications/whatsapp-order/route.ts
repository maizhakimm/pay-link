import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizePhone(phone?: string | null) {
  const cleaned = String(phone || '').replace(/\D/g, '')

  if (!cleaned) return ''
  if (cleaned.startsWith('0')) return `6${cleaned}`
  if (cleaned.startsWith('60')) return cleaned

  return cleaned
}

function formatItems(order: any) {
  const sourceItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.checkout_items)
      ? order.checkout_items
      : []

  if (!sourceItems.length) return 'Order received'

  return sourceItems
    .map((item: any) => {
      const name =
        item.product_name ||
        item.name ||
        item.product?.name ||
        'Item'

      const qty = item.quantity || 1

      const addons = Array.isArray(item.addons)
        ? item.addons
            .map((addon: any) => addon.option_name || addon.name || '')
            .filter(Boolean)
            .join(', ')
        : ''

      const addonText = addons ? ` + ${addons}` : ''
      const noteText = item.note ? ` (${item.note})` : ''

      return `• ${name}${addonText} x${qty}${noteText}`
    })
    .join('\n')
}

function formatDelivery(order: any) {
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

/* =========================
   POST — Hantar WhatsApp
========================= */
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (orderError) {
      return NextResponse.json(
        { ok: false, error: orderError.message },
        { status: 500 }
      )
    }

    if (!order) {
      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.whatsapp_notified_at) {
      return NextResponse.json({
        ok: true,
        skipped: 'Already notified',
      })
    }

    const { data: seller, error: sellerError } = await supabase
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

    const sellerPhone = normalizePhone(seller?.whatsapp)

    if (!sellerPhone) {
      return NextResponse.json(
        { ok: false, error: 'Seller WhatsApp not found' },
        { status: 400 }
      )
    }

    const customerName = order.buyer_name || order.customer_name || '-'
    const customerPhone = normalizePhone(order.buyer_phone || order.customer_phone)
    const customerPhoneLink = customerPhone
      ? `https://wa.me/${customerPhone}`
      : '-'

    const itemsText = formatItems(order)
    const deliveryText = formatDelivery(order)
    const slotText = order.delivery_slot_label || '-'
    const totalText = Number(order.total_amount || order.amount || 0).toFixed(2)

    const res = await fetch(
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
            name:
              process.env.WHATSAPP_TEMPLATE_SELLER_NEW_ORDER ||
              'seller_new_order',
            language: {
              code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: order.order_number || orderNumber,
                  },
                  {
                    type: 'text',
                    text: `${customerName}\n📱 ${customerPhoneLink}`,
                  },
                  {
                    type: 'text',
                    text: itemsText,
                  },
                  {
                    type: 'text',
                    text: totalText,
                  },
                  {
                    type: 'text',
                    text: deliveryText,
                  },
                  {
                    type: 'text',
                    text: slotText,
                  },
                ],
              },
            ],
          },
        }),
        cache: 'no-store',
      }
    )

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: json,
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
      result: json,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    )
  }
}

/* =========================
   GET — Test Manual
========================= */
export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get('order_number')

  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, error: 'Missing order_number' },
      { status: 400 }
    )
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my'

  const res = await fetch(`${baseUrl}/api/notifications/whatsapp-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_number: orderNumber,
    }),
    cache: 'no-store',
  })

  const json = await res.json()

  return NextResponse.json({
    ok: res.ok,
    status: res.status,
    result: json,
  })
}
