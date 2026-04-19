'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'

type DashboardOrderRow = {
  id: string
  amount?: number | null
  gross_amount?: number | null
  payment_status?: string | null
  payout_status?: string | null
  created_at?: string | null
  seller_profile_id?: string | null
}

type SellerProfileRow = {
  id: string
  user_id?: string | null
  store_name?: string | null
  created_at?: string | null
}

type RoleRow = {
  role: string
}

function formatMoney(value?: number | null) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

function normalizeStatus(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

function isPaidPaymentStatus(value?: string | null) {
  return ['paid', 'success', 'completed'].includes(normalizeStatus(value))
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [orders, setOrders] = useState<DashboardOrderRow[]>([])
  const [sellers, setSellers] = useState<SellerProfileRow[]>([])
  const [userRoles, setUserRoles] = useState<RoleRow[]>([])

  const loadAdminDashboard = useCallback(async () => {
    setLoading(true)
    setPageError('')

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, amount, gross_amount, payment_status, payout_status, created_at, seller_profile_id')
        .order('created_at', { ascending: false })

      if (orderError) {
        throw new Error(orderError.message)
      }

      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_profiles')
        .select('id, user_id, store_name, created_at')
        .order('created_at', { ascending: false })

      if (sellerError) {
        throw new Error(sellerError.message)
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')

      if (roleError) {
        throw new Error(roleError.message)
      }

      setOrders((orderData || []) as DashboardOrderRow[])
      setSellers((sellerData || []) as SellerProfileRow[])
      setUserRoles((roleData || []) as RoleRow[])
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load admin dashboard.'
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdminDashboard()
  }, [loadAdminDashboard])

  const totalUsers = useMemo(() => {
    return userRoles.length
  }, [userRoles])

  const totalSellers = useMemo(() => {
    return sellers.length
  }, [sellers])

  const paidOrders = useMemo(() => {
    return orders.filter((order) => isPaidPaymentStatus(order.payment_status))
  }, [orders])

  const totalTransactions = useMemo(() => {
    return paidOrders.length
  }, [paidOrders])

  const totalRevenue = useMemo(() => {
    return paidOrders.reduce((sum, order) => {
      const gross = Number(order.gross_amount ?? order.amount ?? 0)
      return sum + gross
    }, 0)
  }, [paidOrders])

  const pendingPayoutOrders = useMemo(() => {
    return paidOrders.filter((order) => {
      const payoutStatus = normalizeStatus(order.payout_status)
      return payoutStatus === '' || payoutStatus === 'unpaid' || payoutStatus === 'eligible'
    })
  }, [paidOrders])

  const pendingPayoutValue = useMemo(() => {
    return pendingPayoutOrders.reduce((sum, order) => {
      const gross = Number(order.gross_amount ?? order.amount ?? 0)
      return sum + gross
    }, 0)
  }, [pendingPayoutOrders])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-600">Loading admin dashboard...</p>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <p className="text-sm font-medium text-red-700">{pageError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Admin Dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Ringkasan prestasi platform BayarLink secara keseluruhan.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total Users" value={String(totalUsers)} />
        <StatCard label="Total Sellers" value={String(totalSellers)} />
        <StatCard label="Total Transactions" value={String(totalTransactions)} />
        <StatCard label="Total Revenue" value={formatMoney(totalRevenue)} />
        <StatCard label="Pending Payout" value={formatMoney(pendingPayoutValue)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Quick Access</h3>
          <p className="mt-1 text-sm text-slate-500">
            Shortcut untuk pengurusan platform.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickLinkCard
              href="/admin/payout"
              title="Payout"
              description="Semak payout seller dan mark paid."
            />
            <QuickLinkCard
              href="/admin/reports"
              title="Reports"
              description="Lihat laporan prestasi platform."
            />
            <QuickLinkCard
              href="/admin/users"
              title="Users"
              description="Semak pengguna sistem."
            />
            <QuickLinkCard
              href="/admin/sellers"
              title="Sellers"
              description="Semak maklumat seller berdaftar."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Current Snapshot</h3>
          <p className="mt-1 text-sm text-slate-500">
            Gambaran ringkas keadaan semasa platform.
          </p>

          <div className="mt-4 space-y-3">
            <SnapshotRow
              label="Paid orders ready for payout"
              value={String(pendingPayoutOrders.length)}
            />
            <SnapshotRow
              label="Total sellers onboarded"
              value={String(totalSellers)}
            />
            <SnapshotRow
              label="Paid orders processed"
              value={String(totalTransactions)}
            />
            <SnapshotRow
              label="Platform gross revenue"
              value={formatMoney(totalRevenue)}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
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

function QuickLinkCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
    >
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{description}</div>
    </Link>
  )
}

function SnapshotRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  )
}
