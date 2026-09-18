// The public R2 bucket serves the GLB files without CORS headers, and model-viewer
// fetches them with fetch(), which a cross-origin response without those headers blocks.
// next.config.ts rewrites /r2/<key> to the bucket, so the browser sees a same-origin URL.
// Images do not need this (an <img> ignores CORS), but it does them no harm either.
const R2_PUBLIC_HOST = 'pub-4c6192458b6640b4882edb8106c3751f.r2.dev'

export function toSameOriginAssetUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname === R2_PUBLIC_HOST) return `/r2${u.pathname}`
  } catch {
    // relative or malformed: hand it back untouched
  }
  return url
}
