import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminSellersPage() {
  const { data: sellers, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return <div className="p-6">Error loading sellers</div>
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Sellers
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Senarai seller berdaftar dalam sistem BayarLink
        </p>
      </section>

      {/* TABLE */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Store</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Bank</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sellers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No sellers found
                  </td>
                </tr>
              ) : (
                sellers?.map((seller) => {
                  const hasBank =
                    seller.bank_name &&
                    seller.account_number &&
                    seller.account_holder_name

                  return (
                    <tr
                      key={seller.id}
                      className="border-t border-slate-100"
                    >
                      {/* STORE */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {seller.store_name || "No Store Name"}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {seller.id.slice(0, 8)}
                          </p>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-4 text-slate-700">
                        {seller.email || "-"}
                      </td>

                      {/* PHONE */}
                      <td className="px-4 py-4 text-slate-700">
                        {seller.contact_phone || "-"}
                      </td>

                      {/* BANK */}
                      <td className="px-4 py-4">
                        {hasBank ? (
                          <div className="text-slate-700">
                            <p className="text-sm">{seller.bank_name}</p>
                            <p className="text-xs">{seller.account_number}</p>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-red-600">
                            Incomplete
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        {hasBank ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Ready
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Setup Needed
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/sellers/${seller.id}`}
                            className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                          >
                            Edit
                          </Link>

                          <a
                            href={`/s/${seller.shop_slug || ""}`}
                            target="_blank"
                            className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
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
