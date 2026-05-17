'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import MarketplaceSubnav from '../components/MarketplaceSubnav'

type CategoryRow = { id: string; category_key: string; category_name: string; is_enabled: boolean; display_order: number }
const CATEGORY_LABEL_MAP: Record<string, string> = {
  food_drinks: 'Food & Drinks',
  products_shop: 'Products / Shop',
  services: 'Services',
  catering: 'Catering',
  home_business: 'Home Business',
  beauty_health: 'Beauty & Health',
  fashion: 'Fashion',
  digital_design: 'Digital / Design',
  repair_maintenance: 'Repair / Maintenance',
  community: 'Community',
}

const LEGACY_CATEGORY_KEY_MAP: Record<string, string> = {
  breakfast: 'food_drinks',
  lunch: 'food_drinks',
  dinner: 'food_drinks',
  dessert: 'food_drinks',
  bakery: 'food_drinks',
  drinks: 'food_drinks',
  frozen_food: 'food_drinks',
  kuih_muih: 'food_drinks',
  snacks: 'food_drinks',
}

export default function MarketplaceCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('marketplace_categories')
        .select('id,category_key,category_name,is_enabled,display_order')
        .order('display_order', { ascending: true })
      const normalized = (data || []).map((row) => {
        const key = LEGACY_CATEGORY_KEY_MAP[row.category_key] || row.category_key
        return {
          ...row,
          category_key: key,
          category_name: CATEGORY_LABEL_MAP[key] || row.category_name,
        }
      })
      setRows(normalized)
      setLoading(false)
    }
    loadData()
  }, [])

  return <DataCard title="Marketplace Categories" loading={loading} rows={rows} />
}

function DataCard({ title, loading, rows }: { title: string; loading: boolean; rows: CategoryRow[] }) {
  return (
    <div className="space-y-4">
      <MarketplaceSubnav />
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(rows, null, 2)}</pre>
      </section>
    </div>
  )
}
