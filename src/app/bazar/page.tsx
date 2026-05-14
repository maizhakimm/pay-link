'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import BazarBottomNav from './components/BazarBottomNav'

type Seller = { id: string; store_name: string | null; shop_slug: string | null; whatsapp: string | null }
type MarketplaceProfile = { id: string; seller_profile_id: string; is_featured: boolean; is_verified: boolean; area_text: string | null; community_text: string | null; categoryNames: string[] }
type RequestedTab = 'home' | 'food' | 'services' | 'shop' | 'nearby'
type ListingType = 'food' | 'service' | 'shop'
type ProductCard = { id: string; name: string; price: number; seller_profile_id: string; image: string | null; sellerName: string; shopSlug: string | null; areaText: string | null; communityText: string | null; categoryLabel: string | null; isFeatured: boolean; isVerified: boolean; listingType: ListingType; isDemo?: boolean }

const FOOD_CHIPS = [
  { key: 'all', label: '✨ Semua' },
  { key: 'nasi', label: '🍛 Nasi Lemak' },
  { key: 'burger', label: '🍔 Burger' },
  { key: 'goreng', label: '🍗 Goreng' },
  { key: 'drinks', label: '🥤 Drinks' },
  { key: 'dessert', label: '🍰 Dessert' },
  { key: 'kek', label: '🎂 Kek' },
  { key: 'bakery', label: '🥐 Bakery' },
  { key: 'mee', label: '🍜 Mee' },
  { key: 'lunch', label: '🍱 Lunch' },
  { key: 'kuih', label: '🍪 Kuih' },
]

const CHIP_MATCHERS: Record<string, string[]> = {
  nasi: ['nasi', 'lemak', 'rice'],
  burger: ['burger'],
  goreng: ['goreng', 'fried'],
  drinks: ['drink', 'air', 'teh', 'kopi', 'juice'],
  dessert: ['dessert', 'cake', 'brownies', 'manis'],
  bakery: ['bakery', 'roti', 'bread', 'pastry'],
  mee: ['mee', 'mi', 'noodle'],
  lunch: ['lunch', 'tengah hari'],
  kuih: ['kuih'],
  kek: ['kek', 'cake'],
}

const DELIVERY_BADGES = ['Self-pickup / Delivery', 'Delivery', 'Self-pickup']

export default function ExplorePage() {
  const [requestedTab, setRequestedTab] = useState<RequestedTab>('home')
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedChip, setSelectedChip] = useState('all')
  const [area, setArea] = useState('')
  const [areaOptions, setAreaOptions] = useState<string[]>([])
  const [showAreaPicker, setShowAreaPicker] = useState(false)
  const [showInstallSheet, setShowInstallSheet] = useState(false)
  const [showIOSInstallSheet, setShowIOSInstallSheet] = useState(false)
  const [installInstruction, setInstallInstruction] = useState<string | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [profiles, setProfiles] = useState<MarketplaceProfile[]>([])
  const [sellers, setSellers] = useState<Record<string, Seller>>({})
  const [products, setProducts] = useState<ProductCard[]>([])
  const isFoodTab = requestedTab === 'food'

  const categoriesRef = useRef<HTMLDivElement>(null)
  const nearbyRef = useRef<HTMLDivElement>(null)
  const sellerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [debugHref, setDebugHref] = useState('')
  const [isMobileUa, setIsMobileUa] = useState(false)
  const [apiDebug, setApiDebug] = useState<Record<string, unknown> | null>(null)
  const [openingShopKey, setOpeningShopKey] = useState<string | null>(null)

  useEffect(() => {
    const syncTabFromUrl = () => {
      const tab = new URLSearchParams(window.location.search).get('tab')
      if (tab === 'food' || tab === 'services' || tab === 'shop' || tab === 'nearby') {
        setRequestedTab(tab)
        setSelectedChip('all')
        return
      }
      setRequestedTab('home')
      setSelectedChip('all')
    }

    syncTabFromUrl()

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args)
      syncTabFromUrl()
    }
    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      syncTabFromUrl()
    }

    window.addEventListener('popstate', syncTabFromUrl)
    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('popstate', syncTabFromUrl)
    }
  }, [])


  useEffect(() => {
    const syncDebugFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const enabled = params.get('debug') === '1'
      setDebugMode(enabled)
      if (!enabled) return
      const href = window.location.href
      const ua = navigator.userAgent || ''
      setDebugHref(href)
      setIsMobileUa(/Android|iPhone|iPad|iPod|Mobile/i.test(ua))
    }

    syncDebugFromUrl()
    window.addEventListener('popstate', syncDebugFromUrl)
    return () => window.removeEventListener('popstate', syncDebugFromUrl)
  }, [])
  useEffect(() => {
    async function load() {
      setLoading(true)
      const debugSuffix = debugMode ? '?debug=1' : ''
      const res = await fetch(`/api/bazar/public-listings${debugSuffix}`, { cache: 'no-store' })
      const payload = await res.json().catch(() => null)

      if (!res.ok || !payload?.ok) {
        setProfiles([])
        setSellers({})
        setProducts([])
        setAreaOptions([])
        setApiDebug(null)
        setLoading(false)
        return
      }

      setProfiles((payload.profiles || []) as MarketplaceProfile[])
      setSellers((payload.sellers || {}) as Record<string, Seller>)
      setProducts((payload.products || []) as ProductCard[])
      setAreaOptions((payload.areaOptions || []) as string[])
      setApiDebug(debugMode ? ((payload.debug || null) as Record<string, unknown> | null) : null)
      setLoading(false)
    }
    load()
  }, [debugMode])



  const displayedProducts = useMemo(() => {
    const byTab = products.filter((p) => {
      if (requestedTab === 'home' || requestedTab === 'nearby') return true
      if (requestedTab === 'food') return p.listingType === 'food'
      if (requestedTab === 'services') return p.listingType === 'service'
      return p.listingType === 'shop'
    })
    const bySearch = byTab.filter((p) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return [p.name, p.sellerName, p.categoryLabel || '', p.areaText || '', p.communityText || ''].join(' ').toLowerCase().includes(q)
    })
    const byChip = bySearch.filter((p) => {
      if (!isFoodTab) return true
      if (selectedChip === 'all') return true
      const keywords = CHIP_MATCHERS[selectedChip] || [selectedChip]
      const haystack = [p.name, p.categoryLabel || ''].join(' ').toLowerCase()
      return keywords.some((kw) => haystack.includes(kw))
    })
    const shouldApplyAreaFilter = requestedTab === 'nearby' || Boolean(area)
    const byArea = byChip.filter((p) => !shouldApplyAreaFilter || !area || (p.areaText || '').toLowerCase().includes(area.toLowerCase()))

    if (process.env.NODE_ENV !== 'production') {
      console.info('[bazar] product filter summary', {
        requestedTab,
        products: products.length,
        byTab: byTab.length,
        bySearch: bySearch.length,
        byChip: byChip.length,
        byArea: byArea.length,
        final: byArea.length,
        selectedChip,
        area,
      })
    }

    return byArea
  }, [products, query, selectedChip, area, requestedTab, isFoodTab])

  const sellerCards = useMemo(() => {
    return profiles
      .map((p) => ({ ...p, seller: sellers[p.seller_profile_id], isDemo: false }))
      .filter((row) => row.seller)
  }, [profiles, sellers])

  const exploreContextQuery = useMemo(() => {
    const params = new URLSearchParams()
    params.set('from', 'bazar')
    if (area) params.set('area', area)
    if (selectedChip && selectedChip !== 'all') params.set('category', selectedChip)
    if (query.trim()) params.set('q', query.trim())
    return params
  }, [area, selectedChip, query])

  const getDeliveryBadge = (seed: string) => DELIVERY_BADGES[Math.abs(seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % DELIVERY_BADGES.length]

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  async function handleInstallClick() {
    const ua = navigator.userAgent || ''
    const isIOSDevice = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/i.test(ua)
    const isIOSSafari = isIOSDevice && isSafari

    if (isIOSSafari) {
      setShowIOSInstallSheet(true)
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult?.outcome) setDeferredPrompt(null)
      return
    }
    setInstallInstruction('Untuk tambah BayarLink ke phone, buka menu browser dan pilih Add to Home Screen.')
    setShowInstallSheet(true)
  }


  function handleViewShopClick(key: string) {
    if (!key) return
    setOpeningShopKey(key)
    window.setTimeout(() => {
      setOpeningShopKey((current) => (current === key ? null : current))
    }, 8000)
  }

  return (
    <main className="min-h-screen bg-white pb-32">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <header className="relative -mx-4 -mt-5 rounded-b-3xl border-b border-white/40 bg-[radial-gradient(circle_at_12%_10%,rgba(186,230,253,0.35),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(187,247,208,0.28),transparent_30%),radial-gradient(circle_at_60%_90%,rgba(244,220,255,0.25),transparent_40%),linear-gradient(180deg,rgba(219,234,254,0.78)_0%,rgba(191,219,254,0.72)_100%)] px-4 pb-5 pt-4 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-b-3xl bg-white/30 blur-xl" />
          <div className="flex items-center justify-between">
            <img src="/BazarLink-Logo-Header.svg" alt="BayarLink" className="h-[30px] w-auto md:h-9" />
            <div className="inline-flex rounded-full border border-sky-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur">Beta</div>
          </div>
          <div className="mt-3.5 relative">
            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nak makan apa hari ni?" className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white p-1.5 text-slate-700" aria-label="Search">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div ref={nearbyRef} className="mt-3 flex justify-center">
            <button onClick={() => setShowAreaPicker(true)} className="inline-flex items-center rounded-full border border-sky-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur">📍 {area || 'Semua Kawasan'}</button>
          </div>
        </header>

        {debugMode ? (
          <section className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-slate-800">
            <p className="font-bold">Debug Mode (debug=1)</p>
            <p>href: {debugHref}</p>
            <p>mobileUA: {isMobileUa ? 'yes' : 'no'}</p>
            <p>requestedTab: {requestedTab}</p>
            <p>products.length: {products.length}</p>
            <p>displayedProducts.length: {displayedProducts.length}</p>
            <p>selectedChip: {selectedChip}</p>
            <p>area: {area || '-'}</p>
            <p>query: {query || '-'}</p>
            <p>isFoodTab: {isFoodTab ? 'true' : 'false'}</p>

            <p>api.marketplaceProfilesRawCount: {String(apiDebug?.marketplaceProfilesRawCount ?? '-')}</p>
            <p>api.marketplaceProfilesAfterFilter: {String(apiDebug?.marketplaceProfilesAfterFilter ?? '-')}</p>
            <p>api.distinctStatusesFound: {Array.isArray(apiDebug?.distinctStatusesFound) ? (apiDebug?.distinctStatusesFound as unknown[]).join(', ') : '-'}</p>
            <p>api.visibilityValuesFound: {Array.isArray(apiDebug?.visibilityValuesFound) ? (apiDebug?.visibilityValuesFound as unknown[]).join(', ') : '-'}</p>
            <p>api.rawProductsCountBeforeVisibilityFilter: {String(apiDebug?.rawProductsCountBeforeVisibilityFilter ?? '-')}</p>
            <p>api.sanitizedProductsCount: {String(apiDebug?.sanitizedProductsCount ?? '-')}</p>
            <div className="mt-2">
              <p className="font-semibold">products (first 5)</p>
              {(products.slice(0, 5)).map((p) => (
                <p key={`all-${p.id}`}>• {p.name} | seller: {p.sellerName} | shopSlug: {p.shopSlug ? 'yes' : 'no'} | type: {p.listingType} | area: {p.areaText || '-'} | community: {p.communityText || '-'}</p>
              ))}
            </div>
            <div className="mt-2">
              <p className="font-semibold">displayedProducts (first 5)</p>
              {(displayedProducts.slice(0, 5)).map((p) => (
                <p key={`display-${p.id}`}>• {p.name} | seller: {p.sellerName} | shopSlug: {p.shopSlug ? 'yes' : 'no'} | type: {p.listingType} | area: {p.areaText || '-'} | community: {p.communityText || '-'}</p>
              ))}
            </div>
          </section>
        ) : null}

        {requestedTab === 'home' ? (
          <section className="mt-5">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link href="/bazar" className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">Semua</Link>
              <Link href="/bazar?tab=food" className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">Food</Link>
              <Link href="/bazar?tab=services" className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">Services</Link>
              <Link href="/bazar?tab=shop" className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">Shop</Link>
              <Link href="/bazar?tab=nearby" className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">Nearby</Link>
            </div>
          </section>
        ) : null}

        {isFoodTab ? (
          <section ref={categoriesRef} className="mt-5">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FOOD_CHIPS.map((chip) => (
                <button key={chip.key} onClick={() => setSelectedChip(chip.key)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold ${selectedChip === chip.key ? 'bg-[#DD0894] text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>{chip.label}</button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-5">
          {loading ? <p className="text-sm text-slate-500">Memuatkan menu...</p> : null}
          {displayedProducts.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p>
                {requestedTab === 'home' ? 'Belum ada listing di kawasan ini.' : null}
                {requestedTab === 'food' ? (selectedChip !== 'all' ? 'Belum ada item untuk kategori ini.' : 'Belum ada makanan di kawasan ini.') : null}
                {requestedTab === 'services' ? 'Belum ada servis di kawasan ini.' : null}
                {requestedTab === 'shop' ? 'Belum ada produk di kawasan ini.' : null}
                {requestedTab === 'nearby' ? 'Belum ada seller berhampiran kawasan ini.' : null}
              </p>
              {requestedTab === 'services' ? <p className="mt-1">Jadi antara service provider pertama di BazarLink.</p> : null}
              {requestedTab === 'shop' ? <p className="mt-1">Jadi antara seller pertama di BazarLink.</p> : null}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProducts.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
                {item.image ? <img src={item.image} alt={item.name} className="h-24 w-full rounded-xl object-cover" /> : <div className="flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 text-lg font-bold text-orange-700">{item.name.slice(0, 2).toUpperCase()}</div>}
                <div className="mt-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{item.name}</h3>
                </div>
                <p className="mt-1 text-sm font-extrabold text-rose-700">RM {item.price.toFixed(2)}</p>
                <p className="truncate text-xs text-slate-600">{item.sellerName}</p>
                <p className="text-xs text-slate-500">{item.areaText || '-'} · {item.communityText || '-'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.isFeatured ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Featured</span> : null}
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{getDeliveryBadge(item.seller_profile_id || item.sellerName || item.id)}</span>
                </div>
                <div className="mt-2">{item.shopSlug ? <Link href={`/s/${encodeURIComponent(item.shopSlug)}?${(() => { const p = new URLSearchParams(exploreContextQuery); p.set('product', item.id); return p.toString() })()}`} onClick={(e) => { const key = `product:${item.id}`; if (openingShopKey === key) { e.preventDefault(); return } handleViewShopClick(key) }} aria-disabled={openingShopKey === `product:${item.id}`} className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white ${openingShopKey === `product:${item.id}` ? 'cursor-wait bg-blue-400' : 'bg-[#2563EB]'}`}>{openingShopKey === `product:${item.id}` ? 'Opening...' : item.isDemo ? 'Order Now' : 'View Shop'}</Link> : <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-400">{item.isDemo ? 'Order Now' : 'View Shop'}</span>}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm font-semibold text-slate-800">Jual di BazarLink</p>
          <p className="mt-1 text-xs text-slate-600">Buka tapak digital percuma sepanjang Beta.</p>
          <Link href="/login" className="mt-3 inline-flex rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Daftar Seller</Link>
        </section>

        <section ref={sellerRef} className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-800">BAZAR Seller</h2>
            <button onClick={() => setShowAreaPicker(true)} className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">📍 {area || 'Semua Kawasan'}</button>
          </div>
          {sellerCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Tiada seller marketplace aktif buat masa ini.
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sellerCards.map((item: any) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-rose-700">
                      {(item.seller?.store_name || 'LS').slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{item.seller?.store_name || 'Local Seller'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Open</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 line-clamp-1">Homemade & fresh setiap hari</p>
                <p className="text-xs text-slate-500">{item.area_text || '-'} · {item.community_text || '-'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.is_featured ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Featured</span> : null}
                  {item.is_verified ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Trusted</span> : null}
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{getDeliveryBadge(item.id || item.seller?.store_name || 'seller')}</span>
                </div>
                <div className="mt-2">
                  {item.seller?.shop_slug ? (
                    <Link href={`/s/${encodeURIComponent(item.seller.shop_slug)}`} onClick={(e) => { const key = `seller:${item.id}`; if (openingShopKey === key) { e.preventDefault(); return } handleViewShopClick(key) }} aria-disabled={openingShopKey === `seller:${item.id}`} className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white ${openingShopKey === `seller:${item.id}` ? 'cursor-wait bg-blue-400' : 'bg-[#2563EB]'}`}>{openingShopKey === `seller:${item.id}` ? 'Opening...' : 'View Shop'}</Link>
                  ) : (
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-400">View Shop</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Suspense fallback={null}>
        <BazarBottomNav />
      </Suspense>

      <button onClick={handleInstallClick} className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#DD0894] text-white shadow-xl sm:hidden" aria-label="Add di Phone">
        <Download className="h-6 w-6" strokeWidth={2.3} />
      </button>

      {showAreaPicker ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowAreaPicker(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Pilih kawasan</h3><button onClick={() => setShowAreaPicker(false)} className="rounded-lg border px-2 py-1 text-xs">Tutup</button></div>
            <div className="space-y-2">
              <button onClick={() => { setArea(''); setShowAreaPicker(false) }} className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${area === '' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200'}`}>Semua Kawasan</button>
              {areaOptions.map((item) => <button key={item} onClick={() => { setArea(item); setShowAreaPicker(false) }} className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${area === item ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200'}`}>{item}</button>)}
            </div>
          </div>
        </div>
      ) : null}


      {showInstallSheet ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowInstallSheet(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Add BayarLink launcher icon di Device?</h3>
            <p className="mt-1 text-sm text-slate-600">{installInstruction || 'Buka dan akses BayarLink akan jadi lebih mudah.'}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowInstallSheet(false)} className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Ya, add launcher di device</button>
              <button onClick={() => setShowInstallSheet(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Nanti dulu</button>
            </div>
          </div>
        </div>
      ) : null}

      {showIOSInstallSheet ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowIOSInstallSheet(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Add BayarLink ke iPhone?</h3>
            <p className="mt-1 text-sm text-slate-600">Untuk akses lebih mudah, tekan butang Share di Safari dan pilih ‘Add to Home Screen’.</p>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p>1. Tekan ikon <span className="font-semibold">Share</span> ⎋</p>
              <p className="mt-1">2. Pilih <span className="font-semibold">Add to Home Screen</span></p>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowIOSInstallSheet(false)} className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Okay</button>
              <button onClick={() => setShowIOSInstallSheet(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Tutup</button>
            </div>
          </div>
        </div>
      ) : null}


    </main>
  )
}
