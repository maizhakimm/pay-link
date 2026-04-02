'use client'

import { useMemo, useState } from 'react'
import PayButton from './PayButton'

export default function CheckoutCard({ product }: any) {
  const seller = product.seller_profiles || {}

  const [qty, setQty] = useState(1)
  const [index, setIndex] = useState(0)

  const images = [
    product.image_1,
    product.image_2,
    product.image_3,
    product.image_4,
    product.image_5,
  ].filter(Boolean)

  const current = images[index] || null

  const total = useMemo(() => product.price * qty, [product.price, qty])

  return (
    <main style={main}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
            style={{ height: 44 }}
          />
        </div>

        {/* PRODUCT */}
        <div style={card}>
          <div style={imageBox}>
            {current ? (
              <img src={current} style={img} />
            ) : (
              <div style={placeholder}>No Image</div>
            )}

            {/* SELLER OVERLAY */}
            <div style={sellerOverlay}>
              {seller.profile_image ? (
                <img src={seller.profile_image} style={sellerImg} />
              ) : (
                <div style={sellerFallback}>
                  {seller.store_name?.charAt(0) || 'S'}
                </div>
              )}

              <div>
                <div style={sellerName}>
                  {seller.store_name || 'Seller'}
                </div>
                {seller.email && (
                  <div style={sellerEmail}>{seller.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <h2 style={title}>{product.name}</h2>
              <p style={price}>RM {product.price.toFixed(2)}</p>
              <p style={desc}>{product.description}</p>
            </div>

            {/* QTY */}
            <div style={qtyBox}>
              <div style={qtyLabel}>Qty</div>
              <div style={qtyRow}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtn}>-</button>
                <span style={qtyValue}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={qtyBtn}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div style={card}>
          <PayButton
            slug={product.slug}
            unitPrice={product.price}
            quantity={qty}
            total={total}
          />

          <p style={footer}>This transaction is encrypted and secured.</p>

          <img
            src="/Payment%20List%20Check%20Out%20Page%2001.jpg"
            style={{ width: 200, margin: '0 auto', display: 'block' }}
          />
        </div>
      </div>
    </main>
  )
}

/* STYLES */
const main = { minHeight: '100vh', background: '#f8fafc', padding: 16 }

const card = {
  background: '#fff',
  borderRadius: 20,
  padding: 16,
  marginBottom: 14,
}

const imageBox = {
  position: 'relative',
  aspectRatio: '16/9',
  borderRadius: 16,
  overflow: 'hidden',
}

const img = { width: '100%', height: '100%', objectFit: 'cover' }

const placeholder = { display: 'flex', alignItems: 'center', justifyContent: 'center' }

const sellerOverlay = {
  position: 'absolute',
  bottom: 10,
  left: 10,
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  background: 'rgba(0,0,0,0.5)',
  padding: '8px 10px',
  borderRadius: 12,
}

const sellerImg = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  objectFit: 'cover',
}

const sellerFallback = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
}

const sellerName = { color: '#fff', fontWeight: 700 }
const sellerEmail = { color: '#cbd5f5', fontSize: 12 }

const row = { display: 'flex', justifyContent: 'space-between', marginTop: 10 }

const title = { fontSize: 24, fontWeight: 800 }
const price = { color: '#1d4ed8', fontWeight: 800 }
const desc = { fontSize: 14, color: '#64748b' }

const qtyBox = {
  background: '#f1f5f9',
  padding: 12,
  borderRadius: 12,
  textAlign: 'center',
}

const qtyRow = { display: 'flex', gap: 8, justifyContent: 'center' }
const qtyBtn = { padding: '4px 10px', cursor: 'pointer' }
const qtyValue = { fontWeight: 700 }

const qtyLabel = { fontSize: 12, marginBottom: 6 }

const footer = {
  textAlign: 'center',
  fontSize: 12,
  color: '#64748b',
  margin: '10px 0',
}
