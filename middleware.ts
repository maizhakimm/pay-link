import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search, hostname } = request.nextUrl

  // 1) Paksa semua traffic ke www.bayarlink.my
  if (hostname === 'bayarlink.my') {
    const url = request.nextUrl.clone()
    url.hostname = 'www.bayarlink.my'
    return NextResponse.redirect(url, 308)
  }

  const isAdminRoute =
    pathname === '/admin' ||
    pathname.startsWith('/admin/')

  const isDashboardRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')

  const isProtectedRoute = isAdminRoute || isDashboardRoute

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes('auth-token'))

  if (!hasSupabaseAuthCookie) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = isAdminRoute ? '/admin/login' : '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('redirect', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/((?!_next|favicon.ico|.*\\..*).*)',
  ],
}
