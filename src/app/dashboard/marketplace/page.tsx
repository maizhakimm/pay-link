'use client'

import { useEffect, useMemo, useState } from 'react'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabase'

type SellerProfile = {
  id: string
  user_id: string
  store_name: string | null
}

type MarketplaceProfile = {
  id: string
  seller_profile_id: string
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'hidden' | 'suspended'
  is_marketplace_visible: boolean
  tagline: string | null
  marketplace_description: string | null
  marketplace_banner_image: string | null
  area_text: string | null
  community_text: string | null
  area_id: string | null
  community_id: string | null
}

type Category = { id: string; category_name: string; category_key: string }
type Area = { id: string; area_name: string; area_key: string }
type Community = { id: string; area_id: string; community_name: string; community_key: string }

type ChecklistItem = { label: string; done: boolean }

export default function DashboardMarketplacePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null)
  const [productCount, setProductCount] = useState(0)

  const [categories, setCategories] = useState<Category[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  useEffect(() => {
    async function init() {
      setLoading(true)
      setError(null)
      setNotice(null)

      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        setError('Please login to access marketplace setup.')
        setLoading(false)
        return
      }

      const userId = authData.user.id

      const { data: sellerRow, error: sellerError } = await supabase
        .from('seller_profiles')
        .select('id,user_id,store_name')
        .eq('user_id', userId)
        .maybeSingle()

      if (sellerError || !sellerRow) {
        setError('Seller profile not found. Please complete onboarding first.')
        setLoading(false)
        return
      }

      setSeller(sellerRow as SellerProfile)

      const sellerId = (sellerRow as SellerProfile).id

      const [{ count: productsCount }, categoriesRes, areasRes, communitiesRes] = await Promise.all([
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('seller_profile_id', sellerId)
          .eq('is_active', true),
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
        supabase
          .from('marketplace_communities')
          .select('id,area_id,community_name,community_key')
          .eq('is_enabled', true)
          .order('display_order', { ascending: true }),
      ])

      setProductCount(productsCount || 0)
      setCategories((categoriesRes.data || []) as Category[])
      setAreas((areasRes.data || []) as Area[])
      setCommunities((communitiesRes.data || []) as Community[])

      let mp: MarketplaceProfile | null = null
      const { data: existingProfiles, error: profileError } = await supabase
        .from('marketplace_profiles')
        .select('id,seller_profile_id,status,is_marketplace_visible,tagline,marketplace_description,marketplace_banner_image,area_text,community_text,area_id,community_id')
        .eq('seller_profile_id', sellerId)
        .order('created_at', { ascending: true })
        .limit(1)

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      const existingProfile = (existingProfiles || [])[0] as MarketplaceProfile | undefined

      if (!existingProfile) {
        const { data: createdProfile, error: createError } = await supabase
          .from('marketplace_profiles')
          .insert({
            seller_profile_id: sellerId,
            status: 'draft',
            is_marketplace_visible: false,
          })
          .select('id,seller_profile_id,status,is_marketplace_visible,tagline,marketplace_description,marketplace_banner_image,area_text,community_text,area_id,community_id')
          .single()

        if (createError || !createdProfile) {
          setError(createError?.message || 'Unable to create marketplace draft.')
          setLoading(false)
          return
        }
        mp = createdProfile as MarketplaceProfile
      } else {
        mp = existingProfile as MarketplaceProfile
      }

      setProfile(mp)

      const { data: selectedCats } = await supabase
        .from('marketplace_profile_categories')
        .select('category_id')
        .eq('marketplace_profile_id', mp.id)

      setSelectedCategoryIds((selectedCats || []).map((row) => row.category_id as string))
      setLoading(false)
    }

    init()
  }, [])

  const filteredCommunities = useMemo(() => {
    if (!profile?.area_id) return communities
    return communities.filter((item) => item.area_id === profile.area_id)
  }, [communities, profile?.area_id])

  const checklist = useMemo<ChecklistItem[]>(() => {
    const taglineDone = Boolean(profile?.tagline?.trim())
    const descriptionDone = Boolean(profile?.marketplace_description?.trim())
    const areaCommunityDone = Boolean(profile?.area_id || profile?.community_id || profile?.area_text?.trim() || profile?.community_text?.trim())

    return [
      { label: 'Shop profile exists', done: Boolean(seller) },
      { label: 'At least 3 products', done: productCount >= 3 },
      { label: 'Tagline added', done: taglineDone },
      { label: 'Description added', done: descriptionDone },
      { label: 'Area/community added', done: areaCommunityDone },
      { label: 'At least 1 category selected', done: selectedCategoryIds.length > 0 },
    ]
  }, [profile, productCount, selectedCategoryIds.length, seller])

  const completedCount = checklist.filter((item) => item.done).length
  const progressPercent = Math.round((completedCount / checklist.length) * 100)
  const canSubmit = completedCount >= 5 && Boolean(profile)

  function updateProfileField<K extends keyof MarketplaceProfile>(key: K, value: MarketplaceProfile[K]) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  async function saveDraft() {
    if (!profile) return
    setSaving(true)
    setNotice(null)
    setError(null)

    const { error: updateError } = await supabase
      .from('marketplace_profiles')
      .update({
        tagline: profile.tagline,
        marketplace_description: profile.marketplace_description,
        marketplace_banner_image: profile.marketplace_banner_image,
        area_text: profile.area_text,
        community_text: profile.community_text,
        area_id: profile.area_id,
        community_id: profile.community_id,
        status: 'draft',
        is_marketplace_visible: false,
      })
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    const { error: deleteError } = await supabase
      .from('marketplace_profile_categories')
      .delete()
      .eq('marketplace_profile_id', profile.id)

    if (deleteError) {
      setError(deleteError.message)
      setSaving(false)
      return
    }

    if (selectedCategoryIds.length > 0) {
      const { error: insertError } = await supabase
        .from('marketplace_profile_categories')
        .insert(
          selectedCategoryIds.map((categoryId) => ({
            marketplace_profile_id: profile.id,
            category_id: categoryId,
          }))
        )

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
    }

    setNotice('Draft saved successfully.')
    setSaving(false)
  }

  async function submitForReview() {
    if (!profile || !canSubmit) return

    setSubmitting(true)
    setNotice(null)
    setError(null)

    await saveDraft()

    const { error: submitError } = await supabase
      .from('marketplace_profiles')
      .update({ status: 'pending_review', is_marketplace_visible: false })
      .eq('id', profile.id)

    if (submitError) {
      setError(submitError.message)
      setSubmitting(false)
      return
    }

    setProfile((prev) => (prev ? { ...prev, status: 'pending_review', is_marketplace_visible: false } : prev))
    setNotice('Submitted for review. Your BAZAR profile remains hidden until approved.')
    setSubmitting(false)
  }

  return (
    <Layout>
      <div className="space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">BAZAR Onboarding</h1>
          <p className="mt-2 text-sm text-slate-600">Set up your BAZAR profile in guided steps. This is draft-only until admin review.</p>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </section>

        {loading ? <Card><p className="text-sm text-slate-500">Loading BAZAR setup...</p></Card> : null}
        {error ? <Card><p className="text-sm font-semibold text-red-600">{error}</p></Card> : null}
        {notice ? <Card><p className="text-sm font-semibold text-emerald-700">{notice}</p></Card> : null}

        {!loading && profile ? (
          <>
            <Card title="1) Intro">
              <p className="text-sm text-slate-600">Welcome{seller?.store_name ? `, ${seller.store_name}` : ''}! Complete the sections below and submit when ready.</p>
              <p className="mt-2 text-xs text-slate-500">Current status: <span className="font-semibold">{profile.status}</span></p>
            </Card>

            <Card title="2) Branding">
              <Field label="Tagline">
                <input className={inputCls} value={profile.tagline || ''} onChange={(e) => updateProfileField('tagline', e.target.value)} placeholder="Contoh: Homemade sedap setiap hari" />
              </Field>
              <Field label="BAZAR description">
                <textarea className={inputCls} rows={4} value={profile.marketplace_description || ''} onChange={(e) => updateProfileField('marketplace_description', e.target.value)} placeholder="Terangkan apa special tentang kedai anda..." />
              </Field>
            </Card>

            <Card title="3) Area & Taman / Apartment / Kawasan">
              <Field label="Area select (optional)">
                <select className={inputCls} value={profile.area_id || ''} onChange={(e) => updateProfileField('area_id', e.target.value || null)}>
                  <option value="">Select area</option>
                  {areas.map((area) => <option key={area.id} value={area.id}>{area.area_name}</option>)}
                </select>
              </Field>
              <Field label="Taman / Apartment / Kawasan (optional)">
                <select className={inputCls} value={profile.community_id || ''} onChange={(e) => updateProfileField('community_id', e.target.value || null)}>
                  <option value="">Pilih taman / apartment / kawasan</option>
                  {filteredCommunities.map((community) => <option key={community.id} value={community.id}>{community.community_name}</option>)}
                </select>
              </Field>
              <Field label="Area text">
                <input className={inputCls} value={profile.area_text || ''} onChange={(e) => updateProfileField('area_text', e.target.value)} placeholder="Contoh: Sekitar Shah Alam & Setia Alam" />
              </Field>
              <Field label="Taman / Apartment / Kawasan text">
                <input className={inputCls} value={profile.community_text || ''} onChange={(e) => updateProfileField('community_text', e.target.value)} placeholder="Contoh: Seksyen 7, Seksyen 9" />
              </Field>
            </Card>

            <Card title="4) Categories">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {categories.map((category) => {
                  const checked = selectedCategoryIds.includes(category.id)
                  return (
                    <label key={category.id} className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm ${checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleCategory(category.id)} className="h-4 w-4" />
                      <span>{category.category_name}</span>
                    </label>
                  )
                })}
              </div>
            </Card>

            <Card title="5) Readiness Checklist">
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                    <span>{item.label}</span>
                    <span className={`font-semibold ${item.done ? 'text-emerald-700' : 'text-slate-400'}`}>{item.done ? 'Done' : 'Pending'}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="6) Review & Submit">
              <div className="space-y-2 text-sm text-slate-600">
                <p>This submits your profile for admin review.</p>
                <p>It will remain hidden from public marketplace until approved.</p>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button onClick={saveDraft} disabled={saving || submitting} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button onClick={submitForReview} disabled={!canSubmit || saving || submitting} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </Card>

            <Card title="Seller-only Preview">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Preview card (internal only)</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{seller?.store_name || 'Your Store'}</h3>
                <p className="mt-1 text-sm font-medium text-slate-700">{profile.tagline || 'Add a tagline'}</p>
                <p className="mt-2 text-sm text-slate-600">{profile.marketplace_description || 'Add a marketplace description to preview your profile.'}</p>
                <p className="mt-3 text-xs text-slate-500">Area: {profile.area_text || '—'} · Taman / Apartment / Kawasan: {profile.community_text || '—'}</p>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </Layout>
  )
}

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {title ? <h2 className="mb-3 text-lg font-extrabold text-slate-900">{title}</h2> : null}
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputCls = 'w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-0 focus:border-slate-900'
