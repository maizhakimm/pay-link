import { createClient } from '@supabase/supabase-js'

export async function requireAdminFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''

  if (!token) {
    return { ok: false as const, status: 401, error: 'Missing bearer token' }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { ok: false as const, status: 500, error: 'Missing Supabase environment variables' }
  }

  const authClient = createClient(supabaseUrl, anonKey)
  const serviceClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: authData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !authData.user) {
    return { ok: false as const, status: 401, error: 'Invalid auth token' }
  }

  const { data: roleRow, error: roleError } = await serviceClient
    .from('user_roles')
    .select('role')
    .eq('user_id', authData.user.id)
    .maybeSingle()

  if (roleError) {
    return { ok: false as const, status: 500, error: roleError.message }
  }

  if (!roleRow || roleRow.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Admin access required' }
  }

  return { ok: true as const, userId: authData.user.id }
}
