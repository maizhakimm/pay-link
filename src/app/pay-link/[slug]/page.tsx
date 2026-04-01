import { supabase } from '../../../lib/supabase'
import PayButton from './PayButton'

type ProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  seller_profile_id: string
  is_active: boolean
  store_name: string | null
}

function PaymentBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        borderRadius: '999px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        color: '#334155',
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  )
}

export default async function PaymentPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (productError || !product) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '28px',
              color: '#0f172a',
              fontWeight: 800,
            }}
          >
            Payment Link Not Found
          </h1>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            This payment link may be invalid, expired, or no longer available.
          </p>
        </div>
      </main>
    )
  }

  const typedProduct = product as ProductRow

  if (!typedProduct.is_active) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '28px',
              color: '#0f172a',
              fontWeight: 800,
            }}
          >
            Payment Link Inactive
          </h1>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            This payment link is currently inactive.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)',
        padding: '18px 14px 30px',
      }}
    >
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '999px',
              background: '#e0e7ff',
              color: '#4338ca',
              fontWeight: 700,
              fontSize: '12px',
              marginBottom: '12px',
            }}
          >
            <span>🛡️</span>
            <span>Secure Checkout</span>
          </div>

          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: 'clamp(24px, 5vw, 34px)',
              lineHeight: 1.12,
              color: '#0f172a',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Complete Payment
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: '500px',
              color: '#64748b',
              fontSize: '14px',
              lineHeight: 1.7,
            }}
          >
            Fast and secure checkout for your order.
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '18px',
            boxShadow: '0 14px 40px rgba(15,23,42,0.08)',
            marginBottom: '14px',
            border: '1px solid #eef2f7',
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '18px',
              background:
                'linear-gradient(135deg, #dbeafe 0%, #ede9fe 45%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#475569',
              fontWeight: 700,
              fontSize: '14px',
              textAlign: 'center',
              padding: '16px',
            }}
          >
            Product image placeholder
          </div>

          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: 'clamp(24px, 5vw, 32px)',
              lineHeight: 1.1,
              color: '#0f172a',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {typedProduct.name}
          </h2>

          <p
            style={{
              margin: '0 0 12px 0',
              color: '#16a34a',
              fontWeight: 800,
              fontSize: 'clamp(24px, 4vw, 30px)',
            }}
          >
            RM {Number(typedProduct.price).toFixed(2)}
          </p>

          {typedProduct.description && (
            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px',
                lineHeight: 1.8,
              }}
            >
              {typedProduct.description}
            </p>
          )}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '18px',
            boxShadow: '0 14px 40px rgba(15,23,42,0.08)',
            border: '1px solid #eef2f7',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <PaymentBadge label="FPX" />
            <PaymentBadge label="Card" />
            <PaymentBadge label="QR" />
            <PaymentBadge label="BNPL" />
            <PaymentBadge label="Protected" />
          </div>

          <PayButton
            slug={typedProduct.slug}
            unitPrice={Number(typedProduct.price)}
          />

          <p
            style={{
              margin: '14px 0 0 0',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '12px',
              lineHeight: 1.7,
            }}
          >
            Available payment methods depend on merchant activation and gateway support.
          </p>
        </div>
      </div>
    </main>
  )
}
