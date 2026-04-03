'use client'

import Layout from '../../components/Layout'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type SellerProfile = {
  id: string
  store_name: string | null
  daily_note?: string | null
}

type Product = {
  id: string
  name?: string
  price?: number
  is_active?: boolean
}

type Order = {
  id: string
  product_name?: string
  amount?: number
}

function formatMoney(value?: number) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-')
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [dailyNote, setDailyNote] = useState('')
  const [copied, setCopied] = useState(false)

  // ✅ FIX: hook dalam component
  const loadDashboard = useCallback(async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: sellerData } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!sellerData) {
      window.location.href = '/dashboard/settings'
      return
    }

    setSeller(sellerData)
    setDailyNote(sellerData.daily_note || '')

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_profile_id', sellerData.id)

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_profile_id', sellerData.id)
      .order('created_at', { ascending: false })

    setProducts(productData || [])
    setOrders(orderData || [])

    setLoading(false)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const activeProducts = products.filter(p => p.is_active)

  const shopLink = seller?.store_name
    ? `${window.location.origin}/shop/${slugify(seller.store_name)}`
    : ''

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0)

  const message = `Salam 😊

Open order hari ini:

${activeProducts.map((p, i) => `${i + 1}. ${p.name} - ${formatMoney(p.price)}`).join('\n')}

${dailyNote}

Order sini:
${shopLink}
`

  async function saveNote() {
    if (!seller) return

    await supabase
      .from('seller_profiles')
      .update({ daily_note: dailyNote })
      .eq('id', seller.id)

    alert('Saved')
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

  if (loading) {
    return <Layout>Loading...</Layout>
  }

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Welcome {seller?.store_name}
        </h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card title="Products" value={products.length} />
        <Card title="Revenue" value={formatMoney(totalRevenue)} />
      </div>

      {/* DAILY NOTE */}
      <div className="bg-white p-4 rounded-xl mb-6 border">
        <h2 className="font-bold mb-2">Daily Note</h2>
        <textarea
          value={dailyNote}
          onChange={(e) => setDailyNote(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={saveNote}
          className="mt-2 bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>

      {/* WHATSAPP */}
      <div className="bg-white p-4 rounded-xl border mb-6">
        <h2 className="font-bold mb-2">WhatsApp Message</h2>

        <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-line">
          {message}
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={copyMessage} className="border px-3 py-2 rounded">
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={shareWhatsApp}
            className="bg-green-500 text-white px-3 py-2 rounded"
          >
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
              <div className="text-sm text-gray-500">
                {formatMoney(order.amount)}
              </div>
            </div>
          ))
        )}
      </div>

    </Layout>
  )
}

// ✅ FIX TYPE (NO ANY)
function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
