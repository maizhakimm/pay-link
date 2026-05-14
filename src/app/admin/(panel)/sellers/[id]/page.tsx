import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import SellerEditClient from "./seller-edit-client"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("id", params.id)
    .single()
  const { data: marketplaceProfile } = await supabase
    .from("marketplace_profiles")
    .select("id,seller_profile_id,status,is_marketplace_visible,is_featured,is_verified,area_text,community_text,tagline,marketplace_description")
    .eq("seller_profile_id", params.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  let marketplaceCategoryNames: string[] = []
  if (marketplaceProfile?.id) {
    const { data: categoryRows } = await supabase
      .from("marketplace_profile_categories")
      .select("marketplace_categories(category_name)")
      .eq("marketplace_profile_id", marketplaceProfile.id)
    marketplaceCategoryNames = (categoryRows || [])
      .map((row: any) =>
        Array.isArray(row.marketplace_categories)
          ? row.marketplace_categories[0]?.category_name
          : row.marketplace_categories?.category_name
      )
      .filter(Boolean)
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Edit Seller
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Seller not found.
          </p>

          <div className="mt-6">
            <Link
              href="/admin/sellers"
              className="inline-flex rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Sellers
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return <SellerEditClient seller={data} marketplaceProfile={marketplaceProfile ? { ...marketplaceProfile, category_names: marketplaceCategoryNames } : null} />
}
