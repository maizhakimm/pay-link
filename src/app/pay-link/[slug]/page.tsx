import { createClient } from '@supabase/supabase-js'
import CheckoutCard from './CheckoutCard'

type PageProps = {
  params: {
    slug: string
  }
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
  store_name?: string | null
  seller_profile_id?: string | null
}

type SellerProfileRow = {
  id: string
  store_name?: string | null
  profile_image?: string | null
  email?: string | null
  whatsapp?: string | null
  company_name?: string | null
}

export default async function Page({ params }: PageProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              marginBottom: '8px',
              color: '#0f172a',
              fontWeight: 800,
            }}
          >
            Product not found
          </h2>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontSize: '14px',
            }}
          >
            The product link may be invalid or no longer available.
          </p>
        </div>
      </main>
    )
  }

  const typedProduct = product as ProductRow

  let seller: SellerProfileRow | null = null

  if (typedProduct.seller_profile_id) {
    const { data: sellerData } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', typedProduct.seller_profile_id)
      .single()

    seller = (sellerData as SellerProfileRow) || null
  }

  return <CheckoutCard product={typedProduct} seller={seller} />
}
