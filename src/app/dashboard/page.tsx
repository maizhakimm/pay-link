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
  share_image_mode?: 'product' | 'logo' | 'poster' | null
  share_poster_url?: string | null
}

type Product = {
  id: string
  name?: string
  price?: number
  is_active?: boolean
  menu_category_id?: string | null
  product_image_url?: string | null
}

type MenuCategory = {
  id: string
  name: string
  sort_order?: number | null
  is_active?: boolean | null
}

type Order = {
  id: string
  product_name?: string
  amount?: number
}

function getImageUrl(path?: string | null) {
  if (!path) return ''

  const trimmed = path.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return trimmed

  const cleanPath = trimmed
    .replace(/^storage\/v1\/object\/public\//, '')
    .replace(/^\/+/, '')

  return `${baseUrl}/storage/v1/object/public/${cleanPath}`
}

function formatMoney(value?: number) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [dailyNote, setDailyNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [savingNote, setSavingNote] = useState(false)

  const [shareMode, setShareMode] = useState<'product' | 'logo' | 'poster'>(
    'product'
  )
  const [posterUrl, setPosterUrl] = useState('')

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
      .select(
        'id, store_name, shop_slug, profile_image, daily_note, share_image_mode, share_poster_url'
      )
      .eq('user_id', user.id)
      .single()

    if (sellerError || !sellerData) {
      window.location.href = '/dashboard/settings'
      return
    }

    setSeller(sellerData)
    setDailyNote(sellerData.daily_note || '')
    setShareMode(
      sellerData.share_image_mode === 'logo' ||
        sellerData.share_image_mode === 'poster' ||
        sellerData.share_image_mode === 'product'
        ? sellerData.share_image_mode
        : 'product'
    )
    setPosterUrl(sellerData.share_poster_url || '')

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_profile_id', sellerData.id)

    const { data: categoryData } = await supabase
      .from('menu_categories')
      .select('id, name, sort_order, is_active')
      .eq('seller_profile_id', sellerData.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_profile_id', sellerData.id)
      .order('created_at', { ascending: false })

    setProducts(productData || [])
    setCategories(categoryData || [])
    setOrders(orderData || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.is_active)
  }, [products])

  const activeCategories = useMemo(() => {
    if (!categories.length || !activeProducts.length) return []

    return categories.filter((category) =>
      activeProducts.some(
        (product) => (product.menu_category_id || '') === category.id
      )
    )
  }, [categories, activeProducts])

  const topCategories = useMemo(() => {
    return activeCategories.slice(0, 5)
  }, [activeCategories])

  const topProducts = useMemo(() => {
    return activeProducts.slice(0, 5)
  }, [activeProducts])

  const shopLink =
    seller?.shop_slug && typeof window !== 'undefined'
      ? `${window.location.origin}/s/${seller.shop_slug}`
      : ''

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0)

  const promoLines = useMemo(() => {
    if (topCategories.length > 0) {
      return `Antara kategori:\n${topCategories
        .map((category) => `• ${category.name}`)
        .join('\n')}\n\n...dan banyak lagi menu tersedia.`
    }

    if (topProducts.length > 0) {
      return `Antara menu:\n${topProducts
        .map((p, i) => `${i + 1}. ${p.name} - ${formatMoney(p.price)}`)
        .join('\n')}\n\n...dan banyak lagi menu tersedia.`
    }

    return 'Tiada produk aktif buat masa ini.'
  }, [topCategories, topProducts])

  const message = useMemo(() => {
    const customBlock = dailyNote.trim()

    return `${customBlock ? `${customBlock}\n\n` : ''}${promoLines}

Order sini:
${shopLink}`.trim()
  }, [dailyNote, promoLines, shopLink])

  const previewImage = useMemo(() => {
    if (shareMode === 'poster' && posterUrl) {
      return posterUrl
    }

    if (shareMode === 'logo' && seller?.profile_image) {
      return getImageUrl(seller.profile_image)
    }

    const firstProductWithImage = products.find(
      (p) =>
        p.is_active &&
        p.product_image_url &&
        p.product_image_url.trim() !== ''
    )

    if (firstProductWithImage?.product_image_url) {
      return getImageUrl(firstProductWithImage.product_image_url)
    }

    if (seller?.profile_image) {
      return getImageUrl(seller.profile_image)
    }

    return '/default-share.png'
  }, [shareMode, posterUrl, seller, products])

  async function uploadPoster(file?: File) {
    if (!file || !seller) return

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `poster-${seller.id}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    setPosterUrl(data.publicUrl)
  }

  async function saveAllShareSettings() {
    if (!seller) return

    setSavingNote(true)

    const { error } = await supabase
      .from('seller_profiles')
      .update({
        daily_note: dailyNote,
        share_image_mode: shareMode,
        share_poster_url: posterUrl || null,
      })
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
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center gap-4">
          {seller?.profile_image ? (
            <img
              src={getImageUrl(seller.profile_image) || '/default-avatar.png'}
              alt={seller.store_name || 'Seller profile'}
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500">
              {(seller?.store_name || 'S').slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-slate-900 sm:text-3xl">
              {seller?.store_name || 'Seller'}
            </h1>
            <p className="mt-1 break-all text-sm text-slate-500">
              {shopLink || 'Complete your settings to activate your shop link.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card title="Products" value={products.length} />
        <Card title="Revenue" value={formatMoney(totalRevenue)} />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Share Preview</h2>
          <p className="text-sm text-slate-500">
            Tulis caption. Preview akan dikemaskini secara automatik.
          </p>
        </div>

        <div className="mb-5">
          <textarea
            value={dailyNote}
            onChange={(e) => setDailyNote(e.target.value)}
            placeholder="Contoh: Open order hari ini! Delivery petang 🚚"
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-3 text-base text-slate-900 outline-none transition focus:border-black"
          />
        </div>

        <div className="mb-5">
          <p className="mb-3 text-xs text-slate-500">
            Pilih gambar yang akan dipaparkan bila link di-share.
          </p>

          <div className="grid gap-3">
            <select
              value={shareMode}
              onChange={(e) =>
                setShareMode(e.target.value as 'product' | 'logo' | 'poster')
              }
              className="w-full rounded-lg border border-slate-200 p-3 text-base text-slate-900 outline-none transition focus:border-black"
            >
              <option value="product">Product Image</option>
              <option value="logo">Logo Kedai</option>
              <option value="poster">Upload Poster</option>
            </select>

            {shareMode === 'poster' && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadPoster(e.target.files?.[0])}
                className="w-full rounded-lg border border-slate-200 p-3 text-base text-slate-900 outline-none transition focus:border-black"
              />
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Link Preview
            </p>

            <div className="overflow-hidden rounded-lg border bg-white">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-40 w-full object-cover transition duration-300 hover:scale-[1.02]"
                />
              ) : null}

              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {seller?.store_name || 'Nama Kedai'}
                </p>

                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {dailyNote.trim() || 'Order dengan mudah di sini.'}
                </p>

                <p className="mt-2 break-all text-xs text-slate-400">
                  {shopLink || 'https://www.bayarlink.my'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              WhatsApp Preview
            </p>

            <div className="whitespace-pre-line rounded-lg border bg-white p-3 text-sm text-slate-800">
              {message}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={saveAllShareSettings}
            disabled={savingNote}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:opacity-70"
          >
            {savingNote ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={copyMessage}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition hover:bg-slate-50"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={shareWhatsApp}
            className="rounded-lg bg-green-500 px-3 py-2 text-sm text-white transition hover:bg-green-600"
          >
            Share to WhatsApp
          </button>
        </div>
      </div>
    </Layout>
  )
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  )
}
