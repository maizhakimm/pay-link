'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ShopPayButton from './ShopPayButton'

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
  delivery_mode?:
    | 'free_delivery'
    | 'fixed_fee'
    | 'included_in_price'
    | 'pay_rider_separately'
    | 'distance_based'
    | null
  delivery_fee?: number | null
  delivery_area?: string | null
  delivery_note?: string | null
  delivery_radius_km?: number | null
  delivery_rate_per_km?: number | null
  delivery_min_fee?: number | null
  pickup_address?: string | null
  latitude?: number | null
  longitude?: number | null
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

function getShopAvailability(seller: SellerProfile) {
  if (seller.temporarily_closed) {
    return {
      isOpen: false,
      label: 'Temporarily Closed',
      detail:
        seller.closed_message ||
        'Kedai kini ditutup. Tempahan akan dibuka semula pada waktu operasi.',
    }
  }

  if (seller.accept_orders_anytime === true) {
    return {
      isOpen: true,
      label: 'Open Now',
      detail: 'Kedai ini menerima tempahan pada bila-bila masa.',
    }
  }

  const openMinutes = getMinutesFromTime(seller.opening_time)
  const closeMinutes = getMinutesFromTime(seller.closing_time)

  if (openMinutes === null || closeMinutes === null) {
    return {
      isOpen: true,
      label: 'Open Now',
      detail: '',
    }
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

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
    detail: '',
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
                background: isShopOpen ? '#dcfce7' : '#fee2e2',
                color: isShopOpen ? '#166534' : '#b91c1c',
              }}
            >
              {availability.label}
            </div>

            {seller.accept_orders_anytime === false && availability.timeRange ? (
              <div style={hoursText}>
                {availability.timeRange}
              </div>
            ) : null}
          </div>

          {availability.detail && (
            <div
              style={{
                ...noticeBox,
                background: isShopOpen ? '#eff6ff' : '#fff7ed',
                borderColor: isShopOpen ? '#bfdbfe' : '#fed7aa',
                color: isShopOpen ? '#1e3a8a' : '#9a3412',
              }}
            >
              {availability.detail}
            </div>
          )}
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
                const hasAddons = addonGroups.length > 0

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

                        {hasAddons ? (
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#7c3aed',
                              marginBottom: 8,
                            }}
                          >
                            Add-on available
                          </div>
                        ) : null}

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
                  <button
                    key={item.id}
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
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                            {item.addons.map((a) => (
                              <div key={`${item.id}-${a.option_id}`}>
                                + {a.option_name} (RM {a.price.toFixed(2)})
                              </div>
                            ))}
                          </div>
                        )}

                        {item.note ? (
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                            Note: {item.note}
                          </div>
                        ) : null}

                        <div style={summaryEditHint}>Tap to edit</div>
                      </div>
                      <strong>RM {item.line_total.toFixed(2)}</strong>
                    </div>
                  </button>
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
            <button
              type="button"
              onClick={closeGallery}
              style={galleryCloseButton}
              aria-label="Close image gallery"
            >
              ✕
            </button>

            <div style={galleryTopBar}>
              <div style={galleryTitle}>{gallery.productName}</div>
              <div style={galleryCounter}>
                {gallery.currentIndex + 1} / {gallery.images.length}
              </div>
            </div>

            <div style={galleryImageArea}>
              {gallery.images.length > 1 ? (
                <button
                  type="button"
                  onClick={showPrevImage}
                  style={{ ...galleryNavButton, ...galleryNavLeft }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              ) : null}

              <img
                src={gallery.images[gallery.currentIndex]}
                alt={gallery.productName}
                style={galleryImage}
              />

              {gallery.images.length > 1 ? (
                <button
                  type="button"
                  onClick={showNextImage}
                  style={{ ...galleryNavButton, ...galleryNavRight }}
                  aria-label="Next image"
                >
                  ›
                </button>
              ) : null}
            </div>

            {gallery.images.length > 1 ? (
              <div style={galleryDots}>
                {gallery.images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setGallery((prev) => ({ ...prev, currentIndex: index }))
                    }
                    style={{
                      ...galleryDot,
                      opacity: gallery.currentIndex === index ? 1 : 0.35,
                      transform:
                        gallery.currentIndex === index
                          ? 'scale(1.15)'
                          : 'scale(1)',
                    }}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {addonModal.isOpen && addonModal.product ? (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ marginBottom: 10 }}>
              {addonModal.product.name}
            </h3>

            {addonModal.error ? (
              <div style={modalErrorBox}>{addonModal.error}</div>
            ) : null}

            {addonModal.groups.map((group) => {
              const selectedCount = (addonModal.selections[group.id] || []).length

              return (
                <div key={group.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {group.name}
                    {group.is_required ? (
                      <span style={requiredMark}> *</span>
                    ) : null}
                  </div>

                  <div style={groupMetaText}>
                    {group.selection_type === 'single'
                      ? 'Choose 1'
                      : `Choose ${Number(group.min_select || 0)} or more`}
                    {group.max_select !== null && group.max_select !== undefined
                      ? ` • Max ${group.max_select}`
                      : ''}
                    {selectedCount > 0 ? ` • Selected ${selectedCount}` : ''}
                  </div>

                  {group.options.map((opt) => {
                    const selected =
                      addonModal.selections[group.id]?.includes(opt.id) || false

                    return (
                      <label key={opt.id} style={optionRow}>
                        <input
                          type={
                            group.selection_type === 'single'
                              ? 'radio'
                              : 'checkbox'
                          }
                          checked={selected}
                          onChange={() => {
                            setAddonModal((prev) => {
                              const current = prev.selections[group.id] || []

                              let updated: string[] = []

                              if (group.selection_type === 'single') {
                                updated = [opt.id]
                              } else {
                                if (current.includes(opt.id)) {
                                  updated = current.filter((id) => id !== opt.id)
                                } else {
                                  const maxSelect =
                                    group.max_select === null ||
                                    group.max_select === undefined
                                      ? null
                                      : Number(group.max_select)

                                  if (
                                    maxSelect !== null &&
                                    current.length >= maxSelect
                                  ) {
                                    return {
                                      ...prev,
                                      error: `You can only select up to ${maxSelect} option${
                                        maxSelect > 1 ? 's' : ''
                                      } for "${group.name}".`,
                                    }
                                  }

                                  updated = [...current, opt.id]
                                }
                              }

                              return {
                                ...prev,
                                error: '',
                                selections: {
                                  ...prev.selections,
                                  [group.id]: updated,
                                },
                              }
                            })
                          }}
                        />
                        {opt.name} (+RM {opt.price_delta})
                      </label>
                    )
                  })}
                </div>
              )
            })}

            <textarea
              placeholder="Note (optional)"
              value={addonModal.note}
              onChange={(e) =>
                setAddonModal((prev) => ({
                  ...prev,
                  note: e.target.value,
                  error: '',
                }))
              }
              style={noteBox}
            />

            <button
              type="button"
              onClick={() => {
                if (!addonModal.product) return

                const validationError = validateAddonSelections(
                  addonModal.groups,
                  addonModal.selections
                )

                if (validationError) {
                  setAddonModal((prev) => ({
                    ...prev,
                    error: validationError,
                  }))
                  return
                }

                if (addonModal.editingCartLineId) {
                  const existingLine = cart.find(
                    (item) => item.id === addonModal.editingCartLineId
                  )

                  if (!existingLine) {
                    closeAddonModal()
                    return
                  }

                  const updatedLine = buildCartLine(
                    addonModal.product,
                    addonModal.selections,
                    addonModal.groups,
                    addonModal.note,
                    existingLine.quantity
                  )

                  updateCartLine(updatedLine, existingLine.id)
                } else {
                  addToCartWithAddons(
                    addonModal.product,
                    addonModal.selections,
                    addonModal.groups,
                    addonModal.note
                  )
                }

                closeAddonModal()
              }}
              style={confirmBtn}
            >
              {addonModal.editingCartLineId ? 'Update Order' : 'Add to Order'}
            </button>

            <button
              type="button"
              onClick={closeAddonModal}
              style={cancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

const soldOutBadge = {
  position: 'absolute' as const,
  top: 6,
  right: 6,
  background: '#ef4444',
  color: '#fff',
  fontSize: 10,
  fontWeight: 800,
  padding: '4px 7px',
  borderRadius: 8,
} as const

const multiImageBadge = {
  position: 'absolute' as const,
  left: 6,
  bottom: 6,
  background: 'rgba(15,23,42,0.82)',
  color: '#fff',
  fontSize: 10,
  fontWeight: 800,
  padding: '4px 7px',
  borderRadius: 999,
} as const

const stockText = {
  fontSize: 11,
  color: '#64748b',
  marginBottom: 4,
  lineHeight: 1.35,
} as const

const main = {
  minHeight: '100vh',
  background: '#f8fafc',
  padding: 16,
} as const

const container = {
  maxWidth: 760,
  margin: '0 auto',
} as const

const logoWrap = {
  textAlign: 'center' as const,
  marginBottom: 12,
} as const

const logo = {
  height: 16,
  margin: '0 auto',
  display: 'block',
} as const

const heroCard = {
  background: '#fff',
  borderRadius: 22,
  padding: 18,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
  marginBottom: 16,
} as const

const sellerRow = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  marginBottom: 14,
} as const

const sellerImg = {
  width: 56,
  height: 56,
  borderRadius: '999px',
  objectFit: 'cover' as const,
} as const

const sellerFallback = {
  width: 56,
  height: 56,
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 20,
  flexShrink: 0,
} as const

const shopTitle = {
  margin: '0 0 4px 0',
  fontSize: 28,
  fontWeight: 800,
  color: '#0f172a',
  lineHeight: 1.2,
} as const

const shopSub = {
  margin: 0,
  color: '#64748b',
  fontSize: 14,
  lineHeight: 1.5,
} as const

const statusWrap = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 10,
  alignItems: 'center',
  marginBottom: 12,
} as const

const statusBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 800,
} as const

const hoursText = {
  fontSize: 13,
  color: '#475569',
  fontWeight: 600,
} as const

const noticeBox = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: 14,
  padding: '12px 14px',
  fontSize: 14,
  lineHeight: 1.6,
} as const

const stickyTabWrap = {
  position: 'sticky' as const,
  top: 0,
  zIndex: 50,
  marginBottom: 10,
} as const

const tabShell = {
  padding: '6px 0',
  borderRadius: 0,
  background: '#f8fafc',
  boxShadow: '0 6px 12px rgba(15,23,42,0.06)',
  borderBottom: '1px solid #e2e8f0',
} as const

const tabScroller = {
  display: 'flex',
  gap: 10,
  overflowX: 'auto' as const,
  WebkitOverflowScrolling: 'touch' as const,
  scrollbarWidth: 'none' as const,
} as const

const tabButton = {
  flexShrink: 0,
  borderRadius: 999,
  border: '1px solid #e2e8f0',
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as const

const activeTabButton = {
  background: '#0f172a',
  color: '#fff',
  borderColor: '#0f172a',
  boxShadow: '0 10px 20px rgba(15,23,42,0.18)',
} as const

const inactiveTabButton = {
  background: '#fff',
  color: '#0f172a',
  borderColor: '#e2e8f0',
} as const

const emptyCard = {
  background: '#fff',
  borderRadius: 20,
  padding: 18,
  border: '1px solid #e2e8f0',
  marginBottom: 16,
} as const

const productGrid = {
  display: 'grid',
  gap: 10,
  marginBottom: 16,
} as const

const productCard = {
  background: '#fff',
  borderRadius: 18,
  padding: 12,
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
} as const

const productContent = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 84px',
  alignItems: 'start',
  columnGap: 12,
  minWidth: 0,
  width: '100%',
} as const

const productInfo = {
  minWidth: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
} as const

const productImageButton = {
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  width: 84,
  minWidth: 84,
  justifySelf: 'end' as const,
  alignSelf: 'start' as const,
} as const

const productImageWrap = {
  width: 84,
  height: 84,
  borderRadius: 14,
  overflow: 'hidden',
  background: '#e2e8f0',
  position: 'relative' as const,
} as const

const productImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  display: 'block',
} as const

const productImagePlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  fontSize: 12,
} as const

const productName = {
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: 4,
  fontSize: 13,
  lineHeight: 1.3,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis' as const,
  wordBreak: 'break-word' as const,
  maxWidth: '100%',
} as const

const productPrice = {
  color: '#1d4ed8',
  fontWeight: 700,
  marginBottom: 4,
  fontSize: 14,
  lineHeight: 1.35,
} as const

const productDesc = {
  color: '#64748b',
  fontSize: 11,
  lineHeight: 1.35,
  marginBottom: 8,
  width: '100%',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis' as const,
} as const

const qtyWrap = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 6,
  marginTop: 2,
} as const

const qtyRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const

const qtyBtn = {
  width: 28,
  height: 28,
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 15,
  color: '#0f172a',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
} as const

const qtyValue = {
  minWidth: 16,
  fontWeight: 700,
  color: '#0f172a',
  fontSize: 13,
  textAlign: 'center' as const,
} as const

const qtyHintClosed = {
  fontSize: 11,
  lineHeight: 1.35,
  color: '#b45309',
  fontWeight: 700,
} as const

const checkoutCard = {
  background: '#fff',
  borderRadius: 22,
  padding: 18,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
} as const

const checkoutHeader = {
  marginBottom: 14,
} as const

const checkoutTitle = {
  margin: '0 0 4px 0',
  fontSize: 22,
  fontWeight: 800,
  color: '#0f172a',
} as const

const checkoutSub = {
  margin: 0,
  color: '#64748b',
  fontSize: 14,
} as const

const emptyCartBox = {
  padding: 14,
  borderRadius: 14,
  background: '#f8fafc',
  color: '#64748b',
  fontSize: 14,
  border: '1px solid #e2e8f0',
} as const

const closedCheckoutBox = {
  padding: 16,
  borderRadius: 14,
  background: '#fff7ed',
  color: '#9a3412',
  fontSize: 14,
  border: '1px solid #fed7aa',
} as const

const closedCheckoutTitle = {
  fontSize: 15,
  fontWeight: 800,
  marginBottom: 6,
} as const

const closedCheckoutText = {
  lineHeight: 1.6,
} as const

const summaryList = {
  display: 'grid',
  gap: 10,
  marginBottom: 14,
} as const

const summaryRowButton = {
  width: '100%',
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  textAlign: 'left' as const,
  cursor: 'pointer',
} as const

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 12px',
  borderRadius: 12,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#0f172a',
} as const

const summaryEditHint = {
  marginTop: 6,
  fontSize: 11,
  color: '#7c3aed',
  fontWeight: 700,
} as const

const galleryOverlay = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 999,
  background: 'rgba(2, 6, 23, 0.82)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
} as const

const galleryDialog = {
  width: '100%',
  maxWidth: 920,
  position: 'relative' as const,
} as const

const galleryCloseButton = {
  position: 'absolute' as const,
  top: -8,
  right: -4,
  width: 42,
  height: 42,
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(15,23,42,0.82)',
  color: '#fff',
  fontSize: 18,
  fontWeight: 700,
  cursor: 'pointer',
  zIndex: 2,
} as const

const galleryTopBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  color: '#fff',
  marginBottom: 12,
  paddingRight: 44,
} as const

const galleryTitle = {
  fontSize: 16,
  fontWeight: 800,
  lineHeight: 1.4,
} as const

const galleryCounter = {
  fontSize: 13,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.78)',
  flexShrink: 0,
} as const

const galleryImageArea = {
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 320,
} as const

const galleryImage = {
  width: '100%',
  maxHeight: '78vh',
  objectFit: 'contain' as const,
  borderRadius: 18,
  background: '#fff',
} as const

const galleryNavButton = {
  position: 'absolute' as const,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 42,
  height: 42,
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(15,23,42,0.72)',
  color: '#fff',
  fontSize: 28,
  lineHeight: 1,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const

const galleryNavLeft = {
  left: 12,
} as const

const galleryNavRight = {
  right: 12,
} as const

const galleryDots = {
  marginTop: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

const galleryDot = {
  width: 10,
  height: 10,
  borderRadius: '999px',
  border: 'none',
  background: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as const

const modalOverlay = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
} as const

const modalBox = {
  background: '#fff',
  padding: 16,
  borderRadius: 16,
  width: '90%',
  maxWidth: 400,
} as const

const optionRow = {
  display: 'flex',
  gap: 8,
  marginBottom: 6,
  fontSize: 14,
} as const

const noteBox = {
  width: '100%',
  marginTop: 10,
  padding: 8,
  borderRadius: 8,
  border: '1px solid #ccc',
} as const

const confirmBtn = {
  marginTop: 12,
  width: '100%',
  padding: 10,
  background: '#0f172a',
  color: '#fff',
  borderRadius: 10,
  border: 'none',
  fontWeight: 700,
} as const

const cancelBtn = {
  marginTop: 6,
  width: '100%',
  padding: 10,
  background: '#e5e7eb',
  borderRadius: 10,
  border: 'none',
} as const

const modalErrorBox = {
  marginBottom: 12,
  padding: '10px 12px',
  borderRadius: 10,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  fontSize: 13,
  lineHeight: 1.5,
} as const

const requiredMark = {
  color: '#dc2626',
  fontWeight: 800,
} as const

const groupMetaText = {
  fontSize: 12,
  color: '#64748b',
  marginBottom: 8,
} as const
