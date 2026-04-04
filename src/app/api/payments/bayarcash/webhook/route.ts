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
  gateway_transaction_id: string | null
  gateway_fee: number | null
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

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const orderNumber = payload.order_number as string | undefined
    const transactionId = (payload.transaction_id as string | undefined) || null
    const statusNumber = Number(payload.status || 0)
    const statusDescription = payload.status_description || null
    const newStatus = mapBayarcashStatus(statusNumber)

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
      .select('id, status, payment_status, gateway_transaction_id, gateway_fee')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = existingOrder as OrderRow

    if (
      order.payment_status === 'paid' &&
      order.gateway_transaction_id &&
      order.gateway_transaction_id === transactionId
    ) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    if (statusNumber === 3) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name')
        .eq('order_id', order.id)

      const typedOrderItems = (orderItems || []) as OrderItemRow[]
      const productIds = typedOrderItems.map((item) => item.product_id).filter(Boolean)

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
                status: 'failed',
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
      const productIds = typedOrderItems.map((item) => item.product_id).filter(Boolean)

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
          gateway_fee: order.gateway_fee || 0,
          gateway_status: String(statusNumber),
          payment_status: newStatus,
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
            gateway_fee: order.gateway_fee || 0,
            gateway_status: String(statusNumber),
            payment_status: newStatus,
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
        status: newStatus,
        payment_status: newStatus,
        payout_status: statusNumber === 3 ? 'eligible' : 'unpaid',
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
