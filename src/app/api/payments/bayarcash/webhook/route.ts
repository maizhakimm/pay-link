import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type OrderRow = {
  id: string
  status: string | null
  payment_status: string | null
  fulfillment_status?: string | null
  gateway_transaction_id: string | null
  gross_amount?: number | null
  payment_method?: string | null
  seller_plan_type?: string | null
}

type OrderItemRow = {
  product_id: string
  quantity: number
  product_name: string | null
}

type ProductRow = {
  id: string
  name: string
  track_stock: boolean
  stock_quantity: number
  sold_out: boolean
  reserved_quantity?: number | null
}

type ExistingPaymentRow = {
  id: string
}

type FeeBreakdown = {
  sellerFeeAmount: number
  gatewayCostAmount: number
  gatewaySstAmount: number
  gatewayTotalCostAmount: number
  platformMarginAmount: number
  sstAmount: number
}

type SellerNewOrderRow = {
  id: string
  order_number: string | null
  buyer_name: string | null
  buyer_phone: string | null
  buyer_address: string | null
  total_amount: number | null
  amount: number | null
  delivery_info: any
  items: any
  seller_profile_id: string | null
  delivery_slot_label: string | null
  receipt_token: string | null
  whatsapp_notified_at?: string | null
}

type SellerProfileRow = {
  store_name: string | null
  whatsapp: string | null
}

function mapBayarcashStatus(status: number) {
  if (status === 3) return 'paid'
  if (status === 2) return 'failed'
  if (status === 4) return 'cancelled'
  return 'awaiting_payment'
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function getFeeBreakdown(
  method: string,
  plan: string,
  grossAmount: number
): FeeBreakdown {
  const normalizedMethod = String(method || 'FPX').toUpperCase()
  const normalizedPlan = String(plan || 'BASIC').toUpperCase()

  if (normalizedPlan !== 'BASIC') {
    return {
      sellerFeeAmount: 0,
      gatewayCostAmount: 0,
      gatewaySstAmount: 0,
      gatewayTotalCostAmount: 0,
      platformMarginAmount: 0,
      sstAmount: 0,
    }
  }

  let sellerFeeAmount = 0
  let gatewayCostAmount = 0
  let gatewaySstAmount = 0

  if (normalizedMethod === 'FPX') {
    sellerFeeAmount = 1.5
    gatewayCostAmount = 1.0
    gatewaySstAmount = 0.08
  } else if (normalizedMethod === 'CARD') {
    sellerFeeAmount = roundMoney(1 + grossAmount * 0.025)
    gatewayCostAmount = roundMoney(1 + grossAmount * 0.02)
    gatewaySstAmount = roundMoney(gatewayCostAmount * 0.08)
  } else if (
    normalizedMethod === 'DUITNOW_QR' ||
    normalizedMethod === 'BOOST_PAYFLEX' ||
    normalizedMethod === 'DUITNOW_ONLINE' ||
    normalizedMethod === 'SPAYLATER'
  ) {
    sellerFeeAmount = roundMoney(grossAmount * 0.025)
    gatewayCostAmount = roundMoney(grossAmount * 0.02)
    gatewaySstAmount = roundMoney(gatewayCostAmount * 0.08)
  }

  const gatewayTotalCostAmount = roundMoney(
    gatewayCostAmount + gatewaySstAmount
  )

  const platformMarginAmount = roundMoney(
    sellerFeeAmount - gatewayTotalCostAmount
  )

  return {
    sellerFeeAmount: roundMoney(sellerFeeAmount),
    gatewayCostAmount: roundMoney(gatewayCostAmount),
    gatewaySstAmount: roundMoney(gatewaySstAmount),
    gatewayTotalCostAmount,
    platformMarginAmount,
    sstAmount: 0,
  }
}

function calculateNetSellerAmount(
  grossAmount: number,
  sellerFeeAmount: number
) {
  return roundMoney(grossAmount - sellerFeeAmount)
}

function normalizeWhatsAppPhone(phone?: string | null) {
  const cleaned = String(phone || '').replace(/\D/g, '')

  if (!cleaned) return ''

  if (cleaned.startsWith('0')) {
    return `6${cleaned}`
  }

  if (cleaned.startsWith('60')) {
    return cleaned
  }

  return cleaned
}

function formatItemsForWhatsApp(order: SellerNewOrderRow) {
  const sourceItems = Array.isArray(order.items) ? order.items : []

  if (sourceItems.length > 0) {
    return sourceItems
      .map((item: any) => {
        const name =
          item.product_name ||
          item.name ||
          item.product?.name ||
          'Item'

        const quantity = Number(item.quantity || 1)

        const addons = Array.isArray(item.addons)
          ? item.addons
              .map((addon: any) => addon.option_name || addon.name || '')
              .filter(Boolean)
              .join(', ')
          : ''

        const note = item.note ? ` (${item.note})` : ''
        const addonText = addons ? ` + ${addons}` : ''

        return `• ${name}${addonText} x${quantity}${note}`
      })
      .join('\n')
  }

  return '-'
}

function formatDeliveryForWhatsApp(order: SellerNewOrderRow) {
  const deliveryInfo = order.delivery_info

  if (!deliveryInfo) {
    return order.buyer_address || '-'
  }

  const deliveryRequired = Boolean(deliveryInfo.delivery_required)

  if (!deliveryRequired) {
    return 'Pickup / No delivery'
  }

  const mode = deliveryInfo.delivery_mode || '-'
  const fee = Number(deliveryInfo.delivery_fee || 0)

  const address =
    deliveryInfo.resolved_address ||
    order.buyer_address ||
    [
      deliveryInfo.address?.address1,
      deliveryInfo.address?.address2,
      deliveryInfo.address?.postcode,
      deliveryInfo.address?.city,
      deliveryInfo.address?.district,
      deliveryInfo.address?.state,
    ]
      .filter(Boolean)
      .join(', ')

  const distanceText =
    deliveryInfo.distance_km !== null &&
    deliveryInfo.distance_km !== undefined
      ? ` | ${Number(deliveryInfo.distance_km).toFixed(2)}km`
      : ''

  return `${mode} | RM ${fee.toFixed(2)}${distanceText} | ${address || '-'}`
}

async function sendWhatsAppSellerNotification(orderNumber: string) {
  try {
    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      console.log('WhatsApp skipped: missing WHATSAPP_ACCESS_TOKEN')
      return
    }

    if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log('WhatsApp skipped: missing WHATSAPP_PHONE_NUMBER_ID')
      return
    }

    const templateName =
      process.env.WHATSAPP_TEMPLATE_SELLER_NEW_ORDER || 'seller_new_order'

    const languageCode =
      process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en'

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        buyer_name,
        buyer_phone,
        buyer_address,
        total_amount,
        amount,
        delivery_info,
        items,
        seller_profile_id,
        delivery_slot_label,
        receipt_token,
        whatsapp_notified_at
      `)
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (orderError) {
      console.error('WhatsApp order query error:', orderError.message)
      return
    }

    if (!orderData) {
      console.log('WhatsApp skipped: order not found')
      return
    }

    const order = orderData as SellerNewOrderRow

    if (order.whatsapp_notified_at) {
      console.log('WhatsApp skipped: already notified')
      return
    }

    if (!order.seller_profile_id) {
      console.log('WhatsApp skipped: missing seller_profile_id')
      return
    }

    const { data: sellerData, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('store_name, whatsapp')
      .eq('id', order.seller_profile_id)
      .maybeSingle()

    if (sellerError) {
      console.error('WhatsApp seller query error:', sellerError.message)
      return
    }

    const seller = sellerData as SellerProfileRow | null

    const sellerPhone = normalizeWhatsAppPhone(seller?.whatsapp)

    if (!sellerPhone) {
      console.log('WhatsApp skipped: seller whatsapp not found')
      return
    }

    const itemsText = formatItemsForWhatsApp(order)
    const deliveryText = formatDeliveryForWhatsApp(order)
    const slotText = order.delivery_slot_label || '-'
    const total = Number(order.total_amount ?? order.amount ?? 0)

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: sellerPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: order.order_number || '-',
                  },
                  {
                    type: 'text',
                    text: order.buyer_name || '-',
                  },
                  {
                    type: 'text',
                    text: itemsText || '-',
                  },
                  {
                    type: 'text',
                    text: total.toFixed(2),
                  },
                  {
                    type: 'text',
                    text: deliveryText || '-',
                  },
                  {
                    type: 'text',
                    text: slotText,
                  },
                ],
              },
            ],
          },
        }),
        cache: 'no-store',
      }
    )

    const json = await response.json()

    if (!response.ok) {
      console.error('WhatsApp send error:', json)
      return
    }

    await supabase
      .from('orders')
      .update({
        whatsapp_notified_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    console.log('WhatsApp sent to seller:', {
      order_number: order.order_number,
      to: sellerPhone,
      response: json,
    })
  } catch (error) {
    console.error('WhatsApp notification error:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const orderNumber = payload.order_number as string | undefined
    const transactionId = (payload.transaction_id as string | undefined) || null
    const statusNumber = Number(payload.status || 0)
    const statusDescription = payload.status_description || null
    const newPaymentStatus = mapBayarcashStatus(statusNumber)

    const paidAmount = roundMoney(Number(payload.amount || 0))
    const paymentChannel =
      payload.payment_channel !== undefined && payload.payment_channel !== null
        ? Number(payload.payment_channel)
        : null

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: 'Missing order_number' },
        { status: 400 }
      )
    }

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from('orders')
      .select(
        'id, status, payment_status, fulfillment_status, gateway_transaction_id, gross_amount, payment_method, seller_plan_type'
      )
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = existingOrder as OrderRow

    const grossAmount = roundMoney(Number(order.gross_amount ?? paidAmount ?? 0))
    const paymentMethod = String(order.payment_method || 'FPX').toUpperCase()
    const sellerPlan = String(order.seller_plan_type || 'BASIC').toUpperCase()

    const feeBreakdown = getFeeBreakdown(paymentMethod, sellerPlan, grossAmount)
    const netSellerAmount = calculateNetSellerAmount(
      grossAmount,
      feeBreakdown.sellerFeeAmount
    )

    if (
      order.payment_status === 'paid' &&
      order.gateway_transaction_id &&
      order.gateway_transaction_id === transactionId
    ) {
      await sendWhatsAppSellerNotification(orderNumber)
      return NextResponse.json({ ok: true, duplicate: true })
    }

    if (statusNumber === 3) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name')
        .eq('order_id', order.id)

      const typedOrderItems = (orderItems || []) as OrderItemRow[]
      const productIds = typedOrderItems
        .map((item) => item.product_id)
        .filter(Boolean)

      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select(
            'id, name, track_stock, stock_quantity, sold_out, reserved_quantity'
          )
          .in('id', productIds)

        const productMap = new Map(
          (products || []).map((product) => [
            product.id,
            product as ProductRow,
          ])
        )

        for (const item of typedOrderItems) {
          const product = productMap.get(item.product_id)

          if (!product || !product.track_stock) continue

          if (product.stock_quantity < item.quantity) {
            await supabase
              .from('orders')
              .update({
                payment_status: 'failed',
                gateway_status_description: 'Stock conflict during payment',
                updated_at: new Date().toISOString(),
              })
              .eq('order_number', orderNumber)

            return NextResponse.json(
              { ok: false, error: 'Stock conflict' },
              { status: 409 }
            )
          }
        }

        for (const item of typedOrderItems) {
          const product = productMap.get(item.product_id)

          if (!product || !product.track_stock) continue

          const newStock = Math.max(0, product.stock_quantity - item.quantity)
          const newReserved = Math.max(
            0,
            (product.reserved_quantity || 0) - item.quantity
          )
          const newSoldOut = newStock <= 0

          await supabase
            .from('products')
            .update({
              stock_quantity: newStock,
              reserved_quantity: newReserved,
              sold_out: newSoldOut,
              reserved_until: null,
            })
            .eq('id', product.id)
        }
      }
    }

    if (statusNumber === 2 || statusNumber === 4) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name')
        .eq('order_id', order.id)

      const typedOrderItems = (orderItems || []) as OrderItemRow[]
      const productIds = typedOrderItems
        .map((item) => item.product_id)
        .filter(Boolean)

      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select(
            'id, name, track_stock, stock_quantity, sold_out, reserved_quantity'
          )
          .in('id', productIds)

        const productMap = new Map(
          (products || []).map((product) => [
            product.id,
            product as ProductRow,
          ])
        )

        for (const item of typedOrderItems) {
          const product = productMap.get(item.product_id)

          if (!product || !product.track_stock) continue

          const newReserved = Math.max(
            0,
            (product.reserved_quantity || 0) - item.quantity
          )

          await supabase
            .from('products')
            .update({
              reserved_quantity: newReserved,
              reserved_until: null,
            })
            .eq('id', product.id)
        }
      }
    }

    if (transactionId) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('gateway_transaction_id', transactionId)
        .maybeSingle()

      if (!existingPayment) {
        await supabase.from('payments').insert({
          order_id: order.id,
          gateway_name: 'BayarCash',
          gateway_transaction_id: transactionId,
          payment_channel: paymentChannel,
          paid_amount: paidAmount,
          gateway_fee: feeBreakdown.sellerFeeAmount,
          gateway_status: String(statusNumber),
          payment_status: newPaymentStatus,
          raw_response_json: payload,
          paid_at: statusNumber === 3 ? new Date().toISOString() : null,
        })
      } else {
        const typedExistingPayment = existingPayment as ExistingPaymentRow

        await supabase
          .from('payments')
          .update({
            payment_channel: paymentChannel,
            paid_amount: paidAmount,
            gateway_fee: feeBreakdown.sellerFeeAmount,
            gateway_status: String(statusNumber),
            payment_status: newPaymentStatus,
            raw_response_json: payload,
            paid_at: statusNumber === 3 ? new Date().toISOString() : null,
          })
          .eq('id', typedExistingPayment.id)
      }
    }

    await supabase
      .from('orders')
      .update({
        gateway_transaction_id: transactionId,
        gateway_status: statusNumber,
        gateway_status_description: statusDescription,
        payment_status: newPaymentStatus,
        payout_status: statusNumber === 3 ? 'eligible' : 'unpaid',
        paid_at: statusNumber === 3 ? new Date().toISOString() : null,
        settlement_days: statusNumber === 3 ? 1 : null,
        eligible_payout_at:
          statusNumber === 3 ? new Date().toISOString() : null,

        gateway_fee: feeBreakdown.sellerFeeAmount,
        platform_fee: 0,
        platform_fee_amount: 0,
        sst: 0,
        seller_net: netSellerAmount,

        gross_amount: grossAmount,
        net_seller_amount: netSellerAmount,

        seller_fee_amount: feeBreakdown.sellerFeeAmount,
        gateway_cost_amount: feeBreakdown.gatewayCostAmount,
        gateway_sst_amount: feeBreakdown.gatewaySstAmount,
        gateway_total_cost_amount: feeBreakdown.gatewayTotalCostAmount,
        platform_margin_amount: feeBreakdown.platformMarginAmount,
        sst_amount: feeBreakdown.sstAmount,

        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)

    if (statusNumber === 3) {
      await sendWhatsAppSellerNotification(orderNumber)
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error'

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
