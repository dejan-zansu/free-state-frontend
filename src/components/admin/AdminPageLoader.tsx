'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface AdminPageLoaderProps {
  fullscreen?: boolean
  className?: string
}

export function AdminPageLoader({
  fullscreen = false,
  className,
}: AdminPageLoaderProps) {
  return (
    <div
      className={cn(
        fullscreen
          ? 'min-h-screen flex items-center justify-center bg-background'
          : 'flex items-center justify-center py-12',
        className
      )}
    >
      <Loader2 className="size-4 animate-spin text-primary" />
    </div>
  )
}

export default AdminPageLoader
