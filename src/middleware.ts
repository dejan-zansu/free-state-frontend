import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Account and one-time pages. robots.txt blocks the English slugs (/login, /register), but those
// redirect to the localized ones (/anmelden, /fr/connexion ...), which Google crawled and indexed.
// A response header marks every locale as noindex without depending on streamed page metadata.
const NOINDEX_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/set-password',
  '/verify-email',
  '/magic-link-verify',
  '/claim-calculation',
  '/dashboard',
  '/newsletter/confirm',
  '/newsletter/unsubscribe',
  '/calculator/signing-complete',
]

const pathnames = routing.pathnames as Record<
  string,
  string | Record<string, string>
>

const NOINDEX_PATHS = NOINDEX_ROUTES.flatMap(route =>
  routing.locales.flatMap(locale => {
    const localized = pathnames[route]
    const path = typeof localized === 'object' ? localized[locale] : route
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
    // Unlisted subpages keep the unlocalized segment (/fr/dashboard/settings), so match both.
    return [...new Set([`${prefix}${path}`, `${prefix}${route}`])]
  })
)

function isNoindexPath(pathname: string): boolean {
  return NOINDEX_PATHS.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  )
}

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request)
  if (isNoindexPath(request.nextUrl.pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js, manifest.webmanifest (service worker and web app manifest for the admin PWA)
     * - r2 (same-origin proxy to the public R2 bucket for 3D model files, see next.config.ts)
     * - public files (images, etc.)
     */
    '/((?!api|r2/|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|sitemap.xml|robots.txt|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|xml|txt|glb|pdf)$).*)',
  ],
}
