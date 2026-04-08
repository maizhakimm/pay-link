import crypto from 'crypto'

function hmacSha256(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function createBayarcashPaymentIntentChecksum(data: {
  order_number: string
  amount: string
  payer_name: string
  payer_email: string
}) {
  const secret = process.env.BAYARCASH_API_SECRET || ''

  const payloadData = {
    amount: data.amount,
    order_number: data.order_number,
    payer_email: data.payer_email,
    payer_name: data.payer_name,
  }

  const sortedKeys = Object.keys(payloadData).sort()

  const payloadString = sortedKeys
    .map((key) => String(payloadData[key as keyof typeof payloadData]))
    .join('|')

  return hmacSha256(payloadString, secret)
}
