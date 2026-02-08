'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

interface SolarSystemsQualityTimelineProps {
  items: string[]
}

const SolarSystemsQualityTimeline = ({
  items,
}: SolarSystemsQualityTimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current || !lineRef.current) return

      const dots = containerRef.current.querySelectorAll('.timeline-dot')
      const texts = containerRef.current.querySelectorAll('.timeline-text')

      // Animate the line height
      gsap.fromTo(
        lineRef.current,
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: 0.5,
          },
        }
      )

      // Animate each dot and text
      dots.forEach((dot, index) => {
        gsap.fromTo(
          dot,
          { scale: 0, backgroundColor: 'rgba(6, 46, 37, 0.2)' },
          {
            scale: 1,
            backgroundColor: '#062E25',
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: dot,
              start: 'top 70%',
              end: 'top 50%',
              scrub: 0.3,
            },
          }
        )

        gsap.fromTo(
          texts[index],
          { opacity: 0.3, x: -10 },
          {
            opacity: 1,
            x: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: dot,
              start: 'top 70%',
              end: 'top 50%',
              scrub: 0.3,
            },
          }
        )
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-8 lg:gap-0 lg:w-1/2"
    >
      {/* Background line (gray) */}
      <div className="hidden lg:block absolute left-[8px] top-[8px] bottom-[8px] w-px bg-[#062E25]/20" />

      {/* Animated line (fills on scroll) */}
      <div
        ref={lineRef}
        className="hidden lg:block absolute left-[8px] top-[8px] w-px bg-[#062E25]"
        style={{ height: '0%' }}
      />

      {items.map((item) => (
        <div
          key={item}
          className="relative flex items-center gap-5 lg:h-[150px]"
        >
          {/* Dot */}
          <div
            className="timeline-dot hidden lg:block w-[17px] h-[17px] rounded-full bg-[#062E25]/20 shrink-0 z-10"
            style={{ transform: 'scale(0)' }}
          />
          <span className="timeline-text text-[#062E25] text-lg lg:text-[22px] font-medium leading-tight tracking-tight opacity-30 lg:opacity-100">
            {item}
          </span>
        </div>
      ))}
    </div>
  )
}

export default SolarSystemsQualityTimeline
