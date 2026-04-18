import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      )
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
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
        admin_fee,
        created_at,
        updated_at,
        payout_at,
        payout_reference,
        payout_proof_url
      `)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })

    if (ordersError) {
      return NextResponse.json(
        { error: `Orders query failed: ${ordersError.message}` },
        { status: 500 }
      )
    }

    const sellerProfileIds = Array.from(
      new Set((orders || []).map((row) => row.seller_profile_id).filter(Boolean))
    )

    let sellerProfiles: any[] = []

    if (sellerProfileIds.length > 0) {
      const { data: sellers, error: sellersError } = await supabase
        .from('seller_profiles')
        .select('id, store_name, email, bank_name, account_name, account_number')
        .in('id', sellerProfileIds)

      if (sellersError) {
        return NextResponse.json(
          { error: `Seller profiles query failed: ${sellersError.message}` },
          { status: 500 }
        )
      }

      sellerProfiles = sellers || []
    }

    return NextResponse.json({
      ok: true,
      ordersCount: (orders || []).length,
      sellerProfilesCount: sellerProfiles.length,
      orders: orders || [],
      sellerProfiles,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected error in admin payouts API' },
      { status: 500 }
    )
  }
}
