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

function getOnboardingStatus(
  seller: SellerProfile,
  productCount: number,
  paidOrders: number
) {
  const bankOk = Boolean(
    seller.bank_name && seller.account_number && seller.account_holder_name
  )

  const deliveryOk = Boolean(
    seller.delivery_mode &&
      (toNumber(seller.delivery_radius_km) > 0 ||
        toNumber(seller.delivery_min_fee) > 0 ||
        toNumber(seller.delivery_rate_per_km) > 0 ||
        seller.delivery_mode === "free_delivery" ||
        seller.delivery_mode === "included_in_price" ||
        seller.delivery_mode === "pay_rider_separately")
  )

  const hoursOk = Boolean(
    seller.accept_orders_anytime || (seller.opening_time && seller.closing_time)
  )

  const shareOk = Boolean(seller.share_image_mode || seller.share_poster_url)
  const slugOk = Boolean(seller.shop_slug)

  const setupCount = [bankOk, deliveryOk, hoursOk, shareOk, slugOk].filter(Boolean).length

  if (productCount > 0 && paidOrders > 0) {
    return {
      label: "Active Seller",
      tone: "bg-emerald-50 text-emerald-700",
      note: "Seller already receiving paid orders",
    }
  }

  if (productCount > 0 && setupCount >= 4) {
    return {
      label: "Setup Done",
      tone: "bg-blue-50 text-blue-700",
      note: "Store setup looks ready",
    }
  }

  if (setupCount >= 2) {
    return {
      label: "In Progress",
      tone: "bg-amber-50 text-amber-700",
      note: "Some setup still incomplete",
    }
  }

  return {
    label: "Onboarding",
    tone: "bg-slate-100 text-slate-700",
    note: "Needs admin assistance",
  }
}

export default async function AdminSellersPage() {
  const { data: sellers, error } = await supabase
    .from("seller_profiles")
    .select(`
      id,
      store_name,
      email,
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
          Monitor seller onboarding dan akses quick links untuk support lebih cepat.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Seller</th>
                <th className="px-4 py-3 font-semibold">Onboarding</th>
                <th className="px-4 py-3 font-semibold">Products</th>
                <th className="px-4 py-3 font-semibold">Paid Orders</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!sellers || sellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No sellers found.
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => {
                  const productCount = productCountsMap.get(seller.id) || 0
                  const paidOrders = paidOrdersMap.get(seller.id) || 0
                  const onboarding = getOnboardingStatus(
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
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${onboarding.tone}`}
                          >
                            {onboarding.label}
                          </span>
                          <p className="text-xs text-slate-500">
                            {onboarding.note}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {productCount}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {paidOrders}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            href={`/admin/sellers/${seller.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>

                          <Link
                            href={`/admin/orders?seller=${seller.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Orders
                          </Link>

                          <Link
                            href={`/admin/payout?seller=${seller.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Payout
                          </Link>

                          <Link
                            href={`/admin/products?seller=${seller.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Products
                          </Link>

                          {seller.shop_slug ? (
                            <a
                              href={`/s/${seller.shop_slug}`}
                              target="_blank"
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Open Store
                            </a>
                          ) : null}
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
