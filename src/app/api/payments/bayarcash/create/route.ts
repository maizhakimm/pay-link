const subtotal = totalAmount

const gatewayFee = 1.0
const platformFee = 0
const sellerNet = subtotal - gatewayFee - platformFee

...

const { data: insertedOrder } = await supabase
  .from('orders')
  .insert({
    ...

    subtotal,
    gateway_fee: gatewayFee,
    platform_fee: platformFee,
    seller_net: sellerNet,
    currency: 'MYR',

    ...
  })
  .select('id')
  .single()

// ✅ ADD THIS (CRITICAL FIX)
await supabase.from('order_items').insert({
  order_id: insertedOrder.id,
  product_id: typedProduct.id,
  product_name: typedProduct.name,
  product_slug: typedProduct.slug,
  unit_price: unitPrice,
  quantity,
  line_total: totalAmount,
})
