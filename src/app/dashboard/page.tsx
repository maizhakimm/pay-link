'use client'

import Layout from '../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'
  | 'distance_based'

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

type OperatingDayItem = {
  enabled: boolean
  opening_time: string
  closing_time: string
}

type OperatingDays = Record<DayKey, OperatingDayItem>

type SellerProfile = {
  id: string
  store_name: string | null
  shop_slug?: string | null
  order_mode?: 'anytime' | 'scheduled' | 'preorder' | null
  profile_image?: string | null
  daily_note?: string | null
  whatsapp?: string | null
  delivery_mode?: DeliveryMode | null
  accept_orders_anytime?: boolean | null
  temporarily_closed?: boolean | null
  operating_days?: OperatingDays | null
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
  payment_status?: string | null
  created_at?: string | null
}

function goToSlots() {
  window.location.href = '/dashboard/slots'
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

function limitText(text: string, max: number) {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max).trim() + '...'
}

function formatMoney(value?: number) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

function normalizePaymentStatus(value?: string | null) {
  return (value || '').toString().toLowerCase().trim()
}

function getTodayKey(date = new Date()): DayKey {
  const map: DayKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]

  return map[date.getDay()]
}

function getYesterdayKey(date = new Date()): DayKey {
  const yesterday = new Date(date)
  yesterday.setDate(date.getDate() - 1)
  return getTodayKey(yesterday)
}

function timeToMinutes(value?: string | null) {
  if (!value || !value.includes(':')) return null

  const [hourStr, minuteStr] = value.split(':')
  const hour = Number(hourStr)
  const minute = Number(minuteStr)

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null

  return hour * 60 + minute
}

function isOpenForSchedule(
  config: OperatingDayItem | undefined,
  nowMinutes: number,
  mode: 'same_day' | 'overnight_from_previous'
) {
  if (!config || !config.enabled) return false

  const openingMinutes = timeToMinutes(config.opening_time)
  const closingMinutes = timeToMinutes(config.closing_time)

  if (openingMinutes === null || closingMinutes === null) return false

  if (openingMinutes < closingMinutes) {
    if (mode === 'same_day') {
      return nowMinutes >= openingMinutes && nowMinutes < closingMinutes
    }
    return false
  }

  if (openingMinutes > closingMinutes) {
    if (mode === 'same_day') {
      return nowMinutes >= openingMinutes
    }

    if (mode === 'overnight_from_previous') {
      return nowMinutes < closingMinutes
    }
  }

  return false
}

function getStoreOpenStatus(seller?: SellerProfile | null) {
  if (!seller) {
    return { isOpen: false, label: 'Closed' }
  }

  if (seller.temporarily_closed) {
    return { isOpen: false, label: 'Closed' }
  }

  if (seller.order_mode === 'preorder') {
    return { isOpen: true, label: 'Pre-order' }
  }

  if (seller.order_mode === 'anytime') {
    return { isOpen: true, label: 'Open' }
  }

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const todayKey = getTodayKey(now)
  const yesterdayKey = getYesterdayKey(now)

  const todayConfig = seller.operating_days?.[todayKey]
  const yesterdayConfig = seller.operating_days?.[yesterdayKey]

  const isOpenTodaySchedule = isOpenForSchedule(
    todayConfig,
    nowMinutes,
    'same_day'
  )

  const isOpenFromYesterdayOvernight = isOpenForSchedule(
    yesterdayConfig,
    nowMinutes,
    'overnight_from_previous'
  )

  const isOpen = isOpenTodaySchedule || isOpenFromYesterdayOvernight

  return {
    isOpen,
    label: isOpen ? 'Open' : 'Closed',
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [dailyNote, setDailyNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [savingNote, setSavingNote] = useState(false)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setPageError('')

    try {
      const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()

if (authError || !user) {
  window.location.replace('/login')
  return
}

      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_profiles')
        .select(
          'id, store_name, shop_slug, order_mode, profile_image, daily_note, whatsapp, delivery_mode, accept_orders_anytime, temporarily_closed, operating_days'
        )
        .eq('user_id', user.id)
        .maybeSingle()

      if (sellerError) {
        throw new Error(sellerError.message)
      }

      if (!sellerData) {
        window.location.replace('/dashboard/onboarding')
        return
      }

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_profile_id', sellerData.id)

      if (productError) {
        throw new Error(productError.message)
      }

      const allProducts = (productData || []) as Product[]
      const activeProducts = allProducts.filter((p) => p.is_active)

      const hasStoreName = Boolean(sellerData.store_name?.trim())
      const hasShopSlug = Boolean(sellerData.shop_slug?.trim())
      const hasWhatsapp = Boolean(sellerData.whatsapp?.trim())
      const hasDeliveryMode = Boolean(sellerData.delivery_mode)
      const hasAtLeastOneActiveProduct = activeProducts.length > 0

      const isOnboardingComplete =
        hasStoreName &&
        hasShopSlug &&
        hasWhatsapp &&
        hasDeliveryMode &&
        hasAtLeastOneActiveProduct

      if (!isOnboardingComplete) {
        window.location.href = '/dashboard/onboarding'
        return
      }

      setSeller(sellerData)
      setDailyNote(sellerData.daily_note || '')
      setProducts(allProducts)

      const { data: categoryData, error: categoryError } = await supabase
        .from('menu_categories')
        .select('id, name, sort_order, is_active')
        .eq('seller_profile_id', sellerData.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (categoryError) {
        throw new Error(categoryError.message)
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, product_name, amount, payment_status, created_at')
        .eq('seller_profile_id', sellerData.id)
        .order('created_at', { ascending: false })

      if (orderError) {
        throw new Error(orderError.message)
      }

      setCategories(categoryData || [])
      setOrders(orderData || [])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load dashboard.'
      setPageError(message)
    } finally {
      setLoading(false)
    }
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

  const paidOrders = useMemo(() => {
    return orders.filter((order) =>
      ['paid', 'success', 'completed'].includes(
        normalizePaymentStatus(order.payment_status)
      )
    )
  }, [orders])

  const totalRevenue = useMemo(() => {
    return paidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0)
  }, [paidOrders])

  const todayOrdersCount = useMemo(() => {
    const now = new Date()

    return orders.filter((order) => {
      if (!order.created_at) return false
      const d = new Date(order.created_at)
      if (Number.isNaN(d.getTime())) return false

      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      )
    }).length
  }, [orders])

  const storeStatus = useMemo(() => {
    return getStoreOpenStatus(seller)
  }, [seller])

  const isOpen = storeStatus.isOpen

  const promoLines = useMemo(() => {
    let promo = ''

    if (topCategories.length > 0) {
      promo = `Antara kategori:\n${topCategories
        .map((category) => `• ${category.name}`)
        .join('\n')}`
    } else if (topProducts.length > 0) {
      promo = `Antara menu:\n${topProducts
        .map((p, i) => `${i + 1}. ${p.name} - ${formatMoney(p.price)}`)
        .join('\n')}`
    } else {
      promo = 'Tiada produk aktif buat masa ini.'
    }

    return limitText(promo, 80)
  }, [topCategories, topProducts])

  const message = useMemo(() => {
    const limitedDailyNote = limitText(dailyNote.trim(), 150)

    const parts = [
      limitedDailyNote,
      promoLines,
      shopLink ? `Order sini:\n${shopLink}` : '',
    ].filter(Boolean)

    return parts.join('\n\n').trim()
  }, [dailyNote, promoLines, shopLink])

  const previewImage = useMemo(() => {
    if (seller?.profile_image) {
      return getImageUrl(seller.profile_image)
    }

    return '/default-share.png'
  }, [seller])

  async function saveAllShareSettings() {
    if (!seller) return

    setSavingNote(true)

    const { error } = await supabase
      .from('seller_profiles')
      .update({
        daily_note: dailyNote,
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

  function goToSettings() {
    window.location.href = '/dashboard/settings'
  }

  function goToProducts() {
    window.location.href = '/dashboard/products'
  }

  function goToSlots() {
    window.location.href = '/dashboard/slots'
  }

  function openShop() {
    if (!shopLink) {
      alert('Shop link not ready yet.')
      return
    }

    window.open(shopLink, '_blank')
  }

  async function copyShopLink() {
    if (!shopLink) {
      alert('Shop link not ready yet.')
      return
    }

    try {
      await navigator.clipboard.writeText(shopLink)
      alert('Shop link copied')
    } catch {
      alert('Unable to copy link')
    }
  }

  function shareShopToWhatsApp() {
    if (!shopLink) {
      alert('Shop link not ready yet.')
      return
    }

    const text = `${seller?.store_name || 'Kedai saya'}\n\nOrder di sini:\n${shopLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return <Layout>Loading...</Layout>
  }

  if (pageError) {
    return (
      <Layout>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">{pageError}</p>
        </div>
      </Layout>
    )
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

            <div className="mt-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                  storeStatus.label === 'Pre-order'
                    ? 'bg-violet-100 text-violet-700'
                    : isOpen
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {storeStatus.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            onClick={goToSettings}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-900">Waktu Operasi</div>
            <div className="mt-1 text-xs text-slate-500">
              Set waktu untuk terima order
            </div>
          </button>

          <button
            onClick={goToProducts}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-900">Tambah Menu</div>
            <div className="mt-1 text-xs text-slate-500">
              Tambah produk baru
            </div>
          </button>

          <button
            onClick={goToSlots}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-900">Slot Delivery</div>
            <div className="mt-1 text-xs text-slate-500">
              Urus slot penghantaran
            </div>
          </button>

          <button
            onClick={openShop}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-900">View Shop</div>
            <div className="mt-1 text-xs text-slate-500">
              Buka shop page anda
            </div>
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card title="Products" value={products.length} />
        <Card title="Active Products" value={activeProducts.length} />
        <Card title="Orders Today" value={todayOrdersCount} />
        <Card title="Revenue" value={formatMoney(totalRevenue)} />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Link Kedai Anda</h2>
            <p className="text-sm text-slate-500">
              Customer boleh order & bayar terus melalui link ini.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyShopLink}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition hover:bg-slate-50"
            >
              Copy Link
            </button>

            <button
              onClick={shareShopToWhatsApp}
              className="rounded-lg bg-green-500 px-3 py-2 text-sm text-white transition hover:bg-green-600"
            >
              Share WhatsApp
            </button>
          </div>
        </div>

        <div className="break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {shopLink || 'Shop link not ready yet'}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Semua paid order yang complete akan diproses untuk payout automatik mengikut cycle payout.
        </p>
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
            onChange={(e) => setDailyNote(e.target.value.slice(0, 150))}
            placeholder="Contoh: Fresh bake hari ini! Delivery esok! Grab sekarang!"
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-3 text-base text-slate-900 outline-none transition focus:border-black"
          />
          <p className="mt-1 text-xs text-slate-400">
            {dailyNote.length}/150 characters
          </p>
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

          <button
            onClick={goToSettings}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition hover:bg-slate-50"
          >
            Settings
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
