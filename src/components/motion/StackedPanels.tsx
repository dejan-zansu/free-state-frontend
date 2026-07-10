'use client'

import { Children, type ReactNode } from 'react'

export default function StackedPanels({ children }: { children: ReactNode }) {
  const items = Children.toArray(children)

  return (
    <div className="relative">
      {items.map((child, i) => (
        <div
          key={i}
          data-stack-panel
          className="relative motion-safe:sticky motion-safe:top-0 motion-safe:min-h-svh motion-safe:[&>section]:min-h-svh motion-safe:[&>section]:flex motion-safe:[&>section]:flex-col motion-safe:[&>section>div]:flex-1 motion-safe:[&>section>div]:w-full"
        >
          {child}
        </div>
      ))}
    </div>
  )
}
