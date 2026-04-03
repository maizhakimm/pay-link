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
  created_at?: string | null
  product_name?: string | null
  buyer_name?: string | null
}

function formatMoney(value?: number | null) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-')
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [sellerProfile, setSellerProfile] = useState<SellerProfileRow | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [dailyNote, setDailyNote] = useState('')
  const [copied, setCopied] = useState(false)

  const loadDashboard = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: seller } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single()

    setSellerProfile(seller)
    setDailyNote(seller?.daily_note || '')

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_profile_id', seller.id)

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_profile_id', seller.id)
      .order('created_at', { ascending: false })

    setProducts(productData || [])
    setOrders(orderData || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const activeProducts = products.filter(p => p.is_active)

  const shopLink = sellerProfile?.store_name
    ? `${window.location.origin}/shop/${slugify(sellerProfile.store_name)}`
    : ''

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0)

  const message = `
Salam 😊

Open order hari ini:

${activeProducts.map((p, i) => `${i + 1}. ${p.name} - ${formatMoney(p.price)}`).join('\n')}

${dailyNote}

Order sini:
${shopLink}
`

  async function saveNote() {
    await supabase
      .from('seller_profiles')
      .update({ daily_note: dailyNote })
      .eq('id', sellerProfile?.id)
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (loading) return <Layout>Loading...</Layout>

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Welcome {sellerProfile?.store_name}
        </h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card title="Products" value={products.length} />
        <Card title="Revenue" value={`RM ${totalRevenue}`} />
      </div>

      {/* DAILY NOTE */}
      <div className="bg-white p-4 rounded-xl mb-6 border">
        <h2 className="font-bold mb-2">Daily Note</h2>
        <textarea
          value={dailyNote}
          onChange={(e) => setDailyNote(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Contoh: Delivery petang sahaja"
        />
        <button onClick={saveNote} className="mt-2 bg-black text-white px-4 py-2 rounded">
          Save Note
        </button>
      </div>

      {/* WHATSAPP SECTION */}
      <div className="bg-white p-4 rounded-xl border mb-6">
        <h2 className="font-bold mb-2">WhatsApp Message</h2>

        <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-line">
          {message}
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={copyMessage} className="border px-3 py-2 rounded">
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button onClick={shareWhatsApp} className="bg-green-500 text-white px-3 py-2 rounded">
            WhatsApp
          </button>
        </div>
      </div>

      {/* ORDERS */}
      <div className="bg-white p-4 rounded-xl border">
        <h2 className="font-bold mb-3">Recent Orders</h2>

        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.slice(0, 5).map(order => (
            <div key={order.id} className="border-b py-2">
              <div>{order.product_name}</div>
              <div className="text-sm text-gray-500">{formatMoney(order.amount)}</div>
            </div>
          ))
        )}
      </div>

    </Layout>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
