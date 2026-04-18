import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import PayoutClient from "./payout-client"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = "force-dynamic"

export type OrderRow = {
  id: string
  order_number: string | null
  order_no: string | null
  seller_profile_id: string | null

  buyer_name: string | null
  buyer_email: string | null
  buyer_phone: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null

  total_amount: number | string | null
  platform_fee_amount: number | string | null
  net_seller_amount: number | string | null

  payment_method: string | null
  payment_status: string | null

  paid_at: string | null
  settlement_days: number | null
  eligible_payout_at: string | null

  payout_status: string | null
  payout_at: string | null
  created_at: string | null

  seller_profiles?: {
    store_name?: string | null
    bank_name?: string | null
    bank_account_no?: string | null
    bank_account_holder?: string | null
  } | null
}

async function getOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      order_no,
      seller_profile_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      customer_name,
      customer_email,
      customer_phone,
      total_amount,
      platform_fee_amount,
      net_seller_amount,
      payment_method,
      payment_status,
      paid_at,
      settlement_days,
      eligible_payout_at,
      payout_status,
      payout_at,
      created_at,
      seller_profiles (
        store_name,
        bank_name,
        bank_account_no,
        bank_account_holder
      )
    `)
    .in("payment_status", ["paid", "completed"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Payout orders query failed:", error.message)
    return []
  }

  return (data || []) as OrderRow[]
}

export default async function AdminPayoutPage() {
  const orders = await getOrders()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Payout</h1>
            <p className="mt-1 text-sm text-slate-500">
              Settlement-aware payout grouped by seller
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <PayoutClient initialOrders={orders} />
      </div>
    </div>
  )
}
