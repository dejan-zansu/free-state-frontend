import { cn } from '@/lib/utils'

interface PageLoaderProps {
  fullscreen?: boolean
  className?: string
}

export function PageLoader({ fullscreen = false, className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullscreen ? 'min-h-screen' : 'h-64',
        className
      )}
    >
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = i * 45
            const rad = (angle * Math.PI) / 180
            const x1 = 24 + Math.cos(rad) * 14
            const y1 = 24 + Math.sin(rad) * 14
            const x2 = 24 + Math.cos(rad) * 20
            const y2 = 24 + Math.sin(rad) * 20
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-solar origin-center animate-[solar-ray_1.2s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            )
          })}

          <circle
            cx="24"
            cy="24"
            r="9"
            fill="currentColor"
            className="text-solar animate-[solar-pulse_1.2s_ease-in-out_infinite]"
          />
        </svg>
      </div>
    </div>
  )
}
