import { NextResponse, type NextRequest } from 'next/server'
import { verifyTokenEdge } from '@/utils/jwt-edge'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Maintain Supabase session
  const response = await updateSession(request)

  // 2. Extract auth JWT token from cookie or header
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  const user = token ? await verifyTokenEdge(token) : null

  // Route classifications
  const isOwnerRoute = pathname.startsWith('/owner')
  const isProfileRoute = pathname.startsWith('/profile')
  const isOrdersRoute = pathname.startsWith('/orders')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  // If already authenticated and accessing root / or login / register
  if (pathname === '/' && user && user.role === 'RESTAURANT_OWNER') {
    return NextResponse.redirect(new URL('/owner/dashboard', request.url))
  }

  if (isAuthRoute && user) {
    if (user.role === 'RESTAURANT_OWNER') {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/menu', request.url))
  }

  // If accessing Owner UI routes (/owner/*)
  if (isOwnerRoute) {
    // Must be logged in
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role check: CUSTOMER cannot access Owner UI
    if (user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // If accessing private user routes (/profile/*, /orders/*)
  if (isProfileRoute || isOrdersRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes handle their own auth responses)
     * - Static assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
