'use client'

import { useEffect } from 'react'

import { postFunnelEvent } from '@/lib/analytics/funnel-events'

const TICK_MS = 1000
const IDLE_LIMIT_MS = 90_000
const MAX_SECONDS = 3600

type Props = {
  slug: string
  targetId: string
  locale: string
}

export default function BlogReadTracker({ slug, targetId, locale }: Props) {
  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return

    let maxDepth = 0
    let activeMs = 0
    let lastActivity = Date.now()
    let sent = false
    let frame = 0

    const measure = () => {
      const rect = target.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const ratio =
        scrollable > 0
          ? -rect.top / scrollable
          : rect.bottom <= window.innerHeight
            ? 1
            : 0
      const depth = Math.round(Math.min(1, Math.max(0, ratio)) * 100)
      if (depth > maxDepth) maxDepth = depth
    }

    const onScroll = () => {
      lastActivity = Date.now()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    const onActivity = () => {
      lastActivity = Date.now()
    }

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastActivity > IDLE_LIMIT_MS) return
      activeMs += TICK_MS
    }

    const send = () => {
      if (sent) return
      sent = true
      measure()
      postFunnelEvent('blog_read', {
        meta: {
          slug,
          locale,
          depth: maxDepth,
          seconds: Math.min(MAX_SECONDS, Math.round(activeMs / 1000)),
        },
      })
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') send()
    }

    measure()
    const interval = window.setInterval(tick, TICK_MS)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pointerdown', onActivity, { passive: true })
    window.addEventListener('keydown', onActivity)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', send)

    return () => {
      send()
      window.clearInterval(interval)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', send)
    }
  }, [slug, targetId, locale])

  return null
}
