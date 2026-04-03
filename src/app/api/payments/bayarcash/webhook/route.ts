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

function mapBayarcashStatus(status: number) {
  if (status === 3) return 'paid'
  if (status === 2) return 'failed'
  if (status === 4) return 'cancelled'
  return 'awaiting_payment'
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const orderNumber = payload.order_number as string | undefined
    const transactionId = (payload.transaction_id as string | undefined) || null
    const statusNumber = Number(payload.status || 0)
    const statusDescription = payload.status_description || null
    const newStatus = mapBayarcashStatus(statusNumber)

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: 'Missing order_number' },
        { status: 400 }
      )
    }

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from('orders')
      .select('id, status, payment_status, gateway_transaction_id')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = existingOrder as OrderRow

    // Prevent duplicate webhook
    if (
      order.payment_status === 'paid' &&
      order.gateway_transaction_id &&
      order.gateway_transaction_id === transactionId
    ) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    // 🔥 HANDLE SUCCESS PAYMENT
    if (statusNumber === 3) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name')
        .eq('order_id', order.id)

      const productIds = (orderItems || []).map((item) => item.product_id)

      const { data: products } = await supabase
        .from('products')
        .select('id, name, track_stock, stock_quantity, sold_out, reserved_quantity')
        .in('id', productIds)

      const productMap = new Map(
        (products || []).map((product) => [product.id, product as ProductRow])
      )

      // CHECK AGAIN (ANTI OVERSELL)
      for (const item of orderItems as OrderItemRow[]) {
        const product = productMap.get(item.product_id)

        if (!product) continue

        if (product.track_stock) {
          const reserved = product.reserved_quantity || 0
          const available = product.stock_quantity - reserved

          if (available < 0) {
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
      }

      // 🔥 FINAL STOCK UPDATE
      for (const item of orderItems as OrderItemRow[]) {
        const product = productMap.get(item.product_id)

        if (!product || !product.track_stock) continue

        const newStock = Math.max(
          0,
          product.stock_quantity - item.quantity
        )

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
          })
          .eq('id', product.id)
      }
    }

    // 🔥 HANDLE FAILED / CANCELLED PAYMENT
    if (statusNumber === 2 || statusNumber === 4) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name')
        .eq('order_id', order.id)

      const productIds = (orderItems || []).map((item) => item.product_id)

      const { data: products } = await supabase
        .from('products')
        .select('id, name, track_stock, stock_quantity, sold_out, reserved_quantity')
        .in('id', productIds)

      const productMap = new Map(
        (products || []).map((product) => [product.id, product as ProductRow])
      )

      for (const item of orderItems as OrderItemRow[]) {
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
          })
          .eq('id', product.id)
      }
    }

    // UPDATE ORDER STATUS
    await supabase
      .from('orders')
      .update({
        gateway_transaction_id: transactionId,
        gateway_status: statusNumber,
        gateway_status_description: statusDescription,
        status: newStatus,
        payment_status: newStatus,
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
