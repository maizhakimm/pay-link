'use client'

import { useParams, useSearchParams } from 'next/navigation'

export default function PayPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const phone = '60163352087'
  const amount = String(params.amount || '')
  const description = searchParams.get('desc') || 'Payment'

  if (!amount) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7fb',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: '12px',
              fontSize: '32px',
              color: '#111827',
            }}
          >
            Invalid payment link
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '16px',
            }}
          >
            Please check the payment link and try again.
          </p>
        </div>
      </main>
    )
  }

  const message = `Hi, saya dah buat bayaran RM ${amount} untuk ${description}. Saya akan hantar bukti pembayaran.`
  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  const paymentDetails = `Bayaran RM ${amount} untuk ${description}`

  const copyDetails = async () => {
    await navigator.clipboard.writeText(paymentDetails)
    alert('Payment details copied')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fb',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#16a34a',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.4px',
          }}
        >
          PAYMENT PAGE
        </p>

        <h1
          style={{
            marginTop: '10px',
            marginBottom: '8px',
            fontSize: '34px',
            color: '#111827',
          }}
        >
          RM {amount}
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: '8px',
            color: '#111827',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          {description}
        </p>

        <p
          style={{
            marginTop: 0,
            marginBottom: '10px',
            color: '#6b7280',
            fontSize: '16px',
          }}
        >
          Choose your preferred payment method below.
        </p>

        <p
          style={{
            marginTop: 0,
            marginBottom: '20px',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          1. Pay using QR or your banking app. 2. Then continue on WhatsApp and send your proof of payment.
        </p>

        <img
          src="/qr.png"
          alt="QR Payment"
          style={{
            width: '220px',
            maxWidth: '100%',
            margin: '0 auto 12px',
            display: 'block',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}
        />

        <p
          style={{
            marginTop: 0,
            marginBottom: '22px',
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          Scan this QR, or download it and scan from your gallery in your banking or e-wallet app.
        </p>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <a
              href="/qr.png"
              download
              style={{
                display: 'inline-block',
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#111827',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              Download QR
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              style={{
                display: 'inline-block',
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#16a34a',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              Pay via WhatsApp
            </a>
          </div>

          <button
            onClick={copyDetails}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #d1d5db',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Copy Payment Details
          </button>
        </div>

        <p
          style={{
            marginTop: '10px',
            color: '#9ca3af',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          If you have already paid, you can continue on WhatsApp and send your proof of payment.
        </p>
      </div>
    </main>
  )
}
