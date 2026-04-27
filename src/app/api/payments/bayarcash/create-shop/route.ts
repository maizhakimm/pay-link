import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createBayarcashPaymentIntentChecksum,
  BAYARCASH_CHANNELS,
} from '../../../../../lib/bayarcash'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type RequestItem = {
  product_id: string
  quantity: number
}

type CheckoutAddon = {
  group_id?: string
  group_name?: string
  option_id?: string
  option_name?: string
  price?: number
}

type RequestCheckoutItem = {
  product_id: string
  quantity: number
  name?: string
  base_price?: number
  unit_price?: number
  line_total?: number
  note?: string
  addons?: CheckoutAddon[]
}

type ProductRow = {
  id: string
  name: string
  slug: string
  price: number
  is_active: boolean
  seller_profile_id: string | null
  track_stock: boolean
  stock_quantity: number
  sold_out: boolean
  reserved_quantity?: number | null
  reserved_until?: string | null
}

type ValidItem = {
  product: ProductRow
  quantity: number
  unit_price: number
  line_total: number
  base_price: number
  addons: {
    group_id: string
    group_name: string
    option_id: string
    option_name: string
    price: number
  }[]
  note: string
}

type BayarcashResponse = {
  id?: string
  url?: string
  message?: string
}

type DeliveryPayload = {
  address1?: string
  address2?: string
  postcode?: string
  city?: string
  district?: string
  state?: string
  distance_km?: number | null
  resolved_address?: string | null
} | null

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'
  | 'distance_based'

type SellerRow = {
  accept_orders_anytime?: boolean | null
  opening_time?: string | null
  closing_time?: string | null
  temporarily_closed?: boolean | null
  closed_message?: string | null
  plan_type?: string | null
  delivery_mode?: DeliveryMode | null
  delivery_fee?: number | null
  delivery_radius_km?: number | null
  delivery_rate_per_km?: number | null
  delivery_min_fee?: number | null
  pickup_address?: string | null
  latitude?: number | null
  longitude?: number | null
}

function isReservationExpired(reservedUntil?: string | null) {
  if (!reservedUntil) return true
  return new Date(reservedUntil).getTime() <= Date.now()
}

function buildBuyerAddress(delivery: DeliveryPayload) {
  if (!delivery) return null

  const parts = [
    delivery.address1,
    delivery.address2,
    delivery.postcode,
    delivery.city,
    delivery.district,
    delivery.state,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean)

  return parts.length ? parts.join(', ') : null
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function generateReceiptToken() {
  return crypto.randomUUID().replace(/-/g, '')
}

function estimateGatewayFee() {
  return 1.0
}

function mapPaymentMethod(channel: number) {
  if (channel === BAYARCASH_CHANNELS.FPX) return 'FPX'
  if (channel === BAYARCASH_CHANNELS.CARD) return 'CARD'
  if (channel === BAYARCASH_CHANNELS.DUITNOW_QR) return 'DUITNOW_QR'
  if (channel === BAYARCASH_CHANNELS.BOOST_PAYFLEX) return 'BOOST_PAYFLEX'
  if (channel === BAYARCASH_CHANNELS.DUITNOW_ONLINE) return 'DUITNOW_ONLINE'
  if (channel === BAYARCASH_CHANNELS.SPAYLATER) return 'SPAYLATER'
  return 'FPX'
}

function calculatePlatformFee(amount: number, method: string, plan: string) {
  const normalizedPlan = (plan || 'BASIC').toUpperCase()

  if (normalizedPlan !== 'BASIC') {
    return 0
  }

  if (method === 'FPX') {
    return 1.5
  }

  if (method === 'DUITNOW_QR') {
    return roundMoney(amount * 0.025)
  }

  if (method === 'BOOST_PAYFLEX') {
    return roundMoney(amount * 0.025)
  }

  if (method === 'CARD') {
    return roundMoney(1 + amount * 0.025)
  }

  return 0
}

function isAllowedPaymentChannel(channel: number) {
  const allowedChannels: number[] = [
    BAYARCASH_CHANNELS.FPX,
    BAYARCASH_CHANNELS.CARD,
    BAYARCASH_CHANNELS.DUITNOW_QR,
    BAYARCASH_CHANNELS.BOOST_PAYFLEX,
  ]

  return allowedChannels.includes(channel)
}

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180

  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

async function geocodeAddress(address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY')
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', address)
  url.searchParams.set('key', apiKey)
  url.searchParams.set('region', 'my')

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error('Failed to reach Google Geocoding API')
  }

  if (data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(
      data.error_message ||
        'Alamat customer tidak dapat dikenal pasti. Sila semak semula alamat delivery.'
    )
  }

  const first = data.results[0]
  const lat = Number(first?.geometry?.location?.lat)
  const lng = Number(first?.geometry?.location?.lng)
  const formattedAddress = String(first?.formatted_address || address)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Latitude/longitude customer tidak dijumpai.')
  }

  return {
    latitude: lat,
    longitude: lng,
    formattedAddress,
  }
}

function getAppliedFixedDeliveryFee(params: {
  deliveryRequired: boolean
  deliveryMode: DeliveryMode
  deliveryFee: number
}) {
  const { deliveryRequired, deliveryMode, deliveryFee } = params

  if (!deliveryRequired) return 0
  if (deliveryMode !== 'fixed_fee') return 0

  const fee = Number(deliveryFee || 0)
  if (!Number.isFinite(fee) || fee <= 0) return 0

  return roundMoney(fee)
}

async function getDistanceBasedDelivery(params: {
  seller: SellerRow
  deliveryRequired: boolean
  deliveryMode: DeliveryMode
  delivery: DeliveryPayload
}) {
  const { seller, deliveryRequired, deliveryMode, delivery } = params

  if (!deliveryRequired || deliveryMode !== 'distance_based') {
    return {
      fee: 0,
      distanceKm: null as number | null,
      resolvedAddress: null as string | null,
      customerLatitude: null as number | null,
      customerLongitude: null as number | null,
    }
  }

  const sellerLat = Number(seller.latitude)
  const sellerLng = Number(seller.longitude)
  const radiusKm = Number(seller.delivery_radius_km || 0)
  const ratePerKm = Number(seller.delivery_rate_per_km || 0)
  const minFee = Number(seller.delivery_min_fee || 0)

  if (!Number.isFinite(sellerLat) || !Number.isFinite(sellerLng)) {
    throw new Error('Lokasi seller belum lengkap untuk distance based delivery.')
  }

  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    throw new Error('Radius penghantaran seller belum ditetapkan dengan betul.')
  }

  if (!Number.isFinite(ratePerKm) || ratePerKm <= 0) {
    throw new Error('Kadar delivery per km seller belum ditetapkan dengan betul.')
  }

  const buyerAddress = buildBuyerAddress(delivery)

  if (!buyerAddress) {
    throw new Error('Alamat delivery customer tidak lengkap.')
  }

  const customer = await geocodeAddress(buyerAddress)
  const distanceKm = roundMoney(
    calculateDistanceKm(sellerLat, sellerLng, customer.latitude, customer.longitude)
  )

  if (distanceKm > radiusKm) {
    throw new Error(
      `Maaf, lokasi customer di luar kawasan penghantaran seller ini. Jarak ${distanceKm.toFixed(
        2
      )}km, maksimum ${radiusKm.toFixed(2)}km.`
    )
  }

  const fee = roundMoney(Math.max(minFee, distanceKm * ratePerKm))

  return {
    fee,
    distanceKm,
    resolvedAddress: customer.formattedAddress,
    customerLatitude: customer.latitude,
    customerLongitude: customer.longitude,
  }
}

function getCurrentMalaysiaMinutes() {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date())
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || '0')

  return hour * 60 + minute
}

function normalizeCheckoutItems(
  checkoutItems: RequestCheckoutItem[] | undefined,
  fallbackItems: RequestItem[]
) {
  if (Array.isArray(checkoutItems) && checkoutItems.length > 0) {
    return checkoutItems
      .filter((item) => item && item.product_id)
      .map((item) => ({
        product_id: String(item.product_id),
        quantity: Math.max(1, Math.floor(Number(item.quantity || 1))),
        name: item.name ? String(item.name) : '',
        base_price: Number(item.base_price || 0),
        unit_price: Number(item.unit_price || 0),
        line_total: Number(item.line_total || 0),
        note: item.note ? String(item.note) : '',
        addons: Array.isArray(item.addons)
          ? item.addons.map((addon) => ({
              group_id: String(addon.group_id || ''),
              group_name: String(addon.group_name || ''),
              option_id: String(addon.option_id || ''),
              option_name: String(addon.option_name || ''),
              price: Number(addon.price || 0),
            }))
          : [],
      }))
  }

  return fallbackItems.map((item) => ({
    product_id: String(item.product_id),
    quantity: Math.max(1, Math.floor(Number(item.quantity || 1))),
    name: '',
    base_price: 0,
    unit_price: 0,
    line_total: 0,
    note: '',
    addons: [] as {
      group_id: string
      group_name: string
      option_id: string
      option_name: string
      price: number
    }[],
  }))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const deliverySlotId = body.deliverySlotId || null
    const deliverySlotLabel = body.deliverySlotLabel || null

    const sellerId = body.sellerId as string
    const shopSlug = body.shopSlug as string
    const name = body.name as string
    const email = body.email as string
    const phone = body.phone as string
    const items = (body.items || []) as RequestItem[]
    const checkoutItems = (body.checkoutItems || []) as RequestCheckoutItem[]
    const delivery = (body.delivery || null) as DeliveryPayload

    const requestedSubtotal = Number(body.subtotal || 0)
    const deliveryRequired = Boolean(body.deliveryRequired)
    const deliveryMode = (
      body.deliveryMode || 'pay_rider_separately'
    ) as DeliveryMode
    const requestedDeliveryFee = Number(body.deliveryFee || 0)

    const requestedChannel = Number(body.paymentChannel)
    const paymentChannel = isAllowedPaymentChannel(requestedChannel)
      ? requestedChannel
      : BAYARCASH_CHANNELS.FPX

    if (!sellerId) {
      return NextResponse.json(
        { ok: false, error: 'Missing seller ID' },
        { status: 400 }
      )
    }

    const { data: seller, error: sellerError } = await supabase
      .from('seller_profiles')
      .select(`
        accept_orders_anytime,
        opening_time,
        closing_time,
        temporarily_closed,
        closed_message,
        plan_type,
        delivery_mode,
        delivery_fee,
        delivery_radius_km,
        delivery_rate_per_km,
        delivery_min_fee,
        pickup_address,
        latitude,
        longitude
      `)
      .eq('id', sellerId)
      .maybeSingle()

    if (sellerError || !seller) {
      return NextResponse.json(
        { ok: false, error: 'Seller not found' },
        { status: 404 }
      )
    }

    if (seller.temporarily_closed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            seller.closed_message ||
            'Kedai kini ditutup sementara. Sila cuba lagi nanti.',
        },
        { status: 400 }
      )
    }

    if (!seller.accept_orders_anytime) {
      if (seller.opening_time && seller.closing_time) {
        const currentMinutes = getCurrentMalaysiaMinutes()

        const [openH, openM] = seller.opening_time.split(':').map(Number)
        const [closeH, closeM] = seller.closing_time.split(':').map(Number)

        const open = openH * 60 + openM
        const close = closeH * 60 + closeM

        let isOpen = false

        if (open < close) {
          isOpen = currentMinutes >= open && currentMinutes <= close
        } else {
          isOpen = currentMinutes >= open || currentMinutes <= close
        }

        if (!isOpen) {
          return NextResponse.json(
            {
              ok: false,
              error:
                seller.closed_message ||
                `Kedai hanya menerima tempahan dari ${seller.opening_time} hingga ${seller.closing_time}`,
            },
            { status: 400 }
          )
        }
      }
    }

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: 'No items selected' },
        { status: 400 }
      )
    }

    const normalizedCheckoutItems = normalizeCheckoutItems(checkoutItems, items)
    const productIds = normalizedCheckoutItems.map((item) => item.product_id)

    const { data: products, error: productError } = await supabase
      .from('products')
      .select(
        'id, name, slug, price, is_active, seller_profile_id, track_stock, stock_quantity, sold_out, reserved_quantity, reserved_until'
      )
      .in('id', productIds)
      .eq('seller_profile_id', sellerId)

    if (productError || !products || products.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Products not found' },
        { status: 404 }
      )
    }

    for (const product of products as ProductRow[]) {
      const reservedQty = product.reserved_quantity || 0
      const expired = isReservationExpired(product.reserved_until)

      if (reservedQty > 0 && expired) {
        await supabase
          .from('products')
          .update({
            reserved_quantity: 0,
            reserved_until: null,
          })
          .eq('id', product.id)
      }
    }

    const { data: refreshedProducts, error: refreshedError } = await supabase
      .from('products')
      .select(
        'id, name, slug, price, is_active, seller_profile_id, track_stock, stock_quantity, sold_out, reserved_quantity, reserved_until'
      )
      .in('id', productIds)
      .eq('seller_profile_id', sellerId)

    if (refreshedError || !refreshedProducts || refreshedProducts.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Products not found after refresh' },
        { status: 404 }
      )
    }

    const productMap = new Map(
      (refreshedProducts as ProductRow[]).map((product) => [product.id, product])
    )

    const validItems: ValidItem[] = []

    for (const item of normalizedCheckoutItems) {
      const product = productMap.get(item.product_id)
      const qty = Math.max(1, Math.floor(Number(item.quantity || 1)))

      if (!product || !product.is_active || qty <= 0) continue

      if (product.track_stock) {
        const reserved = product.reserved_quantity || 0
        const availableStock = product.stock_quantity - reserved

        if (product.sold_out || availableStock < qty) {
          return NextResponse.json(
            {
              ok: false,
              error: `${product.name} stock not enough`,
            },
            { status: 400 }
          )
        }
      }

      const safeAddons = Array.isArray(item.addons)
        ? item.addons.map((addon) => ({
            group_id: String(addon.group_id || ''),
            group_name: String(addon.group_name || ''),
            option_id: String(addon.option_id || ''),
            option_name: String(addon.option_name || ''),
            price: Number(addon.price || 0),
          }))
        : []

      const addonTotal = safeAddons.reduce(
        (sum, addon) => sum + Number(addon.price || 0),
        0
      )

      const basePrice =
        Number.isFinite(Number(item.base_price)) && Number(item.base_price) >= 0
          ? Number(item.base_price)
          : Number(product.price || 0)

      const fallbackUnitPrice = roundMoney(basePrice + addonTotal)

      const unitPrice =
        Number.isFinite(Number(item.unit_price)) && Number(item.unit_price) > 0
          ? Number(item.unit_price)
          : fallbackUnitPrice

      const lineTotal =
        Number.isFinite(Number(item.line_total)) && Number(item.line_total) > 0
          ? roundMoney(Number(item.line_total))
          : roundMoney(unitPrice * qty)

      validItems.push({
        product,
        quantity: qty,
        unit_price: unitPrice,
        line_total: lineTotal,
        base_price: basePrice,
        addons: safeAddons,
        note: item.note ? String(item.note) : '',
      })
    }

    if (!validItems.length) {
      return NextResponse.json(
        { ok: false, error: 'No valid products selected' },
        { status: 400 }
      )
    }

    const reserveUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    for (const item of validItems) {
      if (!item.product.track_stock) continue

      const currentReserved = item.product.reserved_quantity || 0

      const { error: reserveError } = await supabase
        .from('products')
        .update({
          reserved_quantity: currentReserved + item.quantity,
          reserved_until: reserveUntil,
        })
        .eq('id', item.product.id)

      if (reserveError) {
        return NextResponse.json(
          { ok: false, error: `Failed to reserve stock for ${item.product.name}` },
          { status: 500 }
        )
      }
    }

    const subtotal = roundMoney(
      validItems.reduce((sum, item) => sum + item.line_total, 0)
    )

    const effectiveDeliveryMode = (
      seller.delivery_mode ||
      deliveryMode ||
      'pay_rider_separately'
    ) as DeliveryMode

    const effectiveDeliveryFee = Number.isFinite(Number(seller.delivery_fee))
      ? Number(seller.delivery_fee || 0)
      : requestedDeliveryFee

    const fixedFee = getAppliedFixedDeliveryFee({
      deliveryRequired,
      deliveryMode: effectiveDeliveryMode,
      deliveryFee: effectiveDeliveryFee,
    })

    const distanceDelivery = await getDistanceBasedDelivery({
      seller: seller as SellerRow,
      deliveryRequired,
      deliveryMode: effectiveDeliveryMode,
      delivery,
    })

    const appliedDeliveryFee =
      effectiveDeliveryMode === 'distance_based'
        ? distanceDelivery.fee
        : fixedFee

    const totalAmount = roundMoney(subtotal + appliedDeliveryFee)
    const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0)

    const paymentMethod = mapPaymentMethod(paymentChannel)
    const sellerPlan = (seller.plan_type || 'BASIC').toUpperCase()

    const gatewayFee = roundMoney(estimateGatewayFee())
    const platformFee = roundMoney(
      calculatePlatformFee(totalAmount, paymentMethod, sellerPlan)
    )
    const sellerNet = roundMoney(Math.max(0, totalAmount - platformFee))

    const firstProduct = validItems[0].product
    const orderNumber = `ORD-${Date.now()}`
    const receiptToken = generateReceiptToken()
    const amount = totalAmount.toFixed(2)
    const buyerAddress =
      distanceDelivery.resolvedAddress || buildBuyerAddress(delivery)

    const itemsSnapshot = validItems.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      product_slug: item.product.slug,
      base_price: item.base_price,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
      addons: item.addons,
      note: item.note,
    }))

    const deliveryInfoPayload = {
      delivery_required: deliveryRequired,
      delivery_mode: effectiveDeliveryMode,
      delivery_fee: appliedDeliveryFee,
      distance_km: distanceDelivery.distanceKm,
      resolved_address: distanceDelivery.resolvedAddress,
      seller_pickup_address: seller.pickup_address || null,
      seller_latitude: seller.latitude ?? null,
      seller_longitude: seller.longitude ?? null,
      customer_latitude: distanceDelivery.customerLatitude,
      customer_longitude: distanceDelivery.customerLongitude,
      address: delivery,
    }

    const { data: insertedOrder, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        product_id: firstProduct.id,
        product_slug: firstProduct.slug,
        product_name:
          validItems.length === 1
            ? firstProduct.name
            : `${validItems.length} menu items`,

        seller_profile_id: sellerId,
        seller_id: sellerId,

        buyer_name: name || 'Customer',
        buyer_email: email || 'customer@example.com',
        buyer_phone: phone || '',
        buyer_address: buyerAddress,

        delivery_slot_id: deliverySlotId,
        delivery_slot_label: deliverySlotLabel,

        customer_name: name || 'Customer',
        customer_email: email || 'customer@example.com',
        customer_phone: phone || '',

        delivery_info: deliveryInfoPayload,
        items: itemsSnapshot,
        checkout_items: itemsSnapshot,

        quantity: totalQuantity,
        amount,
        total_amount: totalAmount,
        subtotal,
        requested_subtotal: Number.isFinite(requestedSubtotal)
          ? requestedSubtotal
          : subtotal,
        gateway_fee: gatewayFee,
        platform_fee: platformFee,
        seller_net: sellerNet,

        seller_plan_type: sellerPlan,
        payment_method: paymentMethod,
        gross_amount: totalAmount,
        platform_fee_amount: platformFee,
        net_seller_amount: sellerNet,

        currency: 'MYR',

        order_number: orderNumber,
        order_no: orderNumber,
        receipt_token: receiptToken,

        payment_provider: 'bayarcash',
        payment_channel: paymentChannel,

        status: 'pending',
        payment_status: 'pending',
        fulfillment_status: 'pending',
        payout_status: 'unpaid',
      })
      .select('id')
      .single()

    if (orderInsertError || !insertedOrder) {
      return NextResponse.json(
        {
          ok: false,
          error: orderInsertError?.message || 'Failed to create order',
        },
        { status: 500 }
      )
    }

    const orderItemsPayload = validItems.map((item) => ({
      order_id: insertedOrder.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_slug: item.product.slug,
      unit_price: item.unit_price.toFixed(2),
      quantity: item.quantity,
      line_total: item.line_total.toFixed(2),
      addons: item.addons,
      note: item.note,
    }))

    const { error: itemInsertError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)

    if (itemInsertError) {
      await supabase.from('orders').delete().eq('id', insertedOrder.id)

      return NextResponse.json(
        {
          ok: false,
          error: itemInsertError.message || 'Failed to create order items',
        },
        { status: 500 }
      )
    }

    const checksum = createBayarcashPaymentIntentChecksum({
      payment_channel: paymentChannel,
      order_number: orderNumber,
      amount,
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
    })

    const safeShopSlug = (shopSlug || '').trim()

    const baseReturnUrl = safeShopSlug
      ? `${process.env.NEXT_PUBLIC_APP_URL}/payment-return?shop=${encodeURIComponent(
          safeShopSlug
        )}&order_number=${encodeURIComponent(orderNumber)}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/payment-return?order_number=${encodeURIComponent(
          orderNumber
        )}`

    const payload = {
      payment_channel: paymentChannel,
      portal_key: process.env.BAYARCASH_PORTAL_KEY,
      order_number: orderNumber,
      amount,
      payer_name: name || 'Customer',
      payer_email: email || 'customer@example.com',
      payer_telephone_number: phone || '',
      return_url: baseReturnUrl,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/bayarcash/webhook`,
      checksum,
    }

    const response = await fetch(`${process.env.BAYARCASH_BASE_URL}/payment-intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BAYARCASH_PAT}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const text = await response.text()

    let parsedResponse: BayarcashResponse | null = null

    try {
      parsedResponse = JSON.parse(text) as BayarcashResponse
    } catch {
      parsedResponse = null
    }

    if (!response.ok) {
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', insertedOrder.id)

      return NextResponse.json(
        {
          ok: false,
          error: parsedResponse?.message || 'Payment failed',
        },
        { status: response.status }
      )
    }

    await supabase
      .from('orders')
      .update({
        gateway_payment_intent_id: parsedResponse?.id || null,
        payment_status: 'awaiting_payment',
        status: 'awaiting_payment',
        updated_at: new Date().toISOString(),
      })
      .eq('id', insertedOrder.id)

    return NextResponse.json({
      ok: true,
      payment_url: parsedResponse?.url || null,
      order_number: orderNumber,
      receipt_token: receiptToken,
      receipt_url: `${process.env.NEXT_PUBLIC_APP_URL}/r/${receiptToken}`,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create payment'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
