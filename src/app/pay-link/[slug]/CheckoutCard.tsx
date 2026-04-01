'use client'

import { useMemo, useState } from 'react'
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
  product_image_url?: string | null
  image_url?: string | null
  image_urls?: string[] | null
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
}

function getSellerInitial(name: string | null) {
  if (!name) return 'S'
  return name.trim().charAt(0).toUpperCase()
}

function getProductImages(product: ProductRow) {
  const images: string[] = []

  const push = (v?: string | null) => {
    if (v && v.trim()) images.push(v.trim())
  }

  if (Array.isArray(product.image_urls)) {
    product.image_urls.forEach(push)
  }

  push(product.product_image_url)
  push(product.image_url)
  push(product.image_1)
  push(product.image_2)
  push(product.image_3)
  push(product.image_4)
  push(product.image_5)

  const unique = Array.from(new Set(images)).slice(0, 5)

  return unique.length ? unique : ['__placeholder__']
}

export default function CheckoutCard({ product }: { product: ProductRow }) {
  const [quantity, setQuantity] = useState(1)
  const [index, setIndex] = useState(0)

  const images = getProductImages(product)
  const currentImage = images[index]

  const total = useMemo(() => product.price * quantity, [product.price, quantity])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)',
        padding: '18px 14px 30px',
      }}
    >
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
            style={{ height: '42px' }}
          />
        </div>

        {/* PRODUCT CARD */}
        <div style={card}>
          {/* IMAGE */}
          <div style={imageBox}>
            {currentImage === '__placeholder__' ? (
              <div style={placeholder}>Product image</div>
            ) : (
              <img src={currentImage} style={imgStyle} />
            )}

            {/* overlay */}
            <div style={gradient} />

            {/* seller */}
            <div style={sellerBox}>
              <div style={avatar}>
                {getSellerInitial(product.store_name)}
              </div>
              <div style={sellerName}>
                {product.store_name || 'Seller'}
              </div>
            </div>

            {/* dots */}
            {images.length > 1 && (
              <div style={dots}>
                {images.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: i === index ? 20 : 8,
                      height: 8,
                      borderRadius: 999,
                      background: '#fff',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div style={infoRow}>
            <div style={{ flex: 1 }}>
              <h2 style={title}>{product.name}</h2>
              <p style={price}>RM {product.price.toFixed(2)}</p>

              {product.description && (
                <p style={desc}>{product.description}</p>
              )}
            </div>

            {/* QUANTITY */}
            <div style={qtyBox}>
              <div style={qtyLabel}>Quantity</div>
              <div style={qtyRow}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div style={card}>
          <PayButton
            slug={product.slug}
            unitPrice={product.price}
            quantity={quantity}
            total={total}
          />

          <p style={footerText}>
            This transaction is encrypted and secured.
          </p>

          {/* PAYMENT IMAGE */}
          <div style={{ textAlign: 'center' }}>
            <img
              src="/Payment%20List%20Check%20Out%20Page%2001.jpg"
              style={{ maxWidth: '220px', width: '100%' }}
            />
          </div>
        </div>

      </div>
    </main>
  )
}

/* STYLES */
const card = {
  background: '#fff',
  borderRadius: 24,
  padding: 18,
  marginBottom: 14,
  border: '1px solid #eef2f7',
}

const imageBox = {
  position: 'relative' as const,
  width: '100%',
  aspectRatio: '16/9',
  borderRadius: 18,
  overflow: 'hidden',
  marginBottom: 16,
}

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
}

const placeholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const gradient = {
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  height: '50%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
}

const sellerBox = {
  position: 'absolute' as const,
  bottom: 14,
  left: 14,
  display: 'flex',
  gap: 10,
  alignItems: 'center',
}

const avatar = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
}

const sellerName = {
  color: '#fff',
  fontWeight: 700,
}

const dots = {
  position: 'absolute' as const,
  bottom: 14,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 6,
}

const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap' as const,
}

const title = {
  fontSize: 28,
  fontWeight: 800,
  marginBottom: 6,
}

const price = {
  color: '#1d4ed8',
  fontWeight: 800,
  fontSize: 22,
}

const desc = {
  color: '#64748b',
  fontSize: 14,
}

const qtyBox = {
  background: '#f8fafc',
  padding: 12,
  borderRadius: 14,
}

const qtyLabel = {
  fontSize: 12,
  marginBottom: 6,
}

const qtyRow = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
}

const footerText = {
  textAlign: 'center' as const,
  fontSize: 12,
  color: '#64748b',
  margin: '12px 0',
}
