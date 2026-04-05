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

/* ================= FIX HERE ================= */
function getImageUrl(path?: string | null) {
  if (!path) return ''

  // kalau dah full URL → terus guna
  if (path.startsWith('http')) return path

  // kalau bukan → generate dari supabase public bucket
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
}
/* =========================================== */

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
          <img src="/BayarLink Logo 01.svg" alt="bayarlink" style={logo} />
        </div>

        <div style={heroCard}>
          <div style={sellerRow}>
            {seller.profile_image ? (
              <img
                src={getImageUrl(seller.profile_image)}  // ✅ FIX HERE
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

        {/* PRODUCTS */}
        <div style={productGrid}>
          {products.map((product) => {
            const image = getFirstImage(product)
            const qty = cart[product.id] || 0
            const productHref = `/s/${shopSlug}/${product.slug}`

            return (
              <div key={product.id} style={productCard}>
                <div style={productImageWrap}>
                  {image ? (
                    <img
                      src={getImageUrl(image)}   // ✅ FIX HERE
                      alt={product.name}
                      style={productImage}
                    />
                  ) : (
                    <div style={productImagePlaceholder}>No image</div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={productName}>{product.name}</div>
                  <div style={productPrice}>RM {product.price.toFixed(2)}</div>
                  <div style={productDesc}>
                    {product.description || 'Tiada deskripsi.'}
                  </div>
                </div>

                <div style={qtyPanel}>
                  <button onClick={() => decrease(product.id)}>-</button>
                  <span>{qty}</span>
                  <button onClick={() => increase(product)}>+</button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={checkoutCard}>
          <ShopPayButton
            sellerId={seller.id}
            shopSlug={shopSlug}
            items={cartItems}
            total={grandTotal}
          />
        </div>
      </div>
    </main>
  )
}
