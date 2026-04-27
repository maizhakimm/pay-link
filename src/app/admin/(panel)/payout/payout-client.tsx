"use client"

import { useMemo, useState } from "react"

type DatePreset = "all" | "today" | "this_week" | "this_month" | "this_year"
type StatusFilter = "eligible" | "paid" | "all"

type OrderRow = {
  id: string
  order_number: string | null
  order_no?: string | null
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
  payout_at: string | null
  payout_reference?: string | null
  created_at: string | null

  seller_profiles?: {
    store_name?: string | null
    bank_name?: string | null
    account_number?: string | null
    account_holder_name?: string | null
    email?: string | null
  } | null
}

type SellerGroup = {
  sellerProfileId: string
  sellerName: string
  sellerEmail: string
  bankName: string
  bankAccountNo: string
  bankAccountHolder: string

  eligibleOrders: OrderRow[]
  pendingSettlementOrders: OrderRow[]
  paidOutOrders: OrderRow[]

  eligibleOrdersCount: number
  eligibleGross: number
  eligibleFee: number
  eligibleNet: number

  pendingSettlementGross: number
  pendingSettlementCount: number

  paidOutGross: number
  paidOutFee: number
  paidOutNet: number

  paymentWindowStart: string | null
  paymentWindowEnd: string | null
  payoutAt: string | null
  payoutReference: string | null

  hasBankInfo: boolean
}

function toNumber(value: number | string | null | undefined): number {
  const num = Number(value || 0)
  return Number.isFinite(num) ? num : 0
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString("en-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

function isWithinPreset(
  dateStr: string | null | undefined,
  preset: DatePreset
): boolean {
  if (!dateStr) return false
  if (preset === "all") return true

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()

  if (preset === "today") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    )
  }

  if (preset === "this_week") {
    const today = new Date(now)
    const day = today.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day

    const start = new Date(today)
    start.setDate(today.getDate() + diffToMonday)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    return date >= start && date <= end
  }

  if (preset === "this_month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    )
  }

  if (preset === "this_year") {
    return date.getFullYear() === now.getFullYear()
  }

  return true
}

function getPaymentMethodLabel(order: OrderRow): string {
  const method = (order.payment_method || "").trim().toUpperCase()

  if (method) {
    if (method === "DUITNOW_QR") return "DuitNow QR"
    if (method === "FPX") return "FPX"
    if (method === "CARD") return "Card"
    return method.replaceAll("_", " ")
  }

  return "FPX"
}

function getDerivedBucket(
  order: OrderRow,
  now: Date
): "eligible" | "pending_settlement" | "paid_out" {
  if (order.payout_status === "paid") return "paid_out"

  const payoutStatus = String(order.payout_status || "").toLowerCase()

  const eligibleAt = order.eligible_payout_at
    ? new Date(order.eligible_payout_at)
    : null

  if (payoutStatus === "unpaid" || payoutStatus === "eligible") {
    if (!eligibleAt) return "eligible"
    if (!Number.isNaN(eligibleAt.getTime()) && eligibleAt <= now) {
      return "eligible"
    }
  }

  return "pending_settlement"
}

function buildGroups(
  orders: OrderRow[],
  datePreset: DatePreset,
  search: string,
  statusFilter: StatusFilter
): SellerGroup[] {
  const now = new Date()
  const q = search.trim().toLowerCase()

  const filtered = orders.filter((order) => {
    if (!isWithinPreset(order.paid_at, datePreset)) return false

    const sellerName = order.seller_profiles?.store_name || "Unknown Seller"
    const sellerEmail = order.seller_profiles?.email || ""

    if (
      q &&
      !sellerName.toLowerCase().includes(q) &&
      !sellerEmail.toLowerCase().includes(q)
    ) {
      return false
    }

    return true
  })

  const map = new Map<string, SellerGroup>()

  for (const order of filtered) {
    const sellerProfileId = order.seller_profile_id || "unknown"
    const sellerName = order.seller_profiles?.store_name || "Unknown Seller"
    const sellerEmail = order.seller_profiles?.email || "-"
    const bankName = order.seller_profiles?.bank_name || ""
    const bankAccountNo = order.seller_profiles?.account_number || ""
    const bankAccountHolder = order.seller_profiles?.account_holder_name || ""

    if (!map.has(sellerProfileId)) {
      map.set(sellerProfileId, {
        sellerProfileId,
        sellerName,
        sellerEmail,
        bankName,
        bankAccountNo,
        bankAccountHolder,
        eligibleOrders: [],
        pendingSettlementOrders: [],
        paidOutOrders: [],
        eligibleOrdersCount: 0,
        eligibleGross: 0,
        eligibleFee: 0,
        eligibleNet: 0,
        pendingSettlementGross: 0,
        pendingSettlementCount: 0,
        paidOutGross: 0,
        paidOutFee: 0,
        paidOutNet: 0,
        paymentWindowStart: null,
        paymentWindowEnd: null,
        payoutAt: null,
        payoutReference: null,
        hasBankInfo: Boolean(bankName && bankAccountNo && bankAccountHolder),
      })
    }

    const group = map.get(sellerProfileId)!
    const bucket = getDerivedBucket(order, now)

    const gross = toNumber(order.total_amount)
    const fee = toNumber(order.seller_fee_amount)
    const net = toNumber(order.net_seller_amount)

    if (bucket === "eligible") {
      if (net > 0) {
        group.eligibleOrders.push(order)
        group.eligibleOrdersCount += 1
        group.eligibleGross += gross
        group.eligibleFee += fee
        group.eligibleNet += net
      } else {
        group.pendingSettlementOrders.push(order)
        group.pendingSettlementCount += 1
        group.pendingSettlementGross += gross
      }
    } else if (bucket === "pending_settlement") {
      group.pendingSettlementOrders.push(order)
      group.pendingSettlementCount += 1
      group.pendingSettlementGross += gross
    } else {
      group.paidOutOrders.push(order)
      group.paidOutGross += gross
      group.paidOutFee += fee
      group.paidOutNet += net

      if (!group.payoutAt && order.payout_at) {
        group.payoutAt = order.payout_at
      }
      if (!group.payoutReference && order.payout_reference) {
        group.payoutReference = order.payout_reference
      }
    }

    if (order.paid_at) {
      if (
        !group.paymentWindowStart ||
        new Date(order.paid_at) < new Date(group.paymentWindowStart)
      ) {
        group.paymentWindowStart = order.paid_at
      }

      if (
        !group.paymentWindowEnd ||
        new Date(order.paid_at) > new Date(group.paymentWindowEnd)
      ) {
        group.paymentWindowEnd = order.paid_at
      }
    }
  }

  let groups = Array.from(map.values())

  if (statusFilter === "eligible") {
    groups = groups.filter((g) => g.eligibleOrdersCount > 0)
  } else if (statusFilter === "paid") {
    groups = groups.filter((g) => g.paidOutOrders.length > 0)
  } else {
    groups = groups.filter(
      (g) =>
        g.eligibleOrdersCount > 0 ||
        g.pendingSettlementCount > 0 ||
        g.paidOutOrders.length > 0
    )
  }

  groups.sort((a, b) => {
    if (statusFilter === "paid") {
      return (
        new Date(b.payoutAt || 0).getTime() - new Date(a.payoutAt || 0).getTime()
      )
    }
    return b.eligibleNet - a.eligibleNet
  })

  return groups
}

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle?: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-3 text-[2.1rem] font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  )
}

function StatusBadge({ label }: { label: string }) {
  const base =
    "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset"

  if (label === "Eligible") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
        {label}
      </span>
    )
  }

  if (label === "Paid") {
    return (
      <span className={`${base} bg-blue-50 text-blue-700 ring-blue-200`}>
        {label}
      </span>
    )
  }

  return (
    <span className={`${base} bg-amber-50 text-amber-700 ring-amber-200`}>
      {label}
    </span>
  )
}

export default function PayoutClient({
  initialOrders,
}: {
  initialOrders: OrderRow[]
}) {
  const [datePreset, setDatePreset] = useState<DatePreset>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("eligible")
  const [search, setSearch] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<SellerGroup | null>(null)
  const [loadingSellerId, setLoadingSellerId] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders)

  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutTarget, setPayoutTarget] = useState<SellerGroup | null>(null)
  const [payoutReference, setPayoutReference] = useState("")

  const groups = useMemo(
    () => buildGroups(orders, datePreset, search, statusFilter),
    [orders, datePreset, search, statusFilter]
  )

  const summary = useMemo(() => {
    if (statusFilter === "paid") {
      const paidSellers = groups.length
      const gross = groups.reduce((sum, g) => sum + g.paidOutGross, 0)
      const fee = groups.reduce((sum, g) => sum + g.paidOutFee, 0)
      const net = groups.reduce((sum, g) => sum + g.paidOutNet, 0)

      return {
        title: "Paid Sellers",
        count: paidSellers,
        gross,
        fee,
        net,
      }
    }

    const pendingSellers = groups.filter((g) => g.eligibleOrdersCount > 0).length
    const gross = groups.reduce((sum, g) => sum + g.eligibleGross, 0)
    const fee = groups.reduce((sum, g) => sum + g.eligibleFee, 0)
    const net = groups.reduce((sum, g) => sum + g.eligibleNet, 0)

    return {
      title: "Pending Sellers",
      count: pendingSellers,
      gross,
      fee,
      net,
    }
  }, [groups, statusFilter])

  function openPayoutModal(group: SellerGroup) {
    setPayoutTarget(group)
    setPayoutReference("")
    setShowPayoutModal(true)
  }

  function closePayoutModal() {
    if (loadingSellerId) return
    setShowPayoutModal(false)
    setPayoutTarget(null)
    setPayoutReference("")
  }

  async function confirmMarkPaid() {
    if (!payoutTarget) return

    const trimmedReference = payoutReference.trim()
    if (!trimmedReference) {
      alert("Sila isi payout reference terlebih dahulu.")
      return
    }

    try {
      setLoadingSellerId(payoutTarget.sellerProfileId)

      const res = await fetch("/api/admin/payout/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerProfileId: payoutTarget.sellerProfileId,
          datePreset,
          payoutReference: trimmedReference,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || "Failed to update payout status")
      }

      const nowIso = new Date().toISOString()

      setOrders((prev) =>
        prev.map((order) => {
          if (
            order.seller_profile_id === payoutTarget.sellerProfileId &&
            order.payment_status === "paid" &&
            order.payout_status !== "paid" &&
            isWithinPreset(order.paid_at, datePreset)
          ) {
            const eligibleAt = order.eligible_payout_at
              ? new Date(order.eligible_payout_at)
              : null
            const net = toNumber(order.net_seller_amount)

            if ((!eligibleAt || eligibleAt <= new Date()) && net > 0) {
              return {
                ...order,
                payout_status: "paid",
                payout_at: nowIso,
                payout_reference: trimmedReference,
              }
            }
          }

          return order
        })
      )

      closePayoutModal()
      setSelectedGroup(null)
      alert("Payout batch berjaya ditandakan sebagai paid.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error"
      alert(message)
    } finally {
      setLoadingSellerId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={summary.title}
          value={String(summary.count)}
          subtitle={
            statusFilter === "paid"
              ? "Seller yang telah dibayar"
              : "Seller yang layak dibayar"
          }
        />
        <SummaryCard
          title={statusFilter === "paid" ? "Total Paid Gross" : "Total Eligible Gross"}
          value={formatCurrency(summary.gross)}
        />
        <SummaryCard
          title="Total Fee"
          value={formatCurrency(summary.fee)}
        />
        <SummaryCard
          title={statusFilter === "paid" ? "Total Paid Net" : "Total Net Payout"}
          value={formatCurrency(summary.net)}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["eligible", "paid", "all"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setStatusFilter(item)}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  statusFilter === item
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item === "eligible"
                  ? "Eligible"
                  : item === "paid"
                  ? "Paid"
                  : "All"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex flex-wrap gap-2">
              {(["all", "today", "this_week", "this_month", "this_year"] as const).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setDatePreset(item)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      datePreset === item
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item === "all"
                      ? "All Time"
                      : item === "today"
                      ? "Today"
                      : item === "this_week"
                      ? "This Week"
                      : item === "this_month"
                      ? "This Month"
                      : "This Year"}
                  </button>
                )
              )}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search seller / email"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 lg:w-80"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Seller</th>
                <th className="px-5 py-4 font-semibold">
                  {statusFilter === "paid" ? "Paid Orders" : "Eligible Orders"}
                </th>
                <th className="px-5 py-4 font-semibold">Gross</th>
                <th className="px-5 py-4 font-semibold">Fee</th>
                <th className="px-5 py-4 font-semibold">Net</th>
                <th className="px-5 py-4 font-semibold">
                  {statusFilter === "paid" ? "Payout Reference" : "Pending Settlement"}
                </th>
                <th className="px-5 py-4 font-semibold">Bank Info</th>
                <th className="px-5 py-4 font-semibold">
                  {statusFilter === "paid" ? "Paid At" : "Payment Window"}
                </th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-500">
                    No payout data found.
                  </td>
                </tr>
              ) : (
                groups.map((group) => {
                  const rowGross =
                    statusFilter === "paid" ? group.paidOutGross : group.eligibleGross
                  const rowFee =
                    statusFilter === "paid" ? group.paidOutFee : group.eligibleFee
                  const rowNet =
                    statusFilter === "paid" ? group.paidOutNet : group.eligibleNet
                  const rowCount =
                    statusFilter === "paid"
                      ? group.paidOutOrders.length
                      : group.eligibleOrdersCount

                  return (
                    <tr key={group.sellerProfileId} className="border-t border-slate-100">
                      <td className="px-5 py-5 align-top">
                        <div>
                          <p className="font-semibold text-slate-900">{group.sellerName}</p>
                          <p className="mt-1 text-xs text-slate-500">{group.sellerEmail}</p>
                        </div>
                      </td>

                      <td className="px-5 py-5 align-top text-slate-700">{rowCount}</td>

                      <td className="px-5 py-5 align-top font-medium text-slate-900">
                        {formatCurrency(rowGross)}
                      </td>

                      <td className="px-5 py-5 align-top text-slate-700">
                        {formatCurrency(rowFee)}
                      </td>

                      <td className="px-5 py-5 align-top font-semibold text-emerald-700">
                        {formatCurrency(rowNet)}
                      </td>

                      <td className="px-5 py-5 align-top">
                        {statusFilter === "paid" ? (
                          <div className="text-slate-700">
                            <p className="font-medium">{group.payoutReference || "-"}</p>
                          </div>
                        ) : group.pendingSettlementCount > 0 ? (
                          <div className="text-amber-700">
                            <p className="font-medium">
                              {group.pendingSettlementCount} orders pending
                            </p>
                            <p className="text-xs">
                              {formatCurrency(group.pendingSettlementGross)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-5 align-top">
                        {group.hasBankInfo ? (
                          <div className="text-slate-700">
                            <p className="font-medium">{group.bankName}</p>
                            <p className="text-xs">{group.bankAccountNo}</p>
                            <p className="text-xs">{group.bankAccountHolder}</p>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-red-600">
                            Bank info incomplete
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5 align-top text-sm text-slate-600">
                        {statusFilter === "paid"
                          ? formatDate(group.payoutAt)
                          : `${formatShortDate(group.paymentWindowStart)} → ${formatShortDate(group.paymentWindowEnd)}`}
                      </td>

                      <td className="px-5 py-5 align-top">
                        {statusFilter === "paid" ? (
                          <StatusBadge label="Paid" />
                        ) : group.eligibleNet > 0 ? (
                          <StatusBadge label="Eligible" />
                        ) : group.paidOutOrders.length > 0 ? (
                          <StatusBadge label="Paid" />
                        ) : (
                          <StatusBadge label="Pending Settlement" />
                        )}
                      </td>

                      <td className="px-5 py-5 align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedGroup(group)}
                            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View Details
                          </button>

                          {statusFilter !== "paid" &&
                          group.eligibleOrdersCount > 0 &&
                          group.eligibleNet > 0 ? (
                            <button
                              onClick={() => openPayoutModal(group)}
                              disabled={
                                !group.hasBankInfo ||
                                loadingSellerId === group.sellerProfileId
                              }
                              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {loadingSellerId === group.sellerProfileId
                                ? "Processing..."
                                : "Mark as Paid"}
                            </button>
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
      </div>

      {selectedGroup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedGroup.sellerName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedGroup.sellerEmail}
                </p>
              </div>

              <button
                onClick={() => setSelectedGroup(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title={
                    statusFilter === "paid" ? "Paid Gross" : "Eligible Gross"
                  }
                  value={formatCurrency(
                    statusFilter === "paid"
                      ? selectedGroup.paidOutGross
                      : selectedGroup.eligibleGross
                  )}
                />
                <SummaryCard
                  title="Fee"
                  value={formatCurrency(
                    statusFilter === "paid"
                      ? selectedGroup.paidOutFee
                      : selectedGroup.eligibleFee
                  )}
                />
                <SummaryCard
                  title={statusFilter === "paid" ? "Paid Net" : "Eligible Net"}
                  value={formatCurrency(
                    statusFilter === "paid"
                      ? selectedGroup.paidOutNet
                      : selectedGroup.eligibleNet
                  )}
                />
                <SummaryCard
                  title="Pending Settlement"
                  value={formatCurrency(selectedGroup.pendingSettlementGross)}
                  subtitle={`${selectedGroup.pendingSettlementCount} order`}
                />
              </div>

              <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bank Info
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedGroup.bankName || "-"}
                  </p>
                  <p className="text-sm text-slate-700">
                    {selectedGroup.bankAccountNo || "-"}
                  </p>
                  <p className="text-sm text-slate-700">
                    {selectedGroup.bankAccountHolder || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {statusFilter === "paid" ? "Paid Info" : "Payment Window"}
                  </p>
                  {statusFilter === "paid" ? (
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold">Paid At:</span>{" "}
                        {formatDate(selectedGroup.payoutAt)}
                      </p>
                      <p>
                        <span className="font-semibold">Reference:</span>{" "}
                        {selectedGroup.payoutReference || "-"}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-700">
                      {formatDate(selectedGroup.paymentWindowStart)} →{" "}
                      {formatDate(selectedGroup.paymentWindowEnd)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900">
                  {statusFilter === "paid" ? "Paid Transactions" : "Eligible for Payout"}
                </h3>
                <div className="mt-3 overflow-hidden rounded-3xl border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Order</th>
                        <th className="px-4 py-3 font-semibold">Buyer</th>
                        <th className="px-4 py-3 font-semibold">Method</th>
                        <th className="px-4 py-3 font-semibold">Paid At</th>
                        <th className="px-4 py-3 font-semibold">
                          {statusFilter === "paid" ? "Payout Ref" : "Eligible At"}
                        </th>
                        <th className="px-4 py-3 font-semibold">Gross</th>
                        <th className="px-4 py-3 font-semibold">Fee</th>
                        <th className="px-4 py-3 font-semibold">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(statusFilter === "paid"
                        ? selectedGroup.paidOutOrders
                        : selectedGroup.eligibleOrders
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                            No transactions found.
                          </td>
                        </tr>
                      ) : (
                        (statusFilter === "paid"
                          ? selectedGroup.paidOutOrders
                          : selectedGroup.eligibleOrders
                        ).map((order) => {
                          const gross = toNumber(order.total_amount)
                          const fee = toNumber(order.seller_fee_amount)
                          const net = toNumber(order.net_seller_amount)

                          return (
                            <tr key={order.id} className="border-t border-slate-100">
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {order.order_number || "-"}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {order.buyer_name ||
                                  order.customer_name ||
                                  order.buyer_email ||
                                  order.customer_email ||
                                  order.buyer_phone ||
                                  order.customer_phone ||
                                  "-"}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {getPaymentMethodLabel(order)}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {formatDate(order.paid_at)}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {statusFilter === "paid"
                                  ? order.payout_reference || "-"
                                  : formatDate(order.eligible_payout_at)}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {formatCurrency(gross)}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {formatCurrency(fee)}
                              </td>
                              <td
                                className={`px-4 py-3 font-medium ${
                                  net > 0 ? "text-emerald-700" : "text-red-600"
                                }`}
                              >
                                {formatCurrency(net)}
                                {statusFilter !== "paid" && net <= 0 && (
                                  <span className="block text-xs text-red-500">
                                    Excluded (negative payout)
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {statusFilter !== "paid" && selectedGroup.eligibleOrdersCount > 0 ? (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => openPayoutModal(selectedGroup)}
                    disabled={
                      !selectedGroup.hasBankInfo ||
                      loadingSellerId === selectedGroup.sellerProfileId ||
                      selectedGroup.eligibleNet <= 0
                    }
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loadingSellerId === selectedGroup.sellerProfileId
                      ? "Processing..."
                      : "Mark Eligible Transactions as Paid"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showPayoutModal && payoutTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Confirm Payout</h3>
            <p className="mt-2 text-sm text-slate-600">
              Sahkan payout untuk seller ini. Pastikan anda sudah membuat transfer
              bank sebelum tandakan sebagai paid.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-slate-700">Seller:</span>{" "}
                  {payoutTarget.sellerName}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Bank:</span>{" "}
                  {payoutTarget.bankName} / {payoutTarget.bankAccountNo}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Account Holder:</span>{" "}
                  {payoutTarget.bankAccountHolder}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Eligible Orders:</span>{" "}
                  {payoutTarget.eligibleOrdersCount}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Net Payout:</span>{" "}
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(payoutTarget.eligibleNet)}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payout Reference
              </label>
              <input
                value={payoutReference}
                onChange={(e) => setPayoutReference(e.target.value)}
                placeholder="Contoh: MBB-TRX-20260419-001"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
              <p className="mt-2 text-xs text-slate-500">
                Masukkan reference transfer bank / transaction ID untuk audit trail.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closePayoutModal}
                disabled={Boolean(loadingSellerId)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkPaid}
                disabled={Boolean(loadingSellerId) || !payoutReference.trim()}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loadingSellerId ? "Processing..." : "Confirm & Mark as Paid"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
