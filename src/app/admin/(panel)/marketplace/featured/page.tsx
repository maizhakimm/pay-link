'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'

type FeaturedRow = {
  id: string
  marketplace_profile_id: string
  product_id: string
  feature_type: string
  priority: number
  start_at: string | null
  end_at: string | null
  is_enabled: boolean
}

export default function MarketplaceFeaturedPage() {
  const [rows, setRows] = useState<FeaturedRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('marketplace_featured_products')
        .select('id,marketplace_profile_id,product_id,feature_type,priority,start_at,end_at,is_enabled')
        .order('priority', { ascending: true })
      setRows(data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Featured Products</h2>
      {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
      <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(rows, null, 2)}</pre>
    </section>
  )
}
