'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { postPageView } from '@/lib/analytics/page-view'

const IGNORED_SEGMENTS = ['admin']

function isIgnored(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return IGNORED_SEGMENTS.some(segment => segments.includes(segment))
}

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastSentRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (lastSentRef.current === pathname) return
    if (isIgnored(pathname)) return
    lastSentRef.current = pathname
    postPageView(pathname)
  }, [pathname])

  return null
}
