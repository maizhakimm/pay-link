import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const isAdminRoute =
    pathname === '/admin' || pathname.startsWith('/admin/')

  const isDashboardRoute =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  const isProtectedRoute = isAdminRoute || isDashboardRoute

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes('auth-token'))

  if (!hasSupabaseAuthCookie) {
    const loginUrl = new URL(
      isAdminRoute ? '/admin/login' : '/login',
      request.url
    )
    loginUrl.searchParams.set('redirect', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
