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

function getSellerInitial(name: string | null) {
  if (!name) return 'S'
  return name.trim().charAt(0).toUpperCase() || 'S'
}

function getProductImages(product: ProductRow) {
  const images: string[] = []

  const pushIfValid = (value?: string | null) => {
    if (value && value.trim()) images.push(value.trim())
  }

  if (Array.isArray(product.image_urls)) {
    product.image_urls.forEach((img) => {
      if (img && img.trim()) images.push(img.trim())
    })
  }

  pushIfValid(product.product_image_url)
  pushIfValid(product.image_url)
  pushIfValid(product.image_1)
  pushIfValid(product.image_2)
  pushIfValid(product.image_3)
  pushIfValid(product.image_4)
  pushIfValid(product.image_5)

  const uniqueImages = Array.from(new Set(images)).slice(0, 5)

  if (uniqueImages.length === 0) {
    return ['__placeholder__']
  }

  return uniqueImages
}

export default function CheckoutCard({ product }: { product: ProductRow }) {
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const total = useMemo(() => Number(product.price) * quantity, [product.price, quantity])
  const productImages = getProductImages(product)
  const currentImage = productImages[currentImageIndex]

  function decreaseQty() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  function increaseQty() {
    setQuantity((prev) => prev + 1)
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
  }

  function nextImage() {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
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
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '6px',
            }}
          >
            GoBayar
          </div>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontSize: '13px',
            }}
          >
            Secure checkout
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
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '18px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 45%, #f8fafc 100%)',
              marginBottom: '16px',
            }}
          >
            {currentImage === '__placeholder__' ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                Product image placeholder
              </div>
            ) : (
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.8)',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#0f172a',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 8px 18px rgba(15,23,42,0.12)',
                  }}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.8)',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#0f172a',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 8px 18px rgba(15,23,42,0.12)',
                  }}
                >
                  ›
                </button>
              </>
            )}

            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.68), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Seller overlay */}
            <div
              style={{
                position: 'absolute',
                left: '14px',
                bottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '999px',
                  background: '#ffffff',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  border: '2px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.18)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {getSellerInitial(product.store_name)}
              </div>

              <div
                style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                }}
              >
                {product.store_name || 'Seller'}
              </div>
            </div>

            {productImages.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '14px',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                {productImages.map((_, index) => (
                  <span
                    key={index}
                    style={{
                      width: index === currentImageIndex ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '999px',
                      background: index === currentImageIndex ? '#ffffff' : 'rgba(255,255,255,0.65)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 260px' }}>
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
                {product.name}
              </h2>

              <p
                style={{
                  margin: '0 0 10px 0',
                  color: '#1d4ed8',
                  fontWeight: 800,
                  fontSize: 'clamp(20px, 4vw, 24px)',
                }}
              >
                RM {Number(product.price).toFixed(2)}
              </p>

              {product.description && (
                <p
                  style={{
                    margin: 0,
                    color: '#64748b',
                    fontSize: '14px',
                    lineHeight: 1.8,
                  }}
                >
                  {product.description}
                </p>
              )}
            </div>

            <div
              style={{
                flex: '0 0 auto',
                minWidth: '140px',
              }}
            >
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  Quantity
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'space-between',
                  }}
                >
                  <button
                    type="button"
                    onClick={decreaseQty}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#0f172a',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>

                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#0f172a',
                      minWidth: '16px',
                      textAlign: 'center',
                    }}
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQty}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#0f172a',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
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
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <PaymentBadge label="FPX" />
              <PaymentBadge label="Card" />
              <PaymentBadge label="QR" />
              <PaymentBadge label="BNPL" />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0f766e',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <span>🛡️</span>
            </div>
          </div>

          <PayButton
            slug={product.slug}
            unitPrice={Number(product.price)}
            quantity={quantity}
            total={total}
          />

          <p
            style={{
              margin: '14px 0 0 0',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '12px',
              lineHeight: 1.7,
            }}
          >
            This transaction is encrypted and secured.
          </p>
        </div>
      </div>
    </main>
  )
}
