import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ExistingPaymentRow = {
  id: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const orderNumber = String(body.order_number || '').trim()
    const amount = Number(body.amount || 0)
    const paymentIntentId = body.payment_intent_id
      ? String(body.payment_intent_id).trim()
      : null

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: 'Missing order number' },
        { status: 400 }
      )
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (orderError || !order) {
      await supabase.from('webhook_logs').insert({
        source: 'manual-confirm',
        event_type: 'order_not_found',
        reference_no: orderNumber,
        payload: body,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // log request masuk supaya awak boleh trace fallback ini
    await supabase.from('webhook_logs').insert({
      source: 'manual-confirm',
      event_type: 'payment_success_fallback',
      reference_no: orderNumber,
      payload: body,
      created_at: new Date().toISOString(),
    })

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

    // avoid duplicate payment rows
    let existingPayment: ExistingPaymentRow | null = null

    if (paymentIntentId) {
      const { data } = await supabase
        .from('payments')
        .select('id')
        .eq('gateway_payment_intent_id', paymentIntentId)
        .maybeSingle()

      existingPayment = (data as ExistingPaymentRow | null) || null
    }

    if (!existingPayment) {
      const { data } = await supabase
        .from('payments')
        .select('id')
        .eq('order_id', order.id)
        .eq('gateway_name', 'BayarCash')
        .maybeSingle()

      existingPayment = (data as ExistingPaymentRow | null) || null
    }

    if (existingPayment) {
      await supabase
        .from('payments')
        .update({
          payment_status: 'paid',
          paid_amount: amount,
          gateway_status: '3',
          gateway_payment_intent_id: paymentIntentId,
          raw_response_json: body,
          paid_at: new Date().toISOString(),
        })
        .eq('id', existingPayment.id)
    } else {
      await supabase.from('payments').insert({
        order_id: order.id,
        gateway_name: 'BayarCash',
        payment_status: 'paid',
        paid_amount: amount,
        gateway_status: '3',
        gateway_payment_intent_id: paymentIntentId,
        raw_response_json: body,
        paid_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'

    await supabase.from('webhook_logs').insert({
      source: 'manual-confirm',
      event_type: 'server_error',
      reference_no: null,
      payload: { error: message },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
