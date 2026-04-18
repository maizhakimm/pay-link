'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

type SellerProfileMap = Record<
  string,
  {
    store_name: string | null
    email: string | null
  }
>

type PayoutOrderRow = {
  id: string
  order_number: string | null
  seller_profile_id: string | null
  seller_id: string | null
  payment_status: string | null
  payout_status: string | null
  payment_method: string | null
  payment_channel: string | null
  net_seller_amount: number | null
  seller_net: number | null
  amount: number | null
  total_amount: number | null
  platform_fee: number | null
  fee_amount: number | null
  admin_fee: number | null
  created_at: string
  paid_at: string | null
  payout_at: string | null
}

export default function AdminPayoutPage() {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<PayoutOrderRow[]>([])
  const [sellerMap, setSellerMap] = useState<SellerProfileMap>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function checkAccess() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const user = session?.user

        if (!user) {
          if (mounted) {
            setAuthorized(false)
            setChecking(false)
            window.location.href = '/admin/login'
          }
          return
        }

        const { data: roleRow, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error || !roleRow || roleRow.role !== 'admin') {
          await supabase.auth.signOut()

          if (mounted) {
            setAuthorized(false)
            setChecking(false)
            window.location.href = '/admin/login'
          }
          return
        }

        if (mounted) {
          setAuthorized(true)
          setChecking(false)
        }
      } catch (error) {
        console.error('Admin access check failed:', error)

        if (mounted) {
          setAuthorized(false)
          setChecking(false)
          window.location.href = '/admin/login'
        }
      }
    }

    checkAccess()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!authorized) return

    async function loadPayouts() {
      setLoading(true)

      const { data, error } = await supabase
        .from('orders')
        .select(
          `
            id,
            order_number,
            seller_profile_id,
            seller_id,
            payment_status,
            payout_status,
            payment_method,
            payment_channel,
            net_seller_amount,
            seller_net,
            amount,
            total_amount,
            platform_fee,
            fee_amount,
            admin_fee,
            created_at,
            paid_at,
            payout_at
          `
        )
        .eq('payment_status', 'paid')
        .neq('payout_status', 'paid')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Load payout orders error:', error)
        setRows([])
        setSellerMap({})
        setLoading(false)
        return
      }

      const orderRows = ((data || []) as unknown) as PayoutOrderRow[]
      setRows(orderRows)

      const sellerProfileIds = Array.from(
        new Set(
          orderRows
            .map((row) => row.seller_profile_id)
            .filter((id): id is string => Boolean(id))
        )
      )

      if (sellerProfileIds.length === 0) {
        setSellerMap({})
        setLoading(false)
        return
      }

      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_profiles')
        .select('id, store_name, email')
        .in('id', sellerProfileIds)

      if (sellerError) {
        console.error('Load seller profiles error:', sellerError)
        setSellerMap({})
        setLoading(false)
        return
      }

      const nextSellerMap: SellerProfileMap = {}

      for (const seller of sellerData || []) {
        nextSellerMap[seller.id] = {
          store_name: seller.store_name,
          email: seller.email,
        }
      }

      setSellerMap(nextSellerMap)
      setLoading(false)
    }

    loadPayouts()
  }, [authorized])

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => {
      const status = (r.payout_status || '').toLowerCase()
      return (
        status === 'unpaid' ||
        status === 'eligible' ||
        status === 'pending' ||
        status === ''
      )
    }).length

    const approved = rows.filter(
      (r) => (r.payout_status || '').toLowerCase() === 'approved'
    ).length

    const paid = rows.filter(
      (r) => (r.payout_status || '').toLowerCase() === 'paid'
    ).length

    return { total, pending, approved, paid }
  }, [rows])

  function getSellerName(row: PayoutOrderRow) {
    const profile = row.seller_profile_id ? sellerMap[row.seller_profile_id] : null
    return profile?.store_name || 'No store name'
  }

  function getSellerEmail(row: PayoutOrderRow) {
    const profile = row.seller_profile_id ? sellerMap[row.seller_profile_id] : null
    return profile?.email || row.seller_profile_id || row.seller_id || '-'
  }

  function getGrossAmount(row: PayoutOrderRow) {
    return Number(row.total_amount ?? row.amount ?? 0)
  }

  function getFeeAmount(row: PayoutOrderRow) {
    return Number(row.platform_fee ?? row.fee_amount ?? row.admin_fee ?? 0)
  }

  function getNetAmount(row: PayoutOrderRow) {
    return Number(
      row.net_seller_amount ??
        row.seller_net ??
        getGrossAmount(row) - getFeeAmount(row)
    )
  }

  function getPaymentMethod(row: PayoutOrderRow) {
    return row.payment_method || row.payment_channel || '-'
  }

  function formatAmount(amount: number | null | undefined) {
    return `RM ${Number(amount || 0).toFixed(2)}`
  }

  function formatDate(value: string | null) {
    if (!value) return '-'

    try {
      return new Date(value).toLocaleString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return value
    }
  }

  function getStatusBadgeClass(status: string | null) {
    const value = (status || 'unpaid').toLowerCase()

    if (value === 'unpaid' || value === 'eligible' || value === 'pending') {
      return 'bg-amber-100 text-amber-700'
    }

    if (value === 'approved') {
      return 'bg-blue-100 text-blue-700'
    }

    if (value === 'paid') {
      return 'bg-emerald-100 text-emerald-700'
    }

    if (value === 'rejected') {
      return 'bg-rose-100 text-rose-700'
    }

    return 'bg-slate-100 text-slate-700'
  }

  async function updateStatus(id: string, newStatus: string) {
    const ok = window.confirm(`Update payout status to "${newStatus}"?`)
    if (!ok) return

    const updatePayload: Record<string, string> = {
      payout_status: newStatus,
    }

    if (newStatus === 'paid') {
      updatePayload.payout_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              payout_status: newStatus,
              payout_at:
                newStatus === 'paid' ? new Date().toISOString() : row.payout_at,
            }
          : row
      )
    )
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading admin panel...</p>
      </main>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payout</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage seller payouts from paid orders.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Requests</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{stats.approved}</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Paid</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.paid}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">Payout Orders</h2>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading payouts...</div>
          ) : rows.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">No payout records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Seller</th>
                    <th className="px-4 py-3 font-medium">Net Payout</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Payout Status</th>
                    <th className="px-4 py-3 font-medium">Created At</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const isExpanded = expandedId === row.id

                    return (
                      <>
                        <tr key={row.id} className="border-t align-top">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">
                              {row.order_number || row.id}
                            </div>
                            <div className="text-xs text-slate-500">{row.id}</div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">
                              {getSellerName(row)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {getSellerEmail(row)}
                            </div>
                          </td>

                          <td className="px-4 py-3 font-medium text-slate-900">
                            {formatAmount(getNetAmount(row))}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
                              {row.payment_status || '-'}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                                row.payout_status
                              )}`}
                            >
                              {row.payout_status || 'unpaid'}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {formatDate(row.created_at)}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  setExpandedId(isExpanded ? null : row.id)
                                }
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </button>

                              <button
                                onClick={() => updateStatus(row.id, 'approved')}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => updateStatus(row.id, 'paid')}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                              >
                                Mark Paid
                              </button>

                              <button
                                onClick={() => updateStatus(row.id, 'rejected')}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-t bg-slate-50/50">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-xl border bg-white p-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Order Info
                                  </p>
                                  <div className="mt-3 space-y-2 text-sm">
                                    <div>
                                      <span className="text-slate-500">Order ID:</span>{' '}
                                      <span className="font-medium text-slate-900">{row.id}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Order Number:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {row.order_number || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Created At:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {formatDate(row.created_at)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Paid At:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {formatDate(row.paid_at)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Payout At:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {formatDate(row.payout_at)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-xl border bg-white p-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Seller Info
                                  </p>
                                  <div className="mt-3 space-y-2 text-sm">
                                    <div>
                                      <span className="text-slate-500">Store Name:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {getSellerName(row)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Seller Email:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {getSellerEmail(row)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Seller Profile ID:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {row.seller_profile_id || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Seller ID:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {row.seller_id || '-'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-xl border bg-white p-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Payment Breakdown
                                  </p>
                                  <div className="mt-3 space-y-2 text-sm">
                                    <div>
                                      <span className="text-slate-500">Payment Method:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {getPaymentMethod(row)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Gross Amount:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {formatAmount(getGrossAmount(row))}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Platform Fee:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {formatAmount(getFeeAmount(row))}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Net Seller Payout:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {formatAmount(getNetAmount(row))}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Payment Status:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {row.payment_status || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Payout Status:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {row.payout_status || 'unpaid'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
