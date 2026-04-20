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
  shop_description?: string | null
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
        ? `Delivery fee: ${formatCurrency(fee)}`
        : 'Delivery fee akan dikenakan.'
    case 'included_in_price':
      return 'Harga produk telah termasuk delivery.'
    case 'distance_based':
      return `Caj delivery dikira ikut jarak. Kadar ${formatCurrency(
        rate
      )}/km, minimum ${formatCurrency(minFee)}, radius maksimum ${radius}km.`
    case 'pay_rider_separately':
    default:
      return (
        seller.delivery_note?.trim() ||
        'Bayaran delivery dibuat terus kepada rider semasa order sampai.'
      )
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

      if (
        openMinutes > closeMinutes &&
        currentMinutes < openMinutes &&
        currentMinutes > closeMinutes
      ) {
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
      inlineInfo: '',
      timeRange: '',
    }
  }

  const orderMode = getEffectiveOrderMode(seller)

  if (orderMode === 'preorder') {
    const days = Number(seller.preorder_days || 1)

    return {
      isOpen: true,
      label: 'Pre-order',
      detail: '',
      inlineInfo: `${days} hari awal`,
      timeRange: '',
    }
  }

  if (orderMode === 'anytime') {
    return {
      isOpen: true,
      label: 'Open Now',
      detail: '',
      inlineInfo: '24 jam',
      timeRange: '',
    }
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (seller.operating_days) {
    const todayKey = getTodayKey(now)
    const todayConfig = seller.operating_days[todayKey]

    if (!todayConfig || !todayConfig.enabled) {
      const nextOpening = getNextOpeningText(seller)

      return {
        isOpen: false,
        label: 'Closed',
        detail: nextOpening,
        inlineInfo: nextOpening,
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
        inlineInfo:
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
      inlineInfo: isOpen ? timeRange : getNextOpeningText(seller),
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
      inlineInfo: '',
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
    inlineInfo: isOpen
      ? timeRange
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

              <div style={statusInlineWrap}>
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

                {availability.inlineInfo ? (
                  <div style={statusInfoBadge}>{availability.inlineInfo}</div>
                ) : null}
              </div>

              {seller.shop_description ? (
                <p style={shopDescription}>{seller.shop_description}</p>
              ) : seller.business_address ? (
                <p style={shopSub}>{seller.business_address}</p>
              ) : null}
            </div>
          </div>
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
              <div style={deliveryInfoCard}>
                <div style={deliveryInfoTitle}>Delivery Info</div>
                <div style={deliveryInfoText}>{deliverySummary}</div>

                {seller.delivery_area?.trim() ? (
                  <div style={deliveryInfoMeta}>
                    Kawasan: {seller.delivery_area.trim()}
                  </div>
                ) : null}
              </div>

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
            <button type="button" onClick={closeGallery} style={galleryCloseBtn}>
              ✕
            </button>

            <div style={galleryHeader}>
              <div style={galleryTitle}>{gallery.productName}</div>
              <div style={galleryCounter}>
                {gallery.currentIndex + 1} / {gallery.images.length}
              </div>
            </div>

            <div style={galleryBody}>
              <button type="button" onClick={showPrevImage} style={galleryNavBtn}>
                ‹
              </button>

              <div style={galleryImageWrap}>
                <img
                  src={gallery.images[gallery.currentIndex]}
                  alt={gallery.productName}
                  style={galleryImage}
                />
              </div>

              <button type="button" onClick={showNextImage} style={galleryNavBtn}>
                ›
              </button>
            </div>

            {gallery.images.length > 1 ? (
              <div style={galleryThumbRow}>
                {gallery.images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() =>
                      setGallery((prev) => ({
                        ...prev,
                        currentIndex: index,
                      }))
                    }
                    style={{
                      ...galleryThumbBtn,
                      borderColor:
                        gallery.currentIndex === index ? '#0f172a' : '#e2e8f0',
                    }}
                  >
                    <img
                      src={img}
                      alt={`${gallery.productName} ${index + 1}`}
                      style={galleryThumbImg}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {addonModal.isOpen && addonModal.product ? (
        <div style={modalOverlay} onClick={closeAddonModal}>
          <div
            style={modalDialog}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalHeader}>
              <div>
                <div style={modalTitle}>{addonModal.product.name}</div>
                <div style={modalSubtitle}>
                  Base price: RM {addonModal.product.price.toFixed(2)}
                </div>
              </div>

              <button
                type="button"
                onClick={closeAddonModal}
                style={modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div style={modalContent}>
              {addonModal.groups.length === 0 ? (
                <div style={emptyCartBox}>Tiada add-on untuk produk ini.</div>
              ) : (
                addonModal.groups.map((group) => {
                  const selectedIds = addonModal.selections[group.id] || []

                  return (
                    <div key={group.id} style={addonGroupCard}>
                      <div style={addonGroupHeader}>
                        <div style={addonGroupTitle}>{group.name}</div>
                        <div style={addonGroupMeta}>
                          {group.selection_type === 'single'
                            ? 'Pilih satu'
                            : 'Boleh pilih banyak'}
                          {group.is_required ? ' • Required' : ''}
                        </div>
                      </div>

                      <div style={addonOptionsWrap}>
                        {group.options
                          .filter((option) => option.is_active !== false)
                          .sort(
                            (a, b) =>
                              Number(a.sort_order || 0) - Number(b.sort_order || 0)
                          )
                          .map((option) => {
                            const checked = selectedIds.includes(option.id)

                            return (
                              <label key={option.id} style={addonOptionRow}>
                                <input
                                  type={
                                    group.selection_type === 'single'
                                      ? 'radio'
                                      : 'checkbox'
                                  }
                                  name={`group-${group.id}`}
                                  checked={checked}
                                  onChange={(event) => {
                                    setAddonModal((prev) => {
                                      const current = prev.selections[group.id] || []
                                      let nextSelections = [...current]

                                      if (group.selection_type === 'single') {
                                        nextSelections = event.target.checked
                                          ? [option.id]
                                          : []
                                      } else if (event.target.checked) {
                                        if (!nextSelections.includes(option.id)) {
                                          nextSelections.push(option.id)
                                        }
                                      } else {
                                        nextSelections = nextSelections.filter(
                                          (id) => id !== option.id
                                        )
                                      }

                                      return {
                                        ...prev,
                                        selections: {
                                          ...prev.selections,
                                          [group.id]: nextSelections,
                                        },
                                        error: '',
                                      }
                                    })
                                  }}
                                />

                                <div style={{ flex: 1 }}>
                                  <div style={addonOptionName}>{option.name}</div>
                                </div>

                                <div style={addonOptionPrice}>
                                  {Number(option.price_delta || 0) > 0
                                    ? `+ RM ${Number(option.price_delta).toFixed(2)}`
                                    : 'Free'}
                                </div>
                              </label>
                            )
                          })}
                      </div>
                    </div>
                  )
                })
              )}

              <div style={noteWrap}>
                <label style={noteLabel}>Customer Note</label>
                <textarea
                  value={addonModal.note}
                  onChange={(event) =>
                    setAddonModal((prev) => ({
                      ...prev,
                      note: event.target.value,
                      error: '',
                    }))
                  }
                  rows={3}
                  placeholder="Contoh: kurang pedas, asingkan sambal"
                  style={noteTextarea}
                />
              </div>

              {addonModal.error ? (
                <div style={modalError}>{addonModal.error}</div>
              ) : null}
            </div>

            <div style={modalFooter}>
              <button
                type="button"
                onClick={closeAddonModal}
                style={secondaryBtn}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!addonModal.product) return

                  const validationMessage = validateAddonSelections(
                    addonModal.groups,
                    addonModal.selections
                  )

                  if (validationMessage) {
                    setAddonModal((prev) => ({
                      ...prev,
                      error: validationMessage,
                    }))
                    return
                  }

                  const cartLine = buildCartLine(
                    addonModal.product,
                    addonModal.selections,
                    addonModal.groups,
                    addonModal.note
                  )

                  if (addonModal.editingCartLineId) {
                    updateCartLine(cartLine, addonModal.editingCartLineId)
                  } else {
                    addOrMergeCartLine(cartLine)
                  }

                  closeAddonModal()
                }}
                style={primaryBtn}
              >
                {addonModal.editingCartLineId ? 'Update Item' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

const main: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f8fafc',
  padding: '20px 16px 80px',
}

const container: React.CSSProperties = {
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
}

const logoWrap: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 12,
}

const logo: React.CSSProperties = {
  height: 28,
  width: 'auto',
}

const heroCard: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 24,
  padding: 20,
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
}

const sellerRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
}

const sellerImg: React.CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: '9999px',
  objectFit: 'cover',
  border: '1px solid #e2e8f0',
  flexShrink: 0,
}

const sellerFallback: React.CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: '9999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#e2e8f0',
  color: '#0f172a',
  fontSize: 22,
  fontWeight: 800,
  flexShrink: 0,
}

const shopTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.25,
  fontWeight: 800,
  color: '#0f172a',
}

const shopSub: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: 14,
  lineHeight: 1.5,
}

const shopDescription: React.CSSProperties = {
  margin: '10px 0 0',
  color: '#475569',
  fontSize: 14,
  lineHeight: 1.55,
}

const statusInlineWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  marginTop: 10,
}

const statusBadge: React.CSSProperties = {
  borderRadius: 999,
  padding: '7px 11px',
  fontSize: 12,
  fontWeight: 800,
}

const statusInfoBadge: React.CSSProperties = {
  borderRadius: 999,
  padding: '7px 11px',
  fontSize: 12,
  fontWeight: 700,
  background: '#f1f5f9',
  color: '#475569',
  border: '1px solid #e2e8f0',
}

const stickyTabWrap: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  marginBottom: 16,
}

const tabShell: React.CSSProperties = {
  background: 'rgba(248, 250, 252, 0.92)',
  backdropFilter: 'blur(8px)',
  padding: '8px 0',
}

const tabScroller: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  overflowX: 'auto',
  paddingBottom: 4,
}

const tabButton: React.CSSProperties = {
  borderRadius: 999,
  padding: '10px 14px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#334155',
  fontSize: 14,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
}

const activeTabButton: React.CSSProperties = {
  background: '#0f172a',
  color: '#fff',
  borderColor: '#0f172a',
}

const inactiveTabButton: React.CSSProperties = {
  background: '#fff',
  color: '#334155',
  borderColor: '#cbd5e1',
}

const emptyCard: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 20,
  padding: 18,
}

const productGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 16,
}

const productCard: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 24,
  padding: 16,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
}

const productContent: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 120px',
  gap: 14,
  alignItems: 'start',
}

const productInfo: React.CSSProperties = {
  minWidth: 0,
}

const productName: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: '#0f172a',
  lineHeight: 1.3,
}

const productPrice: React.CSSProperties = {
  marginTop: 6,
  fontSize: 16,
  fontWeight: 800,
  color: '#0f172a',
}

const stockText: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: '#64748b',
  fontWeight: 700,
}

const productDesc: React.CSSProperties = {
  marginTop: 8,
  color: '#64748b',
  fontSize: 14,
  lineHeight: 1.5,
  whiteSpace: 'normal',
  wordBreak: 'break-word',
}

const qtyWrap: React.CSSProperties = {
  marginTop: 14,
}

const qtyRow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 999,
  padding: 6,
}

const qtyBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: '9999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  fontSize: 18,
  fontWeight: 800,
  cursor: 'pointer',
}

const qtyValue: React.CSSProperties = {
  minWidth: 18,
  textAlign: 'center',
  fontWeight: 800,
  color: '#0f172a',
}

const qtyHintClosed: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: '#b91c1c',
  fontWeight: 700,
}

const productImageButton: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  padding: 0,
}

const productImageWrap: React.CSSProperties = {
  position: 'relative',
  width: 120,
  height: 120,
  borderRadius: 20,
  overflow: 'hidden',
  background: '#f1f5f9',
  border: '1px solid #e2e8f0',
}

const productImage: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const productImagePlaceholder: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  fontSize: 13,
  fontWeight: 700,
}

const soldOutBadge: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  background: '#fee2e2',
  color: '#b91c1c',
  fontSize: 11,
  fontWeight: 800,
  borderRadius: 999,
  padding: '6px 8px',
}

const multiImageBadge: React.CSSProperties = {
  position: 'absolute',
  right: 8,
  bottom: 8,
  background: 'rgba(15, 23, 42, 0.8)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 800,
  borderRadius: 999,
  padding: '6px 8px',
}

const checkoutCard: React.CSSProperties = {
  marginTop: 18,
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 24,
  padding: 18,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
}

const checkoutHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 14,
}

const checkoutTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: '#0f172a',
}

const checkoutSub: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 14,
  color: '#64748b',
}

const deliveryInfoCard: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  padding: 14,
  marginBottom: 16,
}

const deliveryInfoTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#1d4ed8',
  marginBottom: 8,
}

const deliveryInfoText: React.CSSProperties = {
  fontSize: 14,
  color: '#475569',
  lineHeight: 1.6,
}

const deliveryInfoMeta: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: '#64748b',
}

const closedCheckoutBox: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid #fed7aa',
  background: '#fff7ed',
  padding: 14,
}

const closedCheckoutTitle: React.CSSProperties = {
  fontWeight: 800,
  color: '#9a3412',
}

const closedCheckoutText: React.CSSProperties = {
  marginTop: 6,
  fontSize: 14,
  color: '#9a3412',
}

const emptyCartBox: React.CSSProperties = {
  borderRadius: 18,
  border: '1px dashed #cbd5e1',
  background: '#f8fafc',
  padding: 16,
  color: '#64748b',
  fontSize: 14,
}

const summaryList: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  marginBottom: 16,
}

const summaryCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 18,
  padding: 12,
  background: '#fff',
}

const summaryRowButton: React.CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  padding: 0,
  textAlign: 'left',
  cursor: 'pointer',
}

const summaryRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
}

const summaryEditHint: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: '#2563eb',
  fontWeight: 700,
}

const summaryActions: React.CSSProperties = {
  marginTop: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}

const lineQtyControls: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
}

const lineQtyBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: '9999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  fontSize: 16,
  fontWeight: 800,
  cursor: 'pointer',
}

const lineQtyValue: React.CSSProperties = {
  minWidth: 16,
  textAlign: 'center',
  fontWeight: 800,
}

const deleteLineBtn: React.CSSProperties = {
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#b91c1c',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
}

const galleryOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.78)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
}

const galleryDialog: React.CSSProperties = {
  width: '100%',
  maxWidth: 980,
  background: '#fff',
  borderRadius: 24,
  padding: 16,
  position: 'relative',
}

const galleryCloseBtn: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 36,
  height: 36,
  borderRadius: '9999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 800,
}

const galleryHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 12,
  paddingRight: 42,
}

const galleryTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: '#0f172a',
}

const galleryCounter: React.CSSProperties = {
  fontSize: 13,
  color: '#64748b',
  fontWeight: 700,
}

const galleryBody: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '48px 1fr 48px',
  gap: 12,
  alignItems: 'center',
}

const galleryNavBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '9999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  fontSize: 26,
  cursor: 'pointer',
}

const galleryImageWrap: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 20,
  overflow: 'hidden',
  minHeight: 320,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const galleryImage: React.CSSProperties = {
  width: '100%',
  maxHeight: '70vh',
  objectFit: 'contain',
  display: 'block',
}

const galleryThumbRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  overflowX: 'auto',
  marginTop: 14,
}

const galleryThumbBtn: React.CSSProperties = {
  border: '2px solid #e2e8f0',
  borderRadius: 14,
  padding: 0,
  background: '#fff',
  overflow: 'hidden',
  width: 72,
  height: 72,
  cursor: 'pointer',
  flex: '0 0 auto',
}

const galleryThumbImg: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.62)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1100,
}

const modalDialog: React.CSSProperties = {
  width: '100%',
  maxWidth: 680,
  background: '#fff',
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 16px 50px rgba(15, 23, 42, 0.18)',
}

const modalHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  padding: 18,
  borderBottom: '1px solid #e2e8f0',
}

const modalTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: '#0f172a',
}

const modalSubtitle: React.CSSProperties = {
  marginTop: 4,
  color: '#64748b',
  fontSize: 14,
}

const modalCloseBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '9999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 800,
}

const modalContent: React.CSSProperties = {
  padding: 18,
  display: 'grid',
  gap: 14,
  maxHeight: '70vh',
  overflowY: 'auto',
}

const addonGroupCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 18,
  padding: 14,
  background: '#fff',
}

const addonGroupHeader: React.CSSProperties = {
  marginBottom: 10,
}

const addonGroupTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: '#0f172a',
}

const addonGroupMeta: React.CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  color: '#64748b',
  fontWeight: 600,
}

const addonOptionsWrap: React.CSSProperties = {
  display: 'grid',
  gap: 10,
}

const addonOptionRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: '10px 12px',
  background: '#f8fafc',
}

const addonOptionName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#0f172a',
}

const addonOptionPrice: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: '#334155',
}

const noteWrap: React.CSSProperties = {
  display: 'grid',
  gap: 8,
}

const noteLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#0f172a',
}

const noteTextarea: React.CSSProperties = {
  width: '100%',
  borderRadius: 14,
  border: '1px solid #cbd5e1',
  padding: 12,
  fontSize: 14,
  fontFamily: 'inherit',
  resize: 'vertical',
}

const modalError: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid #fecaca',
  background: '#fef2f2',
  padding: 12,
  color: '#b91c1c',
  fontSize: 14,
  fontWeight: 700,
}

const modalFooter: React.CSSProperties = {
  padding: 18,
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 10,
}

const secondaryBtn: React.CSSProperties = {
  borderRadius: 999,
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  padding: '10px 16px',
  fontWeight: 800,
  cursor: 'pointer',
}

const primaryBtn: React.CSSProperties = {
  borderRadius: 999,
  border: '1px solid #0f172a',
  background: '#0f172a',
  color: '#fff',
  padding: '10px 16px',
  fontWeight: 800,
  cursor: 'pointer',
}
