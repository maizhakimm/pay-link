'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function PaymentReturnClient() {
  const params = useSearchParams()
  const hasRunRef = useRef(false)
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null)

  const status = params.get('status') || ''
  const rawOrderNumber = params.get('order_number') || ''
  const amountParam = params.get('amount') || ''
  const shopParam = params.get('shop') || ''
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

        const maxAttempts = 5
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const res = await fetch('/api/payments/resolve-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_number: cleanOrderNumber || null,
              payment_intent_id: cleanPaymentIntentId || null,
            }),
          })

          const payload = await res.json().catch(() => null)

          if (res.ok && payload?.ok && typeof payload.receipt_url === 'string') {
            window.location.replace(payload.receipt_url)
            return
          }

          if (attempt < maxAttempts - 1) {
            await delay(900)
          }
        }

        setFallbackMessage('Payment received, but receipt is still being prepared. Please check your WhatsApp confirmation or contact seller.')
      } catch (error) {
        console.error('Payment return redirect failed:', error)
        setFallbackMessage('Payment received, but receipt is still being prepared. Please check your WhatsApp confirmation or contact seller.')
      }
    }

    redirectToReceipt()
  }, [status, cleanOrderNumber, amountParam, cleanPaymentIntentId])

  if (!fallbackMessage) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <p style={{ fontSize: 14, color: '#334155' }}>Preparing your receipt...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, background: '#fff' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Payment Update</p>
        <p style={{ marginTop: 10, color: '#475569', fontSize: 14 }}>{fallbackMessage}</p>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {shopParam ? (
            <a href={`/s/${encodeURIComponent(shopParam)}`} style={{ textDecoration: 'none', padding: '10px 14px', borderRadius: 10, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13 }}>Back to Shop</a>
          ) : null}
          <a href="/" style={{ textDecoration: 'none', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: 13 }}>Go Home</a>
        </div>
      </div>
    </div>
  )
}
