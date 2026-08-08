'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function WorkspaceDisclosure({
  title,
  helper,
  toggleLabel,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  title: string
  helper?: string
  toggleLabel?: string
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}) {
  const panelId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const [everOpened, setEverOpened] = useState(defaultOpen)

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) setEverOpened(true)
    onOpenChange?.(next)
  }

  return (
    <section className="rounded-2xl border border-pine/10 bg-white/70">
      <h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={toggleLabel}
          className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-5 text-left transition-colors hover:bg-white/60 sm:px-8"
        >
          <span className="min-w-0 text-base font-medium text-pine tracking-tight sm:text-lg">
            {title}
          </span>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pine/15 bg-white text-pine">
            <ChevronDown
              className={cn('h-5 w-5 transition-transform duration-200', open && 'rotate-180')}
              aria-hidden
            />
          </span>
        </button>
      </h2>

      {helper && (
        <p className="px-5 pb-5 text-base font-light text-pine/75 tracking-tight sm:px-8">
          {helper}
        </p>
      )}

      <div id={panelId} hidden={!open} className="px-5 pb-8 sm:px-8">
        {everOpened ? children : null}
      </div>
    </section>
  )
}
