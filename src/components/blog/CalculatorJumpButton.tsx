'use client'

import { ArrowDown } from 'lucide-react'
import { activeLenis } from '@/providers/SmoothScrollProvider'
import { CALCULATOR_JUMP_EVENT } from './BlogReadTracker'

export default function CalculatorJumpButton({ label }: { label: string }) {
  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('calculator')
    if (!target) return
    event.preventDefault()
    window.dispatchEvent(new Event(CALCULATOR_JUMP_EVENT))
    if (activeLenis) {
      activeLenis.scrollTo(target, { offset: -96 })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href="#calculator"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#B7FE1A] text-[#062E25] px-6 py-3 text-base font-medium no-underline hover:brightness-105 transition"
    >
      {label}
      <ArrowDown className="w-4 h-4" />
    </a>
  )
}
