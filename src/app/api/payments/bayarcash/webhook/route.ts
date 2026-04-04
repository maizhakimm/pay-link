import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function mapStatus(status: number) {
  if (status === 3) return 'paid'
  if (status === 2) return 'failed'
  if (status === 4) return 'cancelled'
  return 'awaiting_payment'
}

export async function POST(req: NextRequest) {
  const payload = await req.json()

  const orderNumber = payload.order_number
  const transactionId = payload.transaction_id
  const status = Number(payload.status)

  const newStatus = mapStatus(status)

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()

  if (!order) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  // ✅ Insert payment log
  if (transactionId) {
    await supabase.from('payments').insert({
      order_id: order.id,
      gateway_name: 'BayarCash',
      gateway_transaction_id: transactionId,
      paid_amount: payload.amount || 0,
      payment_channel: payload.payment_channel || null,
      gateway_status: String(status),
      payment_status: newStatus,
      raw_response_json: payload,
      paid_at: status === 3 ? new Date().toISOString() : null,
    })
  }

  // ✅ Update order
  await supabase
    .from('orders')
    .update({
      status: newStatus,
      payment_status: newStatus,
      gateway_transaction_id: transactionId,
      gateway_status: status,
      payout_status: status === 3 ? 'eligible' : 'unpaid',
      updated_at: new Date().toISOString(),
    })
    .eq('order_number', orderNumber)

  return NextResponse.json({ ok: true })
}
