'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Category = { id: string; category_name: string; category_key: string }
type Area = { id: string; area_name: string; area_key: string }

type ExploreProfileRaw = {
  id: string
  is_featured: boolean
  is_verified: boolean
  tagline: string | null
  area_text: string | null
  community_text: string | null
  created_at: string
  area_id: string | null
  seller_profiles?: {
    store_name: string | null
    shop_slug: string | null
    profile_image: string | null
    whatsapp: string | null
  } | {
    store_name: string | null
    shop_slug: string | null
    profile_image: string | null
    whatsapp: string | null
  }[] | null
  marketplace_profile_categories?: {
    category_id: string
    marketplace_categories?: { category_name: string; category_key: string } | { category_name: string; category_key: string }[] | null
  }[]
}

type ExploreProfile = {
  isDemo?: boolean
  id: string
  is_featured: boolean
  is_verified: boolean
  tagline: string | null
  area_text: string | null
  community_text: string | null
  created_at: string
  area_id: string | null
  seller: {
    store_name: string | null
    shop_slug: string | null
    profile_image: string | null
    whatsapp: string | null
  } | null
  categories: string[]
  categoryIds: string[]
}

const DEMO_SHOPS: ExploreProfile[] = [
  {
    isDemo: true,
    id: 'demo-dana',
    is_featured: true,
    is_verified: true,
    tagline: 'Menu sarapan homemade setiap pagi',
    area_text: 'Shah Alam',
    community_text: 'Seksyen 7',
    created_at: '',
    area_id: null,
    seller: { store_name: 'Dana Home Cook', shop_slug: 'dana-store', profile_image: null, whatsapp: null },
    categories: ['Breakfast', 'Lunch', 'Drinks'],
    categoryIds: [],
  },
  {
    isDemo: true,
    id: 'demo-kakyan',
    is_featured: false,
    is_verified: true,
    tagline: 'Masakan kampung panas-panas setiap hari',
    area_text: 'Setia Alam',
    community_text: 'Kota Kemuning',
    created_at: '',
    area_id: null,
    seller: { store_name: 'Kak Yan Kitchen', shop_slug: null, profile_image: null, whatsapp: null },
    categories: ['Lunch', 'Drinks'],
    categoryIds: [],
  },
  {
    isDemo: true,
    id: 'demo-rina',
    is_featured: true,
    is_verified: false,
    tagline: 'Biskut, kek mini dan manisan tempahan',
    area_text: 'Shah Alam',
    community_text: 'Seksyen 7',
    created_at: '',
    area_id: null,
    seller: { store_name: 'Auntie Rina Bakes', shop_slug: null, profile_image: null, whatsapp: null },
    categories: ['Bakery', 'Dessert', 'Kuih Muih'],
    categoryIds: [],
  },
  {
    isDemo: true,
    id: 'demo-azizah',
    is_featured: false,
    is_verified: false,
    tagline: 'Kuih tradisional dan menu rumah',
    area_text: 'Setia Alam',
    community_text: 'Kota Kemuning',
    created_at: '',
    area_id: null,
    seller: { store_name: 'Dapur Azizah', shop_slug: null, profile_image: null, whatsapp: null },
    categories: ['Kuih Muih', 'Breakfast'],
    categoryIds: [],
  },
]

export default function ExplorePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<ExploreProfile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedAreaId, setSelectedAreaId] = useState('all')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      const [profilesRes, categoriesRes, areasRes] = await Promise.all([
        supabase
          .from('marketplace_profiles')
          .select(`
            id,
            is_featured,
            is_verified,
            tagline,
            area_text,
            community_text,
            area_id,
            created_at,
            seller_profiles(store_name,shop_slug,profile_image,whatsapp),
            marketplace_profile_categories(category_id,marketplace_categories(category_name,category_key))
          `)
          .eq('status', 'published')
          .eq('is_marketplace_visible', true)
          .order('is_featured', { ascending: false })
          .order('is_verified', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('marketplace_categories')
          .select('id,category_name,category_key')
          .eq('is_enabled', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('marketplace_areas')
          .select('id,area_name,area_key')
          .eq('is_enabled', true)
          .order('display_order', { ascending: true }),
      ])

      if (profilesRes.error) {
        setError(profilesRes.error.message)
        setLoading(false)
        return
      }

      const normalizedProfiles = ((profilesRes.data || []) as ExploreProfileRaw[]).map((row) => {
        const seller = Array.isArray(row.seller_profiles) ? row.seller_profiles[0] || null : row.seller_profiles || null
        const categoriesMap = (row.marketplace_profile_categories || []).map((entry) => {
          const categoryData = Array.isArray(entry.marketplace_categories)
            ? entry.marketplace_categories[0] || null
            : entry.marketplace_categories || null
          return categoryData?.category_name || null
        }).filter(Boolean) as string[]

        return {
          id: row.id,
          is_featured: row.is_featured,
          is_verified: row.is_verified,
          tagline: row.tagline,
          area_text: row.area_text,
          community_text: row.community_text,
          created_at: row.created_at,
          area_id: row.area_id,
          seller,
          categories: categoriesMap,
          categoryIds: (row.marketplace_profile_categories || []).map((entry) => entry.category_id),
        } as ExploreProfile
      })

      setProfiles(normalizedProfiles)
      setCategories((categoriesRes.data || []) as Category[])
      setAreas((areasRes.data || []) as Area[])
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredProfiles = useMemo(() => {
    const realProfiles = profiles.filter((profile) => {
      const areaPass = selectedAreaId === 'all' || profile.area_id === selectedAreaId
      const categoryPass = selectedCategoryId === 'all' || profile.categoryIds.includes(selectedCategoryId)
      return areaPass && categoryPass
    })

    if (realProfiles.length >= 4) return realProfiles
    return [...realProfiles, ...DEMO_SHOPS.slice(0, 4 - realProfiles.length)]
  }, [profiles, selectedAreaId, selectedCategoryId])

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <header className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
          <img src="/BayarLink-Logo-Shop-Page.svg" alt="BayarLink" className="h-7 w-auto" />
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Cari makanan homemade sekitar komuniti anda</h1>
          <p className="mt-2 text-sm text-slate-600">Sokong seller lokal dan jumpa menu menarik sekitar kawasan anda.</p>
          <div className="mt-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Beta Preview
          </div>
        </header>

        <section className="mt-4 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-700">Filter Kategori</span>
            <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.category_name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-700">Filter Kawasan</span>
            <select value={selectedAreaId} onChange={(e) => setSelectedAreaId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Semua kawasan</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.area_name}</option>
              ))}
            </select>
          </label>
        </section>

        {loading ? <p className="mt-4 text-sm text-slate-500">Memuatkan seller...</p> : null}
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}

        <section className="mt-5">
          <h2 className="mb-3 text-lg font-bold text-slate-800">Seller sekitar komuniti</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!loading && filteredProfiles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
              Belum ada seller aktif untuk kawasan ini.
            </div>
          ) : null}

          {filteredProfiles.map((profile) => {
            const shopSlug = profile.seller?.shop_slug
            const storeName = profile.seller?.store_name?.trim() || 'Local Seller'
            const initials = storeName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('') || 'LS'
            return (
              <article key={profile.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {profile.seller?.profile_image ? (
                      <img
                        src={profile.seller.profile_image}
                        alt={storeName}
                        className="h-12 w-12 rounded-2xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-sm font-bold text-rose-700">
                        {initials}
                      </div>
                    )}
                    <h2 className="text-base font-extrabold text-slate-900">{storeName}</h2>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {profile.isDemo ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Demo</span> : null}
                    {profile.is_featured ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Featured</span> : null}
                    {profile.is_verified ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Trusted</span> : null}
                  </div>
                </div>

                <p className="mt-1 text-sm text-slate-700">{profile.tagline || 'Seller komuniti BayarLink'}</p>
                <p className="mt-2 text-xs text-slate-500">Area: {profile.area_text || '-'}</p>
                <p className="text-xs text-slate-500">Taman / Kawasan: {profile.community_text || '-'}</p>

                {profile.categories.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {profile.categories.map((category) => (
                      <span key={`${profile.id}-${category}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{category}</span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">{profile.seller?.whatsapp ? `Hubungi: ${profile.seller.whatsapp}` : 'No contact yet'}</p>
                  {shopSlug ? (
                    <Link href={`/s/${encodeURIComponent(shopSlug)}`} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">
                      {profile.isDemo ? 'Lihat Contoh' : 'Lihat Kedai'}
                    </Link>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-400">{profile.isDemo ? 'Lihat Contoh' : 'Lihat Kedai'}</span>
                  )}
                </div>
              </article>
            )
          })}
          </div>
        </section>
      </div>
    </main>
  )
}
