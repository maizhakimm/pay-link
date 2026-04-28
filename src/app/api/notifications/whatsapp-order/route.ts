import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   🔥 POST (hantar WhatsApp)
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

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle()

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

    const { data: seller } = await supabase
      .from('seller_profiles')
      .select('store_name, whatsapp')
      .eq('id', order.seller_profile_id)
      .maybeSingle()

    const phone = (seller?.whatsapp || '').replace(/\D/g, '')

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: 'Seller WhatsApp not found' },
        { status: 400 }
      )
    }

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
          to: phone,
          type: 'template',
          template: {
            name: process.env.WHATSAPP_TEMPLATE_SELLER_NEW_ORDER || 'seller_new_order',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: order.order_number },
                  { type: 'text', text: order.buyer_name || '-' },
                  { type: 'text', text: 'Order received' },
                  { type: 'text', text: String(order.total_amount || 0) },
                  { type: 'text', text: '-' },
                  { type: 'text', text: '-' },
                ],
              },
            ],
          },
        }),
      }
    )

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: json },
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
      result: json,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}

/* =========================
   🧪 GET (test manual)
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
  })

  const json = await res.json()

  return NextResponse.json({
    ok: res.ok,
    result: json,
  })
}
