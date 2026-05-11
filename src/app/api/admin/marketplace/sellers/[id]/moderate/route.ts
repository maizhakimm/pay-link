import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ActionType = 'approve' | 'reject' | 'feature' | 'verify'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration missing.' }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: userData, error: userError } = await adminClient.auth.getUser(token)
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userData.user.id

    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (roleError || !roleData || roleData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = (await req.json()) as { action?: ActionType }
    const action = body?.action

    if (!action) {
      return NextResponse.json({ error: 'Missing action.' }, { status: 400 })
    }

    const { data: currentProfile, error: currentError } = await adminClient
      .from('marketplace_profiles')
      .select('id,is_featured,is_verified')
      .eq('id', id)
      .maybeSingle()

    if (currentError || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const payload: Record<string, unknown> = {}

    if (action === 'approve') {
      payload.status = 'published'
      payload.is_marketplace_visible = true
      payload.published_at = new Date().toISOString()
    } else if (action === 'reject') {
      payload.status = 'rejected'
      payload.is_marketplace_visible = false
    } else if (action === 'feature') {
      payload.is_featured = !currentProfile.is_featured
    } else if (action === 'verify') {
      const nextVerified = !currentProfile.is_verified
      payload.is_verified = nextVerified
      payload.verification_status = nextVerified ? 'verified' : 'pending'
      payload.verified_at = nextVerified ? new Date().toISOString() : null
    }

    const { error: updateError } = await adminClient
      .from('marketplace_profiles')
      .update(payload)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
