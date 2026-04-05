'use client'

import PayButton from './PayButton'

type Product = {
  name: string
  price: number
  slug: string
}

type Seller = {
  store_name?: string | null
}

export default function CheckoutCard({
  product,
  seller,
}: {
  product: Product
  seller: Seller | null
}) {
  const shopSlug = seller?.shop_slug || 'shop'
  
  return (
    <div style={{ padding: 20 }}>
      <h2>{product.name}</h2>
      <p>RM {product.price}</p>

      <PayButton
        productSlug={product.slug}
        shopSlug={shopSlug}
      />
    </div>
  )
}
