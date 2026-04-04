'use client'

type Seller = {
  id: string
  store_name?: string | null
}

type Product = {
  id: string
  name: string
  slug: string
  price: number
  image_1?: string | null
}

type Props = {
  seller: Seller
  products: Product[]
  shopSlug: string
}

export default function ShopPageClient({ seller, products, shopSlug }: Props) {
  return (
    <div style={{ padding: 20 }}>
      <h1>{seller.store_name}</h1>

      <div style={{ display: 'grid', gap: 16 }}>
        {products.map((product) => (
          <a
            key={product.id}
            href={`/s/${shopSlug}/${product.slug}`}
            style={{
              display: 'block',
              border: '1px solid #eee',
              padding: 12,
              borderRadius: 10,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div>
              {product.image_1 && (
                <img
                  src={product.image_1}
                  alt={product.name}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              )}
            </div>

            <h3>{product.name}</h3>
            <p>RM {product.price}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
