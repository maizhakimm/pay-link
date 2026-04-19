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
  { value: 'distance_based', label: 'Distance Based' },
]

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

type DayKey = (typeof DAY_ORDER)[number]

type OperatingDayItem = {
  enabled: boolean
  opening_time: string
  closing_time: string
}

type OperatingDays = Record<DayKey, OperatingDayItem>

type OrderMode = 'anytime' | 'scheduled' | 'preorder'

const DEFAULT_OPERATING_DAYS: OperatingDays = {
  monday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  tuesday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  wednesday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  thursday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  friday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  saturday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  sunday: { enabled: false, opening_time: '09:00', closing_time: '18:00' },
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueShopSlug(
  base: string,
  currentSellerId?: string | null
) {
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

function normalizeOperatingDays(value: any): OperatingDays {
  const safe: OperatingDays = { ...DEFAULT_OPERATING_DAYS }

  if (!value || typeof value !== 'object') {
    return safe
  }

  for (const day of DAY_ORDER) {
    const item = value?.[day]
    if (!item || typeof item !== 'object') continue

    safe[day] = {
      enabled:
        typeof item.enabled === 'boolean'
          ? item.enabled
          : DEFAULT_OPERATING_DAYS[day].enabled,
      opening_time:
        typeof item.opening_time === 'string' && item.opening_time
          ? item.opening_time
          : DEFAULT_OPERATING_DAYS[day].opening_time,
      closing_time:
        typeof item.closing_time === 'string' && item.closing_time
          ? item.closing_time
          : DEFAULT_OPERATING_DAYS[day].closing_time,
    }
  }

  return safe
}

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'
  | 'distance_based'

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
  delivery_radius_km?: number | null
  delivery_rate_per_km?: number | null
  delivery_min_fee?: number | null
  pickup_address?: string | null
  latitude?: number | null
  longitude?: number | null
  operating_days?: OperatingDays | null
  order_mode?: OrderMode | null
  preorder_days?: number | null
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

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

  const [orderMode, setOrderMode] = useState<OrderMode>('scheduled')
  const [preorderDays, setPreorderDays] = useState('1')

  const [openingTime, setOpeningTime] = useState('09:00')
  const [closingTime, setClosingTime] = useState('22:00')
  const [temporarilyClosed, setTemporarilyClosed] = useState(false)
  const [closedMessage, setClosedMessage] = useState(
    'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.'
  )
  const [operatingDays, setOperatingDays] =
    useState<OperatingDays>(DEFAULT_OPERATING_DAYS)

  const [deliveryMode, setDeliveryMode] =
    useState<DeliveryMode>('pay_rider_separately')
  const [deliveryFee, setDeliveryFee] = useState('0')
  const [deliveryArea, setDeliveryArea] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('10')
  const [deliveryRatePerKm, setDeliveryRatePerKm] = useState('1')
  const [deliveryMinFee, setDeliveryMinFee] = useState('5')
  const [pickupAddress, setPickupAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [resolvedPickupAddress, setResolvedPickupAddress] = useState('')

  const previewBaseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my'
  ).replace(/\/$/, '')

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

    if (orderMode === 'anytime') {
      return 'Open 24 hours'
    }

    if (orderMode === 'preorder') {
      const days = Number(preorderDays || 1)
      return `Pre-order • Customer perlu order sekurang-kurangnya ${days} hari awal`
    }

    const enabledDays = DAY_ORDER.filter((day) => operatingDays[day].enabled)

    if (enabledDays.length === 0) {
      return 'No operating day selected'
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
  }, [operatingDays, temporarilyClosed, orderMode, preorderDays])

  const enabledDayChips = useMemo(() => {
    if (orderMode !== 'scheduled') return []

    return DAY_ORDER.filter((day) => operatingDays[day].enabled).map((day) => {
      const item = operatingDays[day]
      return `${DAY_LABELS[day]} (${item.opening_time} - ${item.closing_time})`
    })
  }, [operatingDays, orderMode])

  const deliverySummaryText = useMemo(() => {
    const fee = Number(deliveryFee || 0)
    const rate = Number(deliveryRatePerKm || 0)
    const minFee = Number(deliveryMinFee || 0)
    const radius = Number(deliveryRadiusKm || 0)

    switch (deliveryMode) {
      case 'free_delivery':
        return 'Free delivery tersedia untuk kawasan terpilih.'
      case 'fixed_fee':
        return fee > 0
          ? `Delivery fee sebanyak ${formatCurrency(fee)} akan dikenakan.`
          : 'Delivery fee akan dikenakan.'
      case 'included_in_price':
        return 'Harga produk telah termasuk delivery.'
      case 'distance_based':
        return `Caj delivery dikira berdasarkan jarak. Kadar ${formatCurrency(
          rate
        )}/km, minimum ${formatCurrency(minFee)}, radius maksimum ${radius}km.`
      case 'pay_rider_separately':
      default:
        return 'Caj delivery tidak termasuk dalam harga. Bayaran delivery harus dibuat terus kepada rider semasa penghantaran.'
    }
  }, [
    deliveryMode,
    deliveryFee,
    deliveryRatePerKm,
    deliveryMinFee,
    deliveryRadiusKm,
  ])

  useEffect(() => {
    loadProfile()
  }, [])

  function updateOperatingDay(day: DayKey, patch: Partial<OperatingDayItem>) {
    setOperatingDays((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...patch,
      },
    }))
  }

  async function ensureSellerProfile(
    currentUserId: string,
    currentUserEmail: string
  ) {
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
        accept_orders_anytime: false,
        order_mode: 'scheduled',
        preorder_days: 1,
        opening_time: null,
        closing_time: null,
        temporarily_closed: false,
        closed_message:
          'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.',
        delivery_mode: 'pay_rider_separately',
        delivery_fee: 0,
        delivery_area: null,
        delivery_note: null,
        delivery_radius_km: 10,
        delivery_rate_per_km: 1,
        delivery_min_fee: 5,
        pickup_address: null,
        latitude: null,
        longitude: null,
        operating_days: DEFAULT_OPERATING_DAYS,
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

      const derivedOrderMode: OrderMode =
        profile.order_mode ||
        (profile.accept_orders_anytime ? 'anytime' : 'scheduled')

      setOrderMode(derivedOrderMode)
      setPreorderDays(String(profile.preorder_days ?? 1))

      setOpeningTime(profile.opening_time || '09:00')
      setClosingTime(profile.closing_time || '22:00')
      setTemporarilyClosed(profile.temporarily_closed ?? false)
      setClosedMessage(
        profile.closed_message ||
          'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.'
      )
      setOperatingDays(normalizeOperatingDays(profile.operating_days))

      setDeliveryMode(profile.delivery_mode || 'pay_rider_separately')
      setDeliveryFee(String(profile.delivery_fee ?? 0))
      setDeliveryArea(profile.delivery_area || '')
      setDeliveryNote(profile.delivery_note || '')
      setDeliveryRadiusKm(String(profile.delivery_radius_km ?? 10))
      setDeliveryRatePerKm(String(profile.delivery_rate_per_km ?? 1))
      setDeliveryMinFee(String(profile.delivery_min_fee ?? 5))
      setPickupAddress(profile.pickup_address || '')
      setResolvedPickupAddress(profile.pickup_address || '')
      setLatitude(
        profile.latitude !== null && profile.latitude !== undefined
          ? String(profile.latitude)
          : ''
      )
      setLongitude(
        profile.longitude !== null && profile.longitude !== undefined
          ? String(profile.longitude)
          : ''
      )

      setStoreName(!existingSlug && isDefaultName ? '' : existingStoreName)
      setSlugLocked(Boolean(existingSlug))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load profile'
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

  async function detectPickupLocation() {
    const trimmedPickupAddress = pickupAddress.trim()

    if (!trimmedPickupAddress) {
      alert('Please enter pickup address first.')
      return null
    }

    try {
      setDetectingLocation(true)

      const response = await fetch('/api/maps/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: trimmedPickupAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || 'Alamat tidak dapat dikenal pasti. Sila semak semula alamat pickup.'
        )
      }

      const nextLat = String(data.latitude)
      const nextLng = String(data.longitude)
      const nextAddress = String(data.formatted_address || trimmedPickupAddress)

      setLatitude(nextLat)
      setLongitude(nextLng)
      setResolvedPickupAddress(nextAddress)

      return {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        formattedAddress: nextAddress,
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to detect pickup location'
      alert(message)
      return null
    } finally {
      setDetectingLocation(false)
    }
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
    let trimmedPickupAddress = pickupAddress.trim()

    const parsedDeliveryFee = Number(deliveryFee || 0)
    const parsedDeliveryRadiusKm = Number(deliveryRadiusKm || 0)
    const parsedDeliveryRatePerKm = Number(deliveryRatePerKm || 0)
    const parsedDeliveryMinFee = Number(deliveryMinFee || 0)
    const parsedPreorderDays = Number(preorderDays || 1)

    let parsedLatitude = latitude.trim() === '' ? null : Number(latitude)
    let parsedLongitude = longitude.trim() === '' ? null : Number(longitude)

    if (!trimmedStoreName) {
      alert('Store Name is required')
      return
    }

    if (!['anytime', 'scheduled', 'preorder'].includes(orderMode)) {
      alert('Please select valid order mode.')
      return
    }

    if (orderMode === 'scheduled') {
      const enabledDays = DAY_ORDER.filter((day) => operatingDays[day].enabled)

      if (enabledDays.length === 0) {
        alert('Please enable at least one operating day.')
        return
      }

      for (const day of enabledDays) {
        const item = operatingDays[day]
        if (!item.opening_time || !item.closing_time) {
          alert(`Please set opening and closing time for ${DAY_LABELS[day]}.`)
          return
        }

        if (item.opening_time === item.closing_time) {
          alert(
            `${DAY_LABELS[day]} opening time and closing time cannot be the same.`
          )
          return
        }
      }
    }

    if (orderMode === 'preorder') {
      if (!Number.isFinite(parsedPreorderDays) || parsedPreorderDays < 1) {
        alert('Please enter preorder days minimum 1.')
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

    if (deliveryMode === 'distance_based') {
      if (!Number.isFinite(parsedDeliveryRadiusKm) || parsedDeliveryRadiusKm <= 0) {
        alert('Please enter max delivery radius more than 0.')
        return
      }

      if (!Number.isFinite(parsedDeliveryRatePerKm) || parsedDeliveryRatePerKm <= 0) {
        alert('Please enter rate per km more than 0.')
        return
      }

      if (!Number.isFinite(parsedDeliveryMinFee) || parsedDeliveryMinFee < 0) {
        alert('Please enter a valid minimum delivery fee.')
        return
      }

      if (!trimmedPickupAddress) {
        alert('Please enter pickup address for distance based delivery.')
        return
      }

      const geocoded = await detectPickupLocation()

      if (!geocoded) {
        return
      }

      parsedLatitude = geocoded.latitude
      parsedLongitude = geocoded.longitude
      trimmedPickupAddress = geocoded.formattedAddress
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

      const firstEnabledDay = DAY_ORDER.find((day) => operatingDays[day].enabled)
      const fallbackOpening = firstEnabledDay
        ? operatingDays[firstEnabledDay].opening_time
        : null
      const fallbackClosing = firstEnabledDay
        ? operatingDays[firstEnabledDay].closing_time
        : null

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

          order_mode: orderMode,
          preorder_days: orderMode === 'preorder' ? parsedPreorderDays : 1,

          accept_orders_anytime: orderMode === 'anytime',
          opening_time: orderMode === 'scheduled' ? fallbackOpening : null,
          closing_time: orderMode === 'scheduled' ? fallbackClosing : null,

          temporarily_closed: temporarilyClosed,
          closed_message:
            trimmedClosedMessage ||
            'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.',
          operating_days: orderMode === 'scheduled' ? operatingDays : null,

          delivery_mode: deliveryMode,
          delivery_fee: deliveryMode === 'fixed_fee' ? parsedDeliveryFee : 0,
          delivery_area: trimmedDeliveryArea || null,
          delivery_note: trimmedDeliveryNote || null,
          delivery_radius_km:
            deliveryMode === 'distance_based' ? parsedDeliveryRadiusKm : null,
          delivery_rate_per_km:
            deliveryMode === 'distance_based' ? parsedDeliveryRatePerKm : null,
          delivery_min_fee:
            deliveryMode === 'distance_based' ? parsedDeliveryMinFee : null,
          pickup_address:
            deliveryMode === 'distance_based' ? trimmedPickupAddress : null,
          latitude: deliveryMode === 'distance_based' ? parsedLatitude : null,
          longitude: deliveryMode === 'distance_based' ? parsedLongitude : null,
        })
        .eq('id', currentSellerId)

      if (error) {
        throw new Error(error.message)
      }

      setStoreName(trimmedStoreName)
      setSavedShopSlug(finalShopSlug)
      setSlugLocked(true)
      setPickupAddress(trimmedPickupAddress)
      setResolvedPickupAddress(trimmedPickupAddress)

      alert('Settings updated successfully!')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save settings'
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
                    if (e.target.files?.[0])
