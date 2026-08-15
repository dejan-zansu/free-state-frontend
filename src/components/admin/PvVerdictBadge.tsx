'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import type { PvVerdict } from '@/types/admin-outreach'

const PV_VERDICT_COLORS: Record<PvVerdict, string> = {
  REGISTRY_HIT: 'bg-red-100 text-red-700',
  IMAGERY_HIT: 'bg-orange-100 text-orange-700',
  NO_PV: 'bg-green-100 text-green-700',
  UNCLEAR: 'bg-amber-100 text-amber-700',
  UNCHECKED: 'bg-gray-100 text-gray-500',
}

export function PvVerdictBadge({ verdict, className }: { verdict: PvVerdict; className?: string }) {
  const t = useTranslations('admin.outreach.pvVerdicts')

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full font-medium whitespace-nowrap', PV_VERDICT_COLORS[verdict], className)}>
      {t(verdict)}
    </span>
  )
}
