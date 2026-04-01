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
            padding: '36px',
            boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              borderRadius: '999px',
              background: '#eef2ff',
              color: '#4338ca',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '14px',
            }}
          >
            Neugens Pay
          </div>

          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
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
              fontSize: '16px',
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
            padding: '36px',
            boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              borderRadius: '999px',
              background: '#eef2ff',
              color: '#4338ca',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '14px',
            }}
          >
            Neugens Pay
          </div>

          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
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
              fontSize: '16px',
              lineHeight: 1.7,
            }}
          >
            This payment link is currently inactive. Please contact the seller for assistance.
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
        padding: '20px 16px 32px',
      }}
    >
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              borderRadius: '999px',
              background: '#e0e7ff',
              color: '#4338ca',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '14px',
            }}
          >
            Neugens Pay
          </div>

          <h1
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(32px, 6vw, 48px)',
              lineHeight: 1.08,
              color: '#0f172a',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Secure Checkout
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: '560px',
              color: '#64748b',
              fontSize: '16px',
              lineHeight: 1.7,
            }}
          >
            Fast, simple and secure payment for your order.
          </p>
        </div>

        {/* Order Summary */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 14px 40px rgba(15,23,42,0.08)',
            marginBottom: '16px',
            border: '1px solid #eef2f7',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '7px 12px',
              borderRadius: '999px',
              background: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '12px',
              marginBottom: '14px',
              letterSpacing: '0.03em',
            }}
          >
            ORDER SUMMARY
          </div>

          <h2
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(30px, 5vw, 40px)',
              lineHeight: 1.08,
              color: '#0f172a',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {typedProduct.name}
          </h2>

          <p
            style={{
              margin: '0 0 14px 0',
              color: '#16a34a',
              fontWeight: 800,
              fontSize: 'clamp(28px, 5vw, 36px)',
            }}
          >
            RM {Number(typedProduct.price).toFixed(2)}
          </p>

          <div
            style={{
              display: 'grid',
              gap: '10px',
              marginBottom: typedProduct.description ? '14px' : 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  minWidth: '74px',
                }}
              >
                Sold by
              </span>
              <span
                style={{
                  color: '#0f172a',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                {typedProduct.store_name || 'Seller'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  minWidth: '74px',
                }}
              >
                Checkout
              </span>
              <span
                style={{
                  color: '#0f172a',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                Processed by Neugens Pay
              </span>
            </div>
          </div>

          {typedProduct.description && (
            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '15px',
                lineHeight: 1.8,
              }}
            >
              {typedProduct.description}
            </p>
          )}
        </div>

        {/* Checkout Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 14px 40px rgba(15,23,42,0.08)',
            border: '1px solid #eef2f7',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ecfeff',
              color: '#0f766e',
              borderRadius: '999px',
              padding: '8px 14px',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <span>🔒</span>
            <span>Secure payment</span>
          </div>

          <h3
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(28px, 5vw, 36px)',
              color: '#0f172a',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Complete Payment
          </h3>

          <p
            style={{
              margin: '0 0 18px 0',
              color: '#64748b',
              fontSize: '15px',
              lineHeight: 1.8,
            }}
          >
            Enter your details below and continue to our secure payment partner to pay
            using FPX, card or Buy Now Pay Later.
          </p>

          <div
            style={{
              display: 'grid',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#334155',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
              <span>Sold by {typedProduct.store_name || 'Seller'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#334155',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
              <span>Payments processed securely by Neugens Pay</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#334155',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
              <span>Your order record is captured automatically after checkout</span>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '18px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '18px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px 0',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              Before you continue
            </p>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px',
                lineHeight: 1.7,
              }}
            >
              You may see <strong>Neugens Pay</strong> / <strong>Neugens Solution</strong> as
              the payment merchant on the next page because payment is processed by our platform
              on behalf of the seller.
            </p>
          </div>

          <PayButton slug={typedProduct.slug} />

          <p
            style={{
              margin: '16px 0 0 0',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            Secure checkout powered by Neugens Pay
          </p>
        </div>
      </div>
    </main>
  )
}
