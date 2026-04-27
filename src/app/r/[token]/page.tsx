import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = {
  params: { token: string }
}

export default async function ReceiptPage({ params }: Props) {
  const token = params.token

  // 🔥 get order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('receipt_token', token)
    .single()

  if (!order) return notFound()

  // 🔥 get seller
  const { data: seller } = await supabase
    .from('seller_profiles')
    .select('store_name, whatsapp')
    .eq('id', order.seller_profile_id)
    .single()

  // 🔥 get items
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

  const waText = encodeURIComponent(
    `Hi ${seller?.store_name || ''},\n\nSaya dah buat bayaran:\n\nOrder No: ${
      order.order_number
    }\nTotal: RM${Number(order.total_amount || 0).toFixed(
      2
    )}\n\nReceipt:\nhttps://www.bayarlink.my/r/${token}`
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-5 space-y-5">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">Payment Successful ✅</h1>
          <p className="text-sm text-gray-500">
            Sila hantar resit kepada seller
          </p>
        </div>

        {/* SUMMARY */}
        <div className="border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Order No</span>
            <span className="font-medium">{order.order_number}</span>
          </div>

          <div className="flex justify-between">
            <span>Store</span>
            <span className="font-medium">{seller?.store_name}</span>
          </div>

          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-semibold">
              RM {Number(order.total_amount || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Payment</span>
            <span className="text-green-600 font-medium">
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* ITEMS */}
        <div className="border rounded-xl p-4 text-sm">
          <h2 className="font-medium mb-2">Items</h2>

          <div className="space-y-2">
            {items?.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.product_name} x{item.quantity}
                </span>
                <span>
                  RM {Number(item.line_total).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STATUS */}
        <div className="border rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Order Status</p>
          <p className="font-semibold text-yellow-600">
            {order.fulfillment_status}
          </p>
        </div>

        {/* BUTTON */}
        <a
          href={`https://wa.me/${seller?.whatsapp}?text=${waText}`}
          target="_blank"
          className="block w-full text-center bg-green-500 text-white py-3 rounded-xl font-medium"
        >
          Hantar Resit ke Seller
        </a>

      </div>
    </div>
  )
}
