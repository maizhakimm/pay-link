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
] as const

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

  if (!value || typeof value !== 'object') return safe

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

  const rangeText = max === null ? `${min}km ke atas` : `${min}km - ${max}km`
  const rateText =
    rule.rate_type === 'flat'
      ? `${formatCurrency(value)} flat`
      : `${formatCurrency(value)}/km`

  return `${rangeText} → ${rateText}`
}

function getImageUrl(path?: string | null) {
  if (!path) return ''

  const trimmed = path.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return trimmed

  const cleanPath = trimmed
    .replace(/^storage\/v1\/object\/public\//, '')
    .replace(/^\/+/, '')

  return `${baseUrl}/storage/v1/object/public/${cleanPath}`
}

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [savingStep, setSavingStep] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

  const [step, setStep] = useState(1)
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState('')

  const [storeName, setStoreName] = useState('')
  const [savedShopSlug, setSavedShopSlug] = useState('')
  const [slugLocked, setSlugLocked] = useState(false)
  const [shopDescription, setShopDescription] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyReg, setCompanyReg] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [profileImage, setProfileImage] = useState('')

  const [orderMode, setOrderMode] = useState<OrderMode>('scheduled')
  const [preorderDays, setPreorderDays] = useState('1')
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

  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

  const previewBaseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my'
  ).replace(/\/$/, '')

  const livePreviewSlug = useMemo(() => {
    if (slugLocked && savedShopSlug) return savedShopSlug
    return slugify(storeName || 'your-shop')
  }, [slugLocked, savedShopSlug, storeName])

  const shopLink = useMemo(() => {
    return `${previewBaseUrl}/s/${livePreviewSlug}`
  }, [previewBaseUrl, livePreviewSlug])

  const progressPercent = useMemo(() => {
    return (step / 5) * 100
  }, [step])

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

        return `Caj delivery ikut jarak bertingkat. ${activeRules
          .slice(0, 3)
          .map(formatRuleText)
          .join(' • ')}${activeRules.length > 3 ? ' • ...' : ''}`
      case 'pay_rider_separately':
      default:
        return 'Caj delivery tidak termasuk dalam harga. Bayaran delivery dibuat terus kepada rider.'
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
    loadInitial()
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

  function updateDeliveryRule(index: number, patch: Partial<DeliveryPricingRule>) {
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

    const { data: inserted, error: insertError } = await supabase
      .from('seller_profiles')
      .insert({
        user_id: currentUserId,
        email: currentUserEmail || null,
        store_name: 'My Store',
        shop_slug: null,
        shop_description: null,
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

  async function loadInitial() {
    setLoading(true)
    setPageError('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw new Error(authError.message)

      if (!user) {
        window.location.href = '/login'
        return
      }

      setUserId(user.id)
      setAccountEmail(user.email || '')

      const seller = await ensureSellerProfile(user.id, user.email || '')
      setSellerId(seller.id)

      const existingSlug = seller.shop_slug || ''
      const existingStoreName = seller.store_name || ''
      const isDefaultName = existingStoreName === 'My Store'

      const derivedOrderMode: OrderMode =
        seller.order_mode ||
        (seller.accept_orders_anytime ? 'anytime' : 'scheduled')

      setStoreName(!existingSlug && isDefaultName ? '' : existingStoreName)
      setSavedShopSlug(existingSlug)
      setSlugLocked(Boolean(existingSlug))
      setShopDescription(seller.shop_description || '')
      setEmail(seller.email || user.email || '')
      setWhatsapp(seller.whatsapp || '')
      setCompanyName(seller.company_name || '')
      setCompanyReg(seller.company_registration || '')
      setBusinessAddress(seller.business_address || '')
      setProfileImage(seller.profile_image || '')

      setOrderMode(derivedOrderMode)
      setPreorderDays(String(seller.preorder_days ?? 1))
      setTemporarilyClosed(Boolean(seller.temporarily_closed))
      setClosedMessage(
        seller.closed_message ||
          'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.'
      )
      setOperatingDays(normalizeOperatingDays(seller.operating_days))

      const loadedDeliveryMode =
        seller.delivery_mode === 'included_in_price'
          ? 'free_delivery'
          : seller.delivery_mode || 'pay_rider_separately'

      setDeliveryMode(loadedDeliveryMode)
      setDeliveryFee(String(seller.delivery_fee ?? 0))
      setDeliveryArea(seller.delivery_area || '')
      setDeliveryNote(seller.delivery_note || '')
      setDeliveryRadiusKm(String(seller.delivery_radius_km ?? 30))
      setDeliveryRatePerKm(String(seller.delivery_rate_per_km ?? 1))
      setDeliveryMinFee(String(seller.delivery_min_fee ?? 5))
      setPickupAddress(seller.pickup_address || '')
      setResolvedPickupAddress(seller.pickup_address || '')
      setLatitude(
        seller.latitude !== null && seller.latitude !== undefined
          ? String(seller.latitude)
          : ''
      )
      setLongitude(
        seller.longitude !== null && seller.longitude !== undefined
          ? String(seller.longitude)
          : ''
      )

      await loadDeliveryPricingRules(seller.id)

      setMinimumOrderEnabled(Boolean(seller.minimum_order_enabled))
      setMinimumOrderType(
        seller.minimum_order_type === 'amount' ? 'amount' : 'quantity'
      )
      setMinimumOrderValue(String(seller.minimum_order_value ?? 0))
      setMinimumOrderMessage(seller.minimum_order_message || '')

      setBankName(seller.bank_name || '')
      setAccountNumber(seller.account_number || '')
      setAccountHolderName(seller.account_holder_name || '')

      const hasStoreName = Boolean(existingStoreName && existingStoreName !== 'My Store')
      const hasWhatsapp = Boolean(seller.whatsapp?.trim())
      const hasShopSlug = Boolean(existingSlug?.trim())
      const hasOperatingDays = Boolean(seller.operating_days)
      const hasDeliveryMode = Boolean(seller.delivery_mode)
      const hasBank = Boolean(
        seller.bank_name?.trim() &&
          seller.account_number?.trim() &&
          seller.account_holder_name?.trim()
      )

      if (!hasStoreName || !hasWhatsapp || !hasShopSlug) {
        setStep(1)
      } else if (!hasOperatingDays) {
        setStep(2)
      } else if (!hasDeliveryMode) {
        setStep(3)
      } else if (!hasBank) {
        setStep(4)
      } else {
        setStep(5)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load onboarding.'
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadProfileLogo(file: File) {
    if (!sellerId) throw new Error('Seller profile not ready yet.')

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `seller-${sellerId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleLogoChange(file: File | null) {
    if (!file) return

    try {
      setSavingStep(true)
      const publicUrl = await uploadProfileLogo(file)
      setProfileImage(publicUrl)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload logo.'
      alert(message)
    } finally {
      setSavingStep(false)
    }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: trimmedPickupAddress }),
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
    if (deliveryMode !== 'distance_based') return

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

    if (deleteError) throw new Error(deleteError.message)

    if (rows.length === 0) return

    const { error: insertError } = await supabase
      .from('delivery_pricing_rules')
      .insert(rows)

    if (insertError) throw new Error(insertError.message)
  }

  async function handleSaveStep1() {
    if (!sellerId) {
      alert('Seller profile not ready yet.')
      return
    }

    const trimmedStoreName = storeName.trim()
    const trimmedWhatsapp = whatsapp.trim()

    if (!trimmedStoreName) {
      alert('Nama kedai diperlukan.')
      return
    }

    if (!trimmedWhatsapp) {
      alert('Nombor WhatsApp diperlukan.')
      return
    }

    setSavingStep(true)

    try {
      const finalShopSlug =
        savedShopSlug || (await generateUniqueShopSlug(trimmedStoreName, sellerId))

      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: trimmedStoreName,
          shop_description: shopDescription.trim() || null,
          email: email.trim() || accountEmail || null,
          whatsapp: trimmedWhatsapp,
          company_name: companyName.trim() || null,
          company_registration: companyReg.trim() || null,
          business_address: businessAddress.trim() || null,
          profile_image: profileImage || null,
          shop_slug: finalShopSlug,
        })
        .eq('id', sellerId)

      if (error) throw new Error(error.message)

      setStoreName(trimmedStoreName)
      setSavedShopSlug(finalShopSlug)
      setSlugLocked(true)
      setStep(2)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save store info.'
      alert(message)
    } finally {
      setSavingStep(false)
    }
  }

  async function handleSaveStep2() {
    if (!sellerId) {
      alert('Seller profile not ready yet.')
      return
    }

    const parsedPreorderDays = Number(preorderDays || 1)

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
          alert(`${DAY_LABELS[day]} opening time and closing time cannot be the same.`)
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

    setSavingStep(true)

    try {
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
          order_mode: orderMode,
          preorder_days: orderMode === 'preorder' ? parsedPreorderDays : 1,
          accept_orders_anytime: orderMode === 'anytime',
          opening_time: orderMode === 'scheduled' ? fallbackOpening : null,
          closing_time: orderMode === 'scheduled' ? fallbackClosing : null,
          temporarily_closed: temporarilyClosed,
          closed_message:
            closedMessage.trim() ||
            'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.',
          operating_days: orderMode === 'scheduled' ? operatingDays : null,
        })
        .eq('id', sellerId)

      if (error) throw new Error(error.message)

      setStep(3)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save operating hours.'
      alert(message)
    } finally {
      setSavingStep(false)
    }
  }

  async function handleSaveStep3() {
    if (!sellerId) {
      alert('Seller profile not ready yet.')
      return
    }

    const parsedDeliveryFee = Number(deliveryFee || 0)
    const parsedDeliveryRadiusKm = Number(deliveryRadiusKm || 0)
    const parsedDeliveryRatePerKm = Number(deliveryRatePerKm || 0)
    const parsedDeliveryMinFee = Number(deliveryMinFee || 0)
    const parsedMinimumOrderValue = Number(minimumOrderValue || 0)

    let parsedLatitude = latitude.trim() === '' ? null : Number(latitude)
    let parsedLongitude = longitude.trim() === '' ? null : Number(longitude)
    let trimmedPickupAddress = pickupAddress.trim()

    if (!Number.isFinite(parsedDeliveryFee) || parsedDeliveryFee < 0) {
      alert('Please enter a valid delivery fee.')
      return
    }

    if (deliveryMode === 'fixed_fee' && parsedDeliveryFee <= 0) {
      alert('Please enter delivery fee more than 0.')
      return
    }

    if (minimumOrderEnabled) {
      if (!Number.isFinite(parsedMinimumOrderValue) || parsedMinimumOrderValue <= 0) {
        alert('Please enter minimum order value more than 0.')
        return
      }
    }

    if (deliveryMode === 'distance_based') {
      if (!validateDeliveryPricingRules()) return

      if (!Number.isFinite(parsedDeliveryRadiusKm) || parsedDeliveryRadiusKm <= 0) {
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

    setSavingStep(true)

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          delivery_mode: deliveryMode,
          delivery_fee: deliveryMode === 'fixed_fee' ? parsedDeliveryFee : 0,
          delivery_area: deliveryArea.trim() || null,
          delivery_note: deliveryNote.trim() || null,

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
          minimum_order_value: minimumOrderEnabled ? parsedMinimumOrderValue : 0,
          minimum_order_message: minimumOrderMessage.trim() || null,
        })
        .eq('id', sellerId)

      if (error) throw new Error(error.message)

      await saveDeliveryPricingRules(sellerId)

      setPickupAddress(trimmedPickupAddress)
      setResolvedPickupAddress(trimmedPickupAddress)
      setStep(4)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save delivery.'
      alert(message)
    } finally {
      setSavingStep(false)
    }
  }

  async function handleSaveStep4() {
    if (!sellerId) {
      alert('Seller profile not ready yet.')
      return
    }

    if (!bankName) {
      alert('Sila pilih bank.')
      return
    }

    if (!accountNumber.trim()) {
      alert('Sila masukkan nombor akaun bank.')
      return
    }

    if (!accountHolderName.trim()) {
      alert('Sila masukkan nama pemegang akaun.')
      return
    }

    setSavingStep(true)

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          bank_name: bankName,
          account_number: accountNumber.trim(),
          account_holder_name: accountHolderName.trim(),
        })
        .eq('id', sellerId)

      if (error) throw new Error(error.message)

      setStep(5)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save payout details.'
      alert(message)
    } finally {
      setSavingStep(false)
    }
  }

  function handleBack() {
    if (step <= 1) return
    setStep((prev) => prev - 1)
  }

  function goToDashboard() {
    window.location.href = '/dashboard'
  }

  function goToProducts() {
    window.location.href = '/dashboard/products'
  }

  if (loading) {
    return <Layout>Loading...</Layout>
  }

  if (pageError) {
    return (
      <Layout>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">{pageError}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">Setup Kedai Anda</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Jom siapkan BayarLink anda
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Siapkan maklumat asas kedai dahulu. Produk boleh ditambah selepas onboarding.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right sm:block">
              <div className="text-xs uppercase tracking-wide text-slate-500">Step</div>
              <div className="text-lg font-extrabold text-slate-900">{step} / 5</div>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2 text-center text-[11px] sm:text-xs">
            <StepPill active={step >= 1} label="Kedai" />
            <StepPill active={step >= 2} label="Waktu" />
            <StepPill active={step >= 3} label="Delivery" />
            <StepPill active={step >= 4} label="Bank" />
            <StepPill active={step >= 5} label="Next" />
          </div>
        </div>

        {step === 1 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">Step 1</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Maklumat Kedai
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Masukkan identiti asas kedai anda.
              </p>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Logo Kedai
                </label>

                <div className="flex items-center gap-4">
                  {profileImage ? (
                    <img
                      src={getImageUrl(profileImage)}
                      alt="Store logo"
                      className="h-20 w-20 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500">
                      No Logo
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Nama Kedai
                </label>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Dana Kitchen"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Shop Description
                </label>
                <textarea
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="Contoh: Kek batik homemade, kurang manis, sesuai untuk gift & event."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Max 160 huruf. Ringkas dan mudah customer faham.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Nombor WhatsApp
                </label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 0123456789"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email kedai / seller"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Preview Shop URL
                </p>
                <p className="mt-1 break-all text-sm font-bold text-slate-900">
                  {shopLink}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  URL akan dikunci selepas setup pertama berjaya.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                  />

                  <input
                    placeholder="Company Registration No"
                    value={companyReg}
                    onChange={(e) => setCompanyReg(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                  />

                  <textarea
                    placeholder="Business Address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveStep1}
                  disabled={savingStep}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingStep ? 'Saving...' : 'Simpan & Teruskan'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">Step 2</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Waktu Operasi
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tetapkan cara kedai menerima order.
              </p>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Cara Kedai Menerima Order
                </label>
                <select
                  value={orderMode}
                  onChange={(e) => setOrderMode(e.target.value as OrderMode)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {ORDER_MODE_OPTIONS.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
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
                </div>
              ) : null}

              {orderMode === 'scheduled' ? (
                <div className="grid gap-3">
                  {DAY_ORDER.map((day) => {
                    const item = operatingDays[day]

                    return (
                      <div
                        key={day}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                            <div className="grid grid-cols-2 gap-2 sm:w-[320px]">
                              <input
                                type="time"
                                value={item.opening_time}
                                onChange={(e) =>
                                  updateOperatingDay(day, {
                                    opening_time: e.target.value,
                                  })
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                              />
                              <input
                                type="time"
                                value={item.closing_time}
                                onChange={(e) =>
                                  updateOperatingDay(day, {
                                    closing_time: e.target.value,
                                  })
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
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
                    Override semua setting dan paparkan kedai sebagai ditutup sementara.
                  </p>
                </div>
              </label>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mesej Bila Kedai Tutup
                </label>
                <textarea
                  value={closedMessage}
                  onChange={(e) => setClosedMessage(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Kedai kini ditutup. Tempahan dibuka semula esok."
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSaveStep2}
                  disabled={savingStep}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingStep ? 'Saving...' : 'Simpan & Teruskan'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">Step 3</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Delivery & Minimum Order
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tetapkan cara penghantaran dan minimum order jika perlu.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-700">Preview</p>
                <p className="mt-1 text-sm text-slate-600">{deliverySummaryText}</p>
              </div>

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
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="Contoh: 5.00"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
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
                          Contoh: 0-5km RM5 flat, 5-10km RM1/km.
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
                                    rate_type: e.target.value as DeliveryRateType,
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
                      value={deliveryRadiusKm}
                      onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                      placeholder="Contoh: 30"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Pickup Address
                    </label>
                    <textarea
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      rows={3}
                      placeholder="Alamat pickup / lokasi kedai"
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={detectPickupLocation}
                      disabled={detectingLocation}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {detectingLocation ? 'Detecting...' : 'Detect Pickup Location'}
                    </button>

                    {latitude && longitude ? (
                      <div className="text-xs text-slate-600">
                        Latitude: <strong>{latitude}</strong> &nbsp;•&nbsp; Longitude:{' '}
                        <strong>{longitude}</strong>
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
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Delivery Area
                </label>
                <input
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                  placeholder="Contoh: Shah Alam, Subang, Klang"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Delivery Note
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Caj rider dibayar terus kepada rider."
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-slate-900">
                    Minimum Order
                  </p>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    Optional
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-700">Preview</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {minimumOrderSummaryText}
                  </p>
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={minimumOrderEnabled}
                    onChange={(e) => setMinimumOrderEnabled(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Enable Minimum Order
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Customer hanya boleh checkout bila cart cukup minimum order.
                    </p>
                  </div>
                </label>

                {minimumOrderEnabled ? (
                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Minimum Type
                      </label>
                      <select
                        value={minimumOrderType}
                        onChange={(e) =>
                          setMinimumOrderType(e.target.value as MinimumOrderType)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      >
                        <option value="quantity">Quantity / pcs</option>
                        <option value="amount">Amount / RM</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Minimum Value
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={minimumOrderType === 'amount' ? '0.01' : '1'}
                        value={minimumOrderValue}
                        onChange={(e) => setMinimumOrderValue(e.target.value)}
                        placeholder={
                          minimumOrderType === 'amount'
                            ? 'Contoh: 20.00'
                            : 'Contoh: 10'
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Message to Customer
                      </label>
                      <textarea
                        value={minimumOrderMessage}
                        onChange={(e) => setMinimumOrderMessage(e.target.value)}
                        rows={3}
                        placeholder="Contoh: Boleh campur-campur minimum 10 pcs."
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSaveStep3}
                  disabled={savingStep || detectingLocation}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingStep
                    ? 'Saving...'
                    : detectingLocation
                      ? 'Detecting...'
                      : 'Simpan & Teruskan'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">Step 4</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Bank / Payout
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Maklumat ini digunakan untuk payout kepada seller.
              </p>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Bank
                </label>
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Account Number
                </label>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Nombor akaun bank"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Account Holder Name
                </label>
                <input
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Nama seperti dalam akaun bank"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSaveStep4}
                  disabled={savingStep}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingStep ? 'Saving...' : 'Simpan & Teruskan'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                🎉
              </div>
              <p className="mt-4 text-sm font-semibold text-emerald-700">Step 5</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Setup asas selesai
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kedai hampir ready. Langkah seterusnya, tambah produk pertama supaya customer boleh mula order.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-900">Next step</p>
              <p className="mt-1 text-sm text-blue-800">
                Produk tidak dimasukkan dalam onboarding supaya seller boleh setup dengan lebih lengkap di Product Page.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={goToProducts}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                Tambah Produk Pertama
              </button>

              <button
                type="button"
                onClick={goToDashboard}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Masuk Dashboard
              </button>
            </div>

            <div className="mt-6 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Back
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`rounded-full px-3 py-2 font-semibold ${
        active ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {label}
    </div>
  )
}
