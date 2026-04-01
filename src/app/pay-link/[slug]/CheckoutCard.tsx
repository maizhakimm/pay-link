'use client'

import { useMemo, useState } from 'react'
import PayButton from './PayButton'

type ProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  store_name: string | null
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
}

function getImages(product: ProductRow) {
  const arr = [
    product.image_1,
    product.image_2,
    product.image_3,
    product.image_4,
    product.image_5,
  ].filter(Boolean) as string[]

  return arr.length ? arr : ['__placeholder__']
}

export default function CheckoutCard({ product }: { product: ProductRow }) {
  const [qty, setQty] = useState(1)
  const [index, setIndex] = useState(0)

  const images = getImages(product)
  const current = images[index]

  const total = useMemo(() => product.price * qty, [product.price, qty])

  function next() {
    setIndex((prev) => (prev + 1) % images.length)
  }

  function prev() {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <main style={main}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
            alt="GoBayar"
            style={{ height: 44, margin: '0 auto', display: 'block' }}
          />
        </div>

        <div style={card}>
          <div style={imageBox}>
            {current === '__placeholder__' ? (
              <div style={placeholder}>Product image</div>
            ) : (
              <img src={current} alt="product" style={img} />
            )}

            {images.length > 1 && (
              <>
                <button type="button" style={leftArrow} onClick={prev}>
                  ‹
                </button>
                <button type="button" style={rightArrow} onClick={next}>
                  ›
                </button>
              </>
            )}

            <div style={gradient} />

            <div style={seller}>
              <div style={avatar}>{product.store_name?.charAt(0) || 'S'}</div>
              <span style={{ color: '#fff', fontWeight: 700 }}>{product.store_name}</span>
            </div>
          </div>

          <div style={row}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={title}>{product.name}</h2>
              <p style={price}>RM {product.price.toFixed(2)}</p>
              <p style={desc}>{product.description}</p>
            </div>

            <div style={qtyBox}>
              <div style={qtyLabel}>Qty</div>
              <div style={qtyRow}>
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={qtyButton}
                >
                  -
                </button>

                <span style={qtyValue}>{qty}</span>

                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  style={qtyButton}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={card}>
          <PayButton slug={product.slug} unitPrice={product.price} quantity={qty} total={total} />

          <p style={footerText}>This transaction is encrypted and secured.</p>

          <div style={{ textAlign: 'center' }}>
            <img
              src="/Payment%20List%20Check%20Out%20Page%2001.jpg"
              alt="payments"
              style={{
                width: '100%',
                maxWidth: 220,
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

/* STYLES */
const main = {
  minHeight: '100vh',
  background: '#f8fafc',
  padding: 16,
}

const card = {
  background: '#fff',
  borderRadius: 20,
  padding: 16,
  marginBottom: 14,
}

const imageBox = {
  position: 'relative' as const,
  width: '100%',
  aspectRatio: '16/9',
  borderRadius: 16,
  overflow: 'hidden',
  marginBottom: 14,
}

const img = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
}

const placeholder = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
}

const gradient = {
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  height: '50%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
}

const seller = {
  position: 'absolute' as const,
  bottom: 12,
  left: 12,
  display: 'flex',
  gap: 8,
  alignItems: 'center',
}

const avatar = {
  width: 32,
  height: 32,
  borderRadius: 999,
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
}

const leftArrow = {
  position: 'absolute' as const,
  left: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '50%',
  width: 32,
  height: 32,
  cursor: 'pointer',
}

const rightArrow = {
  position: 'absolute' as const,
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '50%',
  width: 32,
  height: 32,
  cursor: 'pointer',
}

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
}

const title = {
  fontSize: 26,
  fontWeight: 800,
  marginBottom: 6,
}

const price = {
  color: '#1d4ed8',
  fontWeight: 800,
  fontSize: 20,
  marginBottom: 8,
}

const desc = {
  fontSize: 14,
  color: '#64748b',
  margin: 0,
}

const qtyBox = {
  background: '#f1f5f9',
  padding: '12px 14px',
  borderRadius: 14,
  minWidth: 120,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
}

const qtyLabel = {
  fontSize: 12,
  color: '#64748b',
  textAlign: 'center' as const,
  marginBottom: 8,
  fontWeight: 600,
}

const qtyRow = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'center',
}

const qtyButton = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  color: '#0f172a',
}

const qtyValue = {
  minWidth: 18,
  textAlign: 'center' as const,
  fontWeight: 700,
  color: '#0f172a',
}

const footerText = {
  textAlign: 'center' as const,
  fontSize: 12,
  color: '#64748b',
  margin: '10px 0',
}
