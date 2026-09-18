import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
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
