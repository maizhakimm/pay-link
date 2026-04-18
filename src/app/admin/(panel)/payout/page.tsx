'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

type PayoutOrderRow = {
  id: string
  order_number: string | null
  seller_profile_id: string | null
  seller_id: string | null
  payment_status: string | null
  payout_status: string | null
  net_seller_amount: number | null
  seller_net: number | null
  amount: number | null
  total_amount: number | null
  created_at: string
  payout_at: string | null
  seller_profiles?: {
    store_name: string | null
    email: string | null
    bank_name?: string | null
    account_name?: string | null
    account_number?: string | null
  }[] | null
}

export default function AdminPayoutPage() {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<PayoutOrderRow[]>([])

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
            net_seller_amount,
            seller_net,
            amount,
            total_amount,
            created_at,
            payout_at,
            seller_profiles (
              store_name,
              email
            )
          `
        )
        .eq('payment_status', 'paid')
        .neq('payout_status', 'paid')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Load payout orders error:', error)
        setRows([])
        setLoading(false)
        return
      }

      setRows(((data || []) as unknown) as PayoutOrderRow[])
      setLoading(false)
    }

    loadPayouts()
  }, [authorized])

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => {
      const status = (r.payout_status || '').toLowerCase()
      return status === 'unpaid' || status === 'eligible' || status === 'pending' || status === ''
    }).length

    const approved = rows.filter((r) => (r.payout_status || '').toLowerCase() === 'approved').length
    const paid = rows.filter((r) => (r.payout_status || '').toLowerCase() === 'paid').length

    return { total, pending, approved, paid }
  }, [rows])

  function getNetAmount(row: PayoutOrderRow) {
    return Number(row.net_seller_amount ?? row.seller_net ?? row.total_amount ?? row.amount ?? 0)
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
              payout_at: newStatus === 'paid' ? new Date().toISOString() : row.payout_at,
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
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {row.order_number || row.id}
                        </div>
                        <div className="text-xs text-slate-500">{row.id}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {row.seller_profiles?.[0]?.store_name || 'No store name'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {row.seller_profiles?.[0]?.email || row.seller_profile_id || row.seller_id}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
