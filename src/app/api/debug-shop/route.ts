import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      ok: false,
      error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      supabaseUrl,
      hasServiceRole: Boolean(serviceRoleKey),
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data, error } = await supabase
    .from('seller_profiles')
    .select('id, store_name, shop_slug, temporarily_closed')
    .eq('shop_slug', 'dana-store')
    .maybeSingle()

  return NextResponse.json({
    ok: !error,
    supabaseUrl,
    hasServiceRole: Boolean(serviceRoleKey),
    data,
    error,
  })
}
