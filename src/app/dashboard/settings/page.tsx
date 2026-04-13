'use client'

import Layout from '../../../components/Layout'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const MALAYSIAN_BANKS = [
  'Affin Bank',
  'Agrobank',
  'Alliance Bank',
  'AmBank',
  'Bank Islam',
  'Bank Muamalat',
  'Bank Rakyat',
  'BSN',
  'CIMB Bank',
  'Citibank',
  'Hong Leong Bank',
  'HSBC',
  'Kuwait Finance House',
  'Maybank',
  'MBSB Bank',
  'OCBC Bank',
  'Public Bank',
  'RHB Bank',
  'Standard Chartered',
  'UOB Bank',
]

const DELIVERY_MODES = [
  { value: 'free_delivery', label: 'Free Delivery' },
  { value: 'fixed_fee', label: 'Delivery Fee (Fixed)' },
  { value: 'included_in_price', label: 'Included in Price' },
  { value: 'pay_rider_separately', label: 'Pay Rider Separately' },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueShopSlug(base: string, currentSellerId?: string | null) {
  const cleanBase = slugify(base || 'shop')
  let candidate = cleanBase || 'shop'
  let counter = 1

  while (true) {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('shop_slug', candidate)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return candidate
    }

    if (currentSellerId && data.id === currentSellerId) {
      return candidate
    }

    counter += 1
    candidate = `${cleanBase}-${counter}`
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount)
}

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'

type SellerProfileRow = {
  id: string
  user_id: string
  store_name?: string | null
  shop_slug?: string | null
  email?: string | null
  whatsapp?: string | null
  company_name?: string | null
  company_registration?: string | null
  business_address?: string | null
  bank_name?: string | null
  account_number?: string | null
  account_holder_name?: string | null
  profile_image?: string | null
  accept_orders_anytime?: boolean | null
  opening_time?: string | null
  closing_time?: string | null
  temporarily_closed?: boolean | null
  closed_message?: string | null
  delivery_mode?: DeliveryMode | null
  delivery_fee?: number | null
  delivery_area?: string | null
  delivery_note?: string | null
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [sellerId, setSellerId] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [storeName, setStoreName] = useState('')
  const [savedShopSlug, setSavedShopSlug] = useState('')
  const [slugLocked, setSlugLocked] = useState(false)

  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyReg, setCompanyReg] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')

  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

  const [profileImage, setProfileImage] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [acceptOrdersAnytime, setAcceptOrdersAnytime] = useState(true)
  const [openingTime, setOpeningTime] = useState('09:00')
  const [closingTime, setClosingTime] = useState('22:00')
  const [temporarilyClosed, setTemporarilyClosed] = useState(false)
  const [closedMessage, setClosedMessage] = useState(
    'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.'
  )

  const [deliveryMode, setDeliveryMode] =
    useState<DeliveryMode>('pay_rider_separately')
  const [deliveryFee, setDeliveryFee] = useState('0')
  const [deliveryArea, setDeliveryArea] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  const previewBaseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my').replace(/\/$/, '')

  const livePreviewSlug = useMemo(() => {
    if (slugLocked && savedShopSlug) {
      return savedShopSlug
    }

    return slugify(storeName || 'your-shop')
  }, [slugLocked, savedShopSlug, storeName])

  const availabilityStatusText = useMemo(() => {
    if (temporarilyClosed) {
      return 'Temporarily Closed'
    }

    if (acceptOrdersAnytime) {
      return 'Accepting orders anytime'
    }

    return `Orders allowed from ${openingTime || '09:00'} to ${closingTime || '22:00'}`
  }, [acceptOrdersAnytime, openingTime, closingTime, temporarilyClosed])

  const deliverySummaryText = useMemo(() => {
    const fee = Number(deliveryFee || 0)

    switch (deliveryMode) {
      case 'free_delivery':
        return 'Free delivery tersedia untuk kawasan terpilih.'
      case 'fixed_fee':
        return fee > 0
          ? `Delivery fee sebanyak ${formatCurrency(fee)} akan dikenakan.`
          : 'Delivery fee akan dikenakan.'
      case 'included_in_price':
        return 'Harga produk telah termasuk delivery.'
      case 'pay_rider_separately':
      default:
        return 'Caj delivery tidak termasuk dalam harga dan dibayar terus kepada rider.'
    }
  }, [deliveryMode, deliveryFee])

  useEffect(() => {
    loadProfile()
  }, [])

  async function ensureSellerProfile(currentUserId: string, currentUserEmail: string) {
    const { data: existing, error: existingError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', currentUserId)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message)
    }

    if (existing) {
      return existing as SellerProfileRow
    }

    const fallbackStoreName = 'My Store'

    const { data: inserted, error: insertError } = await supabase
      .from('seller_profiles')
      .insert({
        user_id: currentUserId,
        email: currentUserEmail || null,
        store_name: fallbackStoreName,
        shop_slug: null,
        accept_orders_anytime: true,
        opening_time: '09:00',
        closing_time: '22:00',
        temporarily_closed: false,
        closed_message:
          'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.',
        delivery_mode: 'pay_rider_separately',
        delivery_fee: 0,
        delivery_area: null,
        delivery_note: null,
      })
      .select('*')
      .single()

    if (insertError || !inserted) {
      throw new Error(insertError?.message || 'Failed to create seller profile')
    }

    return inserted as SellerProfileRow
  }

  async function loadProfile() {
    setLoading(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(authError.message)
      }

      if (!user) {
        return
      }

      setUserId(user.id)
      setAccountEmail(user.email || '')

      const profile = await ensureSellerProfile(user.id, user.email || '')

      const existingSlug = profile.shop_slug || ''
      const existingStoreName = profile.store_name || ''
      const isDefaultName = existingStoreName === 'My Store'

      setSellerId(profile.id)
      setSavedShopSlug(existingSlug)
      setEmail(profile.email || '')
      setWhatsapp(profile.whatsapp || '')
      setCompanyName(profile.company_name || '')
      setCompanyReg(profile.company_registration || '')
      setBusinessAddress(profile.business_address || '')
      setBankName(profile.bank_name || '')
      setAccountNumber(profile.account_number || '')
      setAccountHolderName(profile.account_holder_name || '')
      setProfileImage(profile.profile_image || '')

      setAcceptOrdersAnytime(profile.accept_orders_anytime ?? true)
      setOpeningTime(profile.opening_time || '09:00')
      setClosingTime(profile.closing_time || '22:00')
      setTemporarilyClosed(profile.temporarily_closed ?? false)
      setClosedMessage(
        profile.closed_message ||
          'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.'
      )

      setDeliveryMode(profile.delivery_mode || 'pay_rider_separately')
      setDeliveryFee(String(profile.delivery_fee ?? 0))
      setDeliveryArea(profile.delivery_area || '')
      setDeliveryNote(profile.delivery_note || '')

      setStoreName(!existingSlug && isDefaultName ? '' : existingStoreName)
      setSlugLocked(Boolean(existingSlug))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadImage(file: File) {
    if (!sellerId) {
      alert('Seller profile not ready yet. Please refresh and try again.')
      return
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `seller-${sellerId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    setProfileImage(data.publicUrl)
  }

  async function handleSave() {
    if (saving) return

    if (!userId) {
      alert('User session not found. Please log in again.')
      return
    }

    const trimmedStoreName = storeName.trim()
    const trimmedClosedMessage = closedMessage.trim()
    const trimmedDeliveryArea = deliveryArea.trim()
    const trimmedDeliveryNote = deliveryNote.trim()
    const parsedDeliveryFee = Number(deliveryFee || 0)

    if (!trimmedStoreName) {
      alert('Store Name is required')
      return
    }

    if (!acceptOrdersAnytime) {
      if (!openingTime || !closingTime) {
        alert('Please set opening time and closing time.')
        return
      }

      if (openingTime === closingTime) {
        alert('Opening time and closing time cannot be the same.')
        return
      }
    }

    if (!Number.isFinite(parsedDeliveryFee) || parsedDeliveryFee < 0) {
      alert('Please enter a valid delivery fee.')
      return
    }

    if (deliveryMode === 'fixed_fee' && parsedDeliveryFee <= 0) {
      alert('Please enter delivery fee more than 0.')
      return
    }

    setSaving(true)

    try {
      let currentSellerId = sellerId

      if (!currentSellerId) {
        const profile = await ensureSellerProfile(userId, accountEmail || '')
        currentSellerId = profile.id
        setSellerId(profile.id)
      }

      let finalShopSlug = savedShopSlug

      if (!finalShopSlug) {
        finalShopSlug = await generateUniqueShopSlug(trimmedStoreName, currentSellerId)
      }

      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: trimmedStoreName,
          email: email.trim() || null,
          whatsapp: whatsapp.trim() || null,
          company_name: companyName.trim() || null,
          company_registration: companyReg.trim() || null,
          business_address: businessAddress.trim() || null,
          bank_name: bankName || null,
          account_number: accountNumber.trim() || null,
          account_holder_name: accountHolderName.trim() || null,
          profile_image: profileImage || null,
          shop_slug: finalShopSlug,
          accept_orders_anytime: acceptOrdersAnytime,
          opening_time: acceptOrdersAnytime ? null : openingTime,
          closing_time: acceptOrdersAnytime ? null : closingTime,
          temporarily_closed: temporarilyClosed,
          closed_message:
            trimmedClosedMessage ||
            'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.',
          delivery_mode: deliveryMode,
          delivery_fee: deliveryMode === 'fixed_fee' ? parsedDeliveryFee : 0,
          delivery_area: trimmedDeliveryArea || null,
          delivery_note: trimmedDeliveryNote || null,
        })
        .eq('id', currentSellerId)

      if (error) {
        throw new Error(error.message)
      }

      setStoreName(trimmedStoreName)
      setSavedShopSlug(finalShopSlug)
      setSlugLocked(true)

      alert('Settings updated successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) {
      alert('Please fill in new password and confirm password.')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Password confirmation does not match.')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      alert(error.message)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    alert('Password updated successfully!')
  }

  async function handleLogout() {
    const confirmed = window.confirm('Log out from your account?')
    if (!confirmed) return

    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    window.location.href = '/login'
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Manage your store, payout details, account settings, and order availability.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.85fr]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Seller Profile</h2>

              <div className="mb-5">
                <p className="mb-2 text-sm font-bold text-slate-700">Logo Biz</p>

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Seller profile"
                    className="mb-3 h-20 w-20 rounded-full object-cover"
                  />
                ) : null}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      uploadImage(e.target.files[0])
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-extrabold text-slate-900">Nama Biz</p>

                  <div className="grid gap-3">
                    <div>
                      <input
                        placeholder="Store Name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                      />

                      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Shop URL {slugLocked ? 'Locked' : 'Preview'}
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-slate-900">
                          {previewBaseUrl}/s/{livePreviewSlug}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {slugLocked
                            ? 'Your shop URL is locked after first successful save.'
                            : 'Preview only. Type your store name to preview your future shop URL.'}
                        </p>
                      </div>
                    </div>

                    <input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="WhatsApp Number"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-slate-900">Company Info</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      Optional
                    </span>
                  </div>

                  <div className="grid gap-3">
                    <input
                      placeholder="Company Name (Optional)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="Company Registration No (Optional)"
                      value={companyReg}
                      onChange={(e) => setCompanyReg(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <textarea
                      placeholder="Business Address (Optional)"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      rows={4}
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-extrabold text-slate-900">Payout Details</p>

                  <div className="grid gap-3">
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Select Bank</option>
                      {MALAYSIAN_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>

                    <input
                      placeholder="Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="Account Holder Name"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-slate-900">Delivery Settings</p>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      Customer-facing
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">Preview</p>
                    <p className="mt-1 text-sm text-slate-600">{deliverySummaryText}</p>

                    {deliveryArea.trim() ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Kawasan liputan: {deliveryArea.trim()}
                      </p>
                    ) : null}

                    {deliveryNote.trim() ? (
                      <p className="mt-1 text-xs text-slate-500">{deliveryNote.trim()}</p>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Delivery Mode
                      </label>
                      <select
                        value={deliveryMode}
                        onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      >
                        {DELIVERY_MODES.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {deliveryMode === 'fixed_fee' ? (
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Delivery Fee (RM)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Contoh: 5.00"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                      </div>
                    ) : null}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Delivery Area
                      </label>
                      <input
                        placeholder="Contoh: Shah Alam, Subang, Klang"
                        value={deliveryArea}
                        onChange={(e) => setDeliveryArea(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Optional. Customer boleh nampak kawasan liputan seller.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Delivery Note
                      </label>
                      <textarea
                        placeholder="Contoh: Caj rider dibayar terus kepada rider semasa barang sampai."
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Nota tambahan ini boleh dipaparkan kepada customer semasa checkout /
                        shop page.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-slate-900">Order Availability</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        temporarilyClosed
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {temporarilyClosed
                        ? 'Temporarily Closed'
                        : acceptOrdersAnytime
                        ? 'Open Anytime'
                        : 'Scheduled Hours'}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">Current Status</p>
                    <p className="mt-1 text-sm text-slate-600">{availabilityStatusText}</p>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <input
                        type="checkbox"
                        checked={acceptOrdersAnytime}
                        onChange={(e) => setAcceptOrdersAnytime(e.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Accept orders anytime</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Sesuai jika seller sentiasa available untuk terima order.
                        </p>
                      </div>
                    </label>

                    {!acceptOrdersAnytime ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Opening Time
                          </label>
                          <input
                            type="time"
                            value={openingTime}
                            onChange={(e) => setOpeningTime(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Closing Time
                          </label>
                          <input
                            type="time"
                            value={closingTime}
                            onChange={(e) => setClosingTime(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          />
                        </div>
                      </div>
                    ) : null}

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <input
                        type="checkbox"
                        checked={temporarilyClosed}
                        onChange={(e) => setTemporarilyClosed(e.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Temporarily closed</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Tutup sementara walaupun waktu operasi masih aktif.
                        </p>
                      </div>
                    </label>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Closed Message
                      </label>
                      <textarea
                        placeholder="Contoh: Kedai kini ditutup. Tempahan dibuka semula pada 9:00 AM."
                        value={closedMessage}
                        onChange={(e) => setClosedMessage(e.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Mesej ini boleh dipaparkan kepada customer bila kedai tidak menerima
                        order.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Account</h2>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-700">Login Email</p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {accountEmail || '-'}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm font-extrabold text-slate-900">Change Password</p>

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />

                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-slate-50"
                >
                  Update Password
                </button>

                <p className="text-xs text-slate-500">
                  Gunakan password sekurang-kurangnya 6 aksara.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Session</h2>

              <p className="mb-4 text-sm leading-6 text-slate-500">
                Log out jika anda ingin keluar dari akaun seller ini.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-2xl border border-red-200 bg-rose-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:bg-rose-100"
              >
                Log Out
              </button>
            </section>
          </div>
        </div>
      )}
    </Layout>
  )
}
