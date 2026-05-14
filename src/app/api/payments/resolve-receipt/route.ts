import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function pickValue(req: NextRequest, body: any, ...keys: string[]) {
  for (const key of keys) {
    const queryValue = req.nextUrl.searchParams.get(key)
    if (queryValue) return queryValue.trim()
    const bodyValue = body?.[key]
    if (typeof bodyValue === 'string' && bodyValue.trim()) return bodyValue.trim()
  }
  return ''
}

export async function GET(req: NextRequest) {
  return resolveReceipt(req, null)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  return resolveReceipt(req, body)
}

async function resolveReceipt(req: NextRequest, body: any) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, error: 'Server configuration missing' }, { status: 500 })
  }

  const orderNumber = pickValue(req, body, 'order_number')
  const paymentIntentId = pickValue(req, body, 'payment_intent_id', 'intent_id', 'payment_intent')

  if (!orderNumber && !paymentIntentId) {
    return NextResponse.json({ ok: false, error: 'Missing order_number or payment_intent_id' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  let receiptToken = ''

  if (orderNumber) {
    const { data } = await supabase
      .from('orders')
      .select('receipt_token')
      .eq('order_number', orderNumber)
      .maybeSingle()

    receiptToken = data?.receipt_token || ''
  }

  if (!receiptToken && paymentIntentId) {
    const { data } = await supabase
      .from('orders')
      .select('receipt_token')
      .eq('gateway_payment_intent_id', paymentIntentId)
      .maybeSingle()

    receiptToken = data?.receipt_token || ''
  }

  if (!receiptToken) {
    return NextResponse.json({ ok: false, error: 'Receipt not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, receipt_url: `/r/${receiptToken}` })
}
