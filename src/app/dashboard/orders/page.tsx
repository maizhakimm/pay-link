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

  const stats = useMemo(() => {
    const totalOrders = orders.length

    const paidOrders = orders.filter((o) =>
      ['paid'].includes(normalizeStatus(o.payment_status))
    ).length

    const pendingOrders = orders.filter((o) =>
      ['awaiting_payment', 'pending'].includes(normalizeStatus(o.payment_status))
    ).length

    const failedOrders = orders.filter((o) =>
      ['failed', 'cancelled'].includes(normalizeStatus(o.payment_status))
    ).length

    const revenue = orders
      .filter((o) => normalizeStatus(o.payment_status) === 'paid')
      .reduce((sum, o) => sum + Number(o.amount || 0), 0)

    return { totalOrders, paidOrders, pendingOrders, failedOrders, revenue }
  }, [orders])

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-6">Orders</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Total" value={stats.totalOrders} />
        <Stat label="Paid" value={stats.paidOrders} />
        <Stat label="Pending" value={stats.pendingOrders} />
        <Stat label="Failed" value={stats.failedOrders} />
        <Stat label="Revenue" value={formatMoney(stats.revenue)} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = normalizeStatus(order.payment_status)

            return (
              <div key={order.id} className="border p-4 rounded-xl bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">
                      {order.product_name || 'Product'}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Order: {order.order_number || order.id}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Info label="Customer" value={order.buyer_name || '-'} />
                  <Info label="Phone" value={order.buyer_phone || '-'} />
                  <Info label="Amount" value={formatMoney(order.amount)} />
                  <Info label="Payment" value={status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}

function Stat({ label, value }: any) {
  return (
    <div className="p-4 border rounded-xl bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}

function Info({ label, value }: any) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}
