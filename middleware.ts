import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BAZAR_HOSTS = new Set(['bazarlink.my', 'www.bazarlink.my'])
const LEGACY_MARKETPLACE_ROUTES = new Set(['/bazar', '/explore'])

export function middleware(request: NextRequest) {
  const { pathname, search, hostname } = request.nextUrl

  if (LEGACY_MARKETPLACE_ROUTES.has(pathname)) {
    return NextResponse.redirect('https://www.bazarlink.my', 308)
  }


  if (hostname === 'bazarlink.my') {
    const url = request.nextUrl.clone()
    url.hostname = 'www.bazarlink.my'
    return NextResponse.redirect(url, 308)
  }

  if (hostname === 'bayarlink.my') {
    const url = request.nextUrl.clone()
    url.hostname = 'www.bayarlink.my'
    return NextResponse.redirect(url, 308)
  }

  if (BAZAR_HOSTS.has(hostname) && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/bazar'
    return NextResponse.rewrite(url)
  }

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
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
