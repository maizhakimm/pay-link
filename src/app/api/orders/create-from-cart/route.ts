import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🔐 server side only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateOrderNo() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `BL-${y}${m}${d}-${rand}`
}

function normalizePhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) return `6${cleaned}`
  if (cleaned.startsWith('60')) return cleaned
  return cleaned
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      sellerId,
      shopSlug,
      customer,
      items,
      total,
      delivery,
    } = body

    if (!sellerId || !customer || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // 🔎 get products info
    const productIds = items.map((i: any) => i.product_id)

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds)

    if (productError || !products) {
      return NextResponse.json(
        { error: 'Product fetch failed' },
        { status: 500 }
      )
    }

    // 🧮 map items + calculate total
    const enrichedItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.product_id)

      return {
        product_id: item.product_id,
        name: product?.name || 'Unknown',
        price: product?.price || 0,
        quantity: item.quantity,
        line_total: (product?.price || 0) * item.quantity,
      }
    })

    const orderNo = generateOrderNo()

    // 💾 save order
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_no: orderNo,
        seller_id: sellerId,
        items: enrichedItems,
        total_amount: total,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        delivery_info: delivery || null,
        status: 'pending',
      })

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    // 📞 get seller whatsapp
    const { data: seller } = await supabase
      .from('seller_profiles')
      .select('whatsapp, store_name')
      .eq('id', sellerId)
      .single()

    const sellerPhone = normalizePhone(seller?.whatsapp || '')

    // 💬 generate WhatsApp message
    const itemText = enrichedItems
      .map(
        (i: any) =>
          `• ${i.name} x${i.quantity} = RM ${i.line_total.toFixed(2)}`
      )
      .join('\n')

    const message = `
Hi, saya nak order:

🧾 Order No: ${orderNo}

${itemText}

💰 Total: RM ${total.toFixed(2)}

👤 Nama: ${customer.name}
📞 Phone: ${customer.phone}

${
  delivery
    ? `📍 Address:
${delivery.address1}
${delivery.address2 || ''}
${delivery.postcode} ${delivery.city}
${delivery.state}`
    : ''
}

Terima kasih 🙏
`.trim()

    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      ok: true,
      orderNo,
      whatsappUrl,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
