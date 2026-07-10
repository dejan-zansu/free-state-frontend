'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ElementType, type ReactNode } from 'react'
import { MOTION, prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  distance?: number
  on?: 'scroll' | 'load'
  stagger?: boolean
}

export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  distance = MOTION.distance,
  on = 'scroll',
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const targets = stagger ? Array.from(el.children) : el
      if (Array.isArray(targets) && targets.length === 0) return
      const fromVars: gsap.TweenVars = { opacity: 0, y: distance }
      const toVars: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        duration: MOTION.duration,
        ease: MOTION.ease,
        delay,
        stagger: stagger ? MOTION.stagger : 0,
      }

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      if (on === 'load') {
        gsap.fromTo(targets, fromVars, toVars)
        return
      }

      gsap.fromTo(targets, fromVars, {
        ...toVars,
        scrollTrigger: { trigger: el, start: MOTION.start, once: true },
      })
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}

export function RevealStagger(props: Omit<RevealProps, 'stagger'>) {
  return <Reveal {...props} stagger />
}
