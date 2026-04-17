'use client'

import Layout from '../../components/Layout'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'
  | 'distance_based'

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

type OperatingDay = {
  enabled: boolean
  open: string
  close: string
}

type OperatingHours = Record<DayKey, OperatingDay>

type SellerProfileRow = {
  id: string
  user_id: string
  store_name?: string | null
  shop_slug?: string | null
  email?: string | null
  whatsapp?: string | null
  profile_image?: string | null
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
  operating_hours?: OperatingHours | null
  temporarily_closed?: boolean | null
}

type ProductRow = {
  id: string
  seller_profile_id?: string | null
  name?: string | null
  slug?: string | null
  is_active?: boolean | null
  price?: number | null
}

const DELIVERY_MODES = [
  {
    value: 'free_delivery',
    label: 'Free Delivery',
    desc: 'Sesuai kalau anda nak bagi delivery percuma untuk customer.',
  },
  {
    value: 'fixed_fee',
    label: 'Delivery Fee (Fixed)',
    desc: 'Contoh: RM5 untuk semua order.',
  },
  {
    value: 'pay_rider_separately',
    label: 'Pay Rider Separately',
    desc: 'Customer atau seller urus bayaran rider secara berasingan.',
  },
  {
    value: 'distance_based',
    label: 'Distance Based',
    desc: 'Caj delivery dikira berdasarkan jarak.',
  },
] as const

const DAY_OPTIONS: Array<{ key: DayKey; label: string }> = [
  { key: 'monday', label: 'Isnin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Khamis' },
  { key: 'friday', label: 'Jumaat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Ahad' },
]

function getDefaultOperatingHours(): OperatingHours {
  return {
    monday: { enabled: true, open: '08:00', close: '22:00' },
    tuesday: { enabled: true, open: '08:00', close: '22:00' },
    wednesday: { enabled: true, open: '08:00', close: '22:00' },
    thursday: { enabled: true, open: '08:00', close: '22:00' },
    friday: { enabled: true, open: '08:00', close: '22:00' },
    saturday: { enabled: true, open: '08:00', close: '22:00' },
    sunday: { enabled: true, open: '08:00', close: '22:00' },
  }
}

function normalizeOperatingHours(value: unknown): OperatingHours {
  const defaults = getDefaultOperatingHours()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaults
  }

  const source = value as Partial<Record<DayKey, Partial<OperatingDay>>>
  const next = { ...defaults }

  DAY_OPTIONS.forEach(({ key }) => {
    const row = source[key]
    if (!row || typeof row !== 'object') return

    next[key] = {
      enabled:
        typeof row.enabled === 'boolean' ? row.enabled : defaults[key].enabled,
      open:
        typeof row.open === 'string' && row.open.trim()
          ? row.open
          : defaults[key].open,
      close:
        typeof row.close === 'string' && row.close.trim()
          ? row.close
          : defaults[key].close,
    }
  })

  return next
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

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

async function generateUniqueProductSlug(
  base: string,
  sellerProfileId: string,
  productId?: string
) {
  const cleanBase = createSlug(base || 'product')
  let candidate = cleanBase || 'product'
  let counter = 1

  while (true) {
    let query = supabase
      .from('products')
      .select('id')
      .eq('seller_profile_id', sellerProfileId)
      .eq('slug', candidate)

    if (productId) {
      query = query.neq('id', productId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return candidate
    }

    counter += 1
    candidate = `${cleanBase}-${counter}`
  }
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

  const { data: inserted, error: insertError } = await supabase
    .from('seller_profiles')
    .insert({
      user_id: currentUserId,
      email: currentUserEmail || null,
      store_name: 'My Store',
      shop_slug: null,
      delivery_mode: null,
      delivery_fee: 0,
      delivery_area: null,
      delivery_note: null,
      delivery_radius_km: 10,
      delivery_rate_per_km: 1,
      delivery_min_fee: 5,
      pickup_address: null,
      latitude: null,
      longitude: null,
      operating_hours: getDefaultOperatingHours(),
      temporarily_closed: false,
    })
    .select('*')
    .single()

  if (insertError || !inserted) {
    throw new Error(insertError?.message || 'Failed to create seller profile')
  }

  return inserted as SellerProfileRow
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [sellerId, setSellerId] = useState<string | null>(null)

  const [step, setStep] = useState(1)

  const [storeName, setStoreName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [shopSlug, setShopSlug] = useState('')

  const [operatingHours, setOperatingHours] = useState<OperatingHours>(
    getDefaultOperatingHours()
  )

  const [deliveryMode, setDeliveryMode] =
    useState<DeliveryMode>('pay_rider_separately')
  const [deliveryFee, setDeliveryFee] = useState('5')
  const [deliveryArea, setDeliveryArea] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('10')
  const [deliveryRatePerKm, setDeliveryRatePerKm] = useState('1')
  const [deliveryMinFee, setDeliveryMinFee] = useState('5')
  const [pickupAddress, setPickupAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)

  const [existingProducts, setExistingProducts] = useState<ProductRow[]>([])
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productImage, setProductImage] = useState<File | null>(null)

  const [savingStep, setSavingStep] = useState(false)

  const livePreviewSlug = useMemo(() => {
    if (shopSlug) return shopSlug
    return slugify(storeName || 'your-shop')
  }, [shopSlug, storeName])

  const previewBaseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my').replace(/\/$/, '')

  const shopLink = useMemo(() => {
    if (!livePreviewSlug) return ''
    return `${previewBaseUrl}/s/${livePreviewSlug}`
  }, [previewBaseUrl, livePreviewSlug])

  const progressPercent = useMemo(() => {
    return (step / 5) * 100
  }, [step])

  const deliverySummaryText = useMemo(() => {
    const fee = Number(deliveryFee || 0)
    const rate = Number(deliveryRatePerKm || 0)
    const minFee = Number(deliveryMinFee || 0)
    const radius = Number(deliveryRadiusKm || 0)

    switch (deliveryMode) {
      case 'free_delivery':
        return 'Free delivery tersedia untuk customer anda.'
      case 'fixed_fee':
        return fee > 0
          ? `Delivery fee sebanyak ${formatCurrency(fee)} akan dikenakan.`
          : 'Delivery fee akan dikenakan.'
      case 'included_in_price':
        return 'Harga produk telah termasuk delivery.'
      case 'distance_based':
        return `Caj delivery ikut jarak. Kadar ${formatCurrency(
          rate
        )}/km, minimum ${formatCurrency(minFee)}, radius maksimum ${radius}km.`
      case 'pay_rider_separately':
      default:
        return 'Bayaran rider diurus secara berasingan.'
    }
  }, [deliveryMode, deliveryFee, deliveryRatePerKm, deliveryMinFee, deliveryRadiusKm])

  useEffect(() => {
    loadInitial()
  }, [])

  async function loadInitial() {
    setLoading(true)
    setPageError('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(authError.message)
      }

      if (!user) {
        window.location.href = '/login'
        return
      }

      const seller = await ensureSellerProfile(user.id, user.email || '')
      setSellerId(seller.id)

      const existingSlug = seller.shop_slug || ''
      const existingStoreName = seller.store_name || ''

      setStoreName(existingStoreName === 'My Store' ? '' : existingStoreName)
      setWhatsapp(seller.whatsapp || '')
      setProfileImage(seller.profile_image || '')
      setShopSlug(existingSlug)

      setOperatingHours(normalizeOperatingHours(seller.operating_hours))

      setDeliveryMode(seller.delivery_mode || 'pay_rider_separately')
      setDeliveryFee(String(seller.delivery_fee ?? 5))
      setDeliveryArea(seller.delivery_area || '')
      setDeliveryNote(seller.delivery_note || '')
      setDeliveryRadiusKm(String(seller.delivery_radius_km ?? 10))
      setDeliveryRatePerKm(String(seller.delivery_rate_per_km ?? 1))
      setDeliveryMinFee(String(seller.delivery_min_fee ?? 5))
      setPickupAddress(seller.pickup_address || '')
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

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, seller_profile_id, name, slug, is_active, price')
        .eq('seller_profile_id', seller.id)
        .order('created_at', { ascending: false })

      if (productError) {
        throw new Error(productError.message)
      }

      const existing = (productData || []) as ProductRow[]
      setExistingProducts(existing)

      const hasStoreName = Boolean(existingStoreName && existingStoreName !== 'My Store')
      const hasWhatsapp = Boolean(seller.whatsapp?.trim())
      const hasShopSlug = Boolean(existingSlug?.trim())
      const hasOperatingHours = Boolean(seller.operating_hours)
      const hasDeliveryMode = Boolean(seller.delivery_mode)
      const hasProduct = existing.some((p) => p.is_active)

      if (!hasStoreName || !hasWhatsapp || !hasShopSlug) {
        setStep(1)
      } else if (!hasOperatingHours) {
        setStep(2)
      } else if (!hasDeliveryMode) {
        setStep(3)
      } else if (!hasProduct) {
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
    if (!sellerId) {
      throw new Error('Seller profile not ready yet.')
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `seller-${sellerId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function uploadProductImage(file: File, slug: string) {
    if (!sellerId) {
      throw new Error('Seller profile not ready yet.')
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${sellerId}/${slug}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        upsert: true,
      })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
    return data.publicUrl
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
      setPickupAddress(nextAddress)

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

  function updateOperatingDay(
    day: DayKey,
    updates: Partial<OperatingDay>
  ) {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...updates,
      },
    }))
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
        shopSlug || (await generateUniqueShopSlug(trimmedStoreName, sellerId))

      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: trimmedStoreName,
          whatsapp: trimmedWhatsapp,
          profile_image: profileImage || null,
          shop_slug: finalShopSlug,
        })
        .eq('id', sellerId)

      if (error) {
        throw new Error(error.message)
      }

      setShopSlug(finalShopSlug)
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

    const enabledDays = DAY_OPTIONS.filter(({ key }) => operatingHours[key].enabled)

    if (enabledDays.length === 0) {
      alert('Pilih sekurang-kurangnya satu hari operasi.')
      return
    }

    for (const { key, label } of DAY_OPTIONS) {
      const row = operatingHours[key]
      if (!row.enabled) continue

      if (!row.open || !row.close) {
        alert(`Sila lengkapkan waktu operasi untuk ${label}.`)
        return
      }

      if (row.open === row.close) {
        alert(`Waktu buka dan tutup untuk ${label} tidak boleh sama.`)
        return
      }
    }

    setSavingStep(true)

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          operating_hours: operatingHours,
        })
        .eq('id', sellerId)

      if (error) {
        throw new Error(error.message)
      }

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

    let parsedLatitude = latitude.trim() === '' ? null : Number(latitude)
    let parsedLongitude = longitude.trim() === '' ? null : Number(longitude)
    let finalPickupAddress = pickupAddress.trim()

    if (deliveryMode === 'fixed_fee' && (!Number.isFinite(parsedDeliveryFee) || parsedDeliveryFee <= 0)) {
      alert('Sila masukkan delivery fee yang sah.')
      return
    }

    if (deliveryMode === 'distance_based') {
      if (!Number.isFinite(parsedDeliveryRadiusKm) || parsedDeliveryRadiusKm <= 0) {
        alert('Sila masukkan max radius yang sah.')
        return
      }

      if (!Number.isFinite(parsedDeliveryRatePerKm) || parsedDeliveryRatePerKm <= 0) {
        alert('Sila masukkan kadar RM/km yang sah.')
        return
      }

      if (!Number.isFinite(parsedDeliveryMinFee) || parsedDeliveryMinFee < 0) {
        alert('Sila masukkan minimum fee yang sah.')
        return
      }

      if (!finalPickupAddress) {
        alert('Pickup address diperlukan untuk distance based delivery.')
        return
      }

      const geocoded = await detectPickupLocation()
      if (!geocoded) return

      parsedLatitude = geocoded.latitude
      parsedLongitude = geocoded.longitude
      finalPickupAddress = geocoded.formattedAddress
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
            deliveryMode === 'distance_based' ? finalPickupAddress : null,
          latitude:
            deliveryMode === 'distance_based' ? parsedLatitude : null,
          longitude:
            deliveryMode === 'distance_based' ? parsedLongitude : null,
        })
        .eq('id', sellerId)

      if (error) {
        throw new Error(error.message)
      }

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

    const hasExistingActive = existingProducts.some((p) => p.is_active)
    if (hasExistingActive) {
      setStep(5)
      return
    }

    if (!productName.trim()) {
      alert('Nama produk diperlukan.')
      return
    }

    if (!productPrice.trim()) {
      alert('Harga produk diperlukan.')
      return
    }

    if (!productImage) {
      alert('Gambar produk diperlukan.')
      return
    }

    setSavingStep(true)

    try {
      const finalSlug = await generateUniqueProductSlug(productName.trim(), sellerId)

      let uploadedImageUrl: string | null = null

      if (productImage) {
        uploadedImageUrl = await uploadProductImage(productImage, finalSlug)
      }

      const { error } = await supabase.from('products').insert({
        name: productName.trim(),
        slug: finalSlug,
        description: productDescription.trim() || '',
        price: Number(productPrice),
        is_active: true,
        track_stock: false,
        stock_quantity: 0,
        sold_out: false,
        seller_profile_id: sellerId,
        image_1: uploadedImageUrl,
      })

      if (error) {
        throw new Error(error.message)
      }

      setStep(5)

      const { data: productData } = await supabase
        .from('products')
        .select('id, seller_profile_id, name, slug, is_active, price')
        .eq('seller_profile_id', sellerId)
        .order('created_at', { ascending: false })

      setExistingProducts((productData || []) as ProductRow[])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create first product.'
      alert(message)
    } finally {
      setSavingStep(false)
    }
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

  async function copyShopLink() {
    if (!shopLink) {
      alert('Shop link not ready yet.')
      return
    }

    try {
      await navigator.clipboard.writeText(shopLink)
      alert('Shop link copied')
    } catch {
      alert('Unable to copy link')
    }
  }

  function shareShopToWhatsApp() {
    if (!shopLink) {
      alert('Shop link not ready yet.')
      return
    }

    const text = `${storeName || 'Kedai saya'}\n\nOrder di sini:\n${shopLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
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
                Ikut langkah ini satu per satu. Bila siap, anda boleh terus kongsi link kedai dan mula terima order.
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
            <StepPill active={step >= 1} label="Maklumat" />
            <StepPill active={step >= 2} label="Waktu" />
            <StepPill active={step >= 3} label="Delivery" />
            <StepPill active={step >= 4} label="Produk" />
            <StepPill active={step >= 5} label="Siap" />
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
                Mulakan dengan nama kedai, nombor WhatsApp, dan logo jika ada.
              </p>
            </div>

            <div className="grid gap-5">
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
                  Logo Kedai (Optional)
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Preview Shop URL
                </p>
                <p className="mt-1 break-all text-sm font-bold text-slate-900">
                  {shopLink || `${previewBaseUrl}/s/your-shop`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  URL kedai akan dijana automatik berdasarkan nama kedai anda.
                </p>
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
                Pilih hari anda buka dan tetapkan waktu untuk terima tempahan.
              </p>
            </div>

            <div className="grid gap-3">
              {DAY_OPTIONS.map(({ key, label }) => {
                const row = operatingHours[key]

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          id={`day-${key}`}
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) =>
                            updateOperatingDay(key, { enabled: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor={`day-${key}`}
                          className="text-sm font-bold text-slate-900"
                        >
                          {label}
                        </label>
                      </div>

                      {row.enabled ? (
                        <div className="grid grid-cols-2 gap-2 sm:w-auto">
                          <input
                            type="time"
                            value={row.open}
                            onChange={(e) =>
                              updateOperatingDay(key, { open: e.target.value })
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          />
                          <input
                            type="time"
                            value={row.close}
                            onChange={(e) =>
                              updateOperatingDay(key, { close: e.target.value })
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          Tutup
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">
                Temporary Close
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Kalau ada emergency atau perlu tutup sekejap, anda boleh guna fungsi
                temporary close kemudian di Settings / Dashboard.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
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
        ) : null}

        {step === 3 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">Step 3</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Tetapan Delivery
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pilih cara delivery yang paling sesuai untuk kedai anda.
              </p>
            </div>

            <div className="grid gap-3">
              {DELIVERY_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setDeliveryMode(mode.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    deliveryMode === mode.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900">{mode.label}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{mode.desc}</div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-700">Preview</p>
              <p className="mt-1 text-sm text-slate-600">{deliverySummaryText}</p>
            </div>

            <div className="mt-5 grid gap-4">
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
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Rate Per KM (RM)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deliveryRatePerKm}
                      onChange={(e) => setDeliveryRatePerKm(e.target.value)}
                      placeholder="Contoh: 1.00"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Minimum Delivery Fee (RM)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deliveryMinFee}
                      onChange={(e) => setDeliveryMinFee(e.target.value)}
                      placeholder="Contoh: 5.00"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
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
                      placeholder="Contoh: 10"
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
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Delivery Area (Optional)
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
                  Delivery Note (Optional)
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Caj rider dibayar berasingan."
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
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
                {savingStep ? 'Saving...' : 'Simpan & Teruskan'}
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">Step 4</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Tambah Produk Pertama
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tambah sekurang-kurangnya satu produk supaya anda boleh mula terima order.
              </p>
            </div>

            {existingProducts.some((p) => p.is_active) ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-900">
                  Produk aktif sudah wujud
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Kedai anda sudah ada produk aktif. Anda boleh teruskan ke langkah seterusnya atau tambah lagi produk kemudian.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
                  >
                    Teruskan
                  </button>

                  <button
                    type="button"
                    onClick={goToProducts}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    Buka Products Page
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nama Produk
                  </label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Contoh: Nasi Lemak Ayam"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Harga (RM)
                  </label>
                  <input
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Description (Optional)
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Sedap, panas, dan sesuai untuk lunch."
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Gambar Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Untuk onboarding pertama, gambar produk diwajibkan.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <strong className="text-slate-900">Tip:</strong> Anda boleh tambah kategori, gambar tambahan, stock tracking, dan add-on kemudian di page Products.
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
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
                    {savingStep ? 'Saving...' : 'Cipta Produk & Teruskan'}
                  </button>
                </div>
              </div>
            )}
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
                Kedai anda dah siap
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tahniah! Sekarang anda dah boleh kongsi link kedai dan mula terima order.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Link Kedai Anda
              </p>
              <p className="mt-1 break-all text-sm font-bold text-slate-900">
                {shopLink || '-'}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={copyShopLink}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Copy Link
              </button>

              <button
                type="button"
                onClick={shareShopToWhatsApp}
                className="rounded-2xl bg-green-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-600"
              >
                Share WhatsApp
              </button>

              <button
                type="button"
                onClick={goToDashboard}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                Masuk Dashboard
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-900">Next best step</p>
              <p className="mt-1 text-sm text-blue-800">
                Lepas ini anda boleh tambah lagi menu, edit gambar, set stock, dan urus order dari dashboard.
              </p>
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
