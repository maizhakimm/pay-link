'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type OrderData = {
  id: string
  order_number?: string | null
  receipt_token?: string | null
  total_amount?: number | null
  amount?: string | number | null
  buyer_name?: string | null
  customer_name?: string | null
}

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

function formatAmount(order: OrderData | null, fallback?: string) {
  const raw = order?.total_amount ?? order?.amount ?? fallback ?? 0
  const value = Number(raw)
  return Number.isNaN(value) ? '-' : value.toFixed(2)
}

export default function PaymentReturnClient() {
  const params = useSearchParams()

  const status = params.get('status') || ''
  const rawOrderNumber = params.get('order_number') || ''
  const amountParam = params.get('amount') || ''
  const payerName = params.get('payer_name') || ''
  const shopParam = params.get('shop') || ''
  const paymentIntentIdParam =
    params.get('payment_intent_id') || params.get('payment_intent') || ''

  const cleanOrderNumber = sanitizeOrderNumber(rawOrderNumber)
  const cleanPaymentIntentId = sanitizePaymentIntent(
    paymentIntentIdParam,
    rawOrderNumber
  )

  const isSuccess = Number(status) === 3
  const isFailed = Number(status) === 2
  const isCancelled = Number(status) === 4

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Preparing receipt...')
  const [savedShopSlug, setSavedShopSlug] = useState('')

  const hasRunRef = useRef(false)

  const finalShopSlug = shopParam || savedShopSlug
  const shopUrl = finalShopSlug ? `/s/${finalShopSlug}` : '/'

  useEffect(() => {
    try {
      const storedShopSlug =
        window.sessionStorage.getItem('bayarlink_shop_slug') || ''
      setSavedShopSlug(storedShopSlug)
    } catch {
      setSavedShopSlug('')
    }
  }, [])

  async function findOrder() {
    let foundOrder: OrderData | null = null

    if (cleanOrderNumber) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', cleanOrderNumber)
        .maybeSingle()

      if (data) foundOrder = data as OrderData
    }

    if (!foundOrder && cleanPaymentIntentId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('gateway_payment_intent_id', cleanPaymentIntentId)
        .maybeSingle()

      if (data) foundOrder = data as OrderData
    }

    return foundOrder
  }

  async function refreshStatus() {
    setLoading(true)
    setMessage('Checking latest order status...')

    try {
      const foundOrder = await findOrder()
      setOrder(foundOrder)

      if (foundOrder?.receipt_token && isSuccess) {
        window.location.replace(`/r/${foundOrder.receipt_token}`)
        return
      }
    } catch (error) {
      console.error('Refresh order failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function handleReturn() {
      if (hasRunRef.current) return
      hasRunRef.current = true

      try {
        setLoading(true)

        if (isSuccess && cleanOrderNumber) {
          setMessage('Confirming payment...')

          await fetch('/api/payments/manual-confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              order_number: cleanOrderNumber,
              status: 3,
              amount: amountParam,
              payment_intent_id: cleanPaymentIntentId || null,
            }),
          })

          setMessage('Opening receipt...')
        }

        const foundOrder = await findOrder()
        setOrder(foundOrder)

        if (isSuccess && foundOrder?.receipt_token) {
          window.location.replace(`/r/${foundOrder.receipt_token}`)
          return
        }
      } catch (error) {
        console.error('Payment return error:', error)
        setMessage('Unable to open receipt. Please refresh status.')
      } finally {
        setLoading(false)
      }
    }

    handleReturn()
  }, [status, cleanOrderNumber, amountParam, cleanPaymentIntentId])

  function handleBackToShop() {
    window.location.href = shopUrl
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        padding: '28px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 14px 40px rgba(15,23,42,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/BayarLink-Logo-Shop-Page.svg"
            alt="BayarLink"
            style={{ height: 34, margin: '0 auto 16px auto', display: 'block' }}
          />

          <div
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              borderRadius: '999px',
              background: isSuccess ? '#dcfce7' : isFailed ? '#fee2e2' : '#fef3c7',
              color: isSuccess ? '#166534' : isFailed ? '#991b1b' : '#92400e',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {isSuccess ? 'Success' : isFailed ? 'Failed' : isCancelled ? 'Cancelled' : 'Pending'}
          </div>

          <h1 style={{ margin: 0, fontSize: 30, color: '#111827', fontWeight: 800 }}>
            {isSuccess ? 'Payment Successful' : isFailed ? 'Payment Failed' : 'Payment Status'}
          </h1>

          <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: 15 }}>
            {loading ? message : isSuccess ? 'Redirecting to receipt...' : 'Please check your order status.'}
          </p>
        </div>

        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '18px',
            padding: '20px',
            background: '#f8fafc',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: 18, color: '#111827' }}>
            Payment Details
          </h2>

          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={labelStyle}>Order Number</div>
              <div style={valueStyle}>{order?.order_number || cleanOrderNumber || '-'}</div>
            </div>

            <div>
              <div style={labelStyle}>Amount</div>
              <div style={valueStyle}>MYR {formatAmount(order, amountParam)}</div>
            </div>

            <div>
              <div style={labelStyle}>Customer</div>
              <div style={valueStyle}>
                {order?.customer_name || order?.buyer_name || payerName || '-'}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Payment Status Code</div>
              <div style={valueStyle}>{status || '-'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
          <button onClick={refreshStatus} style={greenButton}>
            Refresh Order Status
          </button>

          <button onClick={handleBackToShop} style={darkButton}>
            Back to Shop
          </button>

          {(isFailed || isCancelled) && (
            <button onClick={handleBackToShop} style={outlineButton}>
              Try Again
            </button>
          )}
        </div>

        <p
          style={{
            margin: '20px 0 0',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 13,
          }}
        >
          Thank you for using BayarLink secure checkout.
        </p>
      </div>
    </main>
  )
}

const labelStyle = {
  fontSize: '13px',
  color: '#6b7280',
  marginBottom: '4px',
} as const

const valueStyle = {
  fontSize: '15px',
  color: '#111827',
  fontWeight: 600,
} as const

const greenButton = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  background: '#22c55e',
  color: '#fff',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
} as const

const darkButton = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
} as const

const outlineButton = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  background: '#ffffff',
  color: '#111827',
  fontWeight: 700,
  border: '1px solid #d1d5db',
  cursor: 'pointer',
} as const
