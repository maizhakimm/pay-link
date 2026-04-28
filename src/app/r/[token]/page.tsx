import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = {
  params: { token: string }
}

export default async function ReceiptPage({ params }: Props) {
  const token = params.token

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('receipt_token', token)
    .single()

  if (!order) return notFound()

  const { data: seller } = await supabase
    .from('seller_profiles')
    .select('store_name, profile_image')
    .eq('id', order.seller_profile_id)
    .single()

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-5 space-y-5">

        {/* HEADER */}
        <div className="text-center">
          {seller?.profile_image && (
            <img
              src={seller.profile_image}
              alt={seller?.store_name || 'Seller'}
              className="mx-auto mb-3 h-20 w-20 rounded-full object-cover border shadow-sm"
            />
          )}

          <p className="text-lg font-bold text-gray-900">
            {seller?.store_name}
          </p>

          <h1 className="text-xl font-semibold">
            Payment Successful
          </h1>
        </div>

        {/* SUMMARY */}
        <div className="border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Order No</span>
            <span className="font-medium">{order.order_number}</span>
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
          <p className="text-sm text-gray-500">Status Order</p>

          <p className="font-semibold">
            {order.fulfillment_status === 'pending' && (
              <span className="text-yellow-600">Menunggu pengesahan</span>
            )}

            {order.fulfillment_status === 'processing' && (
              <span className="text-blue-600">Sedang disediakan</span>
            )}

            {order.fulfillment_status === 'completed' && (
              <span className="text-green-600">Selesai</span>
            )}

            {order.fulfillment_status === 'cancelled' && (
              <span className="text-red-600">Dibatalkan</span>
            )}
          </p>
        </div>

        {/* FOOTER */}
        <div className="border-t pt-4 text-center">
          <p className="text-xs text-gray-400 mb-2">Powered by</p>
          <img
            src="/BayarLink-Logo-Shop-Page.svg"
            alt="BayarLink"
            className="h-4 mx-auto"
          />
        </div>

      </div>
    </div>
  )
}
