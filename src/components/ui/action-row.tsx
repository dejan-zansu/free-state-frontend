import { Loader2, CheckCircle2 } from 'lucide-react'

export function ActionRow({
  icon,
  title,
  subtitle,
  buttonLabel,
  onClick,
  disabled,
  loading,
  done,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  buttonLabel: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  done?: boolean
}) {
  return (
    <div className="relative flex items-center gap-4 rounded-[30px] border border-glass-border bg-white/30 backdrop-blur-md px-5 py-3 shadow-[0_25px_34px_0_rgba(183,254,26,0.1)]">
      <span className="shrink-0 text-teal-deep">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium uppercase tracking-tight text-pine">
          {title}
        </p>
        <p className="text-sm italic font-light text-pine/80 tracking-tight truncate">
          {subtitle}
        </p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="shrink-0 inline-flex items-center gap-2 rounded-full border border-pine bg-white/10 backdrop-blur px-4 py-2.5 text-sm font-medium text-pine hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {done && <CheckCircle2 className="w-4 h-4 text-teal-deep" />}
        <span>{buttonLabel}</span>
      </button>
    </div>
  )
}
