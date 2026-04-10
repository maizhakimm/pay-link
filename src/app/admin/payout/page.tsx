'use client'

import Link from 'next/link'
import Layout from '../../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type PayoutRow = {
  seller_profile_id: string
  store_name: string | null
  email: string | null
  total_paid_orders: number
  total_sales: number
  total_fee: number
  total_payout: number
}

type BreakdownRow = {
  seller_profile_id: string
  payment_method: string | null
  total_orders: number
  total_sales: number
  total_fee: number
  total_payout: number
}

function formatMoney(value?: number | null) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

export default function AdminPayoutPage() {
  const [loading, setLoading] = useState(true)
  const [markingSellerId, setMarkingSellerId] = useState<string | null>(null)

  const [rows, setRows] = useState<PayoutRow[]>([])
  const [breakdowns, setBreakdowns] = useState<BreakdownRow[]>([])
  const [search, setSearch] = useState('')

  const loadPayoutData = useCallback(async () => {
    setLoading(true)

    const { data: paidOrders, error } = await supabase
      .from('orders')
      .select(`
        seller_profile_id,
        payment_method,
        gross_amount,
        platform_fee_amount,
        net_seller_amount,
        payout_status,
        payment_status,
        seller_profiles (
          id,
          store_name,
          email
        )
      `)
      .eq('payment_status', 'paid')
      .in('payout_status', ['unpaid', 'eligible'])

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const payoutMap = new Map<string, PayoutRow>()
    const breakdownMap = new Map<string, BreakdownRow>()

    for (const order of paidOrders || []) {
      const sellerProfileId = String(order.seller_profile_id || '')
      if (!sellerProfileId) continue

      const sellerProfileRaw = Array.isArray(order.seller_profiles)
        ? order.seller_profiles[0]
        : order.seller_profiles

      const sellerProfile = sellerProfileRaw as
        | { id?: string; store_name?: string | null; email?: string | null }
        | null
        | undefined

      const storeName = sellerProfile?.store_name || 'Unnamed Seller'
      const email = sellerProfile?.email || null

      const gross = Number(order.gross_amount || 0)
      const fee = Number(order.platform_fee_amount || 0)
      const payout = Number(order.net_seller_amount || 0)
      const paymentMethod = String(order.payment_method || 'UNKNOWN')

      if (!payoutMap.has(sellerProfileId)) {
        payoutMap.set(sellerProfileId, {
          seller_profile_id: sellerProfileId,
          store_name: storeName,
          email,
          total_paid_orders: 0,
          total_sales: 0,
          total_fee: 0,
          total_payout: 0,
        })
      }

      const sellerRow = payoutMap.get(sellerProfileId)!
      sellerRow.total_paid_orders += 1
      sellerRow.total_sales += gross
      sellerRow.total_fee += fee
      sellerRow.total_payout += payout

      const breakdownKey = `${sellerProfileId}__${paymentMethod}`

      if (!breakdownMap.has(breakdownKey)) {
        breakdownMap.set(breakdownKey, {
          seller_profile_id: sellerProfileId,
          payment_method: paymentMethod,
          total_orders: 0,
          total_sales: 0,
          total_fee: 0,
          total_payout: 0,
        })
      }

      const methodRow = breakdownMap.get(breakdownKey)!
      methodRow.total_orders += 1
      methodRow.total_sales += gross
      methodRow.total_fee += fee
      methodRow.total_payout += payout
    }

    const payoutRows = Array.from(payoutMap.values()).sort(
      (a, b) => b.total_payout - a.total_payout
    )

    const breakdownRows = Array.from(breakdownMap.values()).sort((a, b) => {
      if (a.seller_profile_id === b.seller_profile_id) {
        return String(a.payment_method).localeCompare(String(b.payment_method))
      }
      return a.seller_profile_id.localeCompare(b.seller_profile_id)
    })

    setRows(payoutRows)
    setBreakdowns(breakdownRows)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPayoutData()
  }, [loadPayoutData])

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return rows

    return rows.filter((row) => {
      const haystack = [
        row.store_name || '',
        row.email || '',
        row.seller_profile_id,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [rows, search])

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.sellers += 1
        acc.orders += row.total_paid_orders
        acc.sales += row.total_sales
        acc.fee += row.total_fee
        acc.payout += row.total_payout
        return acc
      },
      {
        sellers: 0,
        orders: 0,
        sales: 0,
        fee: 0,
        payout: 0,
      }
    )
  }, [filteredRows])

  async function markSellerPaid(sellerProfileId: string, sellerName: string) {
    const confirmed = window.confirm(
      `Mark all eligible payout orders as PAID for ${sellerName}?`
    )
    if (!confirmed) return

    setMarkingSellerId(sellerProfileId)

    const { error } = await supabase
      .from('orders')
      .update({
        payout_status: 'paid',
        payout_at: new Date().toISOString(),
      })
      .eq('seller_profile_id', sellerProfileId)
      .eq('payment_status', 'paid')
      .in('payout_status', ['unpaid', 'eligible'])

    setMarkingSellerId(null)

    if (error) {
      alert(error.message)
      return
    }

    await loadPayoutData()
    alert('Payout marked as paid')
  }

  function getSellerBreakdowns(sellerProfileId: string) {
    return breakdowns.filter((row) => row.seller_profile_id === sellerProfileId)
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Admin Payout
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Monitor seller payout totals, fee breakdown, and mark payout as paid.
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Orders
        </Link>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Sellers" value={totals.sellers} />
        <StatCard label="Paid Orders" value={totals.orders} />
        <StatCard label="Total Sales" value={formatMoney(totals.sales)} />
        <StatCard label="Total Fee" value={formatMoney(totals.fee)} />
        <StatCard label="Total Payout" value={formatMoney(totals.payout)} />
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seller name, email or seller profile ID..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Seller Payout List</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredRows.length} seller
            {filteredRows.length === 1 ? '' : 's'} with unpaid / eligible paid orders.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : filteredRows.length === 0 ? (
          <p className="text-sm text-slate-500">No payout data found.</p>
        ) : (
          <div className="space-y-4">
            {filteredRows.map((row) => {
              const methodRows = getSellerBreakdowns(row.seller_profile_id)

              return (
                <div
                  key={row.seller_profile_id}
                  className="rounded-3xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {row.store_name || 'Unnamed Seller'}
                      </h3>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {row.email || '-'}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-400">
                        Seller ID: {row.seller_profile_id}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        markSellerPaid(
                          row.seller_profile_id,
                          row.store_name || 'Unnamed Seller'
                        )
                      }
                      disabled={markingSellerId === row.seller_profile_id}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {markingSellerId === row.seller_profile_id
                        ? 'Processing...'
                        : 'Mark Paid'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <InfoCard
                      label="Paid Orders"
                      value={String(row.total_paid_orders)}
                    />
                    <InfoCard
                      label="Total Sales"
                      value={formatMoney(row.total_sales)}
                    />
                    <InfoCard
                      label="Total Fee"
                      value={formatMoney(row.total_fee)}
                    />
                    <InfoCard
                      label="Total Payout"
                      value={formatMoney(row.total_payout)}
                    />
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-4 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <div>Payment Method</div>
                      <div className="text-right">Orders</div>
                      <div className="text-right">Fee</div>
                      <div className="text-right">Payout</div>
                    </div>

                    <div className="bg-white">
                      {methodRows.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-slate-500">
                          No payment method breakdown.
                        </div>
                      ) : (
                        methodRows.map((methodRow) => (
                          <div
                            key={`${methodRow.seller_profile_id}-${methodRow.payment_method}`}
                            className="grid grid-cols-4 gap-3 border-b border-slate-100 px-4 py-3 text-sm text-slate-700 last:border-b-0"
                          >
                            <div className="font-semibold text-slate-900">
                              {methodRow.payment_method || 'UNKNOWN'}
                            </div>
                            <div className="text-right">
                              {methodRow.total_orders}
                            </div>
                            <div className="text-right">
                              {formatMoney(methodRow.total_fee)}
                            </div>
                            <div className="text-right font-bold text-slate-900">
                              {formatMoney(methodRow.total_payout)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </Layout>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-xl font-extrabold text-slate-900 sm:text-2xl">
        {value}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2 break-words text-base font-bold text-slate-900">
        {value}
      </div>
    </div>
  )
}
