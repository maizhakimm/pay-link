'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import MarketplaceSubnav from '../components/MarketplaceSubnav'

type HomepageSectionRow = {
  id: string
  section_key: string
  is_enabled: boolean
  display_order: number
  title: string | null
  subtitle: string | null
}

export default function MarketplaceHomepagePage() {
  const [rows, setRows] = useState<HomepageSectionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('homepage_sections')
        .select('id,section_key,is_enabled,display_order,title,subtitle')
        .order('display_order', { ascending: true })
      setRows(data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <div className="space-y-4">
      <MarketplaceSubnav />
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Homepage Sections</h2>
        {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(rows, null, 2)}</pre>
      </section>
    </div>
  )
}
