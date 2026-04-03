'use client'

import Layout from '../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type SellerProfileRow = {
  id: string
  store_name: string | null
  daily_note?: string | null
}

type ProductRow = {
  id: string
  name?: string | null
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
      .select('id, store_name, daily_note')
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
          .select('id, name, is_active, price')
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
    const activeProductsCount = products.filter((p) => Boolean(p.is_active)).length

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
      activeProductsCount,
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

  const activeProducts = useMemo(() => {
    return products
      .filter((product) => Boolean(product.is_active))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [products])

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

    const productLines =
      activeProducts.length > 0
        ? activeProducts
            .map((product, index) => {
              return `${index + 1}. ${product.name || 'Menu'} - ${formatMoney(product.price)}`
            })
            .join('\n')
        : 'Menu akan dikemaskini tidak lama lagi.'

    const messageBlock = sellerProfile.daily_note?.trim()
      ? `\n${sellerProfile.daily_note.trim()}\n`
      : '\n'

    const message = `Salam 😊

Open order hari ini:

${productLines}${messageBlock}
Klik link di bawah untuk order:
${shopLink}

Terima kasih.
${sellerProfile.store_name}`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Welcome{sellerProfile?.store_name ? `, ${sellerProfile.store_name}` : ''}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Track your products, orders, payouts, and recent activity in one place.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm text-red-700">{error}</p>
        </div>
      ) : (
        <>
          <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 text-2xl font-extrabold text-slate-900">Shop Link</h2>
              <p className="mb-4 text-sm text-slate-500">
                Share satu link sahaja kepada pelanggan untuk order menu anda.
              </p>

              <div className="mb-3 break-all rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900">
                {shopLink || 'Complete your seller profile first'}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-sm font-extrabold text-slate-900">
                  Preview WhatsApp message
                </div>

                <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-7 text-slate-600">
                  Message dan product list ini akan ikut data secara automatik.
                  Product list hanya akan ambil produk yang active sahaja.
                  Kalau nak ubah senarai produk, sila update di page Products.
                </div>

                {activeProducts.length === 0 ? (
                  <div className="text-sm text-slate-600">Tiada menu aktif buat masa ini.</div>
                ) : (
                  <div className="space-y-1 text-sm leading-7 text-slate-600">
                    {activeProducts.map((product, index) => (
                      <div key={product.id}>
                        {index + 1}. {product.name || 'Menu'} - {formatMoney(product.price)}
                      </div>
                    ))}

                    {sellerProfile?.daily_note?.trim() ? (
                      <div className="mt-3 border-t border-dashed border-slate-300 pt-3 whitespace-pre-line text-slate-700">
                        {sellerProfile.daily_note.trim()}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!shopLink}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? 'Copied' : 'Copy Link'}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                disabled={!shopLink}
                className="inline-flex items-center justify-center rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Share WhatsApp
              </button>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total Products" value={String(stats.totalProducts)} />
            <StatCard label="Active Products" value={String(stats.activeProductsCount)} />
            <StatCard label="Total Orders" value={String(stats.totalOrders)} />
            <StatCard label="Paid Orders" value={String(stats.paidOrders)} />
            <StatCard label="Revenue" value={formatMoney(stats.revenue)} />
            <StatCard label="Payout Eligible" value={String(stats.eligiblePayouts)} />
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Recent Orders</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest incoming order activity
                  </p>
                </div>

                <a
                  href="/dashboard/orders"
                  className="text-sm font-bold text-blue-700 hover:text-blue-800"
                >
                  View all
                </a>
              </div>

              {recentOrders.length === 0 ? (
                <p className="m-0 text-sm text-slate-500">No orders yet.</p>
              ) : (
                <div className="grid gap-3">
                  {recentOrders.map((order) => {
                    const paymentStatus = getMainPaymentStatus(order)

                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="mb-1 font-bold text-slate-900">
                              {order.product_name || 'Order'}
                            </div>
                            <div className="text-sm leading-6 text-slate-500">
                              Buyer: {order.buyer_name || '-'}
                            </div>
                            <div className="text-sm leading-6 text-slate-500">
                              {formatDate(order.created_at)}
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <div className="mb-2 font-extrabold text-slate-900">
                              {formatMoney(order.amount)}
                            </div>
                            <div
                              className={[
                                'inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize',
                                isPaidStatus(paymentStatus)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700',
                              ].join(' ')}
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

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-2xl font-extrabold text-slate-900">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Common shortcuts for faster workflow
                </p>
              </div>

              <div className="grid gap-3">
                <a
                  href="/dashboard/products"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Manage Products
                </a>
                <a
                  href="/dashboard/orders"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  View Orders
                </a>
                <a
                  href="/dashboard/settings"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Update Settings
                </a>
                <a
                  href="/dashboard/products/new"
                  className="block rounded-2xl border border-slate-900 bg-slate-900 px-4 py-4 font-bold text-white transition hover:bg-slate-800"
                >
                  Create New Product
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </Layout>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-3 text-2xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}
