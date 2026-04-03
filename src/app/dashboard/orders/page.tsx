'use client'

import Layout from "@/components/Layout"
import { useCallback, useEffect, useMemo, useState } from 'react'
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
      setOrders(data)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded-lg">
              <p><b>Product:</b> {order.product_name}</p>
              <p><b>Amount:</b> RM {order.amount}</p>
              <p><b>Status:</b> {order.status}</p>
              <p className="text-sm text-gray-500">
                {order.created_at}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
