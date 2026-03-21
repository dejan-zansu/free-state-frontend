'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-cyan-100 text-cyan-700',
  QUALIFIED: 'bg-indigo-100 text-indigo-700',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-700',
  NEGOTIATION: 'bg-amber-100 text-amber-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
  ON_HOLD: 'bg-gray-100 text-gray-700',

  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700',
  SUSPENDED: 'bg-red-100 text-red-700',

  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  PENDING_SIGNATURE: 'bg-amber-100 text-amber-700',
  OTP_SENT: 'bg-orange-100 text-orange-700',
  SIGNED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  SENT: 'bg-blue-100 text-blue-700',
  VIEWED: 'bg-cyan-100 text-cyan-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',

  ADMIN: 'bg-purple-100 text-purple-700',
  CUSTOMER: 'bg-blue-100 text-blue-700',
  SALES_REP: 'bg-teal-100 text-teal-700',

  PRELIMINARY: 'bg-blue-100 text-blue-700',
  FINAL: 'bg-green-100 text-green-700',
  AMENDMENT: 'bg-amber-100 text-amber-700',

  OPEN: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'

  return (
    <Badge
      variant="secondary"
      className={cn('font-medium border-0', colorClass, className)}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
