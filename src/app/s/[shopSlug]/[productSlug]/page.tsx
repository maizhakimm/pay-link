import { createClient } from '@supabase/supabase-js'
import CheckoutCard from '../../../pay-link/[slug]/CheckoutCard'

type PageProps = {
  params: {
    shopSlug: string
    productSlug: string
  }
}

type SellerProfileRow = {
  id: string
  store_name?: string | null
  profile_image?: string | null
  email?: string | null
  whatsapp?: string | null
  company_name?: string | null
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

  const { data: sellers } = await supabase
    .from('seller_profiles')
    .select('*')

  const seller =
    (sellers as SellerProfileRow[] | null)?.find((item) => {
      return slugify(item.store_name || '') === params.shopSlug
    }) || null

  if (!seller) {
    return <div>Shop not found</div>
  }

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.productSlug)
    .eq('seller_profile_id', seller.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!product) {
    return <div>Product not found</div>
  }

  return <CheckoutCard product={product as ProductRow} seller={seller} />
}
