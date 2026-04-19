import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type SellerProfile = {
  id: string
  store_name: string | null
  email: string | null
  contact_phone: string | null
  bank_name: string | null
  account_number: string | null
  account_holder_name: string | null
  shop_slug: string | null
  delivery_mode: string | null
  delivery_radius_km: number | string | null
  delivery_rate_per_km: number | string | null
  delivery_min_fee: number | string | null
  accept_orders_anytime: boolean | null
  opening_time: string | null
  closing_time: string | null
  share_image_mode: string | null
  share_poster_url: string | null
  created_at: string | null
}

function toNumber(value: number | string | null | undefined) {
  const num = Number(value || 0)
  return Number.isFinite(num) ? num : 0
}

function getSellerHealth(seller: SellerProfile, productCount: number, paidOrders: number) {
  const checks = {
    bank:
      Boolean(
        seller.bank_name &&
          seller.account_number &&
          seller.account_holder_name
      ),
    delivery:
      Boolean(
        seller.delivery_mode &&
          (toNumber(seller.delivery_radius_km) > 0 ||
            toNumber(seller.delivery_min_fee) > 0 ||
            toNumber(seller.delivery_rate_per_km) > 0)
      ),
    share:
      Boolean(
        seller.share_image_mode ||
          seller.share_poster_url
      ),
    hours:
      Boolean(
        seller.accept_orders_anytime ||
          (seller.opening_time && seller.closing_time)
      ),
    slug: Boolean(seller.shop_slug),
    products: productCount > 0,
  }

  const score = Object.values(checks).filter(Boolean).length
  const maxScore = Object.keys(checks).length
  const percent = Math.round((score / maxScore) * 100)

  let label = "Needs Setup"
  let color =
    "bg-red-50 text-red-700 ring-red-200"

  if (percent >= 100) {
    label = "Ready"
    color = "bg-emerald-50 text-emerald-700 ring-emerald-200"
  } else if (percent >= 70) {
    label = "Almost Ready"
    color = "bg-amber-50 text-amber-700 ring-amber-200"
  } else if (percent >= 40) {
    label = "In Progress"
    color = "bg-blue-50 text-blue-700 ring-blue-200"
  }

  const onboardingStatus =
    productCount > 0 && paidOrders > 0
      ? "Active Seller"
      : productCount > 0
      ? "Setup Done"
      : "Onboarding"

  return {
    checks,
    score,
    maxScore,
    percent,
    label,
    color,
    onboardingStatus,
  }
}

function CheckPill({
  ok,
  label,
}: {
  ok: boolean
  label: string
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        ok
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-100 text-slate-500 ring-slate-200"
      }`}
    >
      {label}
    </span>
  )
}

export default async function AdminSellersPage() {
  const { data: sellers, error } = await supabase
    .from("seller_profiles")
    .select(`
      id,
      store_name,
      email,
      contact_phone,
      bank_name,
      account_number,
      account_holder_name,
      shop_slug,
      delivery_mode,
      delivery_radius_km,
      delivery_rate_per_km,
      delivery_min_fee,
      accept_orders_anytime,
      opening_time,
      closing_time,
      share_image_mode,
      share_poster_url,
      created_at
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return <div className="p-6">Error loading sellers</div>
  }

  const sellerIds = (sellers || []).map((s) => s.id)

  const productCountsMap = new Map<string, number>()
  const paidOrdersMap = new Map<string, number>()

  if (sellerIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("seller_profile_id")
      .in("seller_profile_id", sellerIds)

    for (const row of products || []) {
      const id = row.seller_profile_id as string
      productCountsMap.set(id, (productCountsMap.get(id) || 0) + 1)
    }

    const { data: paidOrders } = await supabase
      .from("orders")
      .select("seller_profile_id")
      .in("seller_profile_id", sellerIds)
      .eq("payment_status", "paid")

    for (const row of paidOrders || []) {
      const id = row.seller_profile_id as string
      paidOrdersMap.set(id, (paidOrdersMap.get(id) || 0) + 1)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Sellers
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Monitor seller onboarding, setup readiness, dan health status.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Seller</th>
                <th className="px-4 py-3 font-semibold">Onboarding</th>
                <th className="px-4 py-3 font-semibold">Health</th>
                <th className="px-4 py-3 font-semibold">Checklist</th>
                <th className="px-4 py-3 font-semibold">Products</th>
                <th className="px-4 py-3 font-semibold">Paid Orders</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!sellers || sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No sellers found.
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => {
                  const productCount = productCountsMap.get(seller.id) || 0
                  const paidOrders = paidOrdersMap.get(seller.id) || 0

                  const health = getSellerHealth(
                    seller as SellerProfile,
                    productCount,
                    paidOrders
                  )

                  return (
                    <tr
                      key={seller.id}
                      className="border-t border-slate-100 align-top"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {seller.store_name || "No Store Name"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {seller.email || "-"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {seller.contact_phone || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {health.onboardingStatus}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${health.color}`}
                          >
                            {health.label}
                          </span>
                          <p className="text-xs text-slate-500">
                            {health.score}/{health.maxScore} complete •{" "}
                            {health.percent}%
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex max-w-md flex-wrap gap-2">
                          <CheckPill ok={health.checks.bank} label="Bank" />
                          <CheckPill ok={health.checks.delivery} label="Delivery" />
                          <CheckPill ok={health.checks.share} label="Share" />
                          <CheckPill ok={health.checks.hours} label="Hours" />
                          <CheckPill ok={health.checks.slug} label="Slug" />
                          <CheckPill ok={health.checks.products} label="Products" />
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {productCount}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {paidOrders}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/sellers/${seller.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>

                          <a
                            href={`/s/${seller.shop_slug || ""}`}
                            target="_blank"
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Open Store
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
