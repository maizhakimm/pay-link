'use client'

import { useMemo, useState } from 'react'
import ShopPayButton from './ShopPayButton'

type SellerProfile = {
  id: string
  store_name: string | null
  profile_image?: string | null
  email?: string | null
  whatsapp?: string | null
  business_address?: string | null
}

type ProductRow = {
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
  is_active?: boolean | null
  seller_profile_id?: string | null
  track_stock?: boolean
  stock_quantity?: number
  sold_out?: boolean
}

function getFirstImage(product: ProductRow) {
  return (
    product.image_1 ||
    product.image_2 ||
    product.image_3 ||
    product.image_4 ||
    product.image_5 ||
    ''
  )
}

export default function ShopPageClient({
  seller,
  products,
  shopSlug,
}: {
  seller: SellerProfile
  products: ProductRow[]
  shopSlug: string
}) {
  const [cart, setCart] = useState<Record<string, number>>({})

  function increase(product: ProductRow) {
    if (product.sold_out) return

    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }))
  }

  function decrease(productId: string) {
    setCart((prev) => {
      const current = prev[productId] || 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[productId]
        return next
      }

      return {
        ...prev,
        [productId]: current - 1,
      }
    })
  }

  const cartItems = useMemo(() => {
    return products
      .filter((product) => (cart[product.id] || 0) > 0)
      .map((product) => ({
        product_id: product.id,
        quantity: cart[product.id],
        name: product.name,
        price: product.price,
        line_total: product.price * cart[product.id],
      }))
  }, [cart, products])

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const grandTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.line_total, 0),
    [cartItems]
  )

  const sellerName = seller.store_name || 'Shop'

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

        <div style={heroCard}>
          <div style={sellerRow}>
            {seller.profile_image ? (
              <img
                src={seller.profile_image}
                alt={sellerName}
                style={sellerImg}
              />
            ) : (
              <div style={sellerFallback}>
                {sellerName.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ minWidth: 0 }}>
              <h1 style={shopTitle}>{sellerName}</h1>
              {seller.business_address ? (
                <p style={shopSub}>{seller.business_address}</p>
              ) : (
                <p style={shopSub}>Order menu anda di sini</p>
              )}
            </div>
          </div>
        </div>

        <div style={sectionTitleWrap}>
          <h2 style={sectionTitle}>Menu / Produk Aktif</h2>
          <p style={sectionSub}>Pilih item dan kuantiti sebelum checkout</p>
        </div>

        {products.length === 0 ? (
          <div style={emptyCard}>
            <p style={{ margin: 0, color: '#64748b' }}>
              Tiada menu aktif buat masa ini.
            </p>
          </div>
        ) : (
          <div style={productGrid}>
            {products.map((product) => {
              const image = getFirstImage(product)
              const qty = cart[product.id] || 0

              return (
                <div key={product.id} style={productCard}>
                  <div style={productImageWrap}>
                    {image ? (
                      <img src={image} alt={product.name} style={productImage} />
                    ) : (
                      <div style={productImagePlaceholder}>No image</div>
                    )}

                    {product.sold_out && (
                      <div style={soldOutBadge}>Sold Out</div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={productName}>{product.name}</div>
                    <div style={productPrice}>RM {product.price.toFixed(2)}</div>

                    {product.track_stock && (
                      <div style={stockText}>
                        Stock: {product.stock_quantity ?? 0}
                      </div>
                    )}

                    <div style={productDesc}>
                      {product.description || 'Tiada deskripsi.'}
                    </div>
                  </div>

                  <div style={qtyPanel}>
                    <div style={qtyLabel}>Qty</div>
                    <div style={qtyRow}>
                      <button
                        type="button"
                        onClick={() => decrease(product.id)}
                        style={qtyBtn}
                      >
                        -
                      </button>

                      <span style={qtyValue}>{qty}</span>

                      <button
                        type="button"
                        onClick={() => increase(product)}
                        style={{
                          ...qtyBtn,
                          opacity: product.sold_out ? 0.4 : 1,
                          cursor: product.sold_out ? 'not-allowed' : 'pointer',
                        }}
                        disabled={product.sold_out}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={checkoutCard}>
          <div style={checkoutHeader}>
            <div>
              <h2 style={checkoutTitle}>Checkout</h2>
              <p style={checkoutSub}>
                {totalItems} item dipilih · Jumlah RM {grandTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div style={emptyCartBox}>
              Sila pilih sekurang-kurangnya satu item untuk teruskan pembayaran.
            </div>
          ) : (
            <>
              <div style={summaryList}>
                {cartItems.map((item) => (
                  <div key={item.product_id} style={summaryRow}>
                    <div>
                      {item.name} × {item.quantity}
                    </div>
                    <strong>RM {item.line_total.toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <ShopPayButton
                sellerId={seller.id}
                shopSlug={shopSlug}
                items={cartItems.map((item) => ({
                  product_id: item.product_id,
                  quantity: item.quantity,
                }))}
                total={grandTotal}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}

const soldOutBadge = {
  position: 'absolute' as const,
  top: 6,
  right: 6,
  background: '#ef4444',
  color: '#fff',
  fontSize: 11,
  fontWeight: 800,
  padding: '4px 8px',
  borderRadius: 8,
} as const

const stockText = {
  fontSize: 12,
  color: '#64748b',
  marginBottom: 4,
} as const

const main = { minHeight: '100vh', background: '#f8fafc', padding: 16 } as const
const container = { maxWidth: 760, margin: '0 auto' } as const
const logoWrap = { textAlign: 'center' as const, marginBottom: 16 } as const
const logo = { height: 44, margin: '0 auto', display: 'block' } as const

const heroCard = {
  background: '#fff',
  borderRadius: 22,
  padding: 18,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
  marginBottom: 16,
} as const

const sellerRow = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  marginBottom: 14,
} as const

const sellerImg = {
  width: 56,
  height: 56,
  borderRadius: '999px',
  objectFit: 'cover' as const,
} as const

const sellerFallback = {
  width: 56,
  height: 56,
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 20,
} as const

const shopTitle = {
  margin: '0 0 4px 0',
  fontSize: 28,
  fontWeight: 800,
  color: '#0f172a',
} as const

const shopSub = { margin: 0, color: '#64748b', fontSize: 14 } as const

const sectionTitleWrap = { marginBottom: 12 } as const

const sectionTitle = {
  margin: '0 0 4px 0',
  fontSize: 22,
  fontWeight: 800,
  color: '#0f172a',
} as const

const sectionSub = { margin: 0, color: '#64748b', fontSize: 14 } as const

const emptyCard = {
  background: '#fff',
  borderRadius: 20,
  padding: 18,
  border: '1px solid #e2e8f0',
  marginBottom: 16,
} as const

const productGrid = { display: 'grid', gap: 12, marginBottom: 16 } as const

const productCard = {
  background: '#fff',
  borderRadius: 20,
  padding: 14,
  border: '1px solid #e2e8f0',
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  position: 'relative' as const,
} as const

const productImageWrap = {
  width: 96,
  height: 96,
  borderRadius: 14,
  overflow: 'hidden',
  background: '#e2e8f0',
  flexShrink: 0,
  position: 'relative' as const,
} as const

const productImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  display: 'block',
} as const

const productImagePlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  fontSize: 12,
} as const

const productName = {
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 6,
  fontSize: 18,
} as const

const productPrice = {
  color: '#1d4ed8',
  fontWeight: 800,
  marginBottom: 6,
} as const

const productDesc = {
  color: '#64748b',
  fontSize: 13,
  lineHeight: 1.6,
} as const

const qtyPanel = {
  minWidth: 110,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: 10,
  textAlign: 'center' as const,
} as const

const qtyLabel = {
  fontSize: 12,
  color: '#64748b',
  fontWeight: 700,
  marginBottom: 8,
} as const

const qtyRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
} as const

const qtyBtn = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
} as const

const qtyValue = {
  minWidth: 16,
  fontWeight: 800,
  color: '#0f172a',
} as const

const checkoutCard = {
  background: '#fff',
  borderRadius: 22,
  padding: 18,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
} as const

const checkoutHeader = { marginBottom: 14 } as const

const checkoutTitle = {
  margin: '0 0 4px 0',
  fontSize: 22,
  fontWeight: 800,
  color: '#0f172a',
} as const

const checkoutSub = { margin: 0, color: '#64748b', fontSize: 14 } as const

const emptyCartBox = {
  padding: 14,
  borderRadius: 14,
  background: '#f8fafc',
  color: '#64748b',
  fontSize: 14,
  border: '1px solid #e2e8f0',
} as const

const summaryList = {
  display: 'grid',
  gap: 10,
  marginBottom: 14,
} as const

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 12px',
  borderRadius: 12,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#0f172a',
} as const
