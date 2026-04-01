import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function mapBayarcashStatus(status: number) {
  if (status === 3) return 'paid'
  if (status === 2) return 'failed'
  if (status === 4) return 'cancelled'
  return 'awaiting_payment'
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const orderNumber = payload.order_number
    const transactionId = payload.transaction_id
    const statusNumber = Number(payload.status || 0)
    const newStatus = mapBayarcashStatus(statusNumber)

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: 'Missing order_number' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('orders')
      .update({
        gateway_transaction_id: transactionId || null,
        gateway_status: statusNumber,
        gateway_status_description: payload.status_description || null,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
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
