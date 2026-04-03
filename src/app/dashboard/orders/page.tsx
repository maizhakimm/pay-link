'use client'

import Layout from "@/components/Layout"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

// type dan function lain kekal

export default function OrdersPage() {
  // logic lama kekal

  return (
    <Layout>
      {/* content orders lama */}
    </Layout>
  )
}

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
  fulfillment_status?: string | null
  delivered_at?: string | null
  payout_status?: string | null
}

type SellerProfileRow = {
  id: string
  store_name: string | null
}

const ITEMS_PER_PAGE = 20

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

function normalizeStatus(value?: string | null, fallback = 'pending') {
  return (value || fallback).toString().toLowerCase().trim()
}

function getMainPaymentStatus(order: OrderRow) {
  return normalizeStatus(
    order.payment_status || order.bayarcash_status || order.order_status,
    'pending'
  )
}

function getFulfillmentStatus(order: OrderRow) {
  return normalizeStatus(order.fulfillment_status, 'pending')
}

function getPayoutStatus(order: OrderRow) {
  return normalizeStatus(order.payout_status, 'unpaid')
}

function isPaidStatus(status: string) {
  return ['paid', 'success', 'successful', 'completed'].includes(status)
}

function isPendingPaymentStatus(status: string) {
  return ['pending', 'processing', 'awaiting_payment'].includes(status)
}

function getPaymentBadgeStyle(status: string) {
  if (isPaidStatus(status)) {
    return {
      background: '#dcfce7',
      color: '#166534',
    }
  }

  if (isPendingPaymentStatus(status)) {
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

function getFulfillmentBadgeStyle(status: string) {
  if (status === 'delivered') {
    return {
      background: '#dcfce7',
      color: '#166534',
    }
  }

  if (status === 'shipped') {
    return {
      background: '#dbeafe',
      color: '#1d4ed8',
    }
  }

  if (status === 'processing') {
    return {
      background: '#fef3c7',
      color: '#92400e',
    }
  }

  return {
    background: '#f1f5f9',
    color: '#334155',
  }
}

function getPayoutBadgeStyle(status: string) {
  if (status === 'paid') {
    return {
      background: '#dcfce7',
      color: '#166534',
    }
  }

  if (status === 'processing') {
    return {
      background: '#dbeafe',
      color: '#1d4ed8',
    }
  }

  if (status === 'eligible') {
    return {
      background: '#fef3c7',
      color: '#92400e',
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
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

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

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  async function updateFulfillmentStatus(
    order: OrderRow,
    nextStatus: 'pending' | 'processing' | 'shipped' | 'delivered'
  ) {
    try {
      setUpdatingOrderId(order.id)

      const paymentStatus = getMainPaymentStatus(order)
      const currentPayoutStatus = getPayoutStatus(order)

      const updatePayload: Record<string, string | null> = {
        fulfillment_status: nextStatus,
      }

      if (nextStatus === 'delivered') {
        updatePayload.delivered_at = new Date().toISOString()

        if (isPaidStatus(paymentStatus) && currentPayoutStatus === 'unpaid') {
          updatePayload.payout_status = 'eligible'
        }
      } else {
        updatePayload.delivered_at = null
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', order.id)

      if (error) {
        alert(error.message)
        return
      }

      await loadOrdersPage()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update delivery status'
      alert(message)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const paymentStatus = getMainPaymentStatus(order)
      const fulfillmentStatus = getFulfillmentStatus(order)
      const payoutStatus = getPayoutStatus(order)

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : paymentStatus === statusFilter ||
            fulfillmentStatus === statusFilter ||
            payoutStatus === statusFilter

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

      const keyword = search.toLowerCase().trim()
      const matchesSearch = keyword ? haystack.includes(keyword) : true

      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const paidOrders = orders.filter((order) =>
      isPaidStatus(getMainPaymentStatus(order))
    ).length
    const pendingOrders = orders.filter((order) =>
      isPendingPaymentStatus(getMainPaymentStatus(order))
    ).length
    const deliveredOrders = orders.filter(
      (order) => getFulfillmentStatus(order) === 'delivered'
    ).length
    const eligiblePayouts = orders.filter(
      (order) => getPayoutStatus(order) === 'eligible'
    ).length

    const revenue = orders
      .filter((order) => isPaidStatus(getMainPaymentStatus(order)))
      .reduce((sum, order) => sum + Number(order.amount || 0), 0)

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      deliveredOrders,
      eligiblePayouts,
      revenue,
    }
  }, [orders])

  function goToPreviousPage() {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  function goToNextPage() {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
              src="/BayarLink Logo 01.svg"
              alt="bayarlink"
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
              Monitor payments, delivery progress, payout readiness, and customer order activity.
            </p>
          </div>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
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
              <div style={statLabelStyle}>Pending Payment</div>
              <div style={statValueStyle}>{stats.pendingOrders}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Delivered</div>
              <div style={statValueStyle}>{stats.deliveredOrders}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Payout Eligible</div>
              <div style={statValueStyle}>{stats.eligiblePayouts}</div>
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
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="eligible">Payout Eligible</option>
                <option value="unpaid">Payout Unpaid</option>
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div>
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

              <div
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                Showing {filteredOrders.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                {' - '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
              </div>
            </div>

            {loading ? (
              <p style={{ margin: 0, color: '#64748b' }}>Loading orders...</p>
            ) : error ? (
              <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
            ) : filteredOrders.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>No orders found.</p>
            ) : (
              <>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {paginatedOrders.map((order) => {
                    const paymentStatus = getMainPaymentStatus(order)
                    const fulfillmentStatus = getFulfillmentStatus(order)
                    const payoutStatus = getPayoutStatus(order)

                    const paymentBadge = getPaymentBadgeStyle(paymentStatus)
                    const fulfillmentBadge = getFulfillmentBadgeStyle(fulfillmentStatus)
                    const payoutBadge = getPayoutBadgeStyle(payoutStatus)

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
                              <span>•</span>
                              <span>Delivered: {formatDate(order.delivered_at)}</span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: '8px',
                              minWidth: '220px',
                            }}
                          >
                            <select
                              value={fulfillmentStatus}
                              onChange={(e) =>
                                updateFulfillmentStatus(
                                  order,
                                  e.target.value as 'pending' | 'processing' | 'shipped' | 'delivered'
                                )
                              }
                              disabled={updatingOrderId === order.id}
                              style={{
                                ...dropdownStyle,
                                opacity: updatingOrderId === order.id ? 0.6 : 1,
                                cursor: updatingOrderId === order.id ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <option value="pending">Delivery: Pending</option>
                              <option value="processing">Delivery: Processing</option>
                              <option value="shipped">Delivery: Shipped</option>
                              <option value="delivered">Delivery: Delivered</option>
                            </select>

                            <div
                              style={{
                                color: '#64748b',
                                fontSize: '12px',
                                fontWeight: 600,
                              }}
                            >
                              {updatingOrderId === order.id ? 'Updating status...' : 'Update delivery status'}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            marginBottom: '12px',
                          }}
                        >
                          <div
                            style={{
                              ...badgeBaseStyle,
                              background: paymentBadge.background,
                              color: paymentBadge.color,
                            }}
                          >
                            Payment: {paymentStatus.replace(/_/g, ' ')}
                          </div>

                          <div
                            style={{
                              ...badgeBaseStyle,
                              background: fulfillmentBadge.background,
                              color: fulfillmentBadge.color,
                            }}
                          >
                            Delivery: {fulfillmentStatus.replace(/_/g, ' ')}
                          </div>

                          <div
                            style={{
                              ...badgeBaseStyle,
                              background: payoutBadge.background,
                              color: payoutBadge.color,
                            }}
                          >
                            Payout: {payoutStatus.replace(/_/g, ' ')}
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
                              Status: <strong>{fulfillmentStatus.replace(/_/g, ' ')}</strong>
                            </div>
                            <div style={infoTextStyle}>
                              {order.wants_delivery ? buildDeliveryAddress(order) : '-'}
                            </div>
                          </div>

                          <div style={infoBoxStyle}>
                            <div style={infoTitleStyle}>Product & Payout</div>
                            <div style={infoTextStyle}>
                              Name: <strong>{order.product_name || '-'}</strong>
                            </div>
                            <div style={infoTextStyle}>Slug: {order.product_slug || '-'}</div>
                            <div style={infoTextStyle}>
                              Payout Status: <strong>{payoutStatus.replace(/_/g, ' ')}</strong>
                            </div>
                            <div style={infoTextStyle}>
                              Payment Status: {order.payment_status || '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div
                  style={{
                    marginTop: '18px',
                    paddingTop: '14px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '13px',
                    }}
                  >
                    Page {currentPage} of {totalPages}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      style={{
                        ...smallActionButton,
                        opacity: currentPage === 1 ? 0.5 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Previous
                    </button>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      style={{
                        ...smallActionButton,
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
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

const dropdownStyle = {
  width: '220px',
  padding: '11px 12px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  fontSize: '13px',
  outline: 'none',
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
  fontSize: '26px',
  fontWeight: 800,
} as const

const badgeBaseStyle = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'capitalize' as const,
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

const smallActionButton = {
  padding: '8px 12px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  fontSize: '13px',
} as const
