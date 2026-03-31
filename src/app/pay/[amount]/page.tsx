'use client'

import { useParams, useSearchParams } from 'next/navigation'

export default function PayPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const phone = '60163352087'
  const amount = String(params.amount || '')
  const description = searchParams.get('desc') || 'Payment'

  const bankName = 'Ryt Bank'
  const accountName = 'Maizhakim Bin Mazlan'
  const accountNumber = '60163352087'

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

  const bankDetails = `Bank: ${bankName}\nAccount Name: ${accountName}\nAccount Number: ${accountNumber}\nAmount: RM ${amount}\nDescription: ${description}`

  const bankDetails = `Bank: ${bankName}\nAccount Name: ${accountName}\nAccount Number: ${accountNumber}\nAmount: RM ${amount}\nDescription: ${description}`
    await navigator.clipboard.writeText(accountNumber)
    alert('Account number copied. Paste in your banking app.')

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
          maxWidth: '540px',
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
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          {description}
        </p>

        <p
          style={{
            marginTop: 0,
            marginBottom: '18px',
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: 1.6,
          }}
        >
          Please follow the steps below to complete your payment.
        </p>

        <div
          style={{
            marginBottom: '24px',
            textAlign: 'left',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              color: '#111827',
              fontSize: '15px',
              fontWeight: 600,
              lineHeight: 1.7,
            }}
          >
            Step 1: Make payment using the QR code or bank details below.
          </p>

          <p
            style={{
              margin: 0,
              color: '#111827',
              fontSize: '15px',
              fontWeight: 600,
              lineHeight: 1.7,
            }}
          >
            Step 2: Send your receipt via WhatsApp after payment.
          </p>
        </div>

        <img
          src="/qr.png"
          alt="QR Payment"
          style={{
            width: '220px',
            maxWidth: '100%',
            margin: '10px auto 16px',
            display: 'block',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
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
          Scan this QR or download it to scan from your gallery.
        </p>

        <div
          style={{
            display: 'grid',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <a
            href="/qr.png"
            download
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
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
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#16a34a',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Send Receipt on WhatsApp
          </a>
        </div>

        <div
          style={{
            marginBottom: '18px',
            textAlign: 'left',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              color: '#111827',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            Bank Details
          </p>

          <hr
            style={{
              margin: '0 0 16px 0',
              border: 'none',
              borderTop: '1px solid #e5e7eb',
            }}
          />

          <div style={{ display: 'grid', gap: '10px' }}>
            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  color: '#6b7280',
                  fontSize: '13px',
                }}
              >
                Bank
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                {bankName}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  color: '#6b7280',
                  fontSize: '13px',
                }}
              >
                Account Name
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                {accountName}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  color: '#6b7280',
                  fontSize: '13px',
                }}
              >
                Account Number
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {accountNumber}
              </p>
            </div>
          </div>

          <button
            onClick={copyBankDetails}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#f3f4f6',
              color: '#111827',
              border: '1px solid #e5e7eb',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Copy Bank Details
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
          Your order will be processed once payment is verified.
        </p>
      </div>
    </main>
  )
}
