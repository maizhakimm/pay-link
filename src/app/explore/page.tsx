'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BotMessageSquare, Download, Handbag, Soup, Store, Wrench } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Seller = { id: string; store_name: string | null; shop_slug: string | null; whatsapp: string | null }
type MarketplaceProfile = { id: string; seller_profile_id: string; is_featured: boolean; is_verified: boolean; area_text: string | null; community_text: string | null; categoryNames: string[] }
type ProductCard = { id: string; name: string; price: number; seller_profile_id: string; image: string | null; sellerName: string; shopSlug: string | null; areaText: string | null; communityText: string | null; categoryLabel: string | null; isFeatured: boolean; isVerified: boolean; isDemo?: boolean }

const FOOD_CHIPS = [
  { key: 'all', label: '✨ Semua' },
  { key: 'nasi', label: '🍛 Nasi Lemak' },
  { key: 'burger', label: '🍔 Burger' },
  { key: 'goreng', label: '🍗 Goreng' },
  { key: 'drinks', label: '🥤 Drinks' },
  { key: 'dessert', label: '🍰 Dessert' },
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
}

const DEMO_PRODUCTS: ProductCard[] = [
  { id: 'demo-1', name: 'Nasi Lemak Ayam Crispy', price: 12, seller_profile_id: '', image: null, sellerName: 'Dana Home Cook', shopSlug: 'dana-store', areaText: 'Shah Alam', communityText: 'Seksyen 7', categoryLabel: 'Nasi Lemak', isFeatured: true, isVerified: true, isDemo: true },
  { id: 'demo-2', name: 'Burger Homemade', price: 14, seller_profile_id: '', image: null, sellerName: 'Kak Yan Kitchen', shopSlug: null, areaText: 'Setia Alam', communityText: 'Kota Kemuning', categoryLabel: 'Burger', isFeatured: false, isVerified: true, isDemo: true },
  { id: 'demo-3', name: 'Kuih Seri Muka', price: 8, seller_profile_id: '', image: null, sellerName: 'Auntie Rina Bakes', shopSlug: null, areaText: 'Shah Alam', communityText: 'Seksyen 7', categoryLabel: 'Kuih Muih', isFeatured: true, isVerified: false, isDemo: true },
  { id: 'demo-4', name: 'Roti Canai Frozen', price: 10, seller_profile_id: '', image: null, sellerName: 'Dapur Azizah', shopSlug: null, areaText: 'Setia Alam', communityText: 'Kota Kemuning', categoryLabel: 'Bakery', isFeatured: false, isVerified: false, isDemo: true },
  { id: 'demo-5', name: 'Brownies Kedut', price: 15, seller_profile_id: '', image: null, sellerName: 'Auntie Rina Bakes', shopSlug: null, areaText: 'Shah Alam', communityText: 'Seksyen 7', categoryLabel: 'Dessert', isFeatured: false, isVerified: false, isDemo: true },
  { id: 'demo-6', name: 'Teh Ais Kaw', price: 4, seller_profile_id: '', image: null, sellerName: 'Kak Yan Kitchen', shopSlug: null, areaText: 'Setia Alam', communityText: 'Kota Kemuning', categoryLabel: 'Drinks', isFeatured: false, isVerified: false, isDemo: true },
]

const DEMO_SELLERS = [
  { id: 'demo-s1', store_name: 'Dana Home Cook', area_text: 'Shah Alam', community_text: 'Seksyen 7' },
  { id: 'demo-s2', store_name: 'Kak Yan Kitchen', area_text: 'Setia Alam', community_text: 'Kota Kemuning' },
]

export default function ExplorePage() {
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedChip, setSelectedChip] = useState('all')
  const [area, setArea] = useState('Shah Alam')
  const [areaOptions, setAreaOptions] = useState<string[]>(['Shah Alam'])
  const [showAreaPicker, setShowAreaPicker] = useState(false)
  const [showServices, setShowServices] = useState(false)
  const [showInstallSheet, setShowInstallSheet] = useState(false)
  const [showSellerSheet, setShowSellerSheet] = useState(false)
  const [showShopSheet, setShowShopSheet] = useState(false)
  const [showReportSheet, setShowReportSheet] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'food' | 'services' | 'shop' | 'seller' | 'report'>('food')
  const [profiles, setProfiles] = useState<MarketplaceProfile[]>([])
  const [sellers, setSellers] = useState<Record<string, Seller>>({})
  const [products, setProducts] = useState<ProductCard[]>([])

  const categoriesRef = useRef<HTMLDivElement>(null)
  const nearbyRef = useRef<HTMLDivElement>(null)
  const sellerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: mpRows }, { data: areaRows }] = await Promise.all([
        supabase
          .from('marketplace_profiles')
          .select('id,seller_profile_id,is_featured,is_verified,area_text,community_text,marketplace_profile_categories(category_id,marketplace_categories(category_name))')
          .eq('status', 'published')
          .eq('is_marketplace_visible', true)
          .order('is_featured', { ascending: false })
          .order('is_verified', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('marketplace_areas').select('area_name').eq('is_enabled', true).order('display_order', { ascending: true }),
      ])

      if (areaRows && areaRows.length > 0) {
        const options = areaRows.map((r: any) => r.area_name).filter(Boolean)
        setAreaOptions(options)
      }

      const normalizedProfiles = ((mpRows || []) as any[]).map((row) => ({
        id: row.id,
        seller_profile_id: row.seller_profile_id,
        is_featured: row.is_featured,
        is_verified: row.is_verified,
        area_text: row.area_text,
        community_text: row.community_text,
        categoryNames: (row.marketplace_profile_categories || []).map((entry: any) => (Array.isArray(entry.marketplace_categories) ? entry.marketplace_categories[0]?.category_name : entry.marketplace_categories?.category_name)).filter(Boolean),
      })) as MarketplaceProfile[]

      const sellerIds = normalizedProfiles.map((p) => p.seller_profile_id)
      const { data: sellerRows } = await supabase.from('seller_profiles').select('id,store_name,shop_slug,whatsapp').in('id', sellerIds)
      const sellerMap: Record<string, Seller> = {}
      ;(sellerRows || []).forEach((row: any) => { sellerMap[row.id] = row as Seller })

      const { data: productRows } = await supabase.from('products').select('*').in('seller_profile_id', sellerIds).eq('is_active', true).order('created_at', { ascending: false })
      const productCards = ((productRows || []) as any[]).map((p) => {
        const profile = normalizedProfiles.find((mp) => mp.seller_profile_id === p.seller_profile_id)
        const seller = sellerMap[p.seller_profile_id]
        const image = p.product_image_url || p.image_1 || p.image_2 || p.image_url || null
        return { id: p.id, name: p.name, price: Number(p.price || 0), seller_profile_id: p.seller_profile_id, image, sellerName: seller?.store_name || 'Local Seller', shopSlug: seller?.shop_slug || null, areaText: profile?.area_text || null, communityText: profile?.community_text || null, categoryLabel: profile?.categoryNames?.[0] || null, isFeatured: Boolean(profile?.is_featured), isVerified: Boolean(profile?.is_verified) } as ProductCard
      })

      setProfiles(normalizedProfiles)
      setSellers(sellerMap)
      setProducts(productCards)
      setLoading(false)
    }
    load()
  }, [])

  const displayedProducts = useMemo(() => {
    const bySearch = products.filter((p) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return [p.name, p.sellerName, p.categoryLabel || '', p.areaText || '', p.communityText || ''].join(' ').toLowerCase().includes(q)
    })
    const byChip = bySearch.filter((p) => {
      if (selectedChip === 'all') return true
      const keywords = CHIP_MATCHERS[selectedChip] || [selectedChip]
      const haystack = [p.name, p.categoryLabel || ''].join(' ').toLowerCase()
      return keywords.some((kw) => haystack.includes(kw))
    })
    const byArea = byChip.filter((p) => !area || (p.areaText || '').toLowerCase().includes(area.toLowerCase()))
    return byArea.length >= 6 ? byArea : [...byArea, ...DEMO_PRODUCTS.slice(0, 6 - byArea.length)]
  }, [products, query, selectedChip, area])

  const sellerCards = useMemo(() => {
    const realSellers = profiles
      .map((p) => ({ ...p, seller: sellers[p.seller_profile_id], isDemo: false }))
      .filter((row) => row.seller)
    if (realSellers.length >= 4) return realSellers
    const fillers = DEMO_SELLERS.slice(0, 4 - realSellers.length).map((item) => ({
      id: item.id,
      seller: { store_name: item.store_name },
      area_text: item.area_text,
      community_text: item.community_text,
      isDemo: true,
    }))
    return [...realSellers, ...fillers]
  }, [profiles, sellers])

  const exploreContextQuery = useMemo(() => {
    const params = new URLSearchParams()
    params.set('from', 'explore')
    if (area) params.set('area', area)
    if (selectedChip && selectedChip !== 'all') params.set('category', selectedChip)
    if (query.trim()) params.set('q', query.trim())
    return params
  }, [area, selectedChip, query])

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-5xl px-4 py-5">
        <header className="-mx-4 -mt-5 bg-[radial-gradient(circle_at_10%_10%,rgba(191,219,254,0.95),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(216,255,239,0.85),transparent_35%),radial-gradient(circle_at_55%_95%,rgba(244,220,255,0.7),transparent_40%),linear-gradient(180deg,#f7fbff_0%,#eef6ff_100%)] px-4 pb-4 pt-4">
          <div className="flex items-start justify-between">
            <img src="/BayarLink-Logo-Shop-Page.svg" alt="BayarLink" className="h-4 w-auto" />
            <div className="inline-flex rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">Beta</div>
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
          <div ref={nearbyRef} className="mt-3">
            <button onClick={() => setShowAreaPicker(true)} className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">📍 {area}</button>
          </div>
        </header>

        <section ref={categoriesRef} className="mt-5">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FOOD_CHIPS.map((chip) => (
              <button key={chip.key} onClick={() => setSelectedChip(chip.key)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold ${selectedChip === chip.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>{chip.label}</button>
            ))}
          </div>
        </section>

        <section className="mt-5">
          {loading ? <p className="text-sm text-slate-500">Memuatkan menu...</p> : null}
          {displayedProducts.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Tiada menu untuk kategori ini buat masa ini.
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProducts.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
                {item.image ? <img src={item.image} alt={item.name} className="h-24 w-full rounded-xl object-cover" /> : <div className="flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 text-lg font-bold text-orange-700">{item.name.slice(0, 2).toUpperCase()}</div>}
                <div className="mt-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{item.name}</h3>
                  {item.isDemo ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Demo</span> : null}
                </div>
                <p className="mt-1 text-sm font-extrabold text-rose-700">RM {item.price.toFixed(2)}</p>
                <p className="truncate text-xs text-slate-600">{item.sellerName}</p>
                <p className="text-xs text-slate-500">{item.areaText || '-'} · {item.communityText || '-'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.categoryLabel ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{item.categoryLabel}</span> : null}
                  {item.isFeatured ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Featured</span> : null}
                  {item.isVerified ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Trusted</span> : null}
                </div>
                <div className="mt-2">{item.shopSlug ? <Link href={`/s/${encodeURIComponent(item.shopSlug)}?${(() => { const p = new URLSearchParams(exploreContextQuery); p.set('product', item.id); return p.toString() })()}`} className="inline-flex rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-bold text-white">{item.isDemo ? 'Lihat Contoh' : 'Lihat Kedai'}</Link> : <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-400">{item.isDemo ? 'Lihat Contoh' : 'Lihat Kedai'}</span>}</div>
              </article>
            ))}
          </div>
        </section>

        <section ref={sellerRef} className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-800">Explore Seller</h2>
            <button onClick={() => setShowAreaPicker(true)} className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">📍 {area}</button>
          </div>
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
                  {item.isDemo ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Demo</span> : null}
                </div>
                <p className="mt-1 text-xs text-slate-600 line-clamp-1">Homemade & fresh setiap hari</p>
                <p className="text-xs text-slate-500">{item.area_text || '-'} · {item.community_text || '-'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.is_featured ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Featured</span> : null}
                  {item.is_verified ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Trusted</span> : null}
                </div>
                <div className="mt-2">
                  <button className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white">Lihat Kedai</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 text-[10px] font-semibold text-slate-600">
          <button onClick={() => { setActiveMenu('food'); categoriesRef.current?.scrollIntoView({ behavior: 'smooth' }) }} className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeMenu === 'food' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Soup className="h-6 w-6" strokeWidth={2} />
            <span>Food</span>
          </button>
          <button onClick={() => { setActiveMenu('services'); setShowServices(true) }} className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeMenu === 'services' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Wrench className="h-6 w-6" strokeWidth={2} />
            <span>Services</span>
          </button>
          <button onClick={() => { setActiveMenu('shop'); setShowShopSheet(true) }} className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeMenu === 'shop' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Handbag className="h-6 w-6" strokeWidth={2} />
            <span>Shop</span>
          </button>
          <button onClick={() => { setActiveMenu('seller'); setShowSellerSheet(true) }} className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeMenu === 'seller' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Store className="h-6 w-6" strokeWidth={2} />
            <span>Seller</span>
          </button>
          <button onClick={() => { setActiveMenu('report'); setShowReportSheet(true) }} className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeMenu === 'report' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <BotMessageSquare className="h-6 w-6" strokeWidth={2} />
            <span>Support</span>
          </button>
        </div>
      </nav>

      <button onClick={() => setShowInstallSheet(true)} className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#DD0894] text-white shadow-xl sm:hidden" aria-label="Add di Phone">
        <Download className="h-6 w-6" strokeWidth={2.3} />
      </button>

      {showAreaPicker ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowAreaPicker(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Pilih kawasan</h3><button onClick={() => setShowAreaPicker(false)} className="rounded-lg border px-2 py-1 text-xs">Tutup</button></div>
            <div className="space-y-2">{areaOptions.map((item) => <button key={item} onClick={() => { setArea(item); setShowAreaPicker(false) }} className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${area === item ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200'}`}>{item}</button>)}</div>
          </div>
        </div>
      ) : null}

      {showServices ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowServices(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Coming Soon</h3>
            <p className="mt-1 text-sm text-slate-600">Kami sedang membuka servis komuniti seperti runner, printing, laundry dan lain-lain.</p>
            <button onClick={() => setShowServices(false)} className="mt-5 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Saya berminat</button>
          </div>
        </div>
      ) : null}

      {showInstallSheet ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowInstallSheet(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Add BayarLink launcher icon di Device?</h3>
            <p className="mt-1 text-sm text-slate-600">Buka dan akses BayarLink akan jadi lebih mudah.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowInstallSheet(false)} className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Ya, add launcher di device</button>
              <button onClick={() => setShowInstallSheet(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Nanti dulu</button>
            </div>
          </div>
        </div>
      ) : null}

      {showSellerSheet ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowSellerSheet(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Nak daftar sebagai Seller?</h3>
            <p className="mt-1 text-sm text-slate-600">Daftar dan jual menggunakan BayarLink dan senaraikan produk dan servis anda di marketplace.</p>
            <div className="mt-5 flex gap-2">
              <Link href="/auth" className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Ya, daftar seller</Link>
              <button onClick={() => setShowSellerSheet(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Tutup</button>
            </div>
          </div>
        </div>
      ) : null}

      {showShopSheet ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowShopSheet(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Marketplace barangan akan datang</h3>
            <p className="mt-1 text-sm text-slate-600">Kami sedang membuka ruang untuk seller menjual barangan komuniti seperti produk homemade, gift, bundle dan item harian.</p>
            <button onClick={() => setShowShopSheet(false)} className="mt-5 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Saya berminat</button>
          </div>
        </div>
      ) : null}

      {showReportSheet ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowReportSheet(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Ada sebarang aduan?</h3>
            <p className="mt-1 text-sm text-slate-600">Laporkan sebarang isu kepada kami melalui WhatsApp.</p>
            <div className="mt-5 flex gap-2">
              <a href="https://wa.me/60163352087" target="_blank" rel="noreferrer" className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">WhatsApp Kami</a>
              <button onClick={() => setShowReportSheet(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Tutup</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
