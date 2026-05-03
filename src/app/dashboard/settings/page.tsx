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
  'GX Bank Berhad',
  'Boost Bank Berhad',
  'AEON Bank (M) Berhad',
  'KAF Digital Bank Berhad',
  'YTL Digital Bank Berhad (Ryt Bank)',
]

const DELIVERY_MODES = [
  { value: 'free_delivery', label: 'Free Delivery / Included' },
  { value: 'fixed_fee', label: 'Delivery Fee (Fixed)' },
  { value: 'pay_rider_separately', label: 'Customer Bayar Rider' },
  { value: 'distance_based', label: 'Ikut Jarak (Auto Kira)' },
]

const ORDER_MODE_OPTIONS = [
  { value: 'anytime', label: 'Open 24 Jam' },
  { value: 'scheduled', label: 'Ikut Waktu Operasi' },
  { value: 'preorder', label: 'Pre-order' },
] as const

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

type DayKey = (typeof DAY_ORDER)[number]
type OrderMode = 'anytime' | 'scheduled' | 'preorder'

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

type OperatingDayItem = {
  enabled: boolean
  opening_time: string
  closing_time: string
}

type OperatingDays = Record<DayKey, OperatingDayItem>

const DEFAULT_OPERATING_DAYS: OperatingDays = {
  monday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  tuesday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  wednesday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  thursday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  friday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  saturday: { enabled: true, opening_time: '09:00', closing_time: '18:00' },
  sunday: { enabled: false, opening_time: '09:00', closing_time: '18:00' },
}

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'
  | 'distance_based'

type MinimumOrderType = 'quantity' | 'amount'
type DeliveryRateType = 'flat' | 'per_km'

type DeliveryPricingRule = {
  id?: string
  seller_profile_id?: string
  min_km: string
  max_km: string
  rate_type: DeliveryRateType
  rate_value: string
  sort_order: number
  is_active: boolean
}

type SellerProfileRow = {
  id: string
  user_id: string
  store_name?: string | null
  shop_slug?: string | null
  email?: string | null
  whatsapp?: string | null
  shop_description?: string | null
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
  minimum_order_enabled?: boolean | null
  minimum_order_type?: MinimumOrderType | null
  minimum_order_value?: number | null
  minimum_order_message?: string | null
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

    if (error) throw new Error(error.message)
    if (!data) return candidate
    if (currentSellerId && data.id === currentSellerId) return candidate

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

function normalizeOperatingDays(value: unknown): OperatingDays {
  const safe: OperatingDays = JSON.parse(JSON.stringify(DEFAULT_OPERATING_DAYS))

  if (!value || typeof value !== 'object') {
    return safe
  }

  const obj = value as Partial<Record<DayKey, Partial<OperatingDayItem>>>

  for (const day of DAY_ORDER) {
    const item = obj?.[day]
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

function getDefaultDeliveryPricingRules(): DeliveryPricingRule[] {
  return [
    {
      min_km: '0',
      max_km: '5',
      rate_type: 'flat',
      rate_value: '5',
      sort_order: 0,
      is_active: true,
    },
    {
      min_km: '5',
      max_km: '10',
      rate_type: 'per_km',
      rate_value: '1',
      sort_order: 1,
      is_active: true,
    },
    {
      min_km: '10',
      max_km: '20',
      rate_type: 'per_km',
      rate_value: '0.90',
      sort_order: 2,
      is_active: true,
    },
    {
      min_km: '20',
      max_km: '30',
      rate_type: 'per_km',
      rate_value: '0.80',
      sort_order: 3,
      is_active: true,
    },
    {
      min_km: '30',
      max_km: '',
      rate_type: 'per_km',
      rate_value: '0.70',
      sort_order: 4,
      is_active: true,
    },
  ]
}

function formatRuleText(rule: DeliveryPricingRule) {
  const min = Number(rule.min_km || 0)
  const max = rule.max_km.trim() ? Number(rule.max_km) : null
  const value = Number(rule.rate_value || 0)

  const rangeText =
    max === null
      ? `${min}km ke atas`
      : `${min}km - ${max}km`

  const rateText =
    rule.rate_type === 'flat'
      ? `${formatCurrency(value)} flat`
      : `${formatCurrency(value)}/km`

  return `${rangeText} → ${rateText}`
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
  const [shopDescription, setShopDescription] = useState('')

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

  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('30')
  const [deliveryRatePerKm, setDeliveryRatePerKm] = useState('1')
  const [deliveryMinFee, setDeliveryMinFee] = useState('5')
  const [deliveryPricingRules, setDeliveryPricingRules] =
    useState<DeliveryPricingRule[]>(getDefaultDeliveryPricingRules())
  const [pickupAddress, setPickupAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [resolvedPickupAddress, setResolvedPickupAddress] = useState('')

  const [minimumOrderEnabled, setMinimumOrderEnabled] = useState(false)
  const [minimumOrderType, setMinimumOrderType] =
    useState<MinimumOrderType>('quantity')
  const [minimumOrderValue, setMinimumOrderValue] = useState('0')
  const [minimumOrderMessage, setMinimumOrderMessage] = useState('')

  const previewBaseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my'
  ).replace(/\/$/, '')

  const livePreviewSlug = useMemo(() => {
    if (slugLocked && savedShopSlug) return savedShopSlug
    return slugify(storeName || 'your-shop')
  }, [slugLocked, savedShopSlug, storeName])

  const availabilityStatusText = useMemo(() => {
    if (temporarilyClosed) {
      return 'Temporarily Closed'
    }

    if (orderMode === 'anytime') {
      return 'Order dibuka 24 jam'
    }

    if (orderMode === 'preorder') {
      const days = Number(preorderDays || 1)
      return `Pre-order • customer perlu order sekurang-kurangnya ${days} hari awal`
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
  }, [temporarilyClosed, orderMode, preorderDays, operatingDays])

  const enabledDayChips = useMemo(() => {
    if (orderMode !== 'scheduled') return []

    return DAY_ORDER.filter((day) => operatingDays[day].enabled).map((day) => {
      const item = operatingDays[day]
      return `${DAY_LABELS[day]} (${item.opening_time} - ${item.closing_time})`
    })
  }, [operatingDays, orderMode])

  const deliverySummaryText = useMemo(() => {
    const fee = Number(deliveryFee || 0)
    const activeRules = deliveryPricingRules.filter((rule) => rule.is_active)

    switch (deliveryMode) {
      case 'free_delivery':
      case 'included_in_price':
        return 'Delivery percuma atau sudah termasuk dalam harga produk.'
      case 'fixed_fee':
        return fee > 0
          ? `Delivery fee sebanyak ${formatCurrency(fee)} akan dikenakan.`
          : 'Delivery fee akan dikenakan.'
      case 'distance_based':
        if (activeRules.length === 0) {
          return 'Caj delivery dikira berdasarkan jarak. Sila tambah sekurang-kurangnya satu rule.'
        }

        return `Caj delivery dikira ikut jarak bertingkat. ${activeRules
          .slice(0, 3)
          .map(formatRuleText)
          .join(' • ')}${activeRules.length > 3 ? ' • ...' : ''}`
      case 'pay_rider_separately':
      default:
        return 'Caj delivery tidak termasuk dalam harga. Bayaran delivery harus dibuat terus kepada rider semasa penghantaran.'
    }
  }, [deliveryMode, deliveryFee, deliveryPricingRules])

  const minimumOrderSummaryText = useMemo(() => {
    const value = Number(minimumOrderValue || 0)

    if (!minimumOrderEnabled || value <= 0) {
      return 'Tiada minimum order ditetapkan.'
    }

    if (minimumOrderType === 'amount') {
      return `Customer perlu order sekurang-kurangnya ${formatCurrency(value)} sebelum checkout.`
    }

    return `Customer perlu order sekurang-kurangnya ${value} pcs sebelum checkout.`
  }, [minimumOrderEnabled, minimumOrderType, minimumOrderValue])

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

  function updateDeliveryRule(
    index: number,
    patch: Partial<DeliveryPricingRule>
  ) {
    setDeliveryPricingRules((prev) =>
      prev.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...patch } : rule
      )
    )
  }

  function addDeliveryRule() {
    setDeliveryPricingRules((prev) => {
      const lastRule = prev[prev.length - 1]
      const nextMin = lastRule?.max_km?.trim()
        ? lastRule.max_km
        : lastRule?.min_km?.trim()
        ? String(Number(lastRule.min_km || 0) + 5)
        : '0'

      return [
        ...prev,
        {
          min_km: nextMin,
          max_km: '',
          rate_type: 'per_km',
          rate_value: '1',
          sort_order: prev.length,
          is_active: true,
        },
      ]
    })
  }

  function removeDeliveryRule(index: number) {
    setDeliveryPricingRules((prev) =>
      prev
        .filter((_, ruleIndex) => ruleIndex !== index)
        .map((rule, ruleIndex) => ({
          ...rule,
          sort_order: ruleIndex,
        }))
    )
  }

  function resetDefaultDeliveryRules() {
    const confirmed = window.confirm(
      'Reset delivery pricing rules kepada default BayarLink?'
    )

    if (!confirmed) return

    setDeliveryPricingRules(getDefaultDeliveryPricingRules())
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
        delivery_radius_km: 30,
        delivery_rate_per_km: 1,
        delivery_min_fee: 5,
        pickup_address: null,
        latitude: null,
        longitude: null,
        operating_days: DEFAULT_OPERATING_DAYS,
        minimum_order_enabled: false,
        minimum_order_type: 'quantity',
        minimum_order_value: 0,
        minimum_order_message: null,
      })
      .select('*')
      .single()

    if (insertError || !inserted) {
      throw new Error(insertError?.message || 'Failed to create seller profile')
    }

    return inserted as SellerProfileRow
  }

  async function loadDeliveryPricingRules(currentSellerId: string) {
    const { data, error } = await supabase
      .from('delivery_pricing_rules')
      .select('*')
      .eq('seller_profile_id', currentSellerId)
      .order('sort_order', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      setDeliveryPricingRules(getDefaultDeliveryPricingRules())
      return
    }

    setDeliveryPricingRules(
      data.map((rule: any, index: number) => ({
        id: rule.id,
        seller_profile_id: rule.seller_profile_id,
        min_km: String(rule.min_km ?? 0),
        max_km:
          rule.max_km === null || rule.max_km === undefined
            ? ''
            : String(rule.max_km),
        rate_type: rule.rate_type === 'flat' ? 'flat' : 'per_km',
        rate_value: String(rule.rate_value ?? 0),
        sort_order: Number(rule.sort_order ?? index),
        is_active: rule.is_active !== false,
      }))
    )
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

      if (!user) return

      setUserId(user.id)
      setAccountEmail(user.email || '')

      const profile = await ensureSellerProfile(user.id, user.email || '')

      const existingSlug = profile.shop_slug || ''
      const existingStoreName = profile.store_name || ''
      const isDefaultName = existingStoreName === 'My Store'

      const derivedOrderMode: OrderMode =
        profile.order_mode ||
        (profile.accept_orders_anytime ? 'anytime' : 'scheduled')

      setSellerId(profile.id)
      setSavedShopSlug(existingSlug)
      setShopDescription(profile.shop_description || '')
      setEmail(profile.email || '')
      setWhatsapp(profile.whatsapp || '')
      setCompanyName(profile.company_name || '')
      setCompanyReg(profile.company_registration || '')
      setBusinessAddress(profile.business_address || '')
      setBankName(profile.bank_name || '')
      setAccountNumber(profile.account_number || '')
      setAccountHolderName(profile.account_holder_name || '')
      setProfileImage(profile.profile_image || '')

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

      const loadedDeliveryMode =
        profile.delivery_mode === 'included_in_price'
          ? 'free_delivery'
          : profile.delivery_mode || 'pay_rider_separately'

      setDeliveryMode(loadedDeliveryMode)
      setDeliveryFee(String(profile.delivery_fee ?? 0))
      setDeliveryArea(profile.delivery_area || '')
      setDeliveryNote(profile.delivery_note || '')
      setDeliveryRadiusKm(String(profile.delivery_radius_km ?? 30))
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

      await loadDeliveryPricingRules(profile.id)

      setMinimumOrderEnabled(Boolean(profile.minimum_order_enabled))
      setMinimumOrderType(
        profile.minimum_order_type === 'amount' ? 'amount' : 'quantity'
      )
      setMinimumOrderValue(String(profile.minimum_order_value ?? 0))
      setMinimumOrderMessage(profile.minimum_order_message || '')

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
          data.error ||
            'Alamat tidak dapat dikenal pasti. Sila semak semula alamat pickup.'
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

  function validateDeliveryPricingRules() {
    const activeRules = deliveryPricingRules.filter((rule) => rule.is_active)

    if (activeRules.length === 0) {
      alert('Please add at least one active delivery pricing rule.')
      return false
    }

    for (let index = 0; index < activeRules.length; index += 1) {
      const rule = activeRules[index]
      const minKm = Number(rule.min_km || 0)
      const maxKm = rule.max_km.trim() ? Number(rule.max_km) : null
      const rateValue = Number(rule.rate_value || 0)

      if (!Number.isFinite(minKm) || minKm < 0) {
        alert(`Rule ${index + 1}: Please enter valid min KM.`)
        return false
      }

      if (maxKm !== null && (!Number.isFinite(maxKm) || maxKm <= minKm)) {
        alert(`Rule ${index + 1}: Max KM must be more than Min KM.`)
        return false
      }

      if (!['flat', 'per_km'].includes(rule.rate_type)) {
        alert(`Rule ${index + 1}: Please select valid rate type.`)
        return false
      }

      if (!Number.isFinite(rateValue) || rateValue < 0) {
        alert(`Rule ${index + 1}: Please enter valid rate value.`)
        return false
      }
    }

    const openEndedRules = activeRules.filter((rule) => !rule.max_km.trim())

    if (openEndedRules.length > 1) {
      alert('Only one rule can have empty Max KM / open-ended distance.')
      return false
    }

    return true
  }

  async function saveDeliveryPricingRules(currentSellerId: string) {
    if (deliveryMode !== 'distance_based') {
      return
    }

    const rows = deliveryPricingRules
      .filter((rule) => rule.is_active)
      .map((rule, index) => ({
        seller_profile_id: currentSellerId,
        min_km: Number(rule.min_km || 0),
        max_km: rule.max_km.trim() ? Number(rule.max_km) : null,
        rate_type: rule.rate_type,
        rate_value: Number(rule.rate_value || 0),
        sort_order: index,
        is_active: true,
      }))

    const { error: deleteError } = await supabase
      .from('delivery_pricing_rules')
      .delete()
      .eq('seller_profile_id', currentSellerId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    if (rows.length === 0) return

    const { error: insertError } = await supabase
      .from('delivery_pricing_rules')
      .insert(rows)

    if (insertError) {
      throw new Error(insertError.message)
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
    const parsedMinimumOrderValue = Number(minimumOrderValue || 0)

    let parsedLatitude = latitude.trim() === '' ? null : Number(latitude)
    let parsedLongitude = longitude.trim() === '' ? null : Number(longitude)

    if (!trimmedStoreName) {
      alert('Store Name is required')
      return
    }

    if (!['anytime', 'scheduled', 'preorder'].includes(orderMode)) {
      alert('Please select a valid order mode.')
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
      if (!Number.isInteger(parsedPreorderDays) || parsedPreorderDays < 1) {
        alert('Please enter preorder days of at least 1.')
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

    if (minimumOrderEnabled) {
      if (
        !Number.isFinite(parsedMinimumOrderValue) ||
        parsedMinimumOrderValue <= 0
      ) {
        alert('Please enter minimum order value more than 0.')
        return
      }
    }

    if (deliveryMode === 'distance_based') {
      if (!validateDeliveryPricingRules()) return

      if (
        !Number.isFinite(parsedDeliveryRadiusKm) ||
        parsedDeliveryRadiusKm <= 0
      ) {
        alert('Please enter max delivery radius more than 0.')
        return
      }

      if (!trimmedPickupAddress) {
        alert('Please enter pickup address for distance based delivery.')
        return
      }

      const geocoded = await detectPickupLocation()

      if (!geocoded) return

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
        finalShopSlug = await generateUniqueShopSlug(
          trimmedStoreName,
          currentSellerId
        )
      }

      const firstEnabledDay = DAY_ORDER.find((day) => operatingDays[day].enabled)

      const fallbackOpening = firstEnabledDay
        ? operatingDays[firstEnabledDay].opening_time
        : openingTime || null

      const fallbackClosing = firstEnabledDay
        ? operatingDays[firstEnabledDay].closing_time
        : closingTime || null

      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: trimmedStoreName,
          shop_description: shopDescription.trim() || null,
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

          // legacy compatibility
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

          // legacy fields kept for compatibility
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

          minimum_order_enabled: minimumOrderEnabled,
          minimum_order_type: minimumOrderType,
          minimum_order_value: minimumOrderEnabled
            ? parsedMinimumOrderValue
            : 0,
          minimum_order_message:
            minimumOrderMessage.trim() || null,
        })
        .eq('id', currentSellerId)

      if (error) {
        throw new Error(error.message)
      }

      await saveDeliveryPricingRules(currentSellerId)

      setStoreName(trimmedStoreName)
      setSavedShopSlug(finalShopSlug)
      setSlugLocked(true)
      setOpeningTime(fallbackOpening || '09:00')
      setClosingTime(fallbackClosing || '22:00')
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
          Manage your store, payout details, account settings, and order
          availability.
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
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                Seller Profile
              </h2>

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
                  <p className="mb-3 text-sm font-extrabold text-slate-900">
                    Nama Biz
                  </p>

                  <div className="grid gap-3">
                    <input
                      placeholder="Store Name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Short Description (Max 160)
                      </label>
                      <textarea
                        placeholder="Contoh: Kek batik homemade, kurang manis, sesuai untuk gift & event."
                        value={shopDescription}
                        onChange={(e) => setShopDescription(e.target.value)}
                        maxLength={160}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>

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
                    <p className="text-sm font-extrabold text-slate-900">
                      Company Info
                    </p>
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
                  <p className="mb-3 text-sm font-extrabold text-slate-900">
                    Payout Details
                  </p>

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
                    <p className="text-sm font-extrabold text-slate-900">
                      Delivery Settings
                    </p>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      Customer-facing
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">Preview</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {deliverySummaryText}
                    </p>

                    {deliveryArea.trim() ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Kawasan liputan: {deliveryArea.trim()}
                      </p>
                    ) : null}

                    {deliveryNote.trim() ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {deliveryNote.trim()}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Delivery Mode
                      </label>
                      <select
                        value={deliveryMode}
                        onChange={(e) =>
                          setDeliveryMode(e.target.value as DeliveryMode)
                        }
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

                    {deliveryMode === 'distance_based' ? (
                      <div className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                        <div className="rounded-2xl border border-blue-100 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-extrabold text-slate-900">
                                Delivery Pricing Rules
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Tetapkan caj delivery ikut jarak. Contoh: 0-5km
                                RM5 flat, 5-10km RM1/km.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={resetDefaultDeliveryRules}
                              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-800 transition hover:bg-slate-50"
                            >
                              Reset Default
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {deliveryPricingRules.map((rule, index) => (
                              <div
                                key={`${rule.id || 'new'}-${index}`}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                                    Rule {index + 1}
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() => removeDeliveryRule(index)}
                                    disabled={deliveryPricingRules.length <= 1}
                                    className="rounded-full border border-red-200 bg-rose-50 px-3 py-1 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-700">
                                      Min KM
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={rule.min_km}
                                      onChange={(e) =>
                                        updateDeliveryRule(index, {
                                          min_km: e.target.value,
                                        })
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-700">
                                      Max KM
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="Kosongkan untuk tiada had"
                                      value={rule.max_km}
                                      onChange={(e) =>
                                        updateDeliveryRule(index, {
                                          max_km: e.target.value,
                                        })
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-700">
                                      Rate Type
                                    </label>
                                    <select
                                      value={rule.rate_type}
                                      onChange={(e) =>
                                        updateDeliveryRule(index, {
                                          rate_type: e.target
                                            .value as DeliveryRateType,
                                        })
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    >
                                      <option value="flat">Flat Rate</option>
                                      <option value="per_km">Per KM</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-700">
                                      Rate Value (RM)
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={rule.rate_value}
                                      onChange={(e) =>
                                        updateDeliveryRule(index, {
                                          rate_value: e.target.value,
                                        })
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                  </div>
                                </div>

                                <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                  <p className="text-xs font-bold text-slate-500">
                                    Preview
                                  </p>
                                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                                    {formatRuleText(rule)}
                                  </p>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={addDeliveryRule}
                              className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100"
                            >
                              + Add Rule
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Maximum Delivery Radius (KM)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Contoh: 30"
                            value={deliveryRadiusKm}
                            onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                          />
                          <p className="mt-2 text-xs text-slate-500">
                            Customer di luar radius ini tidak boleh checkout
                            delivery.
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Pickup Address
                          </label>
                          <textarea
                            placeholder="Alamat pickup / lokasi kedai untuk kiraan jarak"
                            value={pickupAddress}
                            onChange={(e) => setPickupAddress(e.target.value)}
                            rows={3}
                            className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                          />
                          <p className="mt-2 text-xs text-slate-500">
                            Seller hanya isi alamat. Sistem akan auto detect
                            latitude dan longitude.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={detectPickupLocation}
                            disabled={detectingLocation}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {detectingLocation
                              ? 'Detecting...'
                              : 'Detect Pickup Location'}
                          </button>

                          {latitude && longitude ? (
                            <div className="text-xs text-slate-600">
                              Latitude: <strong>{latitude}</strong> &nbsp;•&nbsp;
                              Longitude: <strong>{longitude}</strong>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">
                              Lokasi belum dikesan lagi.
                            </div>
                          )}
                        </div>

                        {resolvedPickupAddress ? (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                              Resolved Address
                            </p>
                            <p className="mt-1 text-sm text-emerald-900">
                              {resolvedPickupAddress}
                            </p>
                          </div>
                        ) : null}

                        <input type="hidden" value={latitude} readOnly />
                        <input type="hidden" value={longitude} readOnly />

                        <p className="text-xs leading-5 text-slate-500">
                          Sistem akan simpan latitude dan longitude secara
                          automatik bila alamat berjaya dikenal pasti.
                        </p>
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
                        Nota tambahan ini boleh dipaparkan kepada customer
                        semasa checkout / shop page.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-slate-900">
                      Minimum Order
                    </p>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      Optional
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">Preview</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {minimumOrderSummaryText}
                    </p>

                    {minimumOrderEnabled && minimumOrderMessage.trim() ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Customer message: {minimumOrderMessage.trim()}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <input
                        type="checkbox"
                        checked={minimumOrderEnabled}
                        onChange={(e) =>
                          setMinimumOrderEnabled(e.target.checked)
                        }
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Enable Minimum Order
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Customer hanya boleh checkout bila cart cukup minimum
                          order yang seller tetapkan.
                        </p>
                      </div>
                    </label>

                    {minimumOrderEnabled ? (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                        <div className="grid gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Minimum Type
                            </label>
                            <select
                              value={minimumOrderType}
                              onChange={(e) =>
                                setMinimumOrderType(
                                  e.target.value as MinimumOrderType
                                )
                              }
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                            >
                              <option value="quantity">Quantity / pcs</option>
                              <option value="amount">Amount / RM</option>
                            </select>
                            <p className="mt-2 text-xs text-slate-500">
                              Pilih Quantity untuk kes seperti ais krim minimum
                              10 pcs. Pilih Amount untuk minimum nilai order.
                            </p>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Minimum Value
                            </label>
                            <input
                              type="number"
                              min="0"
                              step={
                                minimumOrderType === 'amount' ? '0.01' : '1'
                              }
                              placeholder={
                                minimumOrderType === 'amount'
                                  ? 'Contoh: 20.00'
                                  : 'Contoh: 10'
                              }
                              value={minimumOrderValue}
                              onChange={(e) =>
                                setMinimumOrderValue(e.target.value)
                              }
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Message to Customer
                            </label>
                            <textarea
                              placeholder="Contoh: Boleh campur-campur minimum 10 pcs."
                              value={minimumOrderMessage}
                              onChange={(e) =>
                                setMinimumOrderMessage(e.target.value)
                              }
                              rows={3}
                              className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                              Optional. Kalau kosong, sistem akan guna mesej
                              default.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-slate-900">
                      Order Availability
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        temporarilyClosed
                          ? 'bg-rose-100 text-rose-700'
                          : orderMode === 'preorder'
                          ? 'bg-violet-100 text-violet-700'
                          : orderMode === 'anytime'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {temporarilyClosed
                        ? 'Temporarily Closed'
                        : orderMode === 'anytime'
                        ? 'Open Anytime'
                        : orderMode === 'preorder'
                        ? 'Pre-order'
                        : 'By Day Schedule'}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">
                      Current Status
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {availabilityStatusText}
                    </p>

                    {orderMode === 'scheduled' && enabledDayChips.length > 0 ? (
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

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Cara Kedai Menerima Order
                      </label>
                      <select
                        value={orderMode}
                        onChange={(e) =>
                          setOrderMode(e.target.value as OrderMode)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      >
                        {ORDER_MODE_OPTIONS.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-slate-500">
                        Pilih sama ada kedai dibuka 24 jam, ikut waktu operasi,
                        atau pre-order.
                      </p>
                    </div>

                    {orderMode === 'preorder' ? (
                      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Order Awal (Hari)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={preorderDays}
                          onChange={(e) => setPreorderDays(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Contoh: 1 bermaksud customer perlu order
                          sekurang-kurangnya 1 hari awal.
                        </p>
                      </div>
                    ) : null}

                    {orderMode === 'scheduled' ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3">
                          <p className="text-sm font-bold text-slate-900">
                            Set by day
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Seller boleh pilih hari buka dan waktu operasi untuk
                            setiap hari.
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
                                        updateOperatingDay(day, {
                                          enabled: e.target.checked,
                                        })
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
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                      />

                                      <input
                                        type="time"
                                        value={item.closing_time}
                                        onChange={(e) =>
                                          updateOperatingDay(day, {
                                            closing_time: e.target.value,
                                          })
                                        }
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
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

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <input
                        type="checkbox"
                        checked={temporarilyClosed}
                        onChange={(e) => setTemporarilyClosed(e.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Tutup Sementara
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Override semua setting order dan paparkan kedai
                          sebagai ditutup sementara.
                        </p>
                      </div>
                    </label>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Mesej Bila Kedai Tutup
                      </label>
                      <textarea
                        placeholder="Contoh: Kedai kini ditutup. Tempahan dibuka semula esok."
                        value={closedMessage}
                        onChange={(e) => setClosedMessage(e.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Mesej ini dipaparkan kepada customer apabila kedai tidak
                        menerima order.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || detectingLocation}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving
                    ? 'Saving...'
                    : detectingLocation
                    ? 'Detecting location...'
                    : 'Save Settings'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                Account
              </h2>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-700">Login Email</p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {accountEmail || '-'}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm font-extrabold text-slate-900">
                  Change Password
                </p>

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
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                Session
              </h2>

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
