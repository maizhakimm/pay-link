'use client'

import Layout from '../../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type OrderItem = {
  name: string
  quantity: number
  price: number
  total: number
  slug?: string | null
}

type OrderRow = {
  id: string
  order_number?: string | null
  product_name?: string | null
  product_slug?: string | null
  amount?: number | null
  status?: string | null
  payment_status?: string | null
  buyer_name?: string | null
  buyer_phone?: string | null
  buyer_email?: string | null
  created_at?: string | null

  // Optional flexible fields for item detail support
  items?: unknown
  order_items?: unknown
  cart_items?: unknown
  checkout_items?: unknown
  metadata?: unknown
  payload?: unknown
  customer_details?: unknown
}

type StatProps = {
  label: string
  value: string | number
}

type InfoProps = {
  label: string
  value: string | number
}

function normalizeStatus(value?: string | null) {
  return (value || 'pending').toString().toLowerCase().trim()
}

function formatMoney(value?: number | null) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadgeClass(status: string) {
  const normalized = normalizeStatus(status)

  if (['paid', 'success', 'completed'].includes(normalized)) {
    return 'bg-green-100 text-green-700'
  }

  if (['awaiting_payment', 'pending', 'processing'].includes(normalized)) {
    return 'bg-amber-100 text-amber-700'
  }

  if (['failed', 'expired', 'cancelled', 'canceled'].includes(normalized)) {
    return 'bg-red-100 text-red-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function safeParseJson(value: unknown) {
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function toArray(value: unknown): unknown[] {
  const parsed = safeParseJson(value)

  if (Array.isArray(parsed)) return parsed
  return []
}

function toNumber(value: unknown, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function normalizeItem(raw: any): OrderItem | null {
  if (!raw || typeof raw !== 'object') return null

  const name =
    raw.name ||
    raw.product_name ||
    raw.title ||
    raw.productTitle ||
    raw.item_name ||
    raw.label ||
    'Untitled Item'

  const quantity = Math.max(
    1,
    toNumber(raw.quantity ?? raw.qty ?? raw.count ?? raw.item_quantity, 1)
  )

  const price = toNumber(
    raw.price ??
      raw.unit_price ??
      raw.unitPrice ??
      raw.amount ??
      raw.item_price ??
      raw.sale_price,
    0
  )

  const total = toNumber(
    raw.total ??
      raw.line_total ??
      raw.lineTotal ??
      raw.subtotal ??
      raw.item_total,
    price * quantity
  )

  const slug = raw.slug || raw.product_slug || null

  return {
    name: String(name),
    quantity,
    price,
    total,
    slug,
  }
}

function extractOrderItems(order: OrderRow): OrderItem[] {
  const metadata = safeParseJson(order.metadata)
  const payload = safeParseJson(order.payload)

  const candidates: unknown[] = [
    order.order_items,
    order.items,
    order.cart_items,
    order.checkout_items,
    metadata &&
    typeof metadata === 'object' &&
    'items' in (metadata as Record<string, unknown>)
      ? (metadata as Record<string, unknown>).items
      : null,
    payload &&
    typeof payload === 'object' &&
    'items' in (payload as Record<string, unknown>)
      ? (payload as Record<string, unknown>).items
      : null,
  ]

  for (const candidate of candidates) {
    const arr = toArray(candidate)
    if (arr.length > 0) {
      const normalized = arr
        .map((item) => normalizeItem(item))
        .filter(Boolean) as OrderItem[]

      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  if (order.product_name || order.amount) {
    return [
      {
        name: order.product_name || 'Untitled Product',
        quantity: 1,
        price: Number(order.amount || 0),
        total: Number(order.amount || 0),
        slug: order.product_slug || null,
      },
    ]
  }

  return []
}

function getOrderTotal(order: OrderRow, items: OrderItem[]) {
  if (items.length > 0) {
    const itemsTotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0)
    if (itemsTotal > 0) return itemsTotal
  }

  return Number(order.amount || 0)
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  const fetchOrders = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data as OrderRow[])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const items = extractOrderItems(order)

      const itemText = items
        .map((item) => `${item.name} ${item.slug || ''}`)
        .join(' ')
        .toLowerCase()

      const keyword = search.toLowerCase().trim()
      const haystack = [
        order.order_number,
        order.product_name,
        order.product_slug,
        order.id,
        order.status,
        order.payment_status,
        order.buyer_name,
        order.buyer_phone,
        order.buyer_email,
        itemText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = keyword ? haystack.includes(keyword) : true
      const currentStatus = normalizeStatus(order.payment_status || order.status)

      const matchesStatus =
        statusFilter === 'all' ? true : currentStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const stats = useMemo(() => {
    const totalOrders = orders.length

    const paidOrders = orders.filter((order) =>
      ['paid', 'success', 'completed'].includes(
        normalizeStatus(order.payment_status || order.status)
      )
    ).length

    const pendingOrders = orders.filter((order) =>
      ['awaiting_payment', 'pending', 'processing'].includes(
        normalizeStatus(order.payment_status || order.status)
      )
    ).length

    const failedOrders = orders.filter((order) =>
      ['failed', 'expired', 'cancelled', 'canceled'].includes(
        normalizeStatus(order.payment_status || order.status)
      )
    ).length

    const revenue = orders
      .filter((order) =>
        ['paid', 'success', 'completed'].includes(
          normalizeStatus(order.payment_status || order.status)
        )
      )
      .reduce((sum, order) => {
        const items = extractOrderItems(order)
        return sum + getOrderTotal(order, items)
      }, 0)

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      failedOrders,
      revenue,
    }
  }, [orders])

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Orders
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Monitor your incoming orders, payment status, and recent activity.
        </p>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total Orders" value={String(stats.totalOrders)} />
        <StatCard label="Paid Orders" value={String(stats.paidOrders)} />
        <StatCard label="Pending Payment" value={String(stats.pendingOrders)} />
        <StatCard label="Failed / Expired" value={String(stats.failedOrders)} />
        <StatCard label="Revenue" value={formatMoney(stats.revenue)} />
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number, customer, product, phone or status..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="all">All Status</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="success">Success</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Order List</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredOrders.length} order
              {filteredOrders.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders found</p>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = normalizeStatus(order.payment_status || order.status)
              const items = extractOrderItems(order)
              const totalQuantity = items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
              )
              const orderTotal = getOrderTotal(order, items)
              const isExpanded = expandedOrders[order.id] ?? true

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900">
                          {order.order_number || `Order ${order.id.slice(0, 8)}`}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm">
                          <span>{formatDate(order.created_at)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            {items.length} item{items.length === 1 ? '' : 's'}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            Qty {totalQuantity > 0 ? totalQuantity : items.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleOrderExpanded(order.id)}
                          className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <InfoCard
                        label="Customer"
                        value={order.buyer_name || '-'}
                        subValue={order.buyer_phone || order.buyer_email || '-'}
                      />
                      <InfoCard
                        label="Items"
                        value={`${items.length} item${items.length === 1 ? '' : 's'}`}
                        subValue={`${totalQuantity || items.length} total quantity`}
                      />
                      <InfoCard
                        label="Order Total"
                        value={formatMoney(orderTotal)}
                        subValue="Total for this order"
                      />
                      <InfoCard
                        label="Payment"
                        value={status}
                        subValue={formatDate(order.created_at)}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Order Details
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Item details for this order.
                          </p>
                        </div>
                      </div>

                      {items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                          No item details available for this order.
                        </div>
                      ) : (
                        <>
                          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
                            <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              <div className="col-span-5">Item</div>
                              <div className="col-span-2 text-center">Qty</div>
                              <div className="col-span-2 text-right">Price</div>
                              <div className="col-span-3 text-right">Total</div>
                            </div>

                            <div>
                              {items.map((item, index) => (
                                <div
                                  key={`${order.id}-item-${index}`}
                                  className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-slate-700 not-last:border-b not-last:border-slate-100"
                                >
                                  <div className="col-span-5 min-w-0">
                                    <div className="font-semibold text-slate-900">
                                      {item.name}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                      {item.slug || '—'}
                                    </div>
                                  </div>
                                  <div className="col-span-2 text-center font-medium">
                                    {item.quantity}
                                  </div>
                                  <div className="col-span-2 text-right font-medium">
                                    {formatMoney(item.price)}
                                  </div>
                                  <div className="col-span-3 text-right font-semibold text-slate-900">
                                    {formatMoney(item.total)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3 md:hidden">
                            {items.map((item, index) => (
                              <div
                                key={`${order.id}-item-mobile-${index}`}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                              >
                                <div className="text-sm font-bold text-slate-900">
                                  {item.name}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {item.slug || '—'}
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-3">
                                  <MiniInfo label="Qty" value={String(item.quantity)} />
                                  <MiniInfo
                                    label="Price"
                                    value={formatMoney(item.price)}
                                  />
                                  <MiniInfo
                                    label="Total"
                                    value={formatMoney(item.total)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex justify-end">
                            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:max-w-sm">
                              <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>Total Items</span>
                                <span className="font-semibold text-slate-900">
                                  {items.length}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                                <span>Total Quantity</span>
                                <span className="font-semibold text-slate-900">
                                  {totalQuantity || items.length}
                                </span>
                              </div>
                              <div className="mt-3 border-t border-slate-200 pt-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-slate-600">
                                    Order Total
                                  </span>
                                  <span className="text-lg font-extrabold text-slate-900">
                                    {formatMoney(orderTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </Layout>
  )
}

function StatCard({ label, value }: StatProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-3 text-2xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}

function InfoCard({ label, value, subValue }: InfoProps & { subValue: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2 break-words text-base font-bold text-slate-900">
        {value}
      </div>
      <div className="mt-1 break-words text-xs text-slate-500">{subValue}</div>
    </div>
  )
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
    </div>
  )
}
