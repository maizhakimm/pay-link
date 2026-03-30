export default function PayPage({ params }: { params: { amount: string } }) {
  const phone = '60163352087'
  const message = `Hi, saya nak buat bayaran RM ${params.amount}. Boleh share details pembayaran?`
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
            marginBottom: '10px',
            fontSize: '34px',
            color: '#111827',
          }}
        >
          RM {params.amount}
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: '28px',
            color: '#6b7280',
            fontSize: '16px',
          }}
        >
          Click the button below to continue payment via WhatsApp.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          style={{
            display: 'inline-block',
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px 18px',
            borderRadius: '12px',
            background: '#16a34a',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          Pay via WhatsApp
        </a>

        <p
          style={{
            marginTop: '18px',
            color: '#9ca3af',
            fontSize: '14px',
          }}
        >
          You will be redirected to WhatsApp with the payment amount pre-filled.
        </p>
      </div>
    </main>
  )
}
