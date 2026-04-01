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

  return <CheckoutCard product={product} />
}
