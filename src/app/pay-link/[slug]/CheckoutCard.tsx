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
  seller: Seller | null
}) {
  const shopSlug = slugify(seller?.store_name || 'shop')

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
