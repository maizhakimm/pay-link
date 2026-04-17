'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

type PayoutRow = {
  id: string
  seller_id: string
  amount: number
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  status: string | null
  created_at: string
  seller_profiles?: {
    store_name: string | null
    email: string | null
  } | null
}

export default function AdminPayoutPage() {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<PayoutRow[]>([])

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
        .from('payout_requests')
        .select(
          `
            id,
            seller_id,
            amount,
            bank_name,
            account_name,
            account_number,
            status,
            created_at,
            seller_profiles (
              store_name,
              email
            )
          `
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Load payout error:', error)
        setRows([])
        setLoading(false)
        return
      }

      setRows((data as PayoutRow[]) || [])
      setLoading(false)
    }

    loadPayouts()
  }, [authorized])

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => r.status === 'pending').length
    const approved = rows.filter((r) => r.status === 'approved').length
    const paid = rows.filter((r) => r.status === 'paid').length

    return { total, pending, approved, paid }
  }, [rows])

  async function updateStatus(id: string, newStatus: string) {
    const ok = window.confirm(`Update payout status to "${newStatus}"?`)
    if (!ok) return

    const { error } = await supabase
      .from('payout_requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: newStatus } : row
      )
    )
  }

  function formatAmount(amount: number | null | undefined) {
    return `RM ${Number(amount || 0).toFixed(2)}`
  }

  function formatDate(value: string) {
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
            Manage seller payout requests here.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Requests</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {stats.approved}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Paid</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {stats.paid}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">Payout Requests</h2>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading payouts...</div>
          ) : rows.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">
              No payout requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Seller</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Bank</th>
                    <th className="px-4 py-3 font-medium">Account</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Requested At</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {row.seller_profiles?.store_name || 'No store name'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {row.seller_profiles?.email || row.seller_id}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatAmount(row.amount)}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {row.bank_name || '-'}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <div>{row.account_name || '-'}</div>
                        <div className="text-xs text-slate-500">
                          {row.account_number || '-'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
                          {row.status || 'pending'}
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
