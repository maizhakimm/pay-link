import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    return NextResponse.json({
      ok: false,
      error: 'Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID',
    })
  }

  const res = await fetch(
    `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: '60163352087',
        type: 'template',
        template: {
          name: 'seller_new_order',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'TEST-001' },
                { type: 'text', text: 'Ali Test' },
                { type: 'text', text: 'Nasi Lemak x1' },
                { type: 'text', text: '10.00' },
                { type: 'text', text: 'Pickup / No delivery' },
                { type: 'text', text: '-' },
              ],
            },
          ],
        },
      }),
    }
  )

  const json = await res.json()

  return NextResponse.json({
    ok: res.ok,
    status: res.status,
    result: json,
  })
}
