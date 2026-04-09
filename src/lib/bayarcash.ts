import crypto from 'crypto'

export const BAYARCASH_CHANNELS = {
  FPX: 1,
  CARD: 4,
  SPAYLATER: 7,
  BOOST_PAYFLEX: 8,
} as const

function hmacSha256(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function createBayarcashPaymentIntentChecksum(data: {
  order_number: string
  amount: string
  payer_name: string
  payer_email: string
  payment_channel?: number | null
}) {
  const secret = process.env.BAYARCASH_API_SECRET || ''

  const payloadData: Record<string, string | number> = {
    amount: data.amount,
    order_number: data.order_number,
    payer_email: data.payer_email,
    payer_name: data.payer_name,
  }

  // Only include payment_channel if explicitly provided.
  // This allows BayarCash to handle the payment method selection screen.
  if (
    typeof data.payment_channel === 'number' &&
    Number.isFinite(data.payment_channel)
  ) {
    payloadData.payment_channel = data.payment_channel
  }

  const sortedKeys = Object.keys(payloadData).sort()
  const payloadString = sortedKeys
    .map((key) => String(payloadData[key]))
    .join('|')

  return hmacSha256(payloadString, secret)
}
