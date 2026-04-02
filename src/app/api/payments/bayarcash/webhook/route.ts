import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type OrderRow = {
  id: string
  status: string | null
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
    const statusDescription = (payload.status_description as string | undefined) || null
    const newStatus = mapBayarcashStatus(statusNumber)

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: 'Missing order_number' },
        { status: 400 }
      )
    }

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from('orders')
      .select('id, status, gateway_transaction_id')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = existingOrder as OrderRow

    // Duplicate paid webhook guard
    if (
      order.status === 'paid' &&
      order.gateway_transaction_id &&
      order.gateway_transaction_id === transactionId
    ) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    // If payment successful, deduct stock here
    if (statusNumber === 3) {
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name')
        .eq('order_id', order.id)

      if (orderItemsError || !orderItems || orderItems.length === 0) {
        await supabase
          .from('orders')
          .update({
            gateway_transaction_id: transactionId,
            gateway_status: statusNumber,
            gateway_status_description: 'Payment received but order items missing',
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderNumber)

        return NextResponse.json(
          { ok: false, error: 'Order items not found' },
          { status: 500 }
        )
      }

      const typedOrderItems = orderItems as OrderItemRow[]
      const productIds = typedOrderItems.map((item) => item.product_id)

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, track_stock, stock_quantity, sold_out')
        .in('id', productIds)

      if (productsError || !products || products.length === 0) {
        await supabase
          .from('orders')
          .update({
            gateway_transaction_id: transactionId,
            gateway_status: statusNumber,
            gateway_status_description: 'Payment received but products not found',
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderNumber)

        return NextResponse.json(
          { ok: false, error: 'Products not found for stock update' },
          { status: 500 }
        )
      }

      const productMap = new Map(
        (products as ProductRow[]).map((product) => [product.id, product])
      )

      // 1) Re-check stock before deducting
      for (const item of typedOrderItems) {
        const product = productMap.get(item.product_id)

        if (!product) {
          await supabase
            .from('orders')
            .update({
              gateway_transaction_id: transactionId,
              gateway_status: statusNumber,
              gateway_status_description: `Product missing during payment confirmation`,
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('order_number', orderNumber)

          return NextResponse.json(
            { ok: false, error: 'Product missing during stock confirmation' },
            { status: 409 }
          )
        }

        if (product.track_stock) {
          if (product.sold_out || product.stock_quantity < item.quantity) {
            await supabase
              .from('orders')
              .update({
                gateway_transaction_id: transactionId,
                gateway_status: statusNumber,
                gateway_status_description: `${product.name || item.product_name || 'Product'} is out of stock during payment confirmation`,
                status: 'failed',
                updated_at: new Date().toISOString(),
              })
              .eq('order_number', orderNumber)

            return NextResponse.json(
              {
                ok: false,
                error: `${product.name || item.product_name || 'Product'} stock not enough during payment confirmation`,
              },
              { status: 409 }
            )
          }
        }
      }

      // 2) Deduct stock
      for (const item of typedOrderItems) {
        const product = productMap.get(item.product_id)

        if (!product || !product.track_stock) continue

        const newStock = Math.max(0, Number(product.stock_quantity) - Number(item.quantity))
        const newSoldOut = newStock <= 0

        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({
            stock_quantity: newStock,
            sold_out: newSoldOut,
          })
          .eq('id', product.id)

        if (stockUpdateError) {
          await supabase
            .from('orders')
            .update({
              gateway_transaction_id: transactionId,
              gateway_status: statusNumber,
              gateway_status_description: `Failed to update stock for ${product.name}`,
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('order_number', orderNumber)

          return NextResponse.json(
            { ok: false, error: stockUpdateError.message },
            { status: 500 }
          )
        }
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        gateway_transaction_id: transactionId,
        gateway_status: statusNumber,
        gateway_status_description: statusDescription,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error'

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
