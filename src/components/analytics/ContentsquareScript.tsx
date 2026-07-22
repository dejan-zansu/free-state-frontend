'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'

import { contentsquareEnabled, contentsquareTagId } from '@/lib/analytics-env'

const RECORDED_PATH_SEGMENTS = ['/calculator', '/solar-calculator', '/dashboard']

let loaded = false

function loadContentsquare() {
  if (loaded) return
  loaded = true
  window._uxa = window._uxa || []
  const script = document.createElement('script')
  script.async = true
  script.src = `https://t.contentsquare.net/uxa/${contentsquareTagId}.js`
  document.head.appendChild(script)
}

export default function ContentsquareScript() {
  const pathname = usePathname()

  useEffect(() => {
    if (!contentsquareEnabled) return
    if (!RECORDED_PATH_SEGMENTS.some(segment => pathname?.includes(segment))) {
      return
    }
    const loadIfConsented = () => {
      if (CookieConsent.acceptedCategory('analytics')) loadContentsquare()
    }
    loadIfConsented()
    window.addEventListener('app:consent-changed', loadIfConsented)
    return () => window.removeEventListener('app:consent-changed', loadIfConsented)
  }, [pathname])

  return null
}
