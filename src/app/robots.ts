import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/login',
          '/register',
          '/forgot-password',
          '/set-password',
          '/verify-email',
          '/api/',
          '/*?preview=true',
          '/*?draft=true',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
