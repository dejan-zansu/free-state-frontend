import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { REPLACED_POSTS } from './src/lib/blog/replaced-posts'

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Next streams metadata to bots that run JavaScript, Googlebot included, so the canonical
  // and title reach <head> only when metadata resolves before the shell is flushed. Google
  // crawled /solarrechner, /en and others without a canonical and folded them into /impressum
  // (Search Console, September 2026). Setting this replaces the default list, so the first
  // part repeats Next's HTML_LIMITED_BOT_UA_RE from 15.2 and the second part adds Google.
  htmlLimitedBots:
    /Mediapartners-Google|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Googlebot|Google-InspectionTool|GoogleOther|Storebot-Google|AdsBot-Google|Google-PageRenderer/i,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'pub-4c6192458b6640b4882edb8106c3751f.r2.dev',
        port: '',
      },
    ],
  },
  async rewrites() {
    // model-viewer fetches GLB files with fetch(), which needs CORS on a cross-origin
    // bucket. The public R2 bucket has no CORS rule, so /r2/* proxies it same-origin.
    return [
      {
        source: '/r2/:path*',
        destination: 'https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/:path*',
      },
    ]
  },
  async redirects() {
    return [
      ...Object.entries(REPLACED_POSTS).flatMap(([from, to]) => [
        {
          source: `/blog/${from}`,
          destination: `/blog/${to}`,
          permanent: true,
        },
        {
          source: `/:locale(en|fr|it)/blog/${from}`,
          destination: `/:locale/blog/${to}`,
          permanent: true,
        },
      ]),
      {
        source: '/unternehmen',
        destination: '/geschichte',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/geschichte',
        permanent: true,
      },
      {
        source: '/de/unternehmen',
        destination: '/geschichte',
        permanent: true,
      },
      {
        source: '/en/about',
        destination: '/en/history',
        permanent: true,
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
