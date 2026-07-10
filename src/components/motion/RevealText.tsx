'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

interface RevealTextProps {
  children: ReactNode
  as?: ElementType
  className?: string
  on?: 'scroll' | 'load'
  delay?: number
  duration?: number
  stagger?: number
}

export default function RevealText({
  children,
  as: Tag = 'div',
  className,
  on = 'scroll',
  delay = 0,
  duration = 0.9,
  stagger = 0.12,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return

      let split: SplitText | null = null
      let tween: gsap.core.Tween | null = null

      const run = () => {
        split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'reveal-line',
          onSplit: self => {
            tween = gsap.from(self.lines, {
              yPercent: 115,
              opacity: 0,
              duration,
              delay,
              ease: 'power3.out',
              stagger,
              scrollTrigger:
                on === 'load'
                  ? undefined
                  : { trigger: el, start: 'top 85%', once: true },
            })
            return tween
          },
        })
      }

      if (document.fonts && document.fonts.status !== 'loaded') {
        document.fonts.ready.then(run)
      } else {
        run()
      }

      return () => {
        tween?.kill()
        split?.revert()
      }
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
