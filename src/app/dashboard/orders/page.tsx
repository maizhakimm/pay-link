'use client'

import Layout from '../../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type JsonRecord = Record<string, unknown>

type OrderAddon = {
  group_id?: string | null
  group_name?: string | null
  option_id?: string | null
  option_name?: string | null
  price?: number | null
}

type OrderItem = {
  name: string
  quantity: number
  price: number
  total: number
  slug?: string | null
  note?: string | null
  addons?: OrderAddon[]
}

type OrderRow = {
  id: string
  order_number?: string | null
  product_name?: string | null
  product_slug?: string | null
  amount?: number | null
  total_amount?: number | null
  status?: string | null
  fulfillment_status?: string | null
  payment_status?: string | null
  buyer_name?: string | null
  buyer_phone?: string | null
  buyer_email?: string | null
  buyer_address?: string | null
  created_at?: string | null
  seller_profile_id?: string | null
  items?: unknown
  order_items?: unknown
  cart_items?: unknown
  checkout_items?: unknown
  metadata?: unknown
  payload?: unknown
  customer_details?: unknown
  delivery_info?: unknown
  delivery_slot_id?: string | null
  delivery_slot_label?: string | null
}

type SellerProfileRow = {
  id: string
  user_id: string
  store_name?: string | null
  shop_slug?: string | null
}

type StatProps = {
  label: string
  value: string | number
  helper?: string
}

type InfoProps = {
  label: string
  value: string | number
  subValue?: string
}

const SELLER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

function normalizeStatus(value?: string | null) {
  return (value || '').toString().toLowerCase().trim()
}

function normalizeSellerStatus(value?: string | null) {
  const normalized = normalizeStatus(value)

  if (
    ['pending', 'processing', 'completed', 'cancelled', 'canceled'].includes(
      normalized
    )
  ) {
    return normalized === 'canceled' ? 'cancelled' : normalized
  }

  return 'pending'
}

function normalizePaymentStatus(value?: string | null) {
  const normalized = normalizeStatus(value)
  return normalized || 'awaiting_payment'
}

function getSellerStatus(order: OrderRow) {
  return normalizeSellerStatus(order.fulfillment_status || order.status)
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

function sellerStatusBadgeClass(status: string) {
  const normalized = normalizeSellerStatus(status)

  if (normalized === 'completed') {
    return 'bg-green-100 text-green-700'
  }

  if (normalized === 'processing') {
    return 'bg-blue-100 text-blue-700'
  }

  if (normalized === 'cancelled') {
    return 'bg-red-100 text-red-700'
  }

  return 'bg-amber-100 text-amber-700'
}

function safeParseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function toArray(value: unknown): unknown[] {
  const parsed = safeParseJson(value)
  return Array.isArray(parsed) ? parsed : []
}

function toRecord(value: unknown): JsonRecord | null {
  const parsed = safeParseJson(value)

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }

  return parsed as JsonRecord
}

function toNumber(value: unknown, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function getObjectValue(
  source: JsonRecord,
  keys: string[],
  fallback?: unknown
): unknown {
  for (const key of keys) {
    if (key in source) return source[key]
  }
  return fallback
}

function normalizeAddons(raw: unknown): OrderAddon[] {
  const parsed = safeParseJson(raw)
  if (!Array.isArray(parsed)) return []

  return parsed
    .filter((addon) => addon && typeof addon === 'object' && !Array.isArray(addon))
    .map((addon) => {
      const item = addon as JsonRecord
      return {
        group_id: getObjectValue(item, ['group_id'], null)
          ? String(getObjectValue(item, ['group_id'], ''))
          : null,
        group_name: getObjectValue(item, ['group_name'], null)
          ? String(getObjectValue(item, ['group_name'], ''))
          : null,
        option_id: getObjectValue(item, ['option_id'], null)
          ? String(getObjectValue(item, ['option_id'], ''))
          : null,
        option_name: getObjectValue(item, ['option_name', 'name'], null)
          ? String(getObjectValue(item, ['option_name', 'name'], ''))
          : null,
        price: toNumber(getObjectValue(item, ['price'], 0), 0),
      }
    })
}

function normalizeItem(raw: unknown): OrderItem | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const item = raw as JsonRecord

  const nameValue = getObjectValue(
    item,
    ['name', 'product_name', 'title', 'productTitle', 'item_name', 'label'],
    'Untitled Item'
  )

  const quantity = Math.max(
    1,
    toNumber(
      getObjectValue(item, ['quantity', 'qty', 'count', 'item_quantity'], 1),
      1
    )
  )

  const price = toNumber(
    getObjectValue(
      item,
      ['price', 'unit_price', 'unitPrice', 'amount', 'item_price', 'sale_price'],
      0
    ),
    0
  )

  const total = toNumber(
    getObjectValue(
      item,
      ['total', 'line_total', 'lineTotal', 'subtotal', 'item_total'],
      price * quantity
    ),
    price * quantity
  )

  const slugValue = getObjectValue(item, ['slug', 'product_slug'], null)
  const noteValue = getObjectValue(item, ['note', 'customer_note', 'remarks'], null)
  const addonsValue = getObjectValue(item, ['addons', 'add_ons'], [])

  return {
    name: String(nameValue || 'Untitled Item'),
    quantity,
    price,
    total,
    slug: slugValue ? String(slugValue) : null,
    note: noteValue ? String(noteValue) : null,
    addons: normalizeAddons(addonsValue),
  }
}

function extractItemsFromObject(value: unknown): OrderItem[] {
  const parsed = safeParseJson(value)

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return []
  }

  const record = parsed as JsonRecord
  const nestedItems = record.items

  if (!nestedItems) return []

  const arr = toArray(nestedItems)
  return arr
    .map((item) => normalizeItem(item))
    .filter((item): item is OrderItem => item !== null)
}

function extractOrderItems(order: OrderRow): OrderItem[] {
  const directCandidates: unknown[] = [
    order.order_items,
    order.items,
    order.checkout_items,
    order.cart_items,
  ]

  for (const candidate of directCandidates) {
    const arr = toArray(candidate)
    if (arr.length > 0) {
      const normalized = arr
        .map((item) => normalizeItem(item))
        .filter((item): item is OrderItem => item !== null)

      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  const objectCandidates: unknown[] = [order.metadata, order.payload]

  for (const candidate of objectCandidates) {
    const normalized = extractItemsFromObject(candidate)
    if (normalized.length > 0) {
      return normalized
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
        note: null,
        addons: [],
      },
    ]
  }

  return []
}

function getOrderTotal(order: OrderRow, items: OrderItem[]) {
  if (order.total_amount !== null && order.total_amount !== undefined) {
    return Number(order.total_amount)
  }

  if (order.amount !== null && order.amount !== undefined) {
    return Number(order.amount)
  }

  if (items.length > 0) {
    const itemsTotal = items.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    )
    if (itemsTotal > 0) return itemsTotal
  }

  return 0
}

function getOrderSlotLabel(order: OrderRow) {
  if (order.delivery_slot_label && String(order.delivery_slot_label).trim()) {
    return String(order.delivery_slot_label).trim()
  }

  const deliveryInfo = toRecord(order.delivery_info)
  if (!deliveryInfo) return ''

  const direct =
    getObjectValue(deliveryInfo, ['slot_label', 'delivery_slot_label'], '') || ''

  return String(direct || '').trim()
}

function getOrderDeliveryAddress(order: OrderRow) {
  const deliveryInfo = toRecord(order.delivery_info)

  if (deliveryInfo) {
    const resolvedAddress = getObjectValue(
      deliveryInfo,
      ['resolved_address'],
      ''
    )

    if (resolvedAddress && String(resolvedAddress).trim()) {
      return String(resolvedAddress).trim()
    }

    const nestedAddress = getObjectValue(deliveryInfo, ['address'], null)
    const nestedRecord = toRecord(nestedAddress)

    if (nestedRecord) {
      const parts = [
        getObjectValue(nestedRecord, ['address1'], ''),
        getObjectValue(nestedRecord, ['address2'], ''),
        getObjectValue(nestedRecord, ['postcode'], ''),
        getObjectValue(nestedRecord, ['city'], ''),
        getObjectValue(nestedRecord, ['district'], ''),
        getObjectValue(nestedRecord, ['state'], ''),
      ]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }
  }

  if (order.buyer_address && String(order.buyer_address).trim()) {
    return String(order.buyer_address).trim()
  }

  return ''
}

function getOrderDeliveryType(order: OrderRow) {
  const address = getOrderDeliveryAddress(order)
  return address ? 'Delivery' : 'Pickup'
}

function getOrderAddressPreview(order: OrderRow) {
  const address = getOrderDeliveryAddress(order)
  if (!address) return ''

  if (address.length <= 60) return address
  return `${address.slice(0, 60)}...`
}

function isToday(dateValue?: string | null) {
  if (!dateValue) return false

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfileRow | null>(null)
  const [pageError, setPageError] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setPageError('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(authError.message)
      }

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_profiles')
        .select('id, user_id, store_name, shop_slug')
        .eq('user_id', user.id)
        .maybeSingle()

      if (sellerError) {
        throw new Error(sellerError.message)
      }

      if (!sellerData) {
        setSellerProfile(null)
        setOrders([])
        setPageError('Seller profile not found. Please complete your settings first.')
        return
      }

      setSellerProfile(sellerData as SellerProfileRow)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_profile_id', sellerData.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      setOrders((data || []) as OrderRow[])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch orders.'
      console.error('Failed to fetch orders:', message)
      setOrders([])
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId))
  }

  const handleSellerStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!sellerProfile?.id) {
      alert('Seller profile not found.')
      return
    }

    setUpdatingOrderId(orderId)

    const { error } = await supabase
      .from('orders')
      .update({ fulfillment_status: newStatus })
      .eq('id', orderId)
      .eq('seller_profile_id', sellerProfile.id)

    if (error) {
      console.error('Failed to update fulfillment_status:', error)
      alert(`Failed to update order status: ${error.message}`)
      setUpdatingOrderId(null)
      return
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, fulfillment_status: newStatus }
          : order
      )
    )

    await fetchOrders()
    setUpdatingOrderId(null)
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const items = extractOrderItems(order)
      const slotLabel = getOrderSlotLabel(order)
      const deliveryAddress = getOrderDeliveryAddress(order)
      const deliveryType = getOrderDeliveryType(order)

      const itemText = items
        .map((item) => {
          const addonText = (item.addons || [])
            .map((addon) => `${addon.option_name || ''} ${addon.group_name || ''}`)
            .join(' ')
          return `${item.name} ${item.slug || ''} ${item.note || ''} ${addonText}`
        })
        .join(' ')
        .toLowerCase()

      const keyword = search.toLowerCase().trim()
      const haystack = [
        order.order_number,
        order.product_name,
        order.product_slug,
        order.id,
        order.status,
        order.fulfillment_status,
        order.payment_status,
        order.buyer_name,
        order.buyer_phone,
        order.buyer_email,
        slotLabel,
        deliveryAddress,
        deliveryType,
        itemText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = keyword ? haystack.includes(keyword) : true

      const sellerStatus = getSellerStatus(order)
      const paymentStatus = normalizePaymentStatus(order.payment_status)
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : sellerStatus === statusFilter || paymentStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const stats = useMemo(() => {
    const totalOrders = orders.length

    const completedOrders = orders.filter(
      (order) => getSellerStatus(order) === 'completed'
    ).length

    const paidOrders = orders.filter((order) =>
      ['paid', 'success', 'completed'].includes(
        normalizePaymentStatus(order.payment_status)
      )
    ).length

    const pendingOrders = orders.filter((order) =>
      ['awaiting_payment', 'pending', 'processing'].includes(
        normalizePaymentStatus(order.payment_status)
      )
    ).length

    const failedOrders = orders.filter((order) =>
      ['failed', 'expired', 'cancelled', 'canceled'].includes(
        normalizePaymentStatus(order.payment_status)
      )
    ).length

    const revenue = orders
      .filter((order) =>
        ['paid', 'success', 'completed'].includes(
          normalizePaymentStatus(order.payment_status)
        )
      )
      .reduce((sum, order) => {
        const items = extractOrderItems(order)
        return sum + getOrderTotal(order, items)
      }, 0)

    const todayOrdersList = orders.filter((order) => isToday(order.created_at))
    const todayOrders = todayOrdersList.length

    const todayRevenue = todayOrdersList
      .filter((order) =>
        ['paid', 'success', 'completed'].includes(
          normalizePaymentStatus(order.payment_status)
        )
      )
      .reduce((sum, order) => {
        const items = extractOrderItems(order)
        return sum + getOrderTotal(order, items)
      }, 0)

    return {
      totalOrders,
      completedOrders,
      paidOrders,
      pendingOrders,
      failedOrders,
      revenue,
      todayOrders,
      todayRevenue,
    }
  }, [orders])

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Orders
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Monitor your incoming orders, payment status, and update fulfilment progress.
        </p>
      </div>

      {pageError ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-4 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-red-700">{pageError}</p>
        </section>
      ) : null}

      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Today Orders"
            value={String(stats.todayOrders)}
            helper="Created today"
          />
          <StatCard
            label="Today Revenue"
            value={formatMoney(stats.todayRevenue)}
            helper="Paid today"
          />
          <StatCard
            label="Pending Payment"
            value={String(stats.pendingOrders)}
            helper="Awaiting payment"
          />
          <StatCard
            label="Completed Orders"
            value={String(stats.completedOrders)}
            helper="Seller completed"
          />

          <StatCard label="Total Orders" value={String(stats.totalOrders)} />
          <StatCard
            label="Paid Orders"
            value={String(stats.paidOrders)}
            helper="Payment received"
          />
          <StatCard
            label="Failed / Expired"
            value={String(stats.failedOrders)}
            helper="Payment issue"
          />
          <StatCard
            label="Revenue"
            value={formatMoney(stats.revenue)}
            helper="Paid only"
          />
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, customer, phone, slot, address, item or status..."
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
              const items = extractOrderItems(order)
              const totalQuantity = items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
              )
              const orderTotal = getOrderTotal(order, items)
              const isExpanded = expandedOrderId === order.id
              const paymentStatus = normalizePaymentStatus(order.payment_status)
              const sellerStatus = getSellerStatus(order)
              const deliveryType = getOrderDeliveryType(order)
              const deliveryAddress = getOrderDeliveryAddress(order)
              const addressPreview = getOrderAddressPreview(order)
              const slotLabel = getOrderSlotLabel(order)

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-3">
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
                              paymentStatus
                            )}`}
                          >
                            Payment: {paymentStatus}
                          </div>

                          <div
                            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${sellerStatusBadgeClass(
                              sellerStatus
                            )}`}
                          >
                            Order: {sellerStatus}
                          </div>

                          {slotLabel ? (
                            <div className="inline-flex w-fit items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                              Slot: {slotLabel}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {addressPreview ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">
                            {deliveryType}:
                          </span>{' '}
                          {addressPreview}
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
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
                          subValue={deliveryType}
                        />
                        <InfoCard
                          label="Payment Status"
                          value={paymentStatus}
                          subValue={slotLabel || 'No slot'}
                        />
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-sm font-semibold text-slate-500">
                            Action
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleOrderExpanded(order.id)}
                            className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <h4 className="text-sm font-bold text-slate-900">
                              Customer & Delivery
                            </h4>

                            <div className="mt-3 space-y-2 text-sm">
                              <DetailRow label="Customer" value={order.buyer_name || '-'} />
                              <DetailRow label="Phone" value={order.buyer_phone || '-'} />
                              <DetailRow label="Email" value={order.buyer_email || '-'} />
                              <DetailRow label="Type" value={deliveryType} />
                              <DetailRow
                                label="Time Slot"
                                value={slotLabel || '-'}
                              />
                              <DetailRow
                                label="Address"
                                value={deliveryAddress || '-'}
                                multiline
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-3 text-sm font-bold text-slate-900">
                              Order Details
                            </h4>

                            {items.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                                No item details available for this order.
                              </div>
                            ) : (
                              <>
                                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
                                  <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <div className="col-span-6">Item</div>
                                    <div className="col-span-2 text-center">Qty</div>
                                    <div className="col-span-2 text-right">Price</div>
                                    <div className="col-span-2 text-right">Total</div>
                                  </div>

                                  <div>
                                    {items.map((item, index) => (
                                      <div
                                        key={`${order.id}-item-${index}`}
                                        className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-slate-700 not-last:border-b not-last:border-slate-100"
                                      >
                                        <div className="col-span-6 min-w-0">
                                          <div className="font-semibold text-slate-900">
                                            {item.name}
                                          </div>
                                          <div className="mt-1 text-xs text-slate-500">
                                            {item.slug || '—'}
                                          </div>

                                          {item.addons && item.addons.length > 0 ? (
                                            <div className="mt-2 space-y-1">
                                              {item.addons.map((addon, addonIndex) => (
                                                <div
                                                  key={`${order.id}-addon-${index}-${addonIndex}`}
                                                  className="text-xs text-violet-700"
                                                >
                                                  + {addon.option_name || 'Add-on'}
                                                  {typeof addon.price === 'number'
                                                    ? ` (${formatMoney(addon.price)})`
                                                    : ''}
                                                  {addon.group_name
                                                    ? ` • ${addon.group_name}`
                                                    : ''}
                                                </div>
                                              ))}
                                            </div>
                                          ) : null}

                                          {item.note ? (
                                            <div className="mt-2 text-xs text-slate-500">
                                              Note: {item.note}
                                            </div>
                                          ) : null}
                                        </div>

                                        <div className="col-span-2 text-center font-medium">
                                          {item.quantity}
                                        </div>
                                        <div className="col-span-2 text-right font-medium">
                                          {formatMoney(item.price)}
                                        </div>
                                        <div className="col-span-2 text-right font-semibold text-slate-900">
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

                                      <div className="mt-3 text-sm font-semibold text-slate-800">
                                        {item.quantity} × {formatMoney(item.price)} ={' '}
                                        {formatMoney(item.total)}
                                      </div>

                                      {item.addons && item.addons.length > 0 ? (
                                        <div className="mt-3 space-y-1">
                                          {item.addons.map((addon, addonIndex) => (
                                            <div
                                              key={`${order.id}-mobile-addon-${index}-${addonIndex}`}
                                              className="text-xs text-violet-700"
                                            >
                                              + {addon.option_name || 'Add-on'}
                                              {typeof addon.price === 'number'
                                                ? ` (${formatMoney(addon.price)})`
                                                : ''}
                                              {addon.group_name
                                                ? ` • ${addon.group_name}`
                                                : ''}
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}

                                      {item.note ? (
                                        <div className="mt-3 text-xs text-slate-500">
                                          Note: {item.note}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="text-sm font-bold text-slate-900">
                              Update Order Status
                            </div>

                            <select
                              value={sellerStatus}
                              onChange={(e) =>
                                handleSellerStatusUpdate(order.id, e.target.value)
                              }
                              disabled={updatingOrderId === order.id}
                              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50"
                            >
                              {SELLER_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>

                            <div className="mt-3 text-xs text-slate-500">
                              {updatingOrderId === order.id ? 'Updating status...' : ''}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
                            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                              <span>Payment Status</span>
                              <span className="font-semibold capitalize text-slate-900">
                                {paymentStatus}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                              <span>Order Status</span>
                              <span className="font-semibold capitalize text-slate-900">
                                {sellerStatus}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                              <span>Time Slot</span>
                              <span className="text-right font-semibold text-slate-900">
                                {slotLabel || '-'}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                              <span>Type</span>
                              <span className="font-semibold text-slate-900">
                                {deliveryType}
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
                      </div>
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

function StatCard({ label, value, helper }: StatProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-xl font-extrabold text-slate-900 sm:text-2xl">
        {value}
      </div>
      {helper ? (
        <div className="mt-1 text-xs text-slate-500">{helper}</div>
      ) : null}
    </div>
  )
}

function InfoCard({ label, value, subValue }: InfoProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2 break-words text-base font-bold capitalize text-slate-900">
        {value}
      </div>
      {subValue ? (
        <div className="mt-1 break-words text-xs text-slate-500">{subValue}</div>
      ) : null}
    </div>
  )
}

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div
      className={`flex gap-3 ${
        multiline ? 'flex-col' : 'items-start justify-between'
      }`}
    >
      <div className="min-w-[88px] text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`text-sm font-medium text-slate-900 ${
          multiline ? '' : 'text-right'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
