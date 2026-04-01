import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

type ProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  qr_payment_image_url: string | null
  seller_profile_id: string
  is_active: boolean
  store_name: string | null
  contact_phone: string | null
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
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
              color: '#111827',
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
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
              color: '#111827',
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

  const whatsappPhone = typedProduct.contact_phone || ''
  const whatsappMessage = `Hi, I have made payment for ${typedProduct.name} (RM ${Number(
    typedProduct.price
  ).toFixed(2)}). I will send my payment receipt shortly.`

  const whatsappLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : '#'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.6px',
            }}
          >
            PAYMENT PAGE
          </p>

          <h1
            style={{
              margin: '10px 0 10px 0',
              fontSize: '38px',
              lineHeight: 1.1,
              color: '#111827',
            }}
          >
            {typedProduct.name}
          </h1>

          <p
            style={{
              margin: '0 0 10px 0',
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '28px',
            }}
          >
            RM {Number(typedProduct.price).toFixed(2)}
          </p>

          {typedProduct.store_name && (
            <p
              style={{
                margin: '0 0 10px 0',
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
                lineHeight: 1.7,
                maxWidth: '720px',
              }}
            >
              {typedProduct.description}
            </p>
          )}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 18px 0',
              fontSize: '24px',
              color: '#111827',
            }}
          >
            Payment Details
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px 0',
                  color: '#6b7280',
                  fontSize: '13px',
                }}
              >
                Bank Name
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}
              >
                {typedProduct.bank_name || '-'}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 6px 0',
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
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}
              >
                {typedProduct.account_name || '-'}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 6px 0',
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
                  lineHeight: 1.6,
                }}
              >
                {typedProduct.account_number || '-'}
              </p>
            </div>
          </div>

          {typedProduct.qr_payment_image_url && (
            <div
              style={{
                marginTop: '24px',
              }}
            >
              <p
                style={{
                  margin: '0 0 10px 0',
                  color: '#111827',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                QR Payment
              </p>

              <img
                src={typedProduct.qr_payment_image_url}
                alt="QR Payment"
                style={{
                  width: '260px',
                  maxWidth: '100%',
                  display: 'block',
                  borderRadius: '14px',
                  border: '1px solid #e5e7eb',
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h2
            style={{
              margin: '0 0 14px 0',
              fontSize: '24px',
              color: '#111827',
            }}
          >
            Next Step
          </h2>

          <p
            style={{
              margin: '0 0 18px 0',
              color: '#6b7280',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            Complete your bank transfer or QR payment, then send your payment receipt to the seller for verification.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {whatsappPhone ? (
              <Link
                href={whatsappLink}
                target="_blank"
                style={{
                  display: 'inline-block',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#16a34a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Send Receipt on WhatsApp
              </Link>
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: 700,
                }}
              >
                Seller contact not available
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
