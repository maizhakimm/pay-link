import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { order_number } = await req.json()

    if (!order_number) {
      return NextResponse.json({ ok: false, error: 'Missing order_number' }, { status: 400 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, buyer_name, buyer_phone, receipt_token, telegram_notified_at, seller_profile_id')
      .eq('order_number', order_number)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
    }

    if (order.telegram_notified_at) {
      return NextResponse.json({ ok: true, skipped: 'Already notified' })
    }

    const { data: seller } = await supabase
      .from('seller_profiles')
      .select('store_name, telegram_chat_id')
      .eq('id', order.seller_profile_id)
      .maybeSingle()

    if (!seller?.telegram_chat_id) {
      return NextResponse.json({ ok: false, error: 'Seller telegram_chat_id not found' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my'

    const message = `
🎉 Order Baru Masuk!

🏪 Kedai: ${seller.store_name || '-'}
🧾 Order No: ${order.order_number}
👤 Customer: ${order.buyer_name || '-'}
📱 Phone: ${order.buyer_phone || '-'}
💰 Total: RM ${Number(order.total_amount || 0).toFixed(2)}

🔗 Receipt:
${baseUrl}/r/${order.receipt_token}

📊 Semak Order:
${baseUrl}/dashboard/orders?order=${order.order_number}
`.trim()

    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: seller.telegram_chat_id,
          text: message,
          disable_web_page_preview: true,
        }),
      }
    )

    const tgJson = await tgRes.json()

    if (!tgRes.ok) {
      return NextResponse.json({ ok: false, error: tgJson }, { status: 500 })
    }

    await supabase
      .from('orders')
      .update({ telegram_notified_at: new Date().toISOString() })
      .eq('id', order.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
