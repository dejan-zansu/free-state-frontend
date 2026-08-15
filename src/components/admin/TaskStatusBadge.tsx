'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { InternalTaskStatus } from '@/types/admin'

const STATUS_COLORS: Record<InternalTaskStatus, string> = {
  OPEN: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

export function TaskStatusBadge({
  status,
  className,
}: {
  status: InternalTaskStatus
  className?: string
}) {
  const t = useTranslations('admin.tasks.statusLabels')

  return (
    <Badge
      variant="secondary"
      className={cn('font-medium border-0', STATUS_COLORS[status], className)}
    >
      {t(status)}
    </Badge>
  )
}
