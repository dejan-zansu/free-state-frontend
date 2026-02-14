'use client'

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface DeviceToggleProps {
  icon: React.ReactNode
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function DeviceToggle({ icon, label, checked, onCheckedChange }: DeviceToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 border-b border-border py-4 last:border-b-0',
        'transition-colors'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          checked ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {icon}
      </div>
      <span className='flex-1 font-medium'>{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}
