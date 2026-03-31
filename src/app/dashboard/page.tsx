'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type SellerProfile = {
  id: string
  user_id: string
  store_name: string
  store_slug: string
  contact_phone: string | null
  created_at: string
  updated_at: string
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
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7fb',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '24px 28px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            fontWeight: 600,
            color: '#111827',
          }}
        >
          Loading dashboard...
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.4px',
                }}
              >
                SELLER DASHBOARD
              </p>

              <h1
                style={{
                  margin: '10px 0 8px 0',
                  fontSize: '36px',
                  color: '#111827',
                }}
              >
                {seller?.store_name || 'My Store'}
              </h1>

              <p
                style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '16px',
                  lineHeight: 1.6,
                }}
              >
                Logged in as {userEmail || 'seller'}.
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#111827',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '10px',
                color: '#111827',
                fontSize: '20px',
              }}
            >
              Store Settings
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: '18px',
                color: '#6b7280',
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              Update your business details, contact number, bank details, and QR payment setup.
            </p>

            <Link
              href="/dashboard/settings"
              style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#111827',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Manage Settings
            </Link>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '10px',
                color: '#111827',
                fontSize: '20px',
              }}
            >
              Payment Links
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: '18px',
                color: '#6b7280',
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              Create and manage your payment links for products, services, deposits, and custom orders.
            </p>

            <Link
              href="/dashboard/products"
              style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#111827',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Manage Payment Links
            </Link>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '10px',
                color: '#111827',
                fontSize: '20px',
              }}
            >
              Orders
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: '18px',
                color: '#6b7280',
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              Review incoming orders, buyer details, payment status, and uploaded proof of payment.
            </p>

            <Link
              href="/dashboard/orders"
              style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#111827',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              View Orders
            </Link>
          </div>
        </div>

        {!seller && (
          <div
            style={{
              marginTop: '20px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '16px',
              padding: '18px',
              color: '#9a3412',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            }}
          >
            Your seller profile is not set up yet. Next, we should create the settings page so your profile can be saved properly.
          </div>
        )}
      </div>
    </main>
  )
}

