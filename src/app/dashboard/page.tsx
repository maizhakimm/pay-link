'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type SellerProfile = {
  id: string
  user_id: string
  store_name: string | null
  store_slug: string | null
}

export default function DashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [seller, setSeller] = useState<SellerProfile | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      setUserEmail(user.email || '')

      const { data: sellerProfile, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Seller profile fetch error:', error.message)
      }

      setSeller(sellerProfile || null)
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fb' }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12 }}>
          Loading dashboard...
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: 24 }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, marginBottom: 20 }}>
          <h1>{seller?.store_name || 'My Store'}</h1>
          <p>Logged in as {userEmail}</p>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          
          <Link href="/dashboard/settings">
            ⚙️ Store Settings
          </Link>

          <Link href="/dashboard/products">
            Payment Links
          </Link>

          <Link href="/dashboard/orders">
            Orders
          </Link>

        </div>

        {!seller && (
          <div style={{ marginTop: 20, background: '#fff3cd', padding: 16, borderRadius: 12 }}>
            Setup your store first in settings.
          </div>
        )}

      </div>
    </main>
  )
}
