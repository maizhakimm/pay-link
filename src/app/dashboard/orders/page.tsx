'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type OrderRow = {
  id: string
  seller_profile_id?: string | null
  product_id?: string | null
  product_name?: string | null
  product_slug?: string | null
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  amount?: number | null
  payment_status?: string | null
  bayarcash_status?: string | null
  order_status?: string | null
  payment_method?: string | null
  reference_no?: string | null
  transaction_id?: string | null
  wants_delivery?: boolean | null
  delivery_address_line1?: string | null
  delivery_address_line2?: string | null
  delivery_city?: string | null
  delivery_state?: string | null
  delivery_postcode?: string | null
  delivery_country?: string | null
  created_at?: string | null
  paid_at?: string | null
}

type SellerProfileRow = {
  id: string
  store_name: string | null
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

function getMainStatus(order: OrderRow) {
  return (
    order.payment_status ||
    order.bayarcash_status ||
    order.order_status ||
    'pending'
  )
    .toString()
    .toLowerCase()
    .trim()
}

function isPaidStatus(status: string) {
  return ['paid', 'success', 'successful', 'completed'].includes(status)
}

function isPendingStatus(status: string) {
  return ['pending', 'processing', 'awaiting_payment'].includes(status)
}

function getStatusBadgeStyle(status: string) {
  if (isPaidStatus(status)) {
    return {
      background: '#dcfce7',
      color: '#166534',
    }
  }

  if (isPendingStatus(status)) {
    return {
      background: '#fef3c7',
      color: '#92400e',
    }
  }

  if (['failed', 'expired', 'cancelled', 'canceled'].includes(status)) {
    return {
      background: '#fee2e2',
      color: '#b91c1c',
    }
  }

  return {
    background: '#f1f5f9',
    color: '#334155',
  }
}

function buildDeliveryAddress(order: OrderRow) {
  const parts = [
    order.delivery_address_line1,
    order.delivery_address_line2,
    order.delivery_postcode,
    order.delivery_city,
    order.delivery_state,
    order.delivery_country,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : '-'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [sellerProfile, setSellerProfile] = useState<SellerProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadOrdersPage = useCallback(async () => {
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

    setSellerProfile(sellerData as SellerProfileRow)

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_profile_id', sellerData.id)
      .order('created_at', { ascending: false })

    if (orderError) {
      setError(orderError.message)
      setLoading(false)
      return
    }

    setOrders((orderData || []) as OrderRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadOrdersPage()
  }, [loadOrdersPage])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getMainStatus(order)

      const matchesStatus =
        statusFilter === 'all' ? true : status === statusFilter

      const haystack = [
        order.product_name,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.reference_no,
        order.transaction_id,
        order.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = haystack.includes(search.toLowerCase().trim())

      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const paidOrders = orders.filter((order) =>
      isPaidStatus(getMainStatus(order))
    ).length
    const pendingOrders = orders.filter((order) =>
      isPendingStatus(getMainStatus(order))
    ).length
    const revenue = orders
      .filter((order) => isPaidStatus(getMainStatus(order)))
      .reduce((sum, order) => sum + Number(order.amount || 0), 0)

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      revenue,
    }
  }, [orders])

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
            <a href="/dashboard" style={navLinkStyle}>
              Dashboard
            </a>
            <a href="/dashboard/products" style={navLinkStyle}>
              Products
            </a>
            <a href="/dashboard/orders" style={navLinkActiveStyle}>
              Orders
            </a>
            <a href="/dashboard/settings" style={navLinkStyle}>
              Settings
            </a>
          </nav>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '32px',
                color: '#0f172a',
                fontWeight: 800,
              }}
            >
              Orders
            </h1>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '15px',
              }}
            >
              Monitor payments, customer details, delivery requests, and order activity.
            </p>
          </div>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '14px',
              marginBottom: '18px',
            }}
          >
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Total Orders</div>
              <div style={statValueStyle}>{stats.totalOrders}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Paid Orders</div>
              <div style={statValueStyle}>{stats.paidOrders}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Pending Orders</div>
              <div style={statValueStyle}>{stats.pendingOrders}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Revenue</div>
              <div style={statValueStyle}>{formatMoney(stats.revenue)}</div>
            </div>
          </section>

          <section
            style={{
              background: '#ffffff',
              borderRadius: '22px',
              padding: '18px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 220px',
                gap: '12px',
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, product, reference, transaction..."
                style={inputStyle}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="success">Success</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </section>

          <section
            style={{
              background: '#ffffff',
              borderRadius: '22px',
              padding: '22px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
            }}
          >
            <div
              style={{
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '22px',
                  color: '#0f172a',
                  fontWeight: 800,
                }}
              >
                Order List
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                {sellerProfile?.store_name
                  ? `Showing orders for ${sellerProfile.store_name}`
                  : 'Showing your incoming orders'}
              </p>
            </div>

            {loading ? (
              <p style={{ margin: 0, color: '#64748b' }}>Loading orders...</p>
            ) : error ? (
              <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
            ) : filteredOrders.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>No orders found.</p>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {filteredOrders.map((order) => {
                  const status = getMainStatus(order)
                  const badge = getStatusBadgeStyle(status)

                  return (
                    <div
                      key={order.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '18px',
                        padding: '16px',
                        background: '#ffffff',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px',
                          flexWrap: 'wrap',
                          marginBottom: '12px',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <h3
                            style={{
                              margin: '0 0 6px 0',
                              fontSize: '18px',
                              color: '#0f172a',
                              fontWeight: 800,
                            }}
                          >
                            {order.product_name || 'Product Order'}
                          </h3>

                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                              color: '#64748b',
                              fontSize: '13px',
                            }}
                          >
                            <span>Order ID: {order.id}</span>
                            <span>•</span>
                            <span>Created: {formatDate(order.created_at)}</span>
                            <span>•</span>
                            <span>Paid: {formatDate(order.paid_at)}</span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'inline-block',
                            padding: '6px 10px',
                            borderRadius: '999px',
                            background: badge.background,
                            color: badge.color,
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          }}
                        >
                          {status.replace(/_/g, ' ')}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                          gap: '12px',
                        }}
                      >
                        <div style={infoBoxStyle}>
                          <div style={infoTitleStyle}>Customer</div>
                          <div style={infoTextStyle}>
                            <strong>{order.customer_name || '-'}</strong>
                          </div>
                          <div style={infoTextStyle}>{order.customer_email || '-'}</div>
                          <div style={infoTextStyle}>{order.customer_phone || '-'}</div>
                        </div>

                        <div style={infoBoxStyle}>
                          <div style={infoTitleStyle}>Payment</div>
                          <div style={infoTextStyle}>
                            Amount: <strong>{formatMoney(order.amount)}</strong>
                          </div>
                          <div style={infoTextStyle}>
                            Method: {order.payment_method || '-'}
                          </div>
                          <div style={infoTextStyle}>
                            Reference: {order.reference_no || '-'}
                          </div>
                          <div style={infoTextStyle}>
                            Txn ID: {order.transaction_id || '-'}
                          </div>
                        </div>

                        <div style={infoBoxStyle}>
                          <div style={infoTitleStyle}>Delivery</div>
                          <div style={infoTextStyle}>
                            Required: <strong>{order.wants_delivery ? 'Yes' : 'No'}</strong>
                          </div>
                          <div style={infoTextStyle}>
                            {order.wants_delivery ? buildDeliveryAddress(order) : '-'}
                          </div>
                        </div>

                        <div style={infoBoxStyle}>
                          <div style={infoTitleStyle}>Product</div>
                          <div style={infoTextStyle}>
                            Name: <strong>{order.product_name || '-'}</strong>
                          </div>
                          <div style={infoTextStyle}>Slug: {order.product_slug || '-'}</div>
                          <div style={infoTextStyle}>
                            Payment Status: {order.payment_status || '-'}
                          </div>
                          <div style={infoTextStyle}>
                            Order Status: {order.order_status || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
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

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '12px',
  border: '1px solid #dbe2ea',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
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
  fontSize: '28px',
  fontWeight: 800,
} as const

const infoBoxStyle = {
  background: '#f8fafc',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  padding: '12px',
  minWidth: 0,
} as const

const infoTitleStyle = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 800,
  marginBottom: '8px',
} as const

const infoTextStyle = {
  color: '#475569',
  fontSize: '13px',
  lineHeight: 1.7,
  wordBreak: 'break-word' as const,
} as const
