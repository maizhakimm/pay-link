export default function PayPage({
  params,
  searchParams,
}: {
  params: { amount: string }
  searchParams?: { desc?: string }
}) {
  const phone = '60163352087'
  const description = searchParams?.desc || 'Payment'
  const message = `Hi, saya nak buat bayaran RM ${params.amount} untuk ${description}. Boleh share details pembayaran?`
  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

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
          RM {params.amount}
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
            marginBottom: '20px',
            color: '#6b7280',
            fontSize: '16px',
          }}
        >
          Choose your preferred payment method below.
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
            marginBottom: '18px',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          Scan this QR, or download it and scan from your gallery in your banking or e-wallet app.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <a
            href="/qr.png"
            download
            style={{
              display: 'inline-block',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#111827',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Download QR
          </a>

          <a
            href={whatsappLink}
            target="_blank"
            style={{
              display: 'inline-block',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#16a34a',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Pay via WhatsApp
          </a>
        </div>

        <p
          style={{
            marginTop: '10px',
            color: '#9ca3af',
            fontSize: '14px',
          }}
        >
          If you have already paid, you can continue on WhatsApp and send your proof of payment.
        </p>
      </div>
    </main>
  )
}
