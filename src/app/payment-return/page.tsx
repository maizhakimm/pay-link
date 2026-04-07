'use client'

type PaymentReturnPageProps = {
  searchParams: {
    status?: string
    status_description?: string
    order_number?: string
    amount?: string
    payer_name?: string
  }
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
    }
  }

  if (numericStatus === 2) {
    return {
      title: 'Payment Failed',
      message: 'Your payment could not be completed. Please try again.',
      badge: 'Failed',
      badgeBg: '#fee2e2',
      badgeColor: '#991b1b',
    }
  }

  if (numericStatus === 4) {
    return {
      title: 'Payment Cancelled',
      message: 'You cancelled this payment before completion.',
      badge: 'Cancelled',
      badgeBg: '#f3f4f6',
      badgeColor: '#374151',
    }
  }

  return {
    title: 'Payment Pending',
    message: 'Payment sedang diproses. Sila tunggu sebentar.',
    badge: 'Pending',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
  }
}

export default function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  const statusInfo = getStatusDetails(searchParams?.status)
  const isSuccess = Number(searchParams?.status) === 3
  const isFailed = Number(searchParams?.status) === 2
  const isCancelled = Number(searchParams?.status) === 4

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 600, width: '100%', background: '#fff', padding: 24, borderRadius: 16 }}>

        <h1 style={{ fontSize: 24, fontWeight: 800 }}>
          {isSuccess ? '🎉 Payment Successful' : statusInfo.title}
        </h1>

        <p style={{ marginTop: 10 }}>
          {searchParams?.status_description || statusInfo.message}
        </p>

        <div style={{ marginTop: 20 }}>
          <p><strong>Order:</strong> {searchParams?.order_number || '-'}</p>
          <p><strong>Amount:</strong> {searchParams?.amount || '-'}</p>
          <p><strong>Status:</strong> {searchParams?.status || '-'}</p>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              width: '100%',
              padding: 12,
              background: '#111',
              color: '#fff',
              borderRadius: 10,
            }}
          >
            Back to Shop
          </button>

          {(isFailed || isCancelled) && (
            <button
              onClick={() => window.history.back()}
              style={{
                width: '100%',
                padding: 12,
                marginTop: 10,
                border: '1px solid #ccc',
                borderRadius: 10,
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
