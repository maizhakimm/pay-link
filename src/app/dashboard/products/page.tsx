'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

type SellerProfile = {
  id: string
  user_id: string
  store_name: string | null
  store_slug: string | null
  contact_phone: string | null
  bank_name: string | null
  account_name: string | null
  account_number: string | null
}

type Product = {
  id: string
  seller_profile_id: string
  name: string
  slug: string
  description: string | null
  price: number
  product_image_url: string | null
  qr_payment_image_url: string | null
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function formatPrice(value: string | number) {
  const num = Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

export default function DashboardProductsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  const appBaseUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return window.location.origin
  }, [])

  const loadProductsPage = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    const { data: sellerProfile, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (sellerError) {
      alert(`Failed to load seller profile: ${sellerError.message}`)
      setLoading(false)
      return
    }

    if (!sellerProfile) {
      alert('Please complete Store Settings first')
      router.push('/dashboard/settings')
      return
    }

    setSeller(sellerProfile)

    const { data: productRows, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_profile_id', sellerProfile.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      alert(`Failed to load payment links: ${productsError.message}`)
      setLoading(false)
      return
    }

    setProducts(productRows || [])
    setLoading(false)
  }

  useEffect(() => {
    loadProductsPage()
  }, [])

  const handleCreateProduct = async () => {
    if (!seller) {
      alert('Please complete Store Settings first')
      router.push('/dashboard/settings')
      return
    }

    if (!name.trim()) {
      alert('Product name is required')
      return
    }

    if (!price.trim()) {
      alert('Price is required')
      return
    }

    const numericPrice = Number(price)
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid price')
      return
    }

    setSaving(true)

    const baseSlug = slugify(name)
    const uniqueSlug = `${baseSlug}-${Date.now()}`

    const { error } = await supabase.from('products').insert({
      seller_profile_id: seller.id,
      name: name.trim(),
      slug: uniqueSlug,
      description: description.trim() || null,
      price: numericPrice,
      product_image_url: null,
      qr_payment_image_url: null,
      bank_name: seller.bank_name || null,
      account_name: seller.account_name || null,
      account_number: seller.account_number || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    setSaving(false)

    if (error) {
      alert(`Failed to create payment link: ${error.message}`)
      return
    }

    alert('Payment link created successfully')
    setName('')
    setPrice('')
    setDescription('')
    loadProductsPage()
  }

  const handleCopy = async (link: string) => {
    await navigator.clipboard.writeText(link)
    alert('Payment link copied')
  }

  if (loading) {
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
            background: '#ffffff',
            padding: '24px 28px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            fontWeight: 600,
            color: '#111827',
          }}
        >
          Loading payment links...
        </div>
      </main>
    )
  }

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
          maxWidth: '1100px',
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
            PAYMENT LINKS
          </p>

          <h1
            style={{
              margin: '10px 0 10px 0',
              fontSize: '38px',
              lineHeight: 1.1,
              color: '#111827',
            }}
          >
            Create Payment Link
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: 1.7,
              maxWidth: '760px',
            }}
          >
            Create a payment link for your customer and share it instantly for bank transfer or QR payment.
          </p>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Product / Payment Title
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kuih Koci / Website Deposit"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  color: '#111827',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Amount (RM)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 39.00"
                inputMode="decimal"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  color: '#111827',
                }}
              />
            </div>

            <div
              style={{
                gridColumn: '1 / -1',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for the payment page"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  color: '#111827',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleCreateProduct}
              disabled={saving}
              style={{
                padding: '14px 20px',
                border: 'none',
                borderRadius: '12px',
                background: '#111827',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Creating...' : 'Create Payment Link'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '14px 20px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#111827',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
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
              marginTop: 0,
              marginBottom: '18px',
              fontSize: '24px',
              color: '#111827',
            }}
          >
            Your Payment Links
          </h2>

          {products.length === 0 ? (
            <p
              style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '15px',
                lineHeight: 1.7,
              }}
            >
              No payment links yet. Create your first payment link above.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '16px',
              }}
            >
              {products.map((product) => {
                const link = `${appBaseUrl}/pay-link/${product.slug}`

                return (
                  <div
                    key={product.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'grid',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: '0 0 6px 0',
                            fontSize: '18px',
                            color: '#111827',
                          }}
                        >
                          {product.name}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            color: '#16a34a',
                            fontWeight: 700,
                            fontSize: '15px',
                          }}
                        >
                          RM {formatPrice(product.price)}
                        </p>
                      </div>

                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: product.is_active ? '#dcfce7' : '#f3f4f6',
                          color: product.is_active ? '#166534' : '#6b7280',
                        }}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {product.description && (
                      <p
                        style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: '14px',
                          lineHeight: 1.7,
                        }}
                      >
                        {product.description}
                      </p>
                    )}

                    <div
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px',
                        wordBreak: 'break-all',
                        fontSize: '14px',
                        color: '#111827',
                      }}
                    >
                      {link}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: '#16a34a',
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontWeight: 700,
                        }}
                      >
                        Open Link
                      </a>

                      <button
                        onClick={() => handleCopy(link)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          background: '#ffffff',
                          color: '#111827',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
