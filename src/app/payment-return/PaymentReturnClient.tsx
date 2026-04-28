'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function sanitizeOrderNumber(value?: string | null) {
  if (!value) return ''
  return value.split('?')[0].trim()
}

function sanitizePaymentIntent(value?: string | null, orderValue?: string | null) {
  if (value) return value.trim()

  if (orderValue && orderValue.includes('payment_intent_id=')) {
    const parts = orderValue.split('payment_intent_id=')
    return parts[1]?.trim() || ''
  }

  return ''
}

export default function PaymentReturnClient() {
  const params = useSearchParams()
  const hasRunRef = useRef(false)

  const status = params.get('status') || ''
  const rawOrderNumber = params.get('order_number') || ''
  const amountParam = params.get('amount') || ''
  const paymentIntentIdParam =
    params.get('payment_intent_id') || params.get('payment_intent') || ''

  const cleanOrderNumber = sanitizeOrderNumber(rawOrderNumber)
  const cleanPaymentIntentId = sanitizePaymentIntent(
    paymentIntentIdParam,
    rawOrderNumber
  )

  useEffect(() => {
    async function redirectToReceipt() {
      if (hasRunRef.current) return
      hasRunRef.current = true

      try {
        if (Number(status) === 3 && cleanOrderNumber) {
          await fetch('/api/payments/manual-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_number: cleanOrderNumber,
              status: 3,
              amount: amountParam,
              payment_intent_id: cleanPaymentIntentId || null,
            }),
          })
        }

        let receiptToken = ''

        if (cleanOrderNumber) {
          const { data } = await supabase
            .from('orders')
            .select('receipt_token')
            .eq('order_number', cleanOrderNumber)
            .maybeSingle()

          receiptToken = data?.receipt_token || ''
        }

        if (!receiptToken && cleanPaymentIntentId) {
          const { data } = await supabase
            .from('orders')
            .select('receipt_token')
            .eq('gateway_payment_intent_id', cleanPaymentIntentId)
            .maybeSingle()

          receiptToken = data?.receipt_token || ''
        }

        if (receiptToken) {
          window.location.replace(`/r/${receiptToken}`)
          return
        }

        window.location.replace('/')
      } catch (error) {
        console.error('Payment return redirect failed:', error)
        window.location.replace('/')
      }
    }

    redirectToReceipt()
  }, [status, cleanOrderNumber, amountParam, cleanPaymentIntentId])

  return null
}
