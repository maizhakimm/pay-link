'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ShopPayButton from './ShopPayButton'

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

type OperatingDayItem = {
  enabled: boolean
  opening_time: string
  closing_time: string
}

type OperatingDays = Record<DayKey, OperatingDayItem>

type OrderMode = 'anytime' | 'scheduled' | 'preorder'

type ProductAddonOption = {
  id: string
  addon_group_id: string
  product_id: string
  seller_profile_id: string
  name: string
  price_delta: number
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

type ProductAddonGroup = {
  id: string
  product_id: string
  seller_profile_id: string
  name: string
  selection_type: 'single' | 'multiple'
  is_required: boolean
  min_select: number
  max_select: number | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  options: ProductAddonOption[]
}

type ProductAddonsMap = Record<string, ProductAddonGroup[]>

type SellerProfile = {
  id: string
  store_name: string | null
  profile_image?: string | null
  email?: string | null
  whatsapp?: string | null
  business_address?: string | null
  accept_orders_anytime?: boolean | null
  opening_time?: string | null
  closing_time?: string | null
  temporarily_closed?: boolean | null
  closed_message?: string | null
  operating_days?: OperatingDays | null
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
  order_mode?: OrderMode | null
  preorder_days?: number | null
}

type MenuCategory = {
  id: string
  name: string
  sort_order?: number | null
  is_active?: boolean | null
}

type ProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
  is_active?: boolean | null
  seller_profile_id?: string | null
  track_stock?: boolean
  stock_quantity?: number
  sold_out?: boolean
  menu_category_id?: string | null
}

type GalleryState = {
  isOpen: boolean
  images: string[]
  productName: string
  currentIndex: number
}

type CartAddon = {
  group_id: string
  group_name: string
  option_id: string
  option_name: string
  price: number
}

type CartLine = {
  id: string
  product_id: string
  name: string
  base_price: number
  quantity: number
  addons: CartAddon[]
  note?: string
  unit_price: number
  line_total: number
}

const DAY_KEYS_SUNDAY_FIRST: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const DAY_LABELS_MY: Record<DayKey, string> = {
  sunday: 'Ahad',
  monday: 'Isnin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Khamis',
  friday: 'Jumaat',
  saturday: 'Sabtu',
}

function getImageUrl(path?: string | null) {
  if (!path) return ''

  const trimmed = path.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return trimmed

  let cleanPath = trimmed
    .replace(/^storage\/v1\/object\/public\//, '')
    .replace(/^\/+/, '')

  const knownBuckets = ['product-images', 'product-assets']

  if (!knownBuckets.some((bucket) => cleanPath.startsWith(`${bucket}/`))) {
    cleanPath = `product-images/${cleanPath}`
  }

  return `${baseUrl}/storage/v1/object/public/${cleanPath}`
}

function getProductImages(product: ProductRow) {
  return [
    product.image_1,
    product.image_2,
    product.image_3,
    product.image_4,
    product.image_5,
  ].filter(Boolean) as string[]
}

function getFirstImage(product: ProductRow) {
  return (
    product.image_1 ||
    product.image_2 ||
    product.image_3 ||
    product.image_4 ||
    product.image_5 ||
    ''
  )
}

function formatTime(value?: string | null) {
  if (!value) return ''

  const [hourString, minuteString] = value.split(':')
  const hour = Number(hourString)
  const minute = Number(minuteString || '0')

  if (Number.isNaN(hour) || Number.isNaN(minute)) return value

  const period = hour >= 12 ? 'PM' : 'AM'
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12
  const normalizedMinute = minute.toString().padStart(2, '0')

  return `${normalizedHour}:${normalizedMinute} ${period}`
}

function getTodayKey(date = new Date()): DayKey {
  return DAY_KEYS_SUNDAY_FIRST[date.getDay()]
}

function getMinutesFromTime(value?: string | null) {
  if (!value || !value.includes(':')) return null

  const [hourString, minuteString] = value.split(':')
  const hour = Number(hourString)
  const minute = Number(minuteString)

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null

  return hour * 60 + minute
}

function formatCurrency(amount?: number | null) {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(Number(amount || 0))
}

function getDeliverySummary(seller: SellerProfile) {
  const fee = Number(seller.delivery_fee || 0)
  const rate = Number(seller.delivery_rate_per_km || 0)
  const minFee = Number(seller.delivery_min_fee || 0)
  const radius = Number(seller.delivery_radius_km || 0)

  switch (seller.delivery_mode) {
    case 'free_delivery':
      return 'Free delivery tersedia untuk kawasan terpilih.'
    case 'fixed_fee':
      return fee > 0
        ? `Delivery fee sebanyak ${formatCurrency(fee)} akan dikenakan jika customer pilih delivery.`
        : 'Delivery fee akan dikenakan jika customer pilih delivery.'
    case 'included_in_price':
      return 'Harga produk telah termasuk delivery.'
    case 'distance_based':
      return `Caj delivery dikira ikut jarak. Kadar ${formatCurrency(
        rate
      )}/km, minimum ${formatCurrency(minFee)}, radius maksimum ${radius}km.`
    case 'pay_rider_separately':
    default:
      return 'Bayaran delivery dibuat berasingan terus kepada rider.'
  }
}

function getEffectiveOrderMode(seller: SellerProfile): OrderMode {
  if (seller.order_mode === 'anytime') return 'anytime'
  if (seller.order_mode === 'preorder') return 'preorder'
  if (seller.order_mode === 'scheduled') return 'scheduled'

  if (seller.accept_orders_anytime === true) {
    return 'anytime'
  }

  return 'scheduled'
}

function getNextOpeningText(seller: SellerProfile) {
  if (!seller.operating_days) {
    return seller.closed_message || 'Kedai kini ditutup.'
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const todayIndex = now.getDay()

  for (let offset = 0; offset < 7; offset += 1) {
    const dayIndex = (todayIndex + offset) % 7
    const dayKey = DAY_KEYS_SUNDAY_FIRST[dayIndex]
    const config = seller.operating_days[dayKey]

    if (!config?.enabled) continue

    const openMinutes = getMinutesFromTime(config.opening_time)
    const closeMinutes = getMinutesFromTime(config.closing_time)

    if (openMinutes === null || closeMinutes === null) continue

    if (offset === 0) {
      if (openMinutes < closeMinutes && currentMinutes < openMinutes) {
        return `Buka semula hari ini, ${formatTime(config.opening_time)}`
      }

      if (openMinutes > closeMinutes && currentMinutes < openMinutes && currentMinutes > closeMinutes) {
        return `Buka semula hari ini, ${formatTime(config.opening_time)}`
      }

      continue
    }

    if (offset === 1) {
      return `Buka semula esok, ${formatTime(config.opening_time)}`
    }

    return `Buka semula ${DAY_LABELS_MY[dayKey]}, ${formatTime(config.opening_time)}`
  }

  return seller.closed_message || 'Kedai kini ditutup.'
}

function getShopAvailability(seller: SellerProfile) {
  if (seller.temporarily_closed) {
    return {
      isOpen: false,
      label: 'Temporarily Closed',
      detail:
        seller.closed_message ||
        'Kedai ditutup sementara. Sila cuba lagi kemudian.',
      timeRange: '',
    }
  }

  const orderMode = getEffectiveOrderMode(seller)

  if (orderMode === 'preorder') {
    const days = Number(seller.preorder_days || 1)

    return {
      isOpen: true,
      label: 'Pre-order',
      detail: `Perlu order sekurang-kurangnya ${days} hari awal.`,
      timeRange: '',
    }
  }

  if (orderMode === 'anytime') {
    return {
      isOpen: true,
      label: 'Open Now',
      detail: 'Order dibuka 24 jam.',
      timeRange: '',
    }
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (seller.operating_days) {
    const todayKey = getTodayKey(now)
    const todayConfig = seller.operating_days[todayKey]

    if (!todayConfig || !todayConfig.enabled) {
      return {
        isOpen: false,
        label: 'Closed',
        detail: getNextOpeningText(seller),
        timeRange: '',
      }
    }

    const openMinutes = getMinutesFromTime(todayConfig.opening_time)
    const closeMinutes = getMinutesFromTime(todayConfig.closing_time)

    if (openMinutes === null || closeMinutes === null) {
      return {
        isOpen: false,
        label: 'Closed',
        detail:
          seller.closed_message ||
          'Waktu operasi tidak lengkap. Sila cuba lagi kemudian.',
        timeRange: '',
      }
    }

    let isOpen = false

    if (openMinutes < closeMinutes) {
      isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
    } else if (openMinutes > closeMinutes) {
      isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes
    }

    const timeRange = `${formatTime(todayConfig.opening_time)} - ${formatTime(
      todayConfig.closing_time
    )}`

    return {
      isOpen,
      label: isOpen ? 'Open Now' : 'Closed',
      detail: isOpen ? '' : getNextOpeningText(seller),
      timeRange,
    }
  }

  const openMinutes = getMinutesFromTime(seller.opening_time)
  const closeMinutes = getMinutesFromTime(seller.closing_time)

  if (openMinutes === null || closeMinutes === null) {
    return {
      isOpen: true,
      label: 'Open Now',
      detail: '',
      timeRange: '',
    }
  }

  let isOpen = false

  if (openMinutes < closeMinutes) {
    isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  } else if (openMinutes > closeMinutes) {
    isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes
  }

  const timeRange = `${formatTime(seller.opening_time)} - ${formatTime(
    seller.closing_time
  )}`

  return {
    isOpen,
    label: isOpen ? 'Open Now' : 'Closed',
    detail: isOpen
      ? ''
      : seller.closed_message ||
        'Kedai kini ditutup. Tempahan dibuka mengikut waktu operasi.',
    timeRange,
  }
}

function normalizeNote(note?: string) {
  return (note || '').trim()
}

function sortAddons(addons: CartAddon[]) {
  return [...addons].sort((a, b) => {
    const keyA = `${a.group_id}|${a.option_id}|${a.price}`
    const keyB = `${b.group_id}|${b.option_id}|${b.price}`
    return keyA.localeCompare(keyB)
  })
}

function isSameAddons(a: CartAddon[], b: CartAddon[]) {
  if (a.length !== b.length) return false

  const sortedA = sortAddons(a)
  const sortedB = sortAddons(b)

  return JSON.stringify(sortedA) === JSON.stringify(sortedB)
}

function isSameCartLine(a: CartLine, b: CartLine) {
  return (
    a.product_id === b.product_id &&
    normalizeNote(a.note) === normalizeNote(b.note) &&
    isSameAddons(a.addons || [], b.addons || [])
  )
}

export default function ShopPageClient({
  seller,
  products,
  shopSlug,
  categories = [],
  productAddons = {},
}: {
  seller: SellerProfile
  products: ProductRow[]
  shopSlug: string
  categories?: MenuCategory[]
  productAddons?: ProductAddonsMap
}) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [gallery, setGallery] = useState<GalleryState>({
    isOpen: false,
    images: [],
    productName: '',
    currentIndex: 0,
  })

  const [addonModal, setAddonModal] = useState<{
    product: ProductRow | null
    groups: ProductAddonGroup[]
    selections: Record<string, string[]>
    note: string
    isOpen: boolean
    error: string
    editingCartLineId: string | null
  }>({
    product: null,
    groups: [],
    selections: {},
    note: '',
    isOpen: false,
    error: '',
    editingCartLineId: null,
  })

  const productListRef = useRef<HTMLDivElement | null>(null)

  const availability = useMemo(() => getShopAvailability(seller), [seller])
  const isShopOpen = availability.isOpen
  const deliverySummary = useMemo(() => getDeliverySummary(seller), [seller])

  function getProductAddonGroups(productId: string) {
    return productAddons[productId] || []
  }

  function buildCartLine(
    product: ProductRow,
    selections: Record<string, string[]>,
    groups: ProductAddonGroup[],
    note: string,
    quantity = 1
  ): CartLine {
    const selectedAddons: CartAddon[] = []

    for (const group of groups) {
      const selectedIds = selections[group.id] || []

      for (const optId of selectedIds) {
        const opt = group.options.find((o) => o.id === optId)
        if (!opt) continue

        selectedAddons.push({
          group_id: group.id,
          group_name: group.name,
          option_id: opt.id,
          option_name: opt.name,
          price: Number(opt.price_delta || 0),
        })
      }
    }

    const addonTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    const unitPrice = Number(product.price) + addonTotal

    return {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${product.id}-${Date.now()}`,
      product_id: product.id,
      name: product.name,
      base_price: Number(product.price),
      quantity,
      addons: selectedAddons,
      note: normalizeNote(note),
      unit_price: unitPrice,
      line_total: unitPrice * quantity,
    }
  }

  function addOrMergeCartLine(newLine: CartLine) {
    setCart((prev) => {
      const index = prev.findIndex((item) => isSameCartLine(item, newLine))

      if (index === -1) {
        return [...prev, newLine]
      }

      const updated = [...prev]
      const existing = updated[index]
      const nextQuantity = existing.quantity + newLine.quantity

      updated[index] = {
        ...existing,
        quantity: nextQuantity,
        line_total: existing.unit_price * nextQuantity,
      }

      return updated
    })
  }

  function updateCartLine(updatedLine: CartLine, originalLineId: string) {
    setCart((prev) => {
      const withoutOriginal = prev.filter((item) => item.id !== originalLineId)
      const mergeIndex = withoutOriginal.findIndex((item) =>
        isSameCartLine(item, updatedLine)
      )

      if (mergeIndex === -1) {
        return [...withoutOriginal, { ...updatedLine, id: originalLineId }]
      }

      const merged = [...withoutOriginal]
      const existing = merged[mergeIndex]
      const nextQuantity = existing.quantity + updatedLine.quantity

      merged[mergeIndex] = {
        ...existing,
        quantity: nextQuantity,
        line_total: existing.unit_price * nextQuantity,
      }

      return merged
    })
  }

  function addToCartWithAddons(
    product: ProductRow,
    selections: Record<string, string[]>,
    groups: ProductAddonGroup[],
    note: string
  ) {
    const newLine = buildCartLine(product, selections, groups, note)
    addOrMergeCartLine(newLine)
  }

  function validateAddonSelections(
    groups: ProductAddonGroup[],
    selections: Record<string, string[]>
  ) {
    for (const group of groups) {
      const selectedIds = selections[group.id] || []
      const selectedCount = selectedIds.length
      const minSelect = Number(group.min_select || 0)
      const maxSelect =
        group.max_select === null || group.max_select === undefined
          ? null
          : Number(group.max_select)

      if (group.is_required && selectedCount === 0) {
        return `Please select at least one option for "${group.name}".`
      }

      if (selectedCount < minSelect) {
        return `Please select at least ${minSelect} option${
          minSelect > 1 ? 's' : ''
        } for "${group.name}".`
      }

      if (maxSelect !== null && selectedCount > maxSelect) {
        return `You can only select up to ${maxSelect} option${
          maxSelect > 1 ? 's' : ''
        } for "${group.name}".`
      }

      if (group.selection_type === 'single' && selectedCount > 1) {
        return `Only one option is allowed for "${group.name}".`
      }
    }

    return ''
  }

  function openAddonModalForNew(product: ProductRow) {
    setAddonModal({
      product,
      groups: getProductAddonGroups(product.id),
      selections: {},
      note: '',
      isOpen: true,
      error: '',
      editingCartLineId: null,
    })
  }

  function openAddonModalForEdit(cartLine: CartLine) {
    const product = products.find((item) => item.id === cartLine.product_id)
    if (!product) return

    const groups = getProductAddonGroups(product.id)
    const selections: Record<string, string[]> = {}

    for (const addon of cartLine.addons || []) {
      if (!selections[addon.group_id]) {
        selections[addon.group_id] = []
      }
      selections[addon.group_id].push(addon.option_id)
    }

    setAddonModal({
      product,
      groups,
      selections,
      note: cartLine.note || '',
      isOpen: true,
      error: '',
      editingCartLineId: cartLine.id,
    })
  }

  function closeAddonModal() {
    setAddonModal({
      product: null,
      groups: [],
      selections: {},
      note: '',
      isOpen: false,
      error: '',
      editingCartLineId: null,
    })
  }

  function incrementCartLine(lineId: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === lineId
          ? {
              ...item,
              quantity: item.quantity + 1,
              line_total: item.unit_price * (item.quantity + 1),
            }
          : item
      )
    )
  }

  function decrementCartLine(lineId: string) {
    setCart((prev) => {
      const current = prev.find((item) => item.id === lineId)
      if (!current) return prev

      if (current.quantity <= 1) {
        return prev.filter((item) => item.id !== lineId)
      }

      return prev.map((item) =>
        item.id === lineId
          ? {
              ...item,
              quantity: item.quantity - 1,
              line_total: item.unit_price * (item.quantity - 1),
            }
          : item
      )
    })
  }

  function removeCartLine(lineId: string) {
    setCart((prev) => prev.filter((item) => item.id !== lineId))
  }

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()

    for (const product of products) {
      const categoryId = product.menu_category_id || ''
      if (!categoryId) continue
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1)
    }

    return counts
  }, [products])

  const visibleCategories = useMemo(() => {
    return [...categories]
      .filter((item) => item && item.id && item.name)
      .filter((item) => (categoryCounts.get(item.id) || 0) > 0)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
  }, [categories, categoryCounts])

  const hasCategoryFeature =
    visibleCategories.length > 0 &&
    products.some((product) => product.menu_category_id)

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')

  useEffect(() => {
    setActiveCategoryId('all')
  }, [hasCategoryFeature])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!gallery.isOpen) return

      if (event.key === 'Escape') closeGallery()
      if (event.key === 'ArrowLeft') showPrevImage()
      if (event.key === 'ArrowRight') showNextImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gallery.isOpen, gallery.currentIndex, gallery.images.length])

  function scrollToProducts() {
    if (!productListRef.current) return

    const top =
      productListRef.current.getBoundingClientRect().top + window.scrollY - 110

    window.scrollTo({
      top,
      behavior: 'smooth',
    })
  }

  function handleCategoryClick(categoryId: string) {
    setActiveCategoryId(categoryId)
    window.requestAnimationFrame(() => {
      scrollToProducts()
    })
  }

  function increase(product: ProductRow) {
    if (!isShopOpen) return
    if (product.sold_out) return

    const addonGroups = getProductAddonGroups(product.id)

    if (addonGroups.length > 0) {
      openAddonModalForNew(product)
      return
    }

    addToCartWithAddons(product, {}, [], '')
  }

  function decrease(productId: string) {
    setCart((prev) => {
      const index = [...prev]
        .map((item) => item.product_id)
        .lastIndexOf(productId)

      if (index === -1) return prev

      const next = [...prev]
      const currentLine = next[index]

      if (currentLine.quantity <= 1) {
        next.splice(index, 1)
        return next
      }

      next[index] = {
        ...currentLine,
        quantity: currentLine.quantity - 1,
        line_total: currentLine.unit_price * (currentLine.quantity - 1),
      }

      return next
    })
  }

  function openGallery(product: ProductRow, startIndex = 0) {
    const images = getProductImages(product).map((img) => getImageUrl(img))
    if (!images.length) return

    setGallery({
      isOpen: true,
      images,
      productName: product.name,
      currentIndex: startIndex,
    })
  }

  function closeGallery() {
    setGallery((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  function showPrevImage() {
    setGallery((prev) => {
      if (!prev.images.length) return prev

      return {
        ...prev,
        currentIndex:
          prev.currentIndex === 0
            ? prev.images.length - 1
            : prev.currentIndex - 1,
      }
    })
  }

  function showNextImage() {
    setGallery((prev) => {
      if (!prev.images.length) return prev

      return {
        ...prev,
        currentIndex:
          prev.currentIndex === prev.images.length - 1
            ? 0
            : prev.currentIndex + 1,
      }
    })
  }

  const visibleProducts = useMemo(() => {
    if (!hasCategoryFeature) return products
    if (activeCategoryId === 'all') return products

    return products.filter(
      (product) => (product.menu_category_id || '') === activeCategoryId
    )
  }, [products, hasCategoryFeature, activeCategoryId])

  const cartItems = cart

  const grandTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.line_total, 0)
  }, [cart])

  const sellerName = seller.store_name || 'Shop'

  return (
    <main style={main}>
      <div style={container}>
        <div style={logoWrap}>
          <img
            src="/BayarLink-Logo-Shop-Page.svg"
            alt="BayarLink"
            style={logo}
          />
        </div>

        <div style={heroCard}>
          <div style={sellerRow}>
            {seller.profile_image ? (
              <img
                src={getImageUrl(seller.profile_image)}
                alt={sellerName}
                style={sellerImg}
              />
            ) : (
              <div style={sellerFallback}>
                {sellerName.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={shopTitle}>{sellerName}</h1>
              {seller.business_address && (
                <p style={shopSub}>{seller.business_address}</p>
              )}
            </div>
          </div>

          <div style={statusWrap}>
            <div
              style={{
                ...statusBadge,
                background:
                  availability.label === 'Pre-order'
                    ? '#ede9fe'
                    : isShopOpen
                    ? '#dcfce7'
                    : '#fee2e2',
                color:
                  availability.label === 'Pre-order'
                    ? '#6d28d9'
                    : isShopOpen
                    ? '#166534'
                    : '#b91c1c',
              }}
            >
              {availability.label}
            </div>

            {availability.timeRange ? (
              <div style={hoursText}>{availability.timeRange}</div>
            ) : null}
          </div>

          {availability.detail && (
            <div
              style={{
                ...noticeBox,
                background:
                  availability.label === 'Pre-order'
                    ? '#f5f3ff'
                    : isShopOpen
                    ? '#eff6ff'
                    : '#fff7ed',
                borderColor:
                  availability.label === 'Pre-order'
                    ? '#ddd6fe'
                    : isShopOpen
                    ? '#bfdbfe'
                    : '#fed7aa',
                color:
                  availability.label === 'Pre-order'
                    ? '#5b21b6'
                    : isShopOpen
                    ? '#1e3a8a'
                    : '#9a3412',
              }}
            >
              {availability.detail}
            </div>
          )}

          {deliverySummary ? (
            <div style={{ ...shopSub, marginTop: 10 }}>{deliverySummary}</div>
          ) : null}
        </div>

        {hasCategoryFeature ? (
          <div style={stickyTabWrap}>
            <div style={tabShell}>
              <div style={tabScroller}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('all')}
                  style={{
                    ...tabButton,
                    ...(activeCategoryId === 'all'
                      ? activeTabButton
                      : inactiveTabButton),
                  }}
                >
                  All
                </button>

                {visibleCategories.map((category) => {
                  const isActive = activeCategoryId === category.id

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryClick(category.id)}
                      style={{
                        ...tabButton,
                        ...(isActive ? activeTabButton : inactiveTabButton),
                      }}
                    >
                      {category.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div ref={productListRef}>
          {visibleProducts.length === 0 ? (
            <div style={emptyCard}>
              <p style={{ margin: 0, color: '#64748b' }}>
                Tiada menu aktif buat masa ini.
              </p>
            </div>
          ) : (
            <div style={productGrid}>
              {visibleProducts.map((product) => {
                const image = getFirstImage(product)
                const qty = cart.reduce(
                  (sum, item) =>
                    item.product_id === product.id ? sum + item.quantity : sum,
                  0
                )
                const disableAddButton = !isShopOpen || Boolean(product.sold_out)
                const allImages = getProductImages(product)
                const addonGroups = getProductAddonGroups(product.id)

                return (
                  <div key={product.id} style={productCard}>
                    <div style={productContent}>
                      <div style={productInfo}>
                        <div style={productName}>{product.name}</div>

                        <div style={productPrice}>
                          RM {product.price.toFixed(2)}
                        </div>

                        {product.track_stock ? (
                          <div style={stockText}>
                            Stock: {product.stock_quantity ?? 0}
                          </div>
                        ) : null}

                        <div style={productDesc}>
                          {product.description || 'Tiada deskripsi.'}
                        </div>

                        <div style={qtyWrap}>
                          <div style={qtyRow}>
                            <button
                              type="button"
                              onClick={() => decrease(product.id)}
                              style={qtyBtn}
                            >
                              -
                            </button>

                            <span style={qtyValue}>{qty}</span>

                            <button
                              type="button"
                              onClick={() => increase(product)}
                              style={{
                                ...qtyBtn,
                                opacity: disableAddButton ? 0.4 : 1,
                                cursor: disableAddButton
                                  ? 'not-allowed'
                                  : 'pointer',
                              }}
                              disabled={disableAddButton}
                            >
                              +
                            </button>
                          </div>

                          {!isShopOpen ? (
                            <div style={qtyHintClosed}>Ordering unavailable</div>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openGallery(product, 0)}
                        style={{
                          ...productImageButton,
                          cursor: image ? 'pointer' : 'default',
                        }}
                        disabled={!image}
                        aria-label={`View images for ${product.name}`}
                      >
                        <div style={productImageWrap}>
                          {image ? (
                            <img
                              src={getImageUrl(image)}
                              alt={product.name}
                              style={productImage}
                            />
                          ) : (
                            <div style={productImagePlaceholder}>No image</div>
                          )}

                          {product.sold_out ? (
                            <div style={soldOutBadge}>Sold Out</div>
                          ) : null}

                          {allImages.length > 1 ? (
                            <div style={multiImageBadge}>
                              {allImages.length} photos
                            </div>
                          ) : null}
                        </div>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={checkoutCard}>
          <div style={checkoutHeader}>
            <div>
              <h2 style={checkoutTitle}>Checkout</h2>
              <p style={checkoutSub}>Subtotal RM {grandTotal.toFixed(2)}</p>
            </div>
          </div>

          {!isShopOpen ? (
            <div style={closedCheckoutBox}>
              <div style={closedCheckoutTitle}>
                Kedai kini tidak menerima tempahan
              </div>
              <div style={closedCheckoutText}>{availability.detail}</div>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={emptyCartBox}>
              Sila pilih sekurang-kurangnya satu item untuk teruskan pembayaran.
            </div>
          ) : (
            <>
              <div style={summaryList}>
                {cartItems.map((item) => (
                  <div key={item.id} style={summaryCard}>
                    <button
                      type="button"
                      onClick={() => openAddonModalForEdit(item)}
                      style={summaryRowButton}
                    >
                      <div style={summaryRow}>
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {item.name} × {item.quantity}
                          </div>

                          {item.addons.length > 0 && (
                            <div
                              style={{
                                fontSize: 12,
                                color: '#64748b',
                                marginTop: 4,
                              }}
                            >
                              {item.addons.map((a) => (
                                <div key={`${item.id}-${a.option_id}`}>
                                  + {a.option_name} (RM {a.price.toFixed(2)})
                                </div>
                              ))}
                            </div>
                          )}

                          {item.note ? (
                            <div
                              style={{
                                fontSize: 12,
                                color: '#94a3b8',
                                marginTop: 4,
                              }}
                            >
                              Note: {item.note}
                            </div>
                          ) : null}

                          <div style={summaryEditHint}>Tap details to edit</div>
                        </div>
                        <strong>RM {item.line_total.toFixed(2)}</strong>
                      </div>
                    </button>

                    <div style={summaryActions}>
                      <div style={lineQtyControls}>
                        <button
                          type="button"
                          onClick={() => decrementCartLine(item.id)}
                          style={lineQtyBtn}
                        >
                          -
                        </button>
                        <span style={lineQtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementCartLine(item.id)}
                          style={lineQtyBtn}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCartLine(item.id)}
                        style={deleteLineBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <ShopPayButton
                sellerId={seller.id}
                shopSlug={shopSlug}
                items={cartItems}
                total={grandTotal}
                deliveryMode={seller.delivery_mode || 'pay_rider_separately'}
                deliveryFee={seller.delivery_fee || 0}
                deliveryArea={seller.delivery_area || ''}
                deliveryNote={seller.delivery_note || ''}
                deliveryRadiusKm={seller.delivery_radius_km || 0}
                deliveryRatePerKm={seller.delivery_rate_per_km || 0}
                deliveryMinFee={seller.delivery_min_fee || 0}
                pickupAddress={seller.pickup_address || ''}
                sellerLatitude={seller.latitude || null}
                sellerLongitude={seller.longitude || null}
              />
            </>
          )}
        </div>
      </div>

      {gallery.isOpen ? (
        <div style={galleryOverlay} onClick={closeGallery}>
          <div
            style={galleryDialog}
            onClick={(event) => event.stopPropagation()}
          >
