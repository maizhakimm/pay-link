import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hostname = request.nextUrl.hostname.toLowerCase()

  const isBazarWwwHost = hostname === 'www.bazarlink.my'
  const isBazarApexHost = hostname === 'bazarlink.my'
  const isBayarHost = hostname === 'bayarlink.my' || hostname === 'www.bayarlink.my'
  const isLegacyBazarPath = pathname === '/bazar' || pathname.startsWith('/bazar/') || pathname.startsWith('/explore')

  // 1) Bayar hosts should not serve bazar paths.
  if (isBayarHost && isLegacyBazarPath) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = 'www.bazarlink.my'
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url, 308)
  }

  // 2) Canonicalize bazar apex -> www.bazarlink.my.
  if (isBazarApexHost) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = 'www.bazarlink.my'
    if (isLegacyBazarPath) {
      url.pathname = '/'
      url.search = ''
    }
    return NextResponse.redirect(url, 308)
  }

  // 3) Canonicalize legacy bazar/explore paths on www.bazarlink.my to root.
  if (isBazarWwwHost && isLegacyBazarPath) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = 'www.bazarlink.my'
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url, 308)
  }

  // 4) Keep URL at https://www.bazarlink.my/ while rendering /bazar.
  if (isBazarWwwHost && (pathname === '/' || pathname === '')) {
    const url = request.nextUrl.clone()
    url.pathname = '/bazar'
    return NextResponse.rewrite(url)
  }

  // 5) Canonicalize bayar apex -> www.bayarlink.my for non-bazar pages.
  if (hostname === 'bayarlink.my') {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = 'www.bayarlink.my'
    return NextResponse.redirect(url, 308)
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
