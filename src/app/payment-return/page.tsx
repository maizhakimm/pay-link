'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PaymentReturnPageProps = {
  searchParams: {
    status?: string
    status_description?: string
    order_number?: string
    amount?: string
    payer_name?: string
    shop?: string
    payment_intent_id?: string
    payment_intent?: string
  }
}

type OrderItem = {
  product_name?: string
  quantity?: number
  line_total?: number
}

type OrderData = {
  id: string
  order_number?: string | null
  amount?: string | number | null
  total_amount?: number | null
  customer_name?: string | null
  customer_phone?: string | null
  buyer_name?: string | null
  buyer_phone?: string | null
  items?: OrderItem[] | null
  delivery_info?: Record<string, unknown> | null
  seller_profile_id?: string | null
  gateway_payment_intent_id?: string | null
}

function getStatusDetails(status?: string) {
  const numericStatus = Number(status)

  if (numericStatus === 3) {
    return {
      title: 'Payment Successful',
      message: 'Your payment has been received successfully.',
      badge: 'Success',
      badgeBg: '#dcfce7',
      badgeColor: '#166534',
      icon: '🎉',
    }
  }

  if (numericStatus === 2) {
    return {
      title: 'Payment Failed',
      message: 'Your payment could not be completed. Please try again.',
      badge: 'Failed',
      badgeBg: '#fee2e2',
      badgeColor: '#991b1b',
      icon: '⚠️',
    }
  }

  if (numericStatus === 4) {
    return {
      title: 'Payment Cancelled',
      message: 'You cancelled this payment before completion.',
      badge: 'Cancelled',
      badgeBg: '#f3f4f6',
      badgeColor: '#374151',
      icon: '🛑',
    }
  }

  return {
    title: 'Payment Pending',
    message: 'Payment sedang diproses. Sila tunggu sebentar.',
    badge: 'Pending',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    icon: '⏳',
  }
}

function normalizeWhatsappNumber(value?: string | null) {
  if (!value) return ''
  let cleaned = value.replace(/[^\d]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = `6${cleaned}`
  }
  if (!cleaned.startsWith('60') && cleaned.length >= 9) {
    cleaned = `60${cleaned}`
  }
  return cleaned
}

function buildDeliveryText(deliveryInfo?: Record<string, unknown> | null) {
  if (!deliveryInfo) return '-'

  const parts = [
    deliveryInfo.address1,
    deliveryInfo.address2,
    deliveryInfo.postcode,
    deliveryInfo.city,
    deliveryInfo.district,
    deliveryInfo.state,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean)

  return parts.length ? parts.join(', ') : '-'
}

function formatAmount(order: OrderData | null, fallback?: string) {
  if (order?.total_amount != null) {
    return Number(order.total_amount).toFixed(2)
  }

  if (order?.amount != null && order.amount !== '') {
    const value = Number(order.amount)
    if (!Number.isNaN(value)) return value.toFixed(2)
    return String(order.amount)
  }

  if (fallback) {
    const value = Number(fallback)
    if (!Number.isNaN(value)) return value.toFixed(2)
    return fallback
  }

  return '-'
}

export default function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  const statusInfo = getStatusDetails(searchParams?.status)
  const isSuccess = Number(searchParams?.status) === 3
  const isFailed = Number(searchParams?.status) === 2
  const isCancelled = Number(searchParams?.status) === 4

  const [order, setOrder] = useState<OrderData | null>(null)
  const [sellerWhatsapp, setSellerWhatsapp] = useState('')
  const [loadingOrder, setLoadingOrder] = useState(true)

  const shopUrl = searchParams?.shop ? `/s/${searchParams.shop}` : '/'

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoadingOrder(true)

        let foundOrder: OrderData | null = null

        if (searchParams?.order_number) {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', searchParams.order_number)
            .maybeSingle()

          if (data) {
            foundOrder = data as OrderData
          }
        }

        if (
          !foundOrder &&
          (searchParams?.payment_intent_id || searchParams?.payment_intent)
        ) {
          const paymentIntentId =
            searchParams.payment_intent_id || searchParams.payment_intent

          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('gateway_payment_intent_id', paymentIntentId)
            .maybeSingle()

          if (data) {
            foundOrder = data as OrderData
          }
        }

        setOrder(foundOrder)

        if (foundOrder?.seller_profile_id) {
          const { data: seller } = await supabase
            .from('seller_profiles')
            .select('whatsapp')
            .eq('id', foundOrder.seller_profile_id)
            .maybeSingle()

          if (seller?.whatsapp) {
            setSellerWhatsapp(normalizeWhatsappNumber(seller.whatsapp))
          }
        }
      } finally {
        setLoadingOrder(false)
      }
    }

    loadOrder()
  }, [
    searchParams?.order_number,
    searchParams?.payment_intent_id,
    searchParams?.payment_intent,
  ])

  const canNotifySeller = useMemo(() => {
    return Boolean(sellerWhatsapp)
  }, [sellerWhatsapp])

  function handleBackToShop() {
    window.location.href = shopUrl
  }

  function handleNotifySeller() {
    if (!sellerWhatsapp) return

    const now = new Date()
    const date = now.toLocaleDateString('en-GB')
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    const customerName =
      order?.customer_name ||
      order?.buyer_name ||
      searchParams?.payer_name ||
      'Customer'

    const customerPhone =
      order?.customer_phone ||
      order?.buyer_phone ||
      '-'

    const total = formatAmount(order, searchParams?.amount)

    const itemsText =
      order?.items && order.items.length
        ? order.items
            .map((item) => `- ${item.product_name || 'Item'} x${item.quantity || 1}`)
            .join('\n')
        : '- Order details available in dashboard'

    const deliveryText = buildDeliveryText(order?.delivery_info)

    const message = `🎉 Order Baru Masuk!

📦 Order No: ${order?.order_number || searchParams?.order_number || '-'}
🕒 Tarikh: ${date}
⏰ Masa: ${time}

👤 Customer: ${customerName}
📱 Phone: ${customerPhone}

🛒 Order:
${itemsText}

💰 Total: RM${total}

📍 Delivery:
${deliveryText}

👉 Sila prepare order sekarang.`

    const whatsappUrl = `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
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
            style={{
              height: 34,
              margin: '0 auto 16px auto',
              display: 'block',
            }}
          />

          <div
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              borderRadius: '999px',
              background: statusInfo.badgeBg,
              color: statusInfo.badgeColor,
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {statusInfo.badge}
          </div>

          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '30px',
              color: '#111827',
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {statusInfo.icon} {isSuccess ? 'Payment Successful' : statusInfo.title}
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            {searchParams?.status_description || statusInfo.message}
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
          <h2
            style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#111827',
              fontWeight: 700,
            }}
          >
            Payment Details
          </h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div style={labelStyle}>Order Number</div>
              <div style={valueStyle}>
                {order?.order_number || searchParams?.order_number || '-'}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Amount</div>
              <div style={valueStyle}>MYR {formatAmount(order, searchParams?.amount)}</div>
            </div>

            <div>
              <div style={labelStyle}>Customer</div>
              <div style={valueStyle}>
                {order?.customer_name ||
                  order?.buyer_name ||
                  searchParams?.payer_name ||
                  '-'}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Payment Status Code</div>
              <div style={valueStyle}>{searchParams?.status || '-'}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '18px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          {loadingOrder ? (
            <span>Loading order data...</span>
          ) : sellerWhatsapp ? (
            <span>Tap button below to notify seller via WhatsApp.</span>
          ) : (
            <span>
              Order data belum lengkap untuk notify seller. Pastikan order_number atau
              payment_intent_id dipulangkan dalam return URL dan seller ada nombor
              WhatsApp.
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gap: '10px',
          }}
        >
          <button
            onClick={handleBackToShop}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Back to Shop
          </button>

          <button
            onClick={handleNotifySeller}
            disabled={!sellerWhatsapp}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: sellerWhatsapp ? '#25D366' : '#bbf7d0',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: sellerWhatsapp ? 'pointer' : 'not-allowed',
              opacity: sellerWhatsapp ? 1 : 0.75,
            }}
          >
            Notify Seller (WhatsApp)
          </button>

          {(isFailed || isCancelled) && (
            <button
              onClick={handleBackToShop}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#111827',
                fontWeight: 700,
                border: '1px solid #d1d5db',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          )}
        </div>

        <p
          style={{
            margin: '20px 0 0 0',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '13px',
            lineHeight: 1.7,
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
