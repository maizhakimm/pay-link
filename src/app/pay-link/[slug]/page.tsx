import { createClient } from '@supabase/supabase-js'
import CheckoutCard from './CheckoutCard'

type PageProps = {
  params: {
    slug: string
  }
}

export default async function Page({ params }: PageProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      seller_profiles (
        store_name,
        profile_image,
        whatsapp,
        email
      )
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    return (
      <main style={errorMain}>
        <div style={errorBox}>
          <h2 style={errorTitle}>Product not found</h2>
          <p style={errorText}>
            The product link may be invalid or no longer available.
          </p>
        </div>
      </main>
    )
  }

  return <CheckoutCard product={product} />
}

/* styles */
const errorMain = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8fafc',
}

const errorBox = {
  background: '#fff',
  padding: 24,
  borderRadius: 16,
  border: '1px solid #e2e8f0',
}

const errorTitle = {
  fontWeight: 800,
}

const errorText = {
  color: '#64748b',
}
