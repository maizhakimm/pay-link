type PaymentReturnPageProps = {
  searchParams: {
    status?: string
    status_description?: string
    order_number?: string
    amount?: string
    payer_name?: string
    shop?: string
  }
}

function getStatusDetails(status?: string) {
  const numericStatus = Number(status)

  if (numericStatus === 3) {
    return {
      title: 'Payment Successful',
      message: 'Approved',
      badge: 'Success',
      badgeBg: '#dcfce7',
      badgeColor: '#166534',
      icon: '🎉',
    }
  }

  if (numericStatus === 2) {
    return {
      title: 'Payment Failed',
      message: 'Your payment could not be completed.',
      badge: 'Failed',
      badgeBg: '#fee2e2',
      badgeColor: '#991b1b',
      icon: '⚠️',
    }
  }

  if (numericStatus === 4) {
    return {
      title: 'Payment Cancelled',
      message: 'You cancelled this payment.',
      badge: 'Cancelled',
      badgeBg: '#f3f4f6',
      badgeColor: '#374151',
      icon: '🛑',
    }
  }

  return {
    title: 'Payment Pending',
    message: 'Payment sedang diproses.',
    badge: 'Pending',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    icon: '⏳',
  }
}

function safeOrderNumber(value?: string) {
  if (!value) return '-'
  return value.split('?')[0]
}

function safeShopUrl(shop?: string) {
  if (!shop) return '/'
  return `/s/${shop}`
}

export default function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  const statusInfo = getStatusDetails(searchParams?.status)
  const isSuccess = Number(searchParams?.status) === 3
  const shopUrl = safeShopUrl(searchParams?.shop)

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
                {safeOrderNumber(searchParams?.order_number)}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Amount</div>
              <div style={valueStyle}>
                {searchParams?.amount ? `MYR ${searchParams.amount}` : '-'}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Customer</div>
              <div style={valueStyle}>{searchParams?.payer_name || '-'}</div>
            </div>

            <div>
              <div style={labelStyle}>Payment Status Code</div>
              <div style={valueStyle}>{searchParams?.status || '-'}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gap: '10px',
          }}
        >
          <a
            href={shopUrl}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block',
              boxSizing: 'border-box',
            }}
          >
            Back to Shop
          </a>
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
