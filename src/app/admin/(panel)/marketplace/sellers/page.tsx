'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import MarketplaceSubnav from '../components/MarketplaceSubnav'

type MarketplaceSellerRow = {
  id: string
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

export default function MarketplaceSellersPage() {
  const [rows, setRows] = useState<MarketplaceSellerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('marketplace_profiles')
        .select('id,seller_profile_id,status,is_marketplace_visible,is_featured,is_verified,tagline,area_text,community_text,created_at')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setRows(data || [])
      }

      setLoading(false)
    }

    loadData()
  }, [])

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
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Visible</th>
                <th className="px-3 py-2 font-semibold">Featured</th>
                <th className="px-3 py-2 font-semibold">Verified</th>
                <th className="px-3 py-2 font-semibold">Tagline</th>
                <th className="px-3 py-2 font-semibold">Area</th>
                <th className="px-3 py-2 font-semibold">Taman / Apartment / Kawasan</th>
                <th className="px-3 py-2 font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 text-slate-700">
                  <td className="px-3 py-2 font-mono text-xs sm:text-sm">{row.seller_profile_id}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.is_marketplace_visible ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{row.is_featured ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{row.is_verified ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 max-w-[240px] truncate">{row.tagline || '-'}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{row.area_text || '-'}</td>
                  <td className="px-3 py-2 max-w-[240px] truncate">{row.community_text || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
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
