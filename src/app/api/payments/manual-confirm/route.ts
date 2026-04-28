import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ExistingPaymentRow = {
  id: string
}

async function triggerWhatsAppNotification(orderNumber: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/whatsapp-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: orderNumber,
        }),
        cache: 'no-store',
      }
    )

    const json = await res.json()

    if (!res.ok) {
      console.error('WhatsApp notification failed:', json)
    } else {
      console.log('WhatsApp notification triggered:', json)
    }
  } catch (error) {
    console.error('WhatsApp notification trigger error:', error)
  }
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
        payload_json: body,
        received_at: new Date().toISOString(),
      })

      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    await supabase.from('webhook_logs').insert({
      source: 'manual-confirm',
      event_type: 'payment_success_fallback',
      reference_no: orderNumber,
      payload_json: body,
      received_at: new Date().toISOString(),
    })

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        gateway_status: 3,
        gateway_status_description: 'Manual confirm via return page',
        payout_status: 'eligible',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)

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

    // ✅ Trigger WhatsApp notification after payment confirmed
    await triggerWhatsAppNotification(orderNumber)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'

    await supabase.from('webhook_logs').insert({
      source: 'manual-confirm',
      event_type: 'server_error',
      reference_no: null,
      payload_json: { error: message },
      received_at: new Date().toISOString(),
    })

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
