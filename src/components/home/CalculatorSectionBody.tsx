'use client'

import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

const Placeholder = () => (
  <div
    className="flex min-h-[560px] items-center justify-center rounded-[24px] border border-[#546963]/40"
    style={{ background: PAGE_BG }}
  >
    <Loader2 className="h-8 w-8 animate-spin text-[#062E25]/40" />
  </div>
)

const CalculatorClient = dynamic(
  () => import('@/app/[locale]/calculator/CalculatorClient'),
  {
    ssr: false,
    loading: () => <Placeholder />,
  }
)

export default function CalculatorSectionBody() {
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '800px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {shouldLoad ? <CalculatorClient embedded /> : <Placeholder />}
    </div>
  )
}
