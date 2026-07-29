'use client'

import { useEffect, useState } from 'react'
import type { ArticleHeading } from '@/lib/blog/article'

const TocRail = ({
  headings,
  label,
}: {
  headings: ArticleHeading[]
  label: string
}) => {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-100px 0px -70% 0px' }
    )
    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [headings])

  return (
    <nav className="sticky top-28">
      <p className="text-base font-medium text-[#062E25] mb-4">{label}</p>
      <ul className="flex flex-col gap-2.5 border-l border-[#062E25]/10">
        {headings.map(h => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block pl-4 -ml-px border-l-2 text-base transition-colors ${
                activeId === h.id
                  ? 'border-[#B7FE1A] text-[#062E25] font-medium'
                  : 'border-transparent text-[#062E25]/55 hover:text-[#062E25]'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
export default TocRail
