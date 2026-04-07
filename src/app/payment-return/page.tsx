'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type OrderItem = {
  product_name: string
  quantity: number
}

type OrderData = {
  order_number: string
  customer_name: string
  customer_phone: string
  amount: string
  items: OrderItem[]
  delivery_info?: any
  seller_profile_id?: string
}

type Seller = {
  whatsapp?: string
}

export default function PaymentReturnPage({ searchParams }: any) {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [sellerPhone, setSellerPhone] = useState<string>('')

  const orderNumber = searchParams?.order_number

  // 🔥 FETCH ORDER
  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single()

      if (!error && data) {
        setOrder(data)

        // 🔥 FETCH SELLER PHONE
        if (data.seller_profile_id) {
          const { data: seller } = await supabase
            .from('seller_profiles')
            .select('whatsapp')
            .eq('id', data.seller_profile_id)
            .single()

          if (seller?.whatsapp) {
            setSellerPhone(seller.whatsapp)
          }
        }
      }
    }

    fetchOrder()
  }, [orderNumber])

  function handleNotifySeller() {
    if (!order || !sellerPhone) return

    const now = new Date()
    const date = now.toLocaleDateString('en-GB')
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    const itemsText = order.items
      ?.map((item) => `- ${item.product_name} x${item.quantity}`)
      .join('\n')

    const deliveryText = order.delivery_info
      ? Object.values(order.delivery_info).filter(Boolean).join(', ')
      : '-'

    const message = `🎉 Order Baru Masuk!

📦 Order No: ${order.order_number}  
🕒 Tarikh: ${date}  
⏰ Masa: ${time}  

👤 Customer: ${order.customer_name}  
📱 Phone: ${order.customer_phone}  

🛒 Order:
${itemsText}

💰 Total: RM${order.amount}  

📍 Delivery:
${deliveryText}

👉 Sila prepare order sekarang.`

    const url = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`

    window.open(url, '_blank')
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Payment Complete</h1>

      <button
        onClick={handleNotifySeller}
        style={{
          marginTop: 20,
          padding: 12,
          background: '#25D366',
          color: '#fff',
          borderRadius: 10,
        }}
      >
        Notify Seller (WhatsApp)
      </button>
    </main>
  )
}
