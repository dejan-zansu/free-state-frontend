'use client'

import { useEffect } from 'react'

import { MAIN_SITE_ORIGIN, isOutreachHost } from '@/lib/outreach-hosts'

function mainSiteUrl(url: URL): string {
  const target = new URL(
    `${url.pathname}${url.search}${url.hash}`,
    MAIN_SITE_ORIGIN
  )
  const landing = new URLSearchParams(window.location.search)
  landing.forEach((value, key) => {
    if (key.startsWith('utm_') && !target.searchParams.has(key)) {
      target.searchParams.set(key, value)
    }
  })
  return target.toString()
}

export default function OutreachLinkHandler() {
  useEffect(() => {
    if (!isOutreachHost(window.location.hostname)) return

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      const anchor = (event.target as Element | null)?.closest('a[href]')
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.hasAttribute('download')
      )
        return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      const samePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      if (samePage && url.hash) return

      event.preventDefault()
      event.stopPropagation()
      const target = mainSiteUrl(url)
      if (
        anchor.target === '_blank' ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        window.open(target, '_blank', 'noopener')
      } else {
        window.location.assign(target)
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
