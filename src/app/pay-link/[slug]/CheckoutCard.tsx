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

        {/* LOGO CENTER */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
            alt="GoBayar"
            style={{ height: 44, margin: '0 auto', display: 'block' }}
          />
        </div>

        {/* PRODUCT CARD */}
        <div style={card}>

          {/* IMAGE CAROUSEL */}
          <div style={imageBox}>
            {current === '__placeholder__' ? (
              <div style={placeholder}>Product image</div>
            ) : (
              <img src={current} alt="product" style={img} />
            )}

            {/* arrows */}
            {images.length > 1 && (
              <>
                <button style={leftArrow} onClick={prev}>‹</button>
                <button style={rightArrow} onClick={next}>›</button>
              </>
            )}

            {/* gradient */}
            <div style={gradient} />

            {/* seller */}
            <div style={seller}>
              <div style={avatar}>
                {product.store_name?.charAt(0) || 'S'}
              </div>
              <span style={{ color: '#fff', fontWeight: 700 }}>
                {product.store_name}
              </span>
            </div>
          </div>

          {/* INFO */}
          <div style={row}>
            <div>
              <h2 style={title}>{product.name}</h2>
              <p style={price}>RM {product.price.toFixed(2)}</p>
              <p style={desc}>{product.description}</p>
            </div>

            {/* QTY */}
            <div style={qtyBox}>
              <div style={{ fontSize: 12 }}>Qty</div>
              <div style={qtyRow}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div style={card}>
          <PayButton slug={product.slug} unitPrice={product.price} quantity={qty} total={total} />

          <p style={footerText}>
            This transaction is encrypted and secured.
          </p>

          {/* CENTER PAYMENT IMAGE */}
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
  borderRadius: '50%',
  width: 32,
  height: 32,
}

const rightArrow = {
  position: 'absolute' as const,
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#fff',
  borderRadius: '50%',
  width: 32,
  height: 32,
}

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
}

const title = {
  fontSize: 26,
  fontWeight: 800,
}

const price = {
  color: '#1d4ed8',
  fontWeight: 800,
  fontSize: 20,
}

const desc = {
  fontSize: 14,
  color: '#64748b',
}

const qtyBox = {
  background: '#f1f5f9',
  padding: 10,
  borderRadius: 12,
}

const qtyRow = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
}

const footerText = {
  textAlign: 'center' as const,
  fontSize: 12,
  color: '#64748b',
  margin: '10px 0',
}
