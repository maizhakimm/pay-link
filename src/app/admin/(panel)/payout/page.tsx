'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

type SellerProfileMap = Record<
  string,
  {
    store_name: string | null
    email: string | null
    bank_name: string | null
    account_name: string | null
    account_number: string | null
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
  created_at: string
  updated_at: string | null
  payout_at: string | null
  payout_reference: string | null
  payout_proof_url: string | null
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminPayoutPage() {
  const [apiError, setApiError] = useState('')
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<PayoutOrderRow[]>([])
  const [sellerMap, setSellerMap] = useState<SellerProfileMap>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [referenceInputs, setReferenceInputs] = useState<Record<string, string>>({})
  const [proofInputs, setProofInputs] = useState<Record<string, string>>({})
  const [savingPaidId, setSavingPaidId] = useState<string | null>(null)

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
  setApiError('')

  try {
    const res = await fetch('/api/admin/payouts', { cache: 'no-store' })
    const json = await res.json()

    console.log('admin payouts api response:', json)

    if (!res.ok) {
      setApiError(json?.error || 'Failed to load payout data')
      setRows([])
      setSellerMap({})
      setLoading(false)
      return
    }

    const orderRows: PayoutOrderRow[] = json.orders || []
    const sellerProfiles = json.sellerProfiles || []

    setRows(orderRows)

    const nextReferenceInputs: Record<string, string> = {}
    const nextProofInputs: Record<string, string> = {}

    for (const row of orderRows) {
      nextReferenceInputs[row.id] = row.payout_reference || ''
      nextProofInputs[row.id] = row.payout_proof_url || ''
    }

    setReferenceInputs(nextReferenceInputs)
    setProofInputs(nextProofInputs)

    const nextSellerMap: SellerProfileMap = {}

    for (const seller of sellerProfiles) {
      nextSellerMap[seller.id] = {
        store_name: seller.store_name,
        email: seller.email,
        bank_name: seller.bank_name,
        account_name: seller.account_name,
        account_number: seller.account_number,
      }
    }

    setSellerMap(nextSellerMap)
  } catch (error: any) {
    console.error('Load payouts failed:', error)
    setApiError(error?.message || 'Unexpected error loading payouts')
    setRows([])
    setSellerMap({})
  } finally {
    setLoading(false)
  }
}

    loadPayouts()
  }, [authorized])

  function normalizePayoutStatus(status: string | null) {
    const value = (status || '').toLowerCase()

    if (!value || value === 'unpaid' || value === 'eligible' || value === 'pending') {
      return 'pending'
    }

    if (value === 'approved') return 'approved'
    if (value === 'rejected') return 'rejected'
    if (value === 'paid') return 'paid'

    return value
  }

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return rows.filter((row) => {
      const normalizedStatus = normalizePayoutStatus(row.payout_status)

      if (statusFilter !== 'all' && normalizedStatus !== statusFilter) {
        return false
      }

      if (!keyword) return true

      const seller = row.seller_profile_id ? sellerMap[row.seller_profile_id] : null

      const haystack = [
        row.order_number || '',
        row.id || '',
        seller?.store_name || '',
        seller?.email || '',
        row.seller_profile_id || '',
        row.seller_id || '',
        row.payment_method || '',
        row.payment_channel || '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [rows, search, sellerMap, statusFilter])

  const stats = useMemo(() => {
    const total = rows.filter((r) => normalizePayoutStatus(r.payout_status) !== 'paid').length
    const pending = rows.filter((r) => normalizePayoutStatus(r.payout_status) === 'pending').length
    const approved = rows.filter((r) => normalizePayoutStatus(r.payout_status) === 'approved').length
    const paid = rows.filter((r) => normalizePayoutStatus(r.payout_status) === 'paid').length

    return { total, pending, approved, paid }
  }, [rows])

  function getSeller(row: PayoutOrderRow) {
    return row.seller_profile_id ? sellerMap[row.seller_profile_id] : null
  }

  function getSellerName(row: PayoutOrderRow) {
    return getSeller(row)?.store_name || 'No store name'
  }

  function getSellerEmail(row: PayoutOrderRow) {
    return getSeller(row)?.email || row.seller_profile_id || row.seller_id || '-'
  }

  function getBankName(row: PayoutOrderRow) {
    return getSeller(row)?.bank_name || '-'
  }

  function getAccountName(row: PayoutOrderRow) {
    return getSeller(row)?.account_name || '-'
  }

  function getAccountNumber(row: PayoutOrderRow) {
    return getSeller(row)?.account_number || '-'
  }

  function getGrossAmount(row: PayoutOrderRow) {
    return Number(row.total_amount ?? row.amount ?? 0)
  }

  function getFeeAmount(row: PayoutOrderRow) {
    return Number(row.platform_fee ?? 0)
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
    const value = normalizePayoutStatus(status)

    if (value === 'pending') return 'bg-amber-100 text-amber-700'
    if (value === 'approved') return 'bg-blue-100 text-blue-700'
    if (value === 'paid') return 'bg-emerald-100 text-emerald-700'
    if (value === 'rejected') return 'bg-rose-100 text-rose-700'

    return 'bg-slate-100 text-slate-700'
  }

  async function copyToClipboard(text: string, label: string) {
    if (!text || text === '-') {
      alert(`${label} not available`)
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied`)
    } catch (error) {
      console.error('Copy failed:', error)
      alert(`Failed to copy ${label.toLowerCase()}`)
    }
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

  async function handleMarkPaid(row: PayoutOrderRow) {
    const reference = (referenceInputs[row.id] || '').trim()
    const proofUrl = (proofInputs[row.id] || '').trim()

    if (!reference) {
      alert('Please fill payout reference first')
      return
    }

    setSavingPaidId(row.id)

    const now = new Date().toISOString()

    const { error } = await supabase
      .from('orders')
      .update({
        payout_status: 'paid',
        payout_at: now,
        payout_reference: reference,
        payout_proof_url: proofUrl || null,
      })
      .eq('id', row.id)

    setSavingPaidId(null)

    if (error) {
      alert(error.message)
      return
    }

    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              payout_status: 'paid',
              payout_at: now,
              payout_reference: reference,
              payout_proof_url: proofUrl || null,
            }
          : item
      )
    )

    alert('Payout marked as paid')
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

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    statusFilter === item
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item === 'all'
                    ? 'All'
                    : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-80">
              <input
                type="text"
                placeholder="Search seller, email, order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {apiError ? (
  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
    {apiError}
  </div>
) : null}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">Payout Orders</h2>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading payouts...</div>
          ) : filteredRows.length === 0 ? (
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
                  {filteredRows.map((row) => {
                    const isExpanded = expandedId === row.id
                    const normalizedStatus = normalizePayoutStatus(row.payout_status)

                    return (
                      <Fragment key={row.id}>
                        <tr className="border-t align-top">
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
                              {normalizedStatus}
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

                              {normalizedStatus !== 'approved' && normalizedStatus !== 'paid' && (
                                <button
                                  onClick={() => updateStatus(row.id, 'approved')}
                                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                                >
                                  Approve
                                </button>
                              )}

                              {normalizedStatus !== 'paid' && (
                                <button
                                  onClick={() => updateStatus(row.id, 'rejected')}
                                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-t bg-slate-50/50">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                                        <span className="text-slate-500">Last Updated:</span>{' '}
                                        <span className="font-medium text-slate-900">
                                          {formatDate(row.updated_at)}
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
                                      Bank Details
                                    </p>
                                    <div className="mt-3 space-y-2 text-sm">
                                      <div>
                                        <span className="text-slate-500">Bank:</span>{' '}
                                        <span className="font-medium text-slate-900">
                                          {getBankName(row)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">Account Name:</span>{' '}
                                        <span className="font-medium text-slate-900">
                                          {getAccountName(row)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">Account Number:</span>{' '}
                                        <span className="font-medium text-slate-900">
                                          {getAccountNumber(row)}
                                        </span>
                                      </div>
                                      <div className="pt-2">
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              getAccountNumber(row),
                                              'Account number'
                                            )
                                          }
                                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                                        >
                                          Copy Account Number
                                        </button>
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
                                          {normalizePayoutStatus(row.payout_status)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-xl border bg-white p-4">
                                  <div className="mb-3">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Payout Action
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Fill reference and proof URL before marking as paid.
                                    </p>
                                  </div>

                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-600">
                                        Payout Reference
                                      </label>
                                      <input
                                        type="text"
                                        value={referenceInputs[row.id] || ''}
                                        onChange={(e) =>
                                          setReferenceInputs((prev) => ({
                                            ...prev,
                                            [row.id]: e.target.value,
                                          }))
                                        }
                                        placeholder="Example: IBG-18042026-001"
                                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400"
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-600">
                                        Proof URL
                                      </label>
                                      <input
                                        type="text"
                                        value={proofInputs[row.id] || ''}
                                        onChange={(e) =>
                                          setProofInputs((prev) => ({
                                            ...prev,
                                            [row.id]: e.target.value,
                                          }))
                                        }
                                        placeholder="Optional receipt / proof link"
                                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                                    <div>
                                      <span className="text-slate-500">Saved Reference:</span>{' '}
                                      <span className="font-medium text-slate-900">
                                        {row.payout_reference || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Saved Proof URL:</span>{' '}
                                      <span className="font-medium text-slate-900 break-all">
                                        {row.payout_proof_url || '-'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {normalizePayoutStatus(row.payout_status) !== 'approved' &&
                                      normalizePayoutStatus(row.payout_status) !== 'paid' && (
                                        <button
                                          onClick={() => updateStatus(row.id, 'approved')}
                                          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                        >
                                          Approve
                                        </button>
                                      )}

                                    {normalizePayoutStatus(row.payout_status) !== 'paid' && (
                                      <button
                                        onClick={() => handleMarkPaid(row)}
                                        disabled={savingPaidId === row.id}
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                      >
                                        {savingPaidId === row.id ? 'Saving...' : 'Confirm Mark Paid'}
                                      </button>
                                    )}

                                    {normalizePayoutStatus(row.payout_status) !== 'paid' && (
                                      <button
                                        onClick={() => updateStatus(row.id, 'rejected')}
                                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
