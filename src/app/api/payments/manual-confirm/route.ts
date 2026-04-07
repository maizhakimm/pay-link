import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const orderNumber = body.order_number
    const amount = Number(body.amount || 0)

    if (!orderNumber) {
      return NextResponse.json({ ok: false, error: 'Missing order number' })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Order not found' })
    }

    // update order
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        gateway_status: 3,
        gateway_status_description: 'Manual confirm via return page',
        payout_status: 'eligible',
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)

    // insert payment log
    await supabase.from('payments').insert({
      order_id: order.id,
      gateway_name: 'BayarCash',
      payment_status: 'paid',
      paid_amount: amount,
      gateway_status: '3',
      raw_response_json: body,
      paid_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Server error' })
  }
}
