import { createClient } from '@supabase/supabase-js'
import CheckoutCard from '../../../pay-link/[slug]/CheckoutCard'

type PageProps = {
  params: {
    shopSlug: string
    productSlug: string
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default async function Page({ params }: PageProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1️⃣ get seller by shopSlug
  const { data: sellers } = await supabase
    .from('seller_profiles')
    .select('*')

  const seller = sellers?.find(
    (s) => slugify(s.store_name || '') === params.shopSlug
  )

  if (!seller) {
    return <div>Shop not found</div>
  }

  // 2️⃣ get product by slug + seller
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.productSlug)
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)
    .single()

  if (!product) {
    return <div>Product not found</div>
  }

  return <CheckoutCard product={product} seller={seller} />
}
