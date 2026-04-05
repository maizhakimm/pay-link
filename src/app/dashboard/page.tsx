'use client'

import Layout from '../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type SellerProfile = {
  id: string
  store_name: string | null
  shop_slug?: string | null
  profile_image?: string | null
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [dailyNote, setDailyNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [savingNote, setSavingNote] = useState(false)

  const loadDashboard = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: sellerData, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('id, store_name, shop_slug, profile_image, daily_note')
      .eq('user_id', user.id)
      .single()

    if (sellerError || !sellerData) {
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

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.is_active)
  }, [products])

  const shopLink =
    seller?.shop_slug && typeof window !== 'undefined'
      ? `${window.location.origin}/s/${seller.shop_slug}`
      : ''

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0)

  const productLines = activeProducts.length
    ? activeProducts
        .map((p, i) => `${i + 1}. ${p.name} - ${formatMoney(p.price)}`)
        .join('\n')
    : 'Tiada produk aktif buat masa ini.'

  const message = useMemo(() => {
    const customBlock = dailyNote.trim()

    return `Salam 😊

${customBlock ? `${customBlock}\n\n` : ''}Open order hari ini:

${productLines}

Order sini:
${shopLink}`.trim()
  }, [dailyNote, productLines, shopLink])

  async function saveNote() {
    if (!seller) return

    setSavingNote(true)

    const { error } = await supabase
      .from('seller_profiles')
      .update({ daily_note: dailyNote })
      .eq('id', seller.id)

    setSavingNote(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Saved')
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      alert('Unable to copy message')
    }
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
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {seller?.profile_image ? (
            <img
              src={seller.profile_image}
              alt={seller.store_name || 'Seller profile'}
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500">
              {(seller?.store_name || 'S').slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome {seller?.store_name || 'Seller'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {shopLink || 'Complete your settings to activate your shop link.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card title="Products" value={products.length} />
        <Card title="Revenue" value={formatMoney(totalRevenue)} />
      </div>

      <div className="mb-6 rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-bold">Daily Note / Copywriting</h2>
        <p className="mb-3 text-sm text-slate-500">
          Ini optional. Seller boleh tulis ayat sendiri di sini. Sistem tetap akan auto senaraikan produk aktif di bawah mesej WhatsApp.
        </p>

        <textarea
          value={dailyNote}
          onChange={(e) => setDailyNote(e.target.value)}
          placeholder="Contoh: Open order hari ini untuk delivery petang. COD area Shah Alam sahaja."
          rows={4}
          className="w-full rounded border p-3 outline-none"
        />

        <button
          onClick={saveNote}
          disabled={savingNote}
          className="mt-3 rounded bg-black px-4 py-2 text-white disabled:opacity-70"
        >
          {savingNote ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-bold">WhatsApp Message</h2>
        <p className="mb-3 text-sm text-slate-500">
          Produk di bawah ini dijana automatik berdasarkan produk yang aktif sahaja.
        </p>

        <div className="whitespace-pre-line rounded bg-gray-50 p-3 text-sm">
          {message}
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={copyMessage} className="rounded border px-3 py-2">
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={shareWhatsApp}
            className="rounded bg-green-500 px-3 py-2 text-white"
          >
            WhatsApp
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-bold">Recent Orders</h2>

        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.slice(0, 5).map((order) => (
            <div key={order.id} className="border-b py-2 last:border-b-0">
              <div>{order.product_name}</div>
              <div className="text-sm text-gray-500">{formatMoney(order.amount)}</div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
