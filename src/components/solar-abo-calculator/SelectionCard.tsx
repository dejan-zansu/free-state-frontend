'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectionCardProps {
  icon: React.ReactNode
  label: string
  selected?: boolean
  onClick: () => void
}

export function SelectionCard({ icon, label, selected, onClick }: SelectionCardProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border-2 bg-card p-4 text-left transition-all',
        'hover:border-primary/50 hover:bg-primary/5',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border'
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
          selected ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {icon}
      </div>
      <span className='flex-1 font-medium'>{label}</span>
      <ChevronRight
        className={cn(
          'h-5 w-5 shrink-0',
          selected ? 'text-primary' : 'text-muted-foreground'
        )}
      />
    </button>
  )
}
