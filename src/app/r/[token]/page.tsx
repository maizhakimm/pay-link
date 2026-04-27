import { notFound } from "next/navigation"

type Props = {
  params: { token: string }
}

async function getOrder(token: string) {
  // 🔥 Replace dengan API / Supabase
  return {
    orderNo: "BL-1023",
    storeName: "Dana Kitchen",
    total: 25.0,
    status: "Preparing",
    paymentStatus: "Paid",
    items: [
      {
        name: "Nasi Lemak Ayam",
        qty: 2,
        addons: ["Sambal Extra"],
      },
      {
        name: "Teh Ais",
        qty: 1,
        addons: [],
      },
    ],
    note: "Kurang pedas",
    delivery: {
      type: "Delivery",
      address: "Jalan ABC, Shah Alam",
      slot: "5:00 PM – 6:00 PM",
    },
    customer: {
      name: "Ali",
      phone: "0123456789",
    },
    sellerWhatsapp: "60123456789",
  }
}

export default async function ReceiptPage({ params }: Props) {
  const order = await getOrder(params.token)

  if (!order) return notFound()

  const waText = encodeURIComponent(
    `Hi ${order.storeName},\n\nSaya dah buat order:\n\nOrder No: ${order.orderNo}\nTotal: RM${order.total}\n\nReceipt:\nhttps://www.bayarlink.my/r/${params.token}`
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-5 space-y-5">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">Order Confirmed ✅</h1>
          <p className="text-sm text-gray-500">
            Terima kasih atas pesanan anda
          </p>
        </div>

        {/* SUMMARY */}
        <div className="border rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Order No</span>
            <span className="font-medium">{order.orderNo}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Store</span>
            <span className="font-medium">{order.storeName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Paid</span>
            <span className="font-semibold">RM{order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Payment</span>
            <span className="text-green-600 font-medium">
              {order.paymentStatus} ✅
            </span>
          </div>
        </div>

        {/* ITEMS */}
        <div className="border rounded-xl p-4">
          <h2 className="font-medium mb-2">Order Details</h2>
          <div className="space-y-2 text-sm">
            {order.items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span>
                    {item.name} (x{item.qty})
                  </span>
                </div>
                {item.addons.length > 0 && (
                  <div className="text-xs text-gray-500 ml-2">
                    + {item.addons.join(", ")}
                  </div>
                )}
              </div>
            ))}
            {order.note && (
              <div className="text-xs text-gray-500 mt-2">
                Note: {order.note}
              </div>
            )}
          </div>
        </div>

        {/* DELIVERY */}
        <div className="border rounded-xl p-4 text-sm">
          <h2 className="font-medium mb-2">Delivery Info</h2>
          <p>{order.delivery.type}</p>
          <p className="text-gray-600">{order.delivery.address}</p>
          <p className="text-gray-600">{order.delivery.slot}</p>
        </div>

        {/* CUSTOMER */}
        <div className="border rounded-xl p-4 text-sm">
          <h2 className="font-medium mb-2">Customer</h2>
          <p>{order.customer.name}</p>
          <p className="text-gray-600">{order.customer.phone}</p>
        </div>

        {/* STATUS */}
        <div className="border rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold text-yellow-600">
            {order.status}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="space-y-3">

          {/* SEND TO SELLER */}
          <a
            href={`https://wa.me/${order.sellerWhatsapp}?text=${waText}`}
            target="_blank"
            className="block w-full text-center bg-green-500 text-white py-3 rounded-xl font-medium"
          >
            Send to Seller (WhatsApp)
          </a>

          {/* CONTACT SELLER */}
          <a
            href={`https://wa.me/${order.sellerWhatsapp}`}
            target="_blank"
            className="block w-full text-center border py-3 rounded-xl font-medium"
          >
            Contact Seller
          </a>

        </div>

      </div>
    </div>
  )
}
