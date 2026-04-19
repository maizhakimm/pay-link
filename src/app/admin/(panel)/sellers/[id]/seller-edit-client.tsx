"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

const MALAYSIAN_BANKS = [
  "Affin Bank",
  "Agrobank",
  "Alliance Bank",
  "AmBank",
  "Bank Islam",
  "Bank Muamalat",
  "Bank Rakyat",
  "BSN",
  "CIMB Bank",
  "Citibank",
  "Hong Leong Bank",
  "HSBC",
  "Kuwait Finance House",
  "Maybank",
  "MBSB Bank",
  "OCBC Bank",
  "Public Bank",
  "RHB Bank",
  "Standard Chartered",
  "UOB Bank",
]

const DELIVERY_MODES = [
  { value: "free_delivery", label: "Free Delivery" },
  { value: "fixed_fee", label: "Delivery Fee (Fixed)" },
  { value: "included_in_price", label: "Included in Price" },
  { value: "pay_rider_separately", label: "Pay Rider Separately" },
  { value: "distance_based", label: "Distance Based" },
] as const

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

type DayKey = (typeof DAY_ORDER)[number]

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

type OperatingDayItem = {
  enabled: boolean
  opening_time: string
  closing_time: string
}

type OperatingDays = Record<DayKey, OperatingDayItem>

const DEFAULT_OPERATING_DAYS: OperatingDays = {
  monday: { enabled: true, opening_time: "09:00", closing_time: "18:00" },
  tuesday: { enabled: true, opening_time: "09:00", closing_time: "18:00" },
  wednesday: { enabled: true, opening_time: "09:00", closing_time: "18:00" },
  thursday: { enabled: true, opening_time: "09:00", closing_time: "18:00" },
  friday: { enabled: true, opening_time: "09:00", closing_time: "18:00" },
  saturday: { enabled: true, opening_time: "09:00", closing_time: "18:00" },
  sunday: { enabled: false, opening_time: "09:00", closing_time: "18:00" },
}

type DeliveryMode =
  | "free_delivery"
  | "fixed_fee"
  | "included_in_price"
  | "pay_rider_separately"
  | "distance_based"

type SellerForm = {
  id: string
  store_name: string | null
  email: string | null
  business_address: string | null
  whatsapp: string | null
  company_name: string | null
  company_registration: string | null

  bank_name: string | null
  account_number: string | null
  account_holder_name: string | null

  shop_slug: string | null
  slug: string | null
  store_slug: string | null
  plan_type: string | null

  delivery_mode: DeliveryMode | null
  delivery_radius_km: number | string | null
  delivery_rate_per_km: number | string | null
  delivery_min_fee: number | string | null
  delivery_fee: number | string | null
  delivery_area: string | null
  delivery_note: string | null
  pickup_address: string | null
  latitude: number | string | null
  longitude: number | string | null

  accept_orders_anytime: boolean | null
  opening_time: string | null
  closing_time: string | null
  temporarily_closed: boolean | null
  closed_message: string | null
  daily_note: string | null
  operating_days: OperatingDays | null

  share_image_mode: string | null
  share_poster_url: string | null
  share_title: string | null
  share_description: string | null

  profile_image: string | null
}

function normalizeOperatingDays(value: any): OperatingDays {
  const safe: OperatingDays = { ...DEFAULT_OPERATING_DAYS }

  if (!value || typeof value !== "object") {
    return safe
  }

  for (const day of DAY_ORDER) {
    const item = value?.[day]
    if (!item || typeof item !== "object") continue

    safe[day] = {
      enabled:
        typeof item.enabled === "boolean"
          ? item.enabled
          : DEFAULT_OPERATING_DAYS[day].enabled,
      opening_time:
        typeof item.opening_time === "string" && item.opening_time
          ? item.opening_time
          : DEFAULT_OPERATING_DAYS[day].opening_time,
      closing_time:
        typeof item.closing_time === "string" && item.closing_time
          ? item.closing_time
          : DEFAULT_OPERATING_DAYS[day].closing_time,
    }
  }

  return safe
}

function toNumber(value: number | string | null | undefined) {
  const num = Number(value || 0)
  return Number.isFinite(num) ? num : 0
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount)
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string | number | null | undefined
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
      />
    </label>
  )
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string
  value: string | null | undefined
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
      />
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  )
}

function StatusPill({
  ok,
  label,
}: {
  ok: boolean
  label: string
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        ok
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-amber-200"
      }`}
    >
      {label}
    </span>
  )
}

export default function SellerEditClient({ seller }: { seller: SellerForm }) {
  const [form, setForm] = useState<SellerForm>({
    ...seller,
    operating_days: normalizeOperatingDays(seller.operating_days),
  })
  const [loading, setLoading] = useState(false)

  function handleChange<K extends keyof SellerForm>(key: K, value: SellerForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function updateOperatingDay(day: DayKey, patch: Partial<OperatingDayItem>) {
    const current = normalizeOperatingDays(form.operating_days)
    handleChange("operating_days", {
      ...current,
      [day]: {
        ...current[day],
        ...patch,
      },
    })
  }

  const checks = useMemo(() => {
    const bankOk = Boolean(
      form.bank_name && form.account_number && form.account_holder_name
    )

    const deliveryOk = Boolean(
      form.delivery_mode &&
        (toNumber(form.delivery_radius_km) > 0 ||
          toNumber(form.delivery_min_fee) > 0 ||
          toNumber(form.delivery_rate_per_km) > 0 ||
          toNumber(form.delivery_fee) > 0 ||
          form.delivery_mode === "free_delivery" ||
          form.delivery_mode === "included_in_price" ||
          form.delivery_mode === "pay_rider_separately")
    )

    const hoursOk = Boolean(
      form.accept_orders_anytime ||
        DAY_ORDER.some((day) => normalizeOperatingDays(form.operating_days)[day].enabled)
    )

    const shareOk = Boolean(
      form.share_image_mode || form.share_poster_url || form.share_title
    )

    const slugOk = Boolean(form.shop_slug)

    return {
      bankOk,
      deliveryOk,
      hoursOk,
      shareOk,
      slugOk,
    }
  }, [form])

  const availabilityStatusText = useMemo(() => {
    const operatingDays = normalizeOperatingDays(form.operating_days)

    if (form.temporarily_closed) {
      return "Temporarily Closed"
    }

    if (form.accept_orders_anytime) {
      return "Accepting orders anytime"
    }

    const enabledDays = DAY_ORDER.filter((day) => operatingDays[day].enabled)

    if (enabledDays.length === 0) {
      return "No operating day selected"
    }

    if (enabledDays.length === 7) {
      const monday = operatingDays.monday
      const allSameTime = DAY_ORDER.every(
        (day) =>
          operatingDays[day].enabled &&
          operatingDays[day].opening_time === monday.opening_time &&
          operatingDays[day].closing_time === monday.closing_time
      )

      if (allSameTime) {
        return `Open daily from ${monday.opening_time} to ${monday.closing_time}`
      }
    }

    return `${enabledDays.length} operating day(s) configured`
  }, [form.accept_orders_anytime, form.operating_days, form.temporarily_closed])

  const enabledDayChips = useMemo(() => {
    const operatingDays = normalizeOperatingDays(form.operating_days)

    return DAY_ORDER.filter((day) => operatingDays[day].enabled).map((day) => {
      const item = operatingDays[day]
      return `${DAY_LABELS[day]} (${item.opening_time} - ${item.closing_time})`
    })
  }, [form.operating_days])

  const deliverySummaryText = useMemo(() => {
    const fee = Number(form.delivery_fee || 0)
    const rate = Number(form.delivery_rate_per_km || 0)
    const minFee = Number(form.delivery_min_fee || 0)
    const radius = Number(form.delivery_radius_km || 0)

    switch (form.delivery_mode) {
      case "free_delivery":
        return "Free delivery tersedia untuk kawasan terpilih."
      case "fixed_fee":
        return fee > 0
          ? `Delivery fee sebanyak ${formatCurrency(fee)} akan dikenakan.`
          : "Delivery fee akan dikenakan."
      case "included_in_price":
        return "Harga produk telah termasuk delivery."
      case "distance_based":
        return `Caj delivery dikira berdasarkan jarak. Kadar ${formatCurrency(
          rate
        )}/km, minimum ${formatCurrency(minFee)}, radius maksimum ${radius}km.`
      case "pay_rider_separately":
      default:
        return "Caj delivery tidak termasuk dalam harga. Bayaran delivery harus dibuat terus kepada rider semasa penghantaran."
    }
  }, [
    form.delivery_mode,
    form.delivery_fee,
    form.delivery_rate_per_km,
    form.delivery_min_fee,
    form.delivery_radius_km,
  ])

  async function handleSave() {
    try {
      setLoading(true)

      const trimmedStoreName = (form.store_name || "").trim()
      if (!trimmedStoreName) {
        alert("Store Name is required")
        return
      }

      const operatingDays = normalizeOperatingDays(form.operating_days)

      if (!form.accept_orders_anytime) {
        const enabledDays = DAY_ORDER.filter((day) => operatingDays[day].enabled)

        if (enabledDays.length === 0) {
          alert("Please enable at least one operating day.")
          return
        }

        for (const day of enabledDays) {
          const item = operatingDays[day]
          if (!item.opening_time || !item.closing_time) {
            alert(`Please set opening and closing time for ${DAY_LABELS[day]}.`)
            return
          }

          if (item.opening_time === item.closing_time) {
            alert(`${DAY_LABELS[day]} opening time and closing time cannot be the same.`)
            return
          }
        }
      }

      const firstEnabledDay = DAY_ORDER.find((day) => operatingDays[day].enabled)
      const fallbackOpening = firstEnabledDay
        ? operatingDays[firstEnabledDay].opening_time
        : null
      const fallbackClosing = firstEnabledDay
        ? operatingDays[firstEnabledDay].closing_time
        : null

      const payload = {
        ...form,
        store_name: trimmedStoreName,
        email: (form.email || "").trim() || null,
        whatsapp: (form.whatsapp || "").trim() || null,
        company_name: (form.company_name || "").trim() || null,
        company_registration: (form.company_registration || "").trim() || null,
        business_address: (form.business_address || "").trim() || null,
        bank_name: form.bank_name || null,
        account_number: (form.account_number || "").trim() || null,
        account_holder_name: (form.account_holder_name || "").trim() || null,
        daily_note: (form.daily_note || "").trim() || null,
        delivery_area: (form.delivery_area || "").trim() || null,
        delivery_note: (form.delivery_note || "").trim() || null,
        pickup_address: (form.pickup_address || "").trim() || null,
        closed_message:
          (form.closed_message || "").trim() ||
          "Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.",
        opening_time: form.accept_orders_anytime ? null : fallbackOpening,
        closing_time: form.accept_orders_anytime ? null : fallbackClosing,
        operating_days: form.accept_orders_anytime ? null : operatingDays,
      }

      const res = await fetch("/api/admin/sellers/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || "Failed to save seller")
      }

      alert("Seller updated successfully")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error"
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const publicStoreUrl = form.shop_slug ? `/s/${form.shop_slug}` : null
  const operatingDays = normalizeOperatingDays(form.operating_days)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Edit Seller
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Admin boleh bantu setup profile, bank info, delivery, settings, dan share configuration seller.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill ok={checks.bankOk} label={checks.bankOk ? "Bank Ready" : "Bank Incomplete"} />
              <StatusPill ok={checks.deliveryOk} label={checks.deliveryOk ? "Delivery Ready" : "Delivery Incomplete"} />
              <StatusPill ok={checks.hoursOk} label={checks.hoursOk ? "Hours Ready" : "Hours Incomplete"} />
              <StatusPill ok={checks.shareOk} label={checks.shareOk ? "Share Ready" : "Share Incomplete"} />
              <StatusPill ok={checks.slugOk} label={checks.slugOk ? "Slug Ready" : "Slug Missing"} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/sellers"
              className="inline-flex rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Sellers
            </Link>

            {publicStoreUrl ? (
              <a
                href={publicStoreUrl}
                target="_blank"
                className="inline-flex rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open Store
              </a>
            ) : null}

            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>

      <SectionCard
        title="Profile"
        subtitle="Maklumat asas kedai dan seller."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label="Store Name"
            value={form.store_name}
            onChange={(v) => handleChange("store_name", v)}
            placeholder="Nama kedai"
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
            placeholder="seller@email.com"
            type="email"
          />
          <Input
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(v) => handleChange("whatsapp", v)}
            placeholder="Contoh: 60123456789"
          />
          <Input
            label="Company Name"
            value={form.company_name}
            onChange={(v) => handleChange("company_name", v)}
            placeholder="Nama syarikat"
          />
          <Input
            label="Company Registration"
            value={form.company_registration}
            onChange={(v) => handleChange("company_registration", v)}
            placeholder="No. pendaftaran"
          />
          <Input
            label="Plan Type"
            value={form.plan_type}
            onChange={(v) => handleChange("plan_type", v)}
            placeholder="BASIC / PRO"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Textarea
            label="Business Address"
            value={form.business_address}
            onChange={(v) => handleChange("business_address", v)}
            placeholder="Alamat perniagaan"
            rows={4}
          />
          <Textarea
            label="Daily Note"
            value={form.daily_note}
            onChange={(v) => handleChange("daily_note", v)}
            placeholder="Nota harian yang dipaparkan di kedai"
            rows={4}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Bank Info"
        subtitle="Maklumat penting untuk payout seller."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Bank Name
            </span>
            <select
              value={form.bank_name ?? ""}
              onChange={(e) => handleChange("bank_name", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="">Select Bank</option>
              {MALAYSIAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Account Number"
            value={form.account_number}
            onChange={(v) => handleChange("account_number", v)}
            placeholder="No. akaun bank"
          />
          <Input
            label="Account Holder Name"
            value={form.account_holder_name}
            onChange={(v) => handleChange("account_holder_name", v)}
            placeholder="Nama pemegang akaun"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Delivery"
        subtitle="Tetapan penghantaran dan pickup."
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-700">Preview</p>
          <p className="mt-1 text-sm text-slate-600">{deliverySummaryText}</p>

          {(form.delivery_area || "").trim() ? (
            <p className="mt-2 text-xs text-slate-500">
              Kawasan liputan: {(form.delivery_area || "").trim()}
            </p>
          ) : null}

          {(form.delivery_note || "").trim() ? (
            <p className="mt-1 text-xs text-slate-500">
              {(form.delivery_note || "").trim()}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Delivery Mode
            </span>
            <select
              value={form.delivery_mode ?? "pay_rider_separately"}
              onChange={(e) =>
                handleChange("delivery_mode", e.target.value as DeliveryMode)
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            >
              {DELIVERY_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>

          {form.delivery_mode === "fixed_fee" ? (
            <Input
              label="Delivery Fee (RM)"
              value={form.delivery_fee}
              onChange={(v) => handleChange("delivery_fee", v)}
              placeholder="Contoh: 5.00"
              type="number"
            />
          ) : null}

          {form.delivery_mode === "distance_based" ? (
            <div className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 md:grid-cols-2">
              <Input
                label="Rate Per KM (RM)"
                value={form.delivery_rate_per_km}
                onChange={(v) => handleChange("delivery_rate_per_km", v)}
                placeholder="Contoh: 1.00"
                type="number"
              />
              <Input
                label="Minimum Delivery Fee (RM)"
                value={form.delivery_min_fee}
                onChange={(v) => handleChange("delivery_min_fee", v)}
                placeholder="Contoh: 5.00"
                type="number"
              />
              <Input
                label="Maximum Delivery Radius (KM)"
                value={form.delivery_radius_km}
                onChange={(v) => handleChange("delivery_radius_km", v)}
                placeholder="Contoh: 10"
                type="number"
              />
              <Input
                label="Latitude"
                value={form.latitude}
                onChange={(v) => handleChange("latitude", v)}
                placeholder="Optional"
              />
              <Input
                label="Longitude"
                value={form.longitude}
                onChange={(v) => handleChange("longitude", v)}
                placeholder="Optional"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Pickup Address"
                  value={form.pickup_address}
                  onChange={(v) => handleChange("pickup_address", v)}
                  placeholder="Alamat pickup / lokasi kedai"
                  rows={3}
                />
              </div>
            </div>
          ) : null}

          <Input
            label="Delivery Area"
            value={form.delivery_area}
            onChange={(v) => handleChange("delivery_area", v)}
            placeholder="Contoh: Shah Alam, Subang, Klang"
          />

          <Textarea
            label="Delivery Note"
            value={form.delivery_note}
            onChange={(v) => handleChange("delivery_note", v)}
            placeholder="Nota tambahan delivery"
            rows={3}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Order Availability"
        subtitle="Ikut latest setting page: accept anytime atau set by day."
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-700">Current Status</p>
          <p className="mt-1 text-sm text-slate-600">{availabilityStatusText}</p>

          {!form.accept_orders_anytime && enabledDayChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {enabledDayChips.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Toggle
            label="Accept Orders Anytime"
            checked={Boolean(form.accept_orders_anytime)}
            onChange={(v) => handleChange("accept_orders_anytime", v)}
          />
          <Toggle
            label="Temporarily Closed"
            checked={Boolean(form.temporarily_closed)}
            onChange={(v) => handleChange("temporarily_closed", v)}
          />
        </div>

        {!form.accept_orders_anytime ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3">
              <p className="text-sm font-bold text-slate-900">Set by day</p>
              <p className="mt-1 text-xs text-slate-500">
                Seller boleh pilih hari buka dan waktu operasi untuk setiap hari.
              </p>
            </div>

            <div className="space-y-3">
              {DAY_ORDER.map((day) => {
                const item = operatingDays[day]

                return (
                  <div
                    key={day}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) =>
                            updateOperatingDay(day, { enabled: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-bold text-slate-900">
                          {DAY_LABELS[day]}
                        </span>
                      </label>

                      {item.enabled ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[360px]">
                          <input
                            type="time"
                            value={item.opening_time}
                            onChange={(e) =>
                              updateOperatingDay(day, {
                                opening_time: e.target.value,
                              })
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                          />
                          <input
                            type="time"
                            value={item.closing_time}
                            onChange={(e) =>
                              updateOperatingDay(day, {
                                closing_time: e.target.value,
                              })
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <Textarea
            label="Closed Message"
            value={form.closed_message}
            onChange={(v) => handleChange("closed_message", v)}
            placeholder="Mesej bila kedai ditutup"
            rows={3}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Shop & Share"
        subtitle="Tetapan slug, branding, dan marketing share."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label="Shop Slug"
            value={form.shop_slug}
            onChange={(v) => handleChange("shop_slug", v)}
            placeholder="contoh: dana-store"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(v) => handleChange("slug", v)}
            placeholder="Optional"
          />
          <Input
            label="Store Slug"
            value={form.store_slug}
            onChange={(v) => handleChange("store_slug", v)}
            placeholder="Optional"
          />
          <Input
            label="Share Image Mode"
            value={form.share_image_mode}
            onChange={(v) => handleChange("share_image_mode", v)}
            placeholder="logo / poster"
          />
          <Input
            label="Share Poster URL"
            value={form.share_poster_url}
            onChange={(v) => handleChange("share_poster_url", v)}
            placeholder="Poster image URL"
          />
          <Input
            label="Profile Image URL"
            value={form.profile_image}
            onChange={(v) => handleChange("profile_image", v)}
            placeholder="Profile image URL"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Share Title"
            value={form.share_title}
            onChange={(v) => handleChange("share_title", v)}
            placeholder="Title bila share link"
          />
          <Textarea
            label="Share Description"
            value={form.share_description}
            onChange={(v) => handleChange("share_description", v)}
            placeholder="Description bila share link"
            rows={3}
          />
        </div>
      </SectionCard>

      <section className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </section>
    </div>
  )
}
