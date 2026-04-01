import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

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
          background: '#f5f7fb',
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
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
              color: '#111827',
              fontWeight: 800,
            }}
          >
            Payment Link Not Found
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
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
          background: '#f5f7fb',
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
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
              color: '#111827',
              fontWeight: 800,
            }}
          >
            Payment Link Inactive
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
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
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        padding: '28px 20px',
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
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              color: '#16a34a',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '1px',
            }}
          >
            SECURE PAYMENT LINK
          </p>

          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '38px',
              lineHeight: 1.1,
              color: '#111827',
              fontWeight: 800,
            }}
          >
            Complete Your Payment
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: '560px',
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: 1.7,
            }}
          >
            Fast, secure and simple checkout for your order.
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 14px 40px rgba(0,0,0,0.08)',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              color: '#6b7280',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            ORDER SUMMARY
          </p>

          <h2
            style={{
              margin: '0 0 12px 0',
              fontSize: '34px',
              lineHeight: 1.15,
              color: '#111827',
              fontWeight: 800,
            }}
          >
            {typedProduct.name}
          </h2>

          <p
            style={{
              margin: '0 0 16px 0',
              color: '#16a34a',
              fontWeight: 800,
              fontSize: '30px',
            }}
          >
            RM {Number(typedProduct.price).toFixed(2)}
          </p>

          {typedProduct.store_name && (
            <p
              style={{
                margin: '0 0 14px 0',
                color: '#111827',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Sold by {typedProduct.store_name}
            </p>
          )}

          {typedProduct.description && (
            <p
              style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '16px',
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
            padding: '32px',
            boxShadow: '0 14px 40px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ecfdf5',
              color: '#15803d',
              borderRadius: '999px',
              padding: '8px 14px',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <span>🔒</span>
            <span>Secure Checkout</span>
          </div>

          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '28px',
              color: '#111827',
              fontWeight: 800,
            }}
          >
            Pay Securely Now
          </h3>

          <p
            style={{
              margin: '0 auto 24px auto',
              maxWidth: '520px',
              color: '#6b7280',
              fontSize: '15px',
              lineHeight: 1.8,
            }}
          >
            You will be redirected to our secure payment partner to complete your payment using
            FPX, card or Buy Now Pay Later.
          </p>

          <Link
            href="/api/payments/bayarcash/create"
            style={{
              display: 'inline-block',
              width: '100%',
              maxWidth: '420px',
              padding: '16px 22px',
              borderRadius: '14px',
              background: '#16a34a',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 800,
              boxShadow: '0 10px 20px rgba(22,163,74,0.22)',
            }}
          >
            Proceed to Secure Payment
          </Link>

          <p
            style={{
              margin: '18px 0 0 0',
              color: '#9ca3af',
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            Powered by Bayarcash • Automatic payment capture • No manual receipt required
          </p>
        </div>
      </div>
    </main>
  )
}
