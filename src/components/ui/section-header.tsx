export function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <header className="text-center max-w-xl mx-auto space-y-4 mb-8">
      <h2 className="text-4xl sm:text-[45px] font-medium text-pine tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-xl font-light text-pine/80 tracking-tight">
          {subtitle}
        </p>
      )}
    </header>
  )
}
