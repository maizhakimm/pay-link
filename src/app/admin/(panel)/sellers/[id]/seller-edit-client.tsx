"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type SellerForm = {
  id: string
  store_name: string | null
  contact_phone: string | null
  email: string | null
  business_address: string | null
  whatsapp: string | null
  company_name: string | null
  company_registration: string | null

  bank_name: string | null
  account_number: string | null
  account_holder_name: string | null
  account_name: string | null

  shop_slug: string | null
  slug: string | null
  store_slug: string | null
  plan_type: string | null

  delivery_mode: string | null
  delivery_radius_km: number | string | null
  delivery_rate_per_km: number | string | null
  delivery_min_fee: number | string | null
  delivery_fee: number | string | null
  delivery_area: string | null
  delivery_note: string | null
  pickup_address: string | null

  accept_orders_anytime: boolean | null
  opening_time: string | null
  closing_time: string | null
  temporarily_closed: boolean | null
  closed_message: string | null
  daily_note: string | null

  share_image_mode: string | null
  share_poster_url: string | null
  share_title: string | null
  share_description: string | null

  profile_image: string | null
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
  const [form, setForm] = useState<SellerForm>(seller)
  const [loading, setLoading] = useState(false)

  function handleChange<K extends keyof SellerForm>(key: K, value: SellerForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const checks = useMemo(() => {
    const bankOk = Boolean(
      form.bank_name && form.account_number && form.account_holder_name
    )

    const deliveryOk = Boolean(
      form.delivery_mode ||
        form.delivery_radius_km ||
        form.delivery_rate_per_km ||
        form.delivery_min_fee
    )

    const hoursOk = Boolean(
      form.accept_orders_anytime || (form.opening_time && form.closing_time)
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

  async function handleSave() {
    try {
      setLoading(true)

      const res = await fetch("/api/admin/sellers/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
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
            label="Contact Phone"
            value={form.contact_phone}
            onChange={(v) => handleChange("contact_phone", v)}
            placeholder="Contoh: 0123456789"
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
          <Input
            label="Bank Name"
            value={form.bank_name}
            onChange={(v) => handleChange("bank_name", v)}
            placeholder="Contoh: CIMB Bank"
          />
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

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Legacy Account Name"
            value={form.account_name}
            onChange={(v) => handleChange("account_name", v)}
            placeholder="Optional"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Delivery"
        subtitle="Tetapan penghantaran dan pickup."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Delivery Mode"
            value={form.delivery_mode}
            onChange={(v) => handleChange("delivery_mode", v)}
            placeholder="Contoh: distance_based"
          />
          <Input
            label="Radius KM"
            value={form.delivery_radius_km}
            onChange={(v) => handleChange("delivery_radius_km", v)}
            placeholder="Contoh: 10"
            type="number"
          />
          <Input
            label="Rate per KM"
            value={form.delivery_rate_per_km}
            onChange={(v) => handleChange("delivery_rate_per_km", v)}
            placeholder="Contoh: 1.00"
            type="number"
          />
          <Input
            label="Minimum Fee"
            value={form.delivery_min_fee}
            onChange={(v) => handleChange("delivery_min_fee", v)}
            placeholder="Contoh: 5.00"
            type="number"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Flat Delivery Fee"
            value={form.delivery_fee}
            onChange={(v) => handleChange("delivery_fee", v)}
            placeholder="Optional"
            type="number"
          />
          <Textarea
            label="Delivery Area"
            value={form.delivery_area}
            onChange={(v) => handleChange("delivery_area", v)}
            placeholder="Contoh: Shah Alam sahaja"
            rows={3}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Textarea
            label="Delivery Note"
            value={form.delivery_note}
            onChange={(v) => handleChange("delivery_note", v)}
            placeholder="Nota tambahan delivery"
            rows={3}
          />
          <Textarea
            label="Pickup Address"
            value={form.pickup_address}
            onChange={(v) => handleChange("pickup_address", v)}
            placeholder="Alamat pickup"
            rows={3}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Shop Settings"
        subtitle="Waktu operasi, availability, dan status kedai."
      >
        <div className="grid gap-4 md:grid-cols-2">
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

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Opening Time"
            value={form.opening_time}
            onChange={(v) => handleChange("opening_time", v)}
            placeholder="07:00"
          />
          <Input
            label="Closing Time"
            value={form.closing_time}
            onChange={(v) => handleChange("closing_time", v)}
            placeholder="22:00"
          />
          <Input
            label="Shop Slug"
            value={form.shop_slug}
            onChange={(v) => handleChange("shop_slug", v)}
            placeholder="contoh: dana-store"
          />
          <Input
            label="Plan Type"
            value={form.plan_type}
            onChange={(v) => handleChange("plan_type", v)}
            placeholder="BASIC / PRO"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
        </div>

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
        title="Share & Branding"
        subtitle="Tetapan untuk image share, poster, dan marketing text."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
