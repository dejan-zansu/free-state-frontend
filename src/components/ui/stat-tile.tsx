import { EyebrowPill } from '@/components/ui/eyebrow-pill'

interface StatTileProps {
  variant: 'glass' | 'calm'
  badge?: string
  icon?: React.ReactNode
  label?: string
  value: string
  subtitle?: string
  ready?: boolean
}

export function StatTile({
  variant,
  badge,
  icon,
  label,
  value,
  subtitle,
  ready = true,
}: StatTileProps) {
  if (variant === 'glass') {
    return (
      <div className="relative rounded-[10px] border border-glass-border bg-white/30 backdrop-blur-md px-6 h-[180px] sm:h-[200px] flex flex-col items-center justify-center text-center">
        {badge && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <EyebrowPill>{badge}</EyebrowPill>
          </span>
        )}
        {ready ? (
          <>
            <div className="text-2xl sm:text-3xl font-semibold text-pine tabular-nums whitespace-nowrap">
              {value}
            </div>
            {subtitle && (
              <p className="mt-3 text-base sm:text-xl font-light text-pine/90 tracking-tight">
                {subtitle}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="h-10 w-48 rounded bg-pine/10 animate-pulse" />
            <div className="mt-3 h-5 w-32 rounded bg-pine/10 animate-pulse" />
          </>
        )}
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-pine/10 bg-white p-5">
      <div className="flex items-center gap-2">
        {icon && <span className="text-teal-deep">{icon}</span>}
        {label && <p className="text-base text-pine/75">{label}</p>}
      </div>
      <p className="mt-2 text-2xl font-bold text-pine tabular-nums">{value}</p>
      {subtitle && <p className="mt-1 text-base text-pine/75">{subtitle}</p>}
    </div>
  )
}
