'use client'

import Layout from '../../../components/Layout'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type OrderRow = {
  id: string
  product_name?: string | null
  product_slug?: string | null
  amount?: number | null
  status?: string | null
  created_at?: string | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your incoming orders here.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-500">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm">
                <span className="font-semibold">Product:</span>{' '}
                {order.product_name || '-'}
              </p>
              <p className="mt-1 text-sm">
                <span className="font-semibold">Amount:</span>{' '}
                RM {Number(order.amount || 0).toFixed(2)}
              </p>
              <p className="mt-1 text-sm">
                <span className="font-semibold">Status:</span>{' '}
                {order.status || '-'}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {order.created_at || '-'}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
