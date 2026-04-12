'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { hotjarEnabled, hotjarSiteId } from '@/lib/analytics-env'

const HOTJAR_ROUTE_PATTERNS = [/\/calculator(\/|$)/, /\/dashboard(\/|$)/]

function isHotjarRoute(pathname: string | null): boolean {
  if (!pathname) return false
  return HOTJAR_ROUTE_PATTERNS.some((re) => re.test(pathname))
}

function injectHotjar(siteId: string) {
  if (typeof window === 'undefined') return
  if (window.hj) return
  ;(function (h: Window, o: Document, t: string, j: string) {
    h.hj =
      h.hj ||
      function (...args: unknown[]) {
        ;(h.hj!.q = h.hj!.q || []).push(args)
      }
    h._hjSettings = { hjid: Number(siteId), hjsv: 6 }
    const head = o.getElementsByTagName('head')[0]
    const script = o.createElement('script')
    script.async = true
    script.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
    head.appendChild(script)
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
}

export function HotjarScript() {
  const pathname = usePathname()
  const [analyticsConsented, setAnalyticsConsented] = useState(false)

  useEffect(() => {
    if (!hotjarEnabled) return

    let cancelled = false

    const checkConsent = async () => {
      try {
        const cc = await import('vanilla-cookieconsent')
        if (cancelled) return
        setAnalyticsConsented(Boolean(cc.acceptedCategory?.('analytics')))
      } catch {
        if (cancelled) return
        setAnalyticsConsented(false)
      }
    }

    checkConsent()

    const handler = () => {
      checkConsent()
    }
    window.addEventListener('app:consent-changed', handler)

    return () => {
      cancelled = true
      window.removeEventListener('app:consent-changed', handler)
    }
  }, [])

  useEffect(() => {
    if (!hotjarEnabled) return
    if (!analyticsConsented) return
    if (!isHotjarRoute(pathname)) return
    injectHotjar(hotjarSiteId)
  }, [analyticsConsented, pathname])

  return null
}
