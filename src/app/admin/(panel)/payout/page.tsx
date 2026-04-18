import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import PayoutClient from "./payout-client"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = "force-dynamic"

export type SellerProfileLite = {
  id: string
  store_name: string | null
  bank_name: string | null
  account_number: string | null
  account_holder_name: string | null
  email: string | null
}

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
  seller_fee_amount: number | string | null
  net_seller_amount: number | string | null

  payment_method: string | null
  payment_status: string | null

  paid_at: string | null
  settlement_days: number | null
  eligible_payout_at: string | null

  payout_status: string | null
  payout_reference: string | null
  payout_at: string | null
  created_at: string | null

  seller_profiles?: {
    store_name?: string | null
    bank_name?: string | null
    account_number?: string | null
    account_holder_name?: string | null
    email?: string | null
  } | null
}

async function getOrders(): Promise<OrderRow[]> {
  const { data: orders, error: ordersError } = await supabase
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
      seller_fee_amount,
      net_seller_amount,
      payment_method,
      payment_status,
      paid_at,
      settlement_days,
      eligible_payout_at,
      payout_status,
      payout_at,
      payout_reference,
      created_at
    `)
    .eq("payment_status", "paid")
    .order("paid_at", { ascending: false })

  if (ordersError) {
    console.error("Payout orders query failed:", ordersError.message)
    return []
  }

  const safeOrders = (orders || []) as OrderRow[]

  const sellerProfileIds = Array.from(
    new Set(
      safeOrders
        .map((o) => o.seller_profile_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  if (sellerProfileIds.length === 0) {
    return safeOrders
  }

  const { data: sellers, error: sellersError } = await supabase
    .from("seller_profiles")
    .select("id, store_name, bank_name, account_number, account_holder_name, email")
    .in("id", sellerProfileIds)

  if (sellersError) {
    console.error("Seller profiles query failed:", sellersError.message)
    return safeOrders
  }

  const sellerMap = new Map<string, SellerProfileLite>()
  ;((sellers || []) as SellerProfileLite[]).forEach((seller) => {
    sellerMap.set(seller.id, seller)
  })

  return safeOrders.map((order) => {
    const seller = order.seller_profile_id
      ? sellerMap.get(order.seller_profile_id)
      : null

    return {
      ...order,
      seller_profiles: seller
        ? {
            store_name: seller.store_name,
            bank_name: seller.bank_name,
            account_number: seller.account_number,
            account_holder_name: seller.account_holder_name,
            email: seller.email,
          }
        : null,
    }
  })
}

export default async function AdminPayoutPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Admin Payout
            </h1>
            <p className="mt-3 text-xl text-slate-500">
              Settlement-aware payout grouped by seller
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>
      </div>

      <PayoutClient initialOrders={orders} />
    </div>
  )
}
