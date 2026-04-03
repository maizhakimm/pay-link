'use client'

import Layout from '../../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

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
  created_at?: string | null
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
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
      .reduce((sum, order) => sum + Number(order.amount || 0), 0)

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

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900">
                        {order.product_name || 'Untitled Product'}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm">
                        <span>Order No: {order.order_number || order.id}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                        status
                      )}`}
                    >
                      {status}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoCard
                      label="Customer"
                      value={order.buyer_name || '-'}
                      subValue={order.buyer_phone || '-'}
                    />
                    <InfoCard
                      label="Product"
                      value={order.product_name || '-'}
                      subValue={order.product_slug || '-'}
                    />
                    <InfoCard
                      label="Amount"
                      value={formatMoney(order.amount)}
                      subValue="Order amount"
                    />
                    <InfoCard
                      label="Payment"
                      value={status}
                      subValue={formatDate(order.created_at)}
                    />
                  </div>
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
