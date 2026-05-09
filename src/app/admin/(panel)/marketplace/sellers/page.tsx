'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import MarketplaceSubnav from '../components/MarketplaceSubnav'

type MarketplaceSellerRow = {
  id: string
  seller_profiles?: {
    store_name: string | null
    email: string | null
    whatsapp: string | null
    shop_slug: string | null
  } | null
  seller_profile_id: string
  status: string
  is_marketplace_visible: boolean
  is_featured: boolean
  is_verified: boolean
  tagline: string | null
  area_text: string | null
  community_text: string | null
  created_at: string
}

type MarketplaceSellerRowRaw = Omit<MarketplaceSellerRow, 'seller_profiles'> & {
  seller_profiles?:
    | {
        store_name: string | null
        email: string | null
        whatsapp: string | null
        shop_slug: string | null
      }
    | {
        store_name: string | null
        email: string | null
        whatsapp: string | null
        shop_slug: string | null
      }[]
    | null
}

export default function MarketplaceSellersPage() {
  const [rows, setRows] = useState<MarketplaceSellerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('marketplace_profiles')
      .select('id,seller_profile_id,status,is_marketplace_visible,is_featured,is_verified,tagline,area_text,community_text,created_at,seller_profiles(store_name,email,whatsapp,shop_slug)')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      const normalizedRows = ((data || []) as MarketplaceSellerRowRaw[]).map((row) => {
        const sellerProfiles = Array.isArray(row.seller_profiles)
          ? row.seller_profiles[0] || null
          : row.seller_profiles || null

        return {
          ...row,
          seller_profiles: sellerProfiles,
        }
      })

      setRows(normalizedRows)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function moderateAction(
    row: MarketplaceSellerRow,
    action: 'approve' | 'reject' | 'feature' | 'verify'
  ) {
    if (action === 'approve') {
      const ok = window.confirm('Approve this seller for marketplace publish?')
      if (!ok) return
    }
    if (action === 'reject') {
      const ok = window.confirm('Reject this seller marketplace profile?')
      if (!ok) return
    }

    setActionLoadingId(`${row.id}:${action}`)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) {
      setError('Admin session expired. Please log in again.')
      setActionLoadingId(null)
      return
    }

    const response = await fetch(`/api/admin/marketplace/sellers/${row.id}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action }),
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(result?.error || 'Failed to update marketplace profile.')
    } else {
      await loadData()
    }

    setActionLoadingId(null)
  }

  return (
    <div className="space-y-4">
      <MarketplaceSubnav />
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Marketplace Sellers</h2>
          <p className="mt-1 text-sm text-slate-500">View-only list of marketplace profiles.</p>
        </div>
        {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-2 font-semibold">Seller Profile ID</th>
                <th className="px-3 py-2 font-semibold">Store Name</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Contact Phone</th>
                <th className="px-3 py-2 font-semibold">Shop Slug</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Visible</th>
                <th className="px-3 py-2 font-semibold">Featured</th>
                <th className="px-3 py-2 font-semibold">Verified</th>
                <th className="px-3 py-2 font-semibold">Tagline</th>
                <th className="px-3 py-2 font-semibold">Area</th>
                <th className="px-3 py-2 font-semibold">Taman / Apartment / Kawasan</th>
                <th className="px-3 py-2 font-semibold">Created At</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 text-slate-700">
                  <td className="px-3 py-2 font-mono text-xs sm:text-sm">{row.seller_profile_id}</td>
                  <td className="px-3 py-2">{row.seller_profiles?.store_name || '-'}</td>
                  <td className="px-3 py-2">{row.seller_profiles?.email || '-'}</td>
                  <td className="px-3 py-2">{row.seller_profiles?.whatsapp || '-'}</td>
                  <td className="px-3 py-2">{row.seller_profiles?.shop_slug || '-'}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.is_marketplace_visible ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{row.is_featured ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{row.is_verified ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 max-w-[240px] truncate">{row.tagline || '-'}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{row.area_text || '-'}</td>
                  <td className="px-3 py-2 max-w-[240px] truncate">{row.community_text || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => moderateAction(row, 'approve')} disabled={Boolean(actionLoadingId)} className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">{actionLoadingId === `${row.id}:approve` ? 'Approving...' : 'Approve'}</button>
                      <button onClick={() => moderateAction(row, 'reject')} disabled={Boolean(actionLoadingId)} className="rounded-xl bg-rose-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">{actionLoadingId === `${row.id}:reject` ? 'Rejecting...' : 'Reject'}</button>
                      <button onClick={() => moderateAction(row, 'feature')} disabled={Boolean(actionLoadingId)} className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60">{actionLoadingId === `${row.id}:feature` ? 'Updating...' : row.is_featured ? 'Unfeature' : 'Feature'}</button>
                      <button onClick={() => moderateAction(row, 'verify')} disabled={Boolean(actionLoadingId)} className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60">{actionLoadingId === `${row.id}:verify` ? 'Updating...' : row.is_verified ? 'Unverify' : 'Verify'}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-3 py-6 text-center text-slate-500">
                    No marketplace profiles found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
