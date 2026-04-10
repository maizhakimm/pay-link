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
  gateway_fee: number | null
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

function mapBayarcashStatus(status: number) {
  if (status === 3) return 'paid'
  if (status === 2) return 'failed'
  if (status === 4) return 'cancelled'
  return 'awaiting_payment'
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function estimateGatewayFee(_amount: number, _method: string) {
  // Temporary logic aligned with your SQL test:
  // RM1 flat gateway fee
  return 1.0
}

function calculatePlatformFee(amount: number, _method: string, plan: string) {
  const normalizedPlan = (plan || 'BASIC').toUpperCase()

  if (normalizedPlan !== 'BASIC') {
    return 0
  }

  return roundMoney(Math.max(amount * 0.05, 0.5))
}

function calculateSst(platformFee: number) {
  return roundMoney(platformFee * 0.08)
}

function calculateNetSellerAmount(
  grossAmount: number,
  gatewayFee: number,
  platformFee: number,
  sst: number
) {
  return roundMoney(grossAmount - gatewayFee - platformFee - sst)
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
        'id, status, payment_status, fulfillment_status, gateway_transaction_id, gateway_fee, gross_amount, payment_method, seller_plan_type'
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

    const grossAmount = roundMoney(
      Number(order.gross_amount ?? paidAmount ?? 0)
    )
    const paymentMethod = String(order.payment_method || 'FPX').toUpperCase()
    const sellerPlan = String(order.seller_plan_type || 'BASIC').toUpperCase()

    const gatewayFee = roundMoney(estimateGatewayFee(grossAmount, paymentMethod))
    const platformFee = roundMoney(
      calculatePlatformFee(grossAmount, paymentMethod, sellerPlan)
    )
    const sst = roundMoney(calculateSst(platformFee))
    const netSellerAmount = calculateNetSellerAmount(
      grossAmount,
      gatewayFee,
      platformFee,
      sst
    )

    // Prevent duplicate webhook processing for already-paid same transaction
    if (
      order.payment_status === 'paid' &&
      order.gateway_transaction_id &&
      order.gateway_transaction_id === transactionId
    ) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    // HANDLE SUCCESS PAYMENT
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
          .select('id, name, track_stock, stock_quantity, sold_out, reserved_quantity')
          .in('id', productIds)

        const productMap = new Map(
          (products || []).map((product) => [product.id, product as ProductRow])
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

    // HANDLE FAILED / CANCELLED PAYMENT
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
          .select('id, name, track_stock, stock_quantity, sold_out, reserved_quantity')
          .in('id', productIds)

        const productMap = new Map(
          (products || []).map((product) => [product.id, product as ProductRow])
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

    // Insert / update payment log
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
          gateway_fee: gatewayFee,
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
            gateway_fee: gatewayFee,
            gateway_status: String(statusNumber),
            payment_status: newPaymentStatus,
            raw_response_json: payload,
            paid_at: statusNumber === 3 ? new Date().toISOString() : null,
          })
          .eq('id', typedExistingPayment.id)
      }
    }

    // IMPORTANT:
    // payment webhook updates payment_status only
    // do NOT overwrite seller fulfilment status
    await supabase
      .from('orders')
      .update({
        gateway_transaction_id: transactionId,
        gateway_status: statusNumber,
        gateway_status_description: statusDescription,
        payment_status: newPaymentStatus,
        payout_status: statusNumber === 3 ? 'eligible' : 'unpaid',

        gross_amount: grossAmount,
        gateway_fee: gatewayFee,
        platform_fee: platformFee,
        platform_fee_amount: platformFee,
        sst,
        seller_net: netSellerAmount,
        net_seller_amount: netSellerAmount,

        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error'

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
