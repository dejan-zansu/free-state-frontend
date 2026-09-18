import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

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
    '/((?!api|r2/|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|sitemap.xml|robots.txt|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|xml|txt)$).*)',
  ],
}
