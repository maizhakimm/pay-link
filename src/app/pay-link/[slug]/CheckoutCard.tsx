'use client'

import { useMemo, useState } from 'react'

type Props = {
  product: any
  seller?: any
}

export default function CheckoutCard({ product, seller }: Props) {
  const [qty, setQty] = useState(1)

  const images: string[] = [
    product.image_url,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4,
    product.image_url_5,
  ].filter(Boolean)

  const current = images[0] || null

  const total = useMemo(() => product.price * qty, [product.price, qty])

  return (
    <main style={main}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
            alt="GoBayar"
            style={{ height: 44 }}
          />
        </div>

        {/* PRODUCT */}
        <div style={card}>
          <div style={imageBox}>
            {current ? (
              <img src={current} alt="product" style={img} />
            ) : (
              <div style={placeholder}>No Image</div>
            )}

            {/* SELLER */}
            <div style={sellerOverlay}>
              {seller?.profile_image ? (
                <img src={seller.profile_image} style={sellerImg} />
              ) : (
                <div style={sellerFallback}>
                  {seller?.store_name?.charAt(0) || 'S'}
                </div>
              )}

              <div>
                <div style={sellerName}>
                  {seller?.store_name || 'Seller'}
                </div>
                {seller?.email && (
                  <div style={sellerEmail}>{seller.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* INFO */}
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
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={qtyBtn}
                >
                  -
                </button>

                <span style={qtyValue}>{qty}</span>

                <button
                  onClick={() => setQty(qty + 1)}
                  style={qtyBtn}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div style={card}>
          <button style={payBtn}>
            Pay RM {total.toFixed(2)}
          </button>

          <p style={footer}>
            This transaction is encrypted and secured.
          </p>

          <img
            src="/Payment%20List%20Check%20Out%20Page%2001.jpg"
            alt="payment methods"
            style={{ width: 200, margin: '0 auto', display: 'block' }}
          />
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
  padding: 16,
  borderRadius: 16,
  marginBottom: 16,
  border: '1px solid #e2e8f0',
}

const imageBox = {
  position: 'relative' as const,
  marginBottom: 12,
}

const img = {
  width: '100%',
  borderRadius: 12,
}

const placeholder = {
  height: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#e2e8f0',
  borderRadius: 12,
}

const sellerOverlay = {
  position: 'absolute' as const,
  bottom: 10,
  left: 10,
  background: 'rgba(255,255,255,0.9)',
  padding: '6px 10px',
  borderRadius: 10,
  display: 'flex',
  gap: 8,
  alignItems: 'center',
}

const sellerImg = {
  width: 28,
  height: 28,
  borderRadius: '50%',
}

const sellerFallback = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: '#0ea5e9',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const sellerName = {
  fontSize: 12,
  fontWeight: 600,
}

const sellerEmail = {
  fontSize: 10,
  color: '#64748b',
}

const row = {
  display: 'flex',
  gap: 12,
}

const title = {
  fontSize: 18,
  fontWeight: 700,
}

const price = {
  fontSize: 16,
  fontWeight: 600,
  margin: '4px 0',
}

const desc = {
  fontSize: 13,
  color: '#64748b',
}

const qtyBox = {
  width: 100,
}

const qtyLabel = {
  fontSize: 12,
  marginBottom: 4,
}

const qtyRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const qtyBtn = {
  padding: '4px 8px',
  cursor: 'pointer',
}

const qtyValue = {
  minWidth: 20,
  textAlign: 'center' as const,
}

const payBtn = {
  width: '100%',
  padding: '12px',
  background: '#0ea5e9',
  color: '#fff',
  borderRadius: 10,
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
}

const footer = {
  fontSize: 12,
  color: '#64748b',
  margin: '10px 0',
}    product.image_4,
    product.image_5,
  ].filter(Boolean) as string[]

  const current = images[index] || null
  const total = useMemo(() => product.price * qty, [product.price, qty])

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
            src="/GoBayar%20Logo%2001%20800px.svg"
            alt="GoBayar"
            style={logo}
          />
        </div>

        <div style={card}>
          <div style={imageBox}>
            {current ? (
              <img
                src={current}
                alt={product.name}
                style={img}
              />
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
              {seller.profile_image ? (
                <img
                  src={seller.profile_image}
                  alt={seller.store_name || 'Seller profile'}
                  style={sellerImg}
                />
              ) : (
                <div style={sellerFallback}>
                  {seller.store_name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              )}

              <div style={sellerInfo}>
                <div style={sellerName}>{seller.store_name || 'Seller'}</div>
                {seller.email ? (
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
            slug={product.slug}
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

/* styles */
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

const sellerName = {
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
} as const  ].filter(Boolean) as string[]

  const current = images[0] || null

  const total = useMemo(() => product.price * qty, [product.price, qty])

  return (
    <main style={main}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
            alt="GoBayar"
            style={{ height: 44 }}
          />
        </div>

        {/* PRODUCT */}
        <div style={card}>
          <div style={imageBox}>
            {current ? (
              <img src={current} alt="product" style={img} />
            ) : (
              <div style={placeholder}>No Image</div>
            )}

            {/* SELLER */}
            <div style={sellerOverlay}>
              {seller.profile_image ? (
                <img
                  src={seller.profile_image}
                  alt="seller"
                  style={sellerImg}
                />
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

          {/* INFO */}
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
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={qtyBtn}
                >
                  -
                </button>

                <span style={qtyValue}>{qty}</span>

                <button
                  onClick={() => setQty(qty + 1)}
                  style={qtyBtn}
                >
                  +
                </button>
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
            alt="payment methods"
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
  position: 'relative' as const,
  aspectRatio: '16/9',
  borderRadius: 16,
  overflow: 'hidden',
}

const img = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
}

const placeholder = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const sellerOverlay = {
  position: 'absolute' as const,
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
  objectFit: 'cover' as const,
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

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 10,
}

const title = { fontSize: 24, fontWeight: 800 }
const price = { color: '#1d4ed8', fontWeight: 800 }
const desc = { fontSize: 14, color: '#64748b' }

const qtyBox = {
  background: '#f1f5f9',
  padding: 12,
  borderRadius: 12,
  textAlign: 'center' as const,
}

const qtyRow = {
  display: 'flex',
  gap: 8,
  justifyContent: 'center',
}

const qtyBtn = {
  padding: '4px 10px',
  cursor: 'pointer',
}

const qtyValue = { fontWeight: 700 }

const qtyLabel = {
  fontSize: 12,
  marginBottom: 6,
}

const footer = {
  textAlign: 'center' as const,
  fontSize: 12,
  color: '#64748b',
  margin: '10px 0',
}        <div style={card}>
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
