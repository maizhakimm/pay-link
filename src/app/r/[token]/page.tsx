'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ReceiptPage() {
  const params = useParams()
  const token = params.token as string

  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [seller, setSeller] = useState<any>(null)

  async function loadData() {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('receipt_token', token)
      .single()

    if (!orderData) return

    setOrder(orderData)

    const { data: sellerData } = await supabase
      .from('seller_profiles')
      .select('store_name, profile_image')
      .eq('id', orderData.seller_profile_id)
      .single()

    setSeller(sellerData)

    const { data: itemData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.id)

    setItems(itemData || [])
  }

  useEffect(() => {
    loadData()

    // 🔥 realtime subscribe
    const channel = supabase
      .channel('order-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.new.receipt_token === token) {
            setOrder(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!order) return null

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-5 space-y-5">

        {/* HEADER */}
        <div className="text-center">
          {seller?.profile_image && (
            <img
              src={seller.profile_image}
              className="mx-auto mb-3 h-20 w-20 rounded-full object-cover border shadow-sm"
            />
          )}

          <p className="text-lg font-bold">{seller?.store_name}</p>
          <h1 className="text-xl font-semibold">
            Payment Successful
          </h1>
        </div>

        {/* SUMMARY */}
        <div className="border rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Order No</span>
            <span>{order.order_number}</span>
          </div>

          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-semibold">
              RM {Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* ITEMS */}
        <div className="border rounded-xl p-4 text-sm">
          <h2 className="mb-2 font-medium">Items</h2>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.product_name} x{item.quantity}</span>
              <span>RM {Number(item.line_total).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* 🔥 LIVE STATUS */}
        <div className="border rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Status Order</p>

          {order.fulfillment_status === 'pending' && (
            <p className="text-yellow-600 font-semibold">
              ⏳ Menunggu pengesahan
            </p>
          )}

          {order.fulfillment_status === 'processing' && (
            <p className="text-blue-600 font-semibold">
              👨‍🍳 Sedang disediakan
            </p>
          )}

          {order.fulfillment_status === 'completed' && (
            <p className="text-green-600 font-semibold">
              ✅ Selesai
            </p>
          )}

          {order.fulfillment_status === 'cancelled' && (
            <p className="text-red-600 font-semibold">
              ❌ Dibatalkan
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t pt-4 text-center">
          <p className="text-xs text-gray-400 mb-2">Powered by</p>
          <img src="/BayarLink-Logo-Shop-Page.svg" className="h-4 mx-auto" />
        </div>

      </div>
    </div>
  )
}
