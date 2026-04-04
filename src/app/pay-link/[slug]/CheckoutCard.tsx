'use client'

import { useMemo, useState } from 'react'
import PayButton from './PayButton'

type SellerProfile = {
  id?: string
  store_name?: string | null
  profile_image?: string | null
  email?: string | null
  whatsapp?: string | null
  company_name?: string | null
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
  store_name?: string | null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function CheckoutCard({
  product,
  seller,
}: {
  product: Product
  seller: SellerProfile | null
}) {
  const sellerName =
    seller?.store_name?.trim() ||
    product.store_name?.trim() ||
    'Seller'

  const sellerImage =
    seller?.profile_image && seller.profile_image.startsWith('http')
      ? seller.profile_image
      : ''

  const [qty, setQty] = useState(1)
  const [index, setIndex] = useState(0)
  const [sellerImageError, setSellerImageError] = useState(false)

  const images = [
    product.image_1,
    product.image_2,
    product.image_3,
    product.image_4,
    product.image_5,
  ].filter(Boolean) as string[]

  const current = images[index] || null
  const total = useMemo(() => product.price * qty, [product.price, qty])

  const shopSlug = slugify(sellerName)

  function nextImage() {
    if (images.length <= 1) return
    setIndex((prev) => (prev + 1) % images.length)
  }

  function prevImage() {
    if (images.length <= 1) return
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <main style={main}>
      <div style={container}>
        <div style={logoWrap}>
          <img
            src="/BayarLink Logo 01.svg"
            alt="bayarlink"
            style={logo}
          />
        </div>

        <div style={card}>
          <div style={imageBox}>
            {current ? (
              <img src={current} alt={product.name} style={img} />
            ) : (
              <div style={placeholder}>No image available</div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  style={leftArrow}
                  aria-label="Previous image"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  style={rightArrow}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <div style={gradient} />

            <div style={sellerOverlay}>
              {sellerImage && !sellerImageError ? (
                <img
                  src={sellerImage}
                  alt={sellerName}
                  style={sellerImg}
                  onError={() => setSellerImageError(true)}
                />
              ) : (
                <div style={sellerFallback}>
                  {sellerName.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={sellerInfo}>
                <div style={sellerNameStyle}>{sellerName}</div>
                {seller?.email ? (
                  <div style={sellerEmail}>{seller.email}</div>
                ) : null}
              </div>
            </div>
          </div>

          <div style={row}>
            <div style={productInfo}>
              <h2 style={title}>{product.name}</h2>
              <p style={price}>RM {product.price.toFixed(2)}</p>
              <p style={desc}>{product.description || 'No description available.'}</p>
            </div>

            <div style={qtyBox}>
              <div style={qtyLabel}>Qty</div>

              <div style={qtyRow}>
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={qtyBtn}
                  aria-label="Decrease quantity"
                >
                  -
                </button>

                <span style={qtyValue}>{qty}</span>

                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  style={qtyBtn}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div style={totalBox}>
                <div style={totalLabel}>Total</div>
                <div style={totalValue}>RM {total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={card}>
          <PayButton
            productSlug={product.slug}
            shopSlug={shopSlug}
            unitPrice={product.price}
            quantity={qty}
            total={total}
          />

          <p style={footer}>This transaction is encrypted and secured.</p>

          <img
            src="/Payment%20List%20Check%20Out%20Page%2001.jpg"
            alt="Supported payment methods"
            style={paymentMethods}
          />
        </div>
      </div>
    </main>
  )
}

const main = {
  minHeight: '100vh',
  background: '#f8fafc',
  padding: 16,
} as const

const container = {
  maxWidth: 600,
  margin: '0 auto',
} as const

const logoWrap = {
  textAlign: 'center',
  marginBottom: 16,
} as const

const logo = {
  height: 44,
  margin: '0 auto',
  display: 'block',
} as const

const card = {
  background: '#fff',
  borderRadius: 20,
  padding: 16,
  marginBottom: 14,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
} as const

const imageBox = {
  position: 'relative' as const,
  width: '100%',
  aspectRatio: '16/9',
  borderRadius: 16,
  overflow: 'hidden',
  marginBottom: 14,
  background: '#e2e8f0',
} as const

const img = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  display: 'block',
} as const

const placeholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  fontWeight: 600,
} as const

const gradient = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  bottom: 0,
  height: '50%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
} as const

const sellerOverlay = {
  position: 'absolute' as const,
  left: 12,
  bottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  zIndex: 2,
} as const

const sellerImg = {
  width: 38,
  height: 38,
  borderRadius: '999px',
  objectFit: 'cover' as const,
  border: '2px solid rgba(255,255,255,0.9)',
  background: '#fff',
} as const

const sellerFallback = {
  width: 38,
  height: 38,
  borderRadius: '999px',
  background: '#fff',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  border: '2px solid rgba(255,255,255,0.9)',
} as const

const sellerInfo = {
  minWidth: 0,
} as const

const sellerNameStyle = {
  color: '#fff',
  fontWeight: 700,
  fontSize: 14,
  lineHeight: 1.2,
} as const

const sellerEmail = {
  color: '#e2e8f0',
  fontSize: 12,
  lineHeight: 1.2,
  marginTop: 2,
  wordBreak: 'break-word' as const,
} as const

const leftArrow = {
  position: 'absolute' as const,
  left: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 32,
  height: 32,
  borderRadius: '999px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  cursor: 'pointer',
  zIndex: 2,
} as const

const rightArrow = {
  position: 'absolute' as const,
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 32,
  height: 32,
  borderRadius: '999px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  cursor: 'pointer',
  zIndex: 2,
} as const

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
} as const

const productInfo = {
  flex: 1,
  minWidth: 0,
} as const

const title = {
  fontSize: 26,
  fontWeight: 800,
  margin: '0 0 6px 0',
  color: '#0f172a',
} as const

const price = {
  color: '#1d4ed8',
  fontWeight: 800,
  fontSize: 20,
  margin: '0 0 8px 0',
} as const

const desc = {
  fontSize: 14,
  color: '#64748b',
  margin: 0,
  lineHeight: 1.7,
} as const

const qtyBox = {
  background: '#f1f5f9',
  padding: '12px 14px',
  borderRadius: 14,
  minWidth: 130,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
} as const

const qtyLabel = {
  fontSize: 12,
  color: '#64748b',
  textAlign: 'center' as const,
  marginBottom: 8,
  fontWeight: 600,
} as const

const qtyRow = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'center',
} as const

const qtyBtn = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  color: '#0f172a',
} as const

const qtyValue = {
  minWidth: 18,
  textAlign: 'center' as const,
  fontWeight: 700,
  color: '#0f172a',
} as const

const totalBox = {
  marginTop: 10,
  textAlign: 'center' as const,
} as const

const totalLabel = {
  fontSize: 11,
  color: '#64748b',
  fontWeight: 600,
} as const

const totalValue = {
  fontSize: 15,
  color: '#0f172a',
  fontWeight: 800,
  marginTop: 2,
} as const

const footer = {
  textAlign: 'center' as const,
  fontSize: 12,
  color: '#64748b',
  margin: '10px 0',
} as const

const paymentMethods = {
  width: '100%',
  maxWidth: 220,
  display: 'block',
  margin: '0 auto',
} as const
