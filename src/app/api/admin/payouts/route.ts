import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(
        `
          id,
          order_number,
          seller_profile_id,
          seller_id,
          payment_status,
          payout_status,
          payment_method,
          payment_channel,
          net_seller_amount,
          seller_net,
          amount,
          total_amount,
          platform_fee,
          fee_amount,
          admin_fee,
          created_at,
          updated_at,
          payout_at,
          payout_reference,
          payout_proof_url
        `
      )
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })

    if (ordersError) {
      return NextResponse.json(
        { error: ordersError.message },
        { status: 500 }
      )
    }

    const sellerProfileIds = Array.from(
      new Set(
        (orders || [])
          .map((row) => row.seller_profile_id)
          .filter(Boolean)
      )
    )

    let sellerProfiles: any[] = []

    if (sellerProfileIds.length > 0) {
      const { data: sellers, error: sellersError } = await supabase
        .from('seller_profiles')
        .select('id, store_name, email, bank_name, account_name, account_number')
        .in('id', sellerProfileIds)

      if (sellersError) {
        return NextResponse.json(
          { error: sellersError.message },
          { status: 500 }
        )
      }

      sellerProfiles = sellers || []
    }

    return NextResponse.json({
      orders: orders || [],
      sellerProfiles,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
