'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function RevealImage({
  children,
  className,
  on = 'scroll',
}: {
  children: ReactNode
  className?: string
  on?: 'scroll' | 'load'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return

      const inner = el.firstElementChild
      if (!inner) return

      const trigger =
        on === 'load'
          ? undefined
          : { trigger: el, start: 'top 85%', once: true }

      gsap.fromTo(
        el,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: trigger,
        }
      )

      gsap.fromTo(
        inner,
        { scale: 1.2 },
        {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: trigger,
        }
      )
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      {children}
    </div>
  )
}
