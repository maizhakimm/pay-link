'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'

type AreaRow = { id: string; area_key: string; area_name: string; is_enabled: boolean; display_order: number }

export default function MarketplaceAreasPage() {
  const [rows, setRows] = useState<AreaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('marketplace_areas')
        .select('id,area_key,area_name,is_enabled,display_order')
        .order('display_order', { ascending: true })
      setRows(data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Marketplace Areas</h2>
      {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
      <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(rows, null, 2)}</pre>
    </section>
  )
}
