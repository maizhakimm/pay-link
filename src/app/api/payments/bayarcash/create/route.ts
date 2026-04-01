import { NextRequest, NextResponse } from 'next/server'
import { createBayarcashPaymentIntentChecksum, BAYARCASH_CHANNELS } from '../../../../../lib/bayarcash'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    const order_number = body.order_number || `TEST-${Date.now()}`
    const amount = body.amount || '10.00'
    const payer_name = body.payer_name || 'Test Buyer'
    const payer_email = body.payer_email || 'testbuyer@example.com'
    const payment_channel = body.payment_channel || BAYARCASH_CHANNELS.FPX

    const checksum = createBayarcashPaymentIntentChecksum({
      payment_channel,
      order_number,
      amount,
      payer_name,
      payer_email,
    })

    const payload = {
      payment_channel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number,
      amount,
      payer_name,
      payer_email,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-return`,
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

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      sent_payload: payload,
      raw_response: text,
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
