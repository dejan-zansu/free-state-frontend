'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { InternalTaskPriority } from '@/types/admin'

const PRIORITY_COLORS: Record<InternalTaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-500',
  MEDIUM: 'bg-gray-100 text-gray-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
}

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority: InternalTaskPriority
  className?: string
}) {
  const t = useTranslations('admin.tasks.priorityLabels')

  return (
    <Badge
      variant="secondary"
      className={cn('font-medium border-0', PRIORITY_COLORS[priority], className)}
    >
      {t(priority)}
    </Badge>
  )
}
