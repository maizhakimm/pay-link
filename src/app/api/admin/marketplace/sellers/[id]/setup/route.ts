import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromRequest } from '../../../../../../../lib/admin-auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdminFromRequest(req)
    if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

    const { id: sellerProfileId } = await params
    const body = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    let profileId = body.profileId as string | null
    if (!profileId) {
      const { data: created, error: createError } = await supabase.from('marketplace_profiles').insert({
        seller_profile_id: sellerProfileId,
        status: 'draft',
        is_marketplace_visible: false,
      }).select('id').single()
      if (createError || !created) return NextResponse.json({ error: createError?.message || 'Unable to create marketplace profile' }, { status: 400 })
      profileId = created.id
    }

    const { error: updateError } = await supabase.from('marketplace_profiles').update({
      area_text: body.area_text || null,
      community_text: body.community_text || null,
      tagline: body.tagline || null,
      marketplace_description: body.marketplace_description || null,
      status: body.status || 'draft',
      is_marketplace_visible: Boolean(body.is_marketplace_visible),
      is_featured: Boolean(body.is_featured),
      is_verified: Boolean(body.is_verified),
    }).eq('id', profileId)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

    await supabase.from('marketplace_profile_categories').delete().eq('marketplace_profile_id', profileId)
    const categoryIds = Array.isArray(body.category_ids) ? body.category_ids.filter(Boolean) : []
    if (categoryIds.length > 0) {
      const { error: insertError } = await supabase.from('marketplace_profile_categories').insert(categoryIds.map((categoryId: string) => ({ marketplace_profile_id: profileId, category_id: categoryId })))
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    const { data: categoryRows } = await supabase.from('marketplace_profile_categories').select('marketplace_categories(category_name)').eq('marketplace_profile_id', profileId)
    const categoryNames = (categoryRows || []).map((row: any) => Array.isArray(row.marketplace_categories) ? row.marketplace_categories[0]?.category_name : row.marketplace_categories?.category_name).filter(Boolean)

    return NextResponse.json({ ok: true, profileId, categoryNames })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 })
  }
}
