'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type SellerProfileRow = {
  id: string
  store_name: string | null
}

type ProductRow = {
  id: string
  is_active?: boolean | null
  price?: number | null
}

type OrderRow = {
  id: string
  amount?: number | null
  payment_status?: string | null
  payout_status?: string | null
  fulfillment_status?: string | null
  created_at?: string | null
  product_name?: string | null
  buyer_name?: string | null
}

function normalizeStatus(value?: string | null, fallback = 'pending') {
  return (value || fallback).toString().toLowerCase().trim()
}

function getMainPaymentStatus(order: OrderRow) {
  return normalizeStatus(order.payment_status, 'pending')
}

function isPaidStatus(status: string) {
  return ['paid', 'success', 'successful', 'completed'].includes(status)
}

function formatMoney(value?: number | null) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sellerProfile, setSellerProfile] = useState<SellerProfileRow | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [copied, setCopied] = useState(false)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('Unable to load user session.')
      setLoading(false)
      return
    }

    const { data: sellerData, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('id, store_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (sellerError || !sellerData) {
      setError('Seller profile not found. Please complete your settings first.')
      setLoading(false)
      return
    }

    const typedSeller = sellerData as SellerProfileRow
    setSellerProfile(typedSeller)

    const [{ data: productData, error: productError }, { data: orderData, error: orderError }] =
      await Promise.all([
        supabase
          .from('products')
          .select('id, is_active, price')
          .eq('seller_profile_id', typedSeller.id),
        supabase
          .from('orders')
          .select(
            'id, amount, payment_status, payout_status, fulfillment_status, created_at, product_name, buyer_name'
          )
          .eq('seller_profile_id', typedSeller.id)
          .order('created_at', { ascending: false }),
      ])

    if (productError) {
      setError(productError.message)
      setLoading(false)
      return
    }

    if (orderError) {
      setError(orderError.message)
      setLoading(false)
      return
    }

    setProducts((productData || []) as ProductRow[])
    setOrders((orderData || []) as OrderRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const activeProducts = products.filter((p) => Boolean(p.is_active)).length

    const totalOrders = orders.length
    const paidOrders = orders.filter((o) => isPaidStatus(getMainPaymentStatus(o))).length

    const revenue = orders
      .filter((o) => isPaidStatus(getMainPaymentStatus(o)))
      .reduce((sum, o) => sum + Number(o.amount || 0), 0)

    const eligiblePayouts = orders.filter(
      (o) => normalizeStatus(o.payout_status, 'unpaid') === 'eligible'
    ).length

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      paidOrders,
      revenue,
      eligiblePayouts,
    }
  }, [products, orders])

  const shopSlug = sellerProfile?.store_name ? slugify(sellerProfile.store_name) : ''
  const shopLink =
    typeof window !== 'undefined' && shopSlug
      ? `${window.location.origin}/shop/${shopSlug}`
      : shopSlug
        ? `/shop/${shopSlug}`
        : ''

  async function handleCopyLink() {
    if (!shopLink) return

    try {
      await navigator.clipboard.writeText(shopLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      alert('Unable to copy link')
    }
  }

  function handleShareWhatsApp() {
    if (!shopLink || !sellerProfile?.store_name) return

    const message = `Salam 😊

Open order hari ini.

Klik link di bawah untuk order:
${shopLink}

Terima kasih.
${sellerProfile.store_name}`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '14px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/GoBayar%20Logo%2001%20800px.svg"
              alt="GoBayar"
              style={{ height: '40px', width: 'auto', display: 'block' }}
            />
          </div>

          <nav
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <a href="/dashboard" style={navLinkActiveStyle}>
              Dashboard
            </a>
            <a href="/dashboard/products" style={navLinkStyle}>
              Products
            </a>
            <a href="/dashboard/orders" style={navLinkStyle}>
              Orders
            </a>
            <a href="/dashboard/settings" style={navLinkStyle}>
              Settings
            </a>
          </nav>
        </div>
      </header>

      <div style={{ flex: 1, padding: '24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '32px',
                color: '#0f172a',
                fontWeight: 800,
              }}
            >
              Welcome{sellerProfile?.store_name ? `, ${sellerProfile.store_name}` : ''}
            </h1>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '15px',
              }}
            >
              Track your products, orders, payouts, and recent activity in one place.
            </p>
          </div>

          {loading ? (
            <div style={panelStyle}>
              <p style={{ margin: 0, color: '#64748b' }}>Loading dashboard...</p>
            </div>
          ) : error ? (
            <div style={panelStyle}>
              <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
            </div>
          ) : (
            <>
              <section style={sharePanelStyle}>
                <div style={sharePanelLeft}>
                  <div>
                    <h2 style={shareTitleStyle}>Shop Link</h2>
                    <p style={shareSubStyle}>
                      Share satu link sahaja kepada pelanggan untuk order menu anda.
                    </p>
                  </div>

                  <div style={shopLinkBox}>
                    {shopLink || 'Complete your seller profile first'}
                  </div>
                </div>

                <div style={shareActions}>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!shopLink}
                    style={{
                      ...actionButtonStyle,
                      opacity: shopLink ? 1 : 0.5,
                      cursor: shopLink ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    disabled={!shopLink}
                    style={{
                      ...whatsAppButtonStyle,
                      opacity: shopLink ? 1 : 0.5,
                      cursor: shopLink ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Share WhatsApp
                  </button>
                </div>
              </section>

              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                  gap: '14px',
                  marginBottom: '18px',
                }}
              >
                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Total Products</div>
                  <div style={statValueStyle}>{stats.totalProducts}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Active Products</div>
                  <div style={statValueStyle}>{stats.activeProducts}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Total Orders</div>
                  <div style={statValueStyle}>{stats.totalOrders}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Paid Orders</div>
                  <div style={statValueStyle}>{stats.paidOrders}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Revenue</div>
                  <div style={statValueStyle}>{formatMoney(stats.revenue)}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Payout Eligible</div>
                  <div style={statValueStyle}>{stats.eligiblePayouts}</div>
                </div>
              </section>

              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr',
                  gap: '18px',
                }}
              >
                <div style={panelStyle}>
                  <div style={sectionHeaderStyle}>
                    <div>
                      <h2 style={sectionTitleStyle}>Recent Orders</h2>
                      <p style={sectionSubtitleStyle}>
                        Latest incoming order activity
                      </p>
                    </div>

                    <a href="/dashboard/orders" style={miniLinkStyle}>
                      View all
                    </a>
                  </div>

                  {recentOrders.length === 0 ? (
                    <p style={{ margin: 0, color: '#64748b' }}>No orders yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {recentOrders.map((order) => {
                        const paymentStatus = getMainPaymentStatus(order)
                        return (
                          <div key={order.id} style={orderCardStyle}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div>
                                <div style={orderTitleStyle}>
                                  {order.product_name || 'Order'}
                                </div>
                                <div style={orderMetaStyle}>
                                  Buyer: {order.buyer_name || '-'}
                                </div>
                                <div style={orderMetaStyle}>
                                  {formatDate(order.created_at)}
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={orderAmountStyle}>
                                  {formatMoney(order.amount)}
                                </div>
                                <div
                                  style={{
                                    ...badgeStyle,
                                    ...(isPaidStatus(paymentStatus)
                                      ? paidBadgeStyle
                                      : pendingBadgeStyle),
                                  }}
                                >
                                  {paymentStatus}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div style={panelStyle}>
                  <div style={sectionHeaderStyle}>
                    <div>
                      <h2 style={sectionTitleStyle}>Quick Actions</h2>
                      <p style={sectionSubtitleStyle}>
                        Common shortcuts for faster workflow
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    <a href="/dashboard/products" style={quickLinkStyle}>
                      Manage Products
                    </a>
                    <a href="/dashboard/orders" style={quickLinkStyle}>
                      View Orders
                    </a>
                    <a href="/dashboard/settings" style={quickLinkStyle}>
                      Update Settings
                    </a>
                    <a href="/dashboard/products/new" style={quickLinkPrimaryStyle}>
                      Create New Product
                    </a>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <footer
        style={{
          marginTop: '20px',
          borderTop: '1px solid #e5e7eb',
          background: '#ffffff',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '13px',
          }}
        >
          © 2026 All rights reserved. Neugens Solution.
        </div>
      </footer>
    </main>
  )
}

const panelStyle = {
  background: '#ffffff',
  borderRadius: '22px',
  padding: '22px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
} as const

const sharePanelStyle = {
  background: '#ffffff',
  borderRadius: '22px',
  padding: '22px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
  marginBottom: '18px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '18px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
} as const

const sharePanelLeft = {
  flex: 1,
  minWidth: 0,
} as const

const shareTitleStyle = {
  margin: '0 0 4px 0',
  fontSize: '22px',
  color: '#0f172a',
  fontWeight: 800,
} as const

const shareSubStyle = {
  margin: '0 0 14px 0',
  color: '#64748b',
  fontSize: '14px',
} as const

const shopLinkBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '14px',
  color: '#0f172a',
  fontWeight: 600,
  wordBreak: 'break-all' as const,
} as const

const shareActions = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
} as const

const actionButtonStyle = {
  padding: '12px 16px',
  borderRadius: '14px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontWeight: 700,
} as const

const whatsAppButtonStyle = {
  padding: '12px 16px',
  borderRadius: '14px',
  border: '1px solid #bbf7d0',
  background: '#f0fdf4',
  color: '#166534',
  fontWeight: 700,
} as const

const statCardStyle = {
  background: '#ffffff',
  borderRadius: '18px',
  padding: '18px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
} as const

const statLabelStyle = {
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 700,
  marginBottom: '10px',
} as const

const statValueStyle = {
  color: '#0f172a',
  fontSize: '26px',
  fontWeight: 800,
} as const

const navLinkStyle = {
  display: 'inline-block',
  padding: '10px 14px',
  borderRadius: '12px',
  textDecoration: 'none',
  color: '#334155',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  fontWeight: 700,
} as const

const navLinkActiveStyle = {
  ...navLinkStyle,
  background: '#0f172a',
  color: '#ffffff',
  border: '1px solid #0f172a',
} as const

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '16px',
} as const

const sectionTitleStyle = {
  margin: '0 0 4px 0',
  fontSize: '22px',
  color: '#0f172a',
  fontWeight: 800,
} as const

const sectionSubtitleStyle = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
} as const

const miniLinkStyle = {
  display: 'inline-block',
  textDecoration: 'none',
  color: '#1d4ed8',
  fontWeight: 700,
  fontSize: '14px',
} as const

const orderCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '14px',
  background: '#fff',
} as const

const orderTitleStyle = {
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '6px',
} as const

const orderMetaStyle = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.6,
} as const

const orderAmountStyle = {
  color: '#0f172a',
  fontWeight: 800,
  marginBottom: '6px',
} as const

const badgeStyle = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'capitalize' as const,
} as const

const paidBadgeStyle = {
  background: '#dcfce7',
  color: '#166534',
} as const

const pendingBadgeStyle = {
  background: '#fef3c7',
  color: '#92400e',
} as const

const quickLinkStyle = {
  display: 'block',
  padding: '14px 16px',
  borderRadius: '14px',
  textDecoration: 'none',
  color: '#0f172a',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontWeight: 700,
} as const

const quickLinkPrimaryStyle = {
  display: 'block',
  padding: '14px 16px',
  borderRadius: '14px',
  textDecoration: 'none',
  color: '#ffffff',
  border: '1px solid #0f172a',
  background: '#0f172a',
  fontWeight: 700,
} as const
