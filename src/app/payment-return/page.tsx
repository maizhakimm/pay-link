<>
  <SimpleHeader />

  <main className="max-w-4xl mx-auto px-4 py-16">

import SimpleHeader from "@/components/SimpleHeader"

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
    message: 'Your payment is still being processed. Please check again shortly.',
    badge: 'Pending',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
  }
}

export default function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  const statusInfo = getStatusDetails(searchParams.status)
  const isSuccess = Number(searchParams.status) === 3
  const isFailed = Number(searchParams.status) === 2
  const isCancelled = Number(searchParams.status) === 4

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        padding: '28px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 14px 40px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
              fontSize: '34px',
              color: '#111827',
              fontWeight: 800,
            }}
          >
            {isSuccess ? '🎉 Payment Successful' : statusInfo.title}
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: 1.7,
            }}
          >
            {searchParams.status_description || statusInfo.message}
          </p>

          <p
            style={{
              margin: '12px 0 0 0',
              color: '#9ca3af',
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            Final payment confirmation may take a few seconds. Please do not
            refresh this page repeatedly.
          </p>
        </div>

        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '18px',
            padding: '22px',
            background: '#f9fafb',
          }}
        >
          <h2
            style={{
              margin: '0 0 18px 0',
              fontSize: '18px',
              color: '#111827',
              fontWeight: 700,
            }}
          >
            Payment Details
          </h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '4px',
                }}
              >
                Order Number
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#111827',
                  fontWeight: 600,
                }}
              >
                {searchParams.order_number || '-'}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '4px',
                }}
              >
                Amount
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#111827',
                  fontWeight: 600,
                }}
              >
                {searchParams.amount ? `MYR ${searchParams.amount}` : '-'}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '4px',
                }}
              >
                Customer
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#111827',
                  fontWeight: 600,
                }}
              >
                {searchParams.payer_name || '-'}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '4px',
                }}
              >
                Payment Status Code
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#111827',
                  fontWeight: 600,
                }}
              >
                {searchParams.status || '-'}
              </div>
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
          <button
            onClick={() => {
              window.location.href = '/'
            }}
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

          {(isFailed || isCancelled) && (
            <button
              onClick={() => {
                window.history.back()
              }}
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
            color: '#9ca3af',
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

    </main>
</>
