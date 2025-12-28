import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'de', 'fr', 'it', 'es', 'sr']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Extract locale from pathname (format: /{locale}/...)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If pathname already has a locale, set it in cookie and continue
  if (pathnameHasLocale) {
    const pathnameSegments = pathname.split('/').filter(Boolean)
    const locale = pathnameSegments[0]
    
    // Set locale cookie
    const response = NextResponse.next()
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
    
    return response
  }

  // If no locale in pathname, redirect to default locale
  const locale = request.cookies.get('locale')?.value || defaultLocale
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
