import { useTranslations } from 'next-intl'

const NODES = [
  { titleKey: 'node2008Title', bodyKey: 'node2008Body' },
  { titleKey: 'node2008_2024Title', bodyKey: 'node2008_2024Body' },
  { titleKey: 'node2024Title', bodyKey: 'node2024Body' },
  { titleKey: 'nodeTodayTitle', bodyKey: 'nodeTodayBody' },
] as const

export default function TelemiivaTimeline() {
  const t = useTranslations('telemiivaTimeline')
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex flex-col items-center gap-5 text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-[45px] font-medium text-foreground">
            {t('sectionHeading')}
          </h2>
          <p className="text-lg md:text-[22px] font-light text-foreground/80 tracking-tight">
            {t('subheading')}
          </p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-[30px] relative">
          <div
            className="hidden md:block absolute top-6 left-12 right-12 h-px bg-foreground/20"
            aria-hidden
          />
          {NODES.map(n => (
            <li
              key={n.titleKey}
              className="relative bg-[#FDFEFA] rounded-xl border border-[#546963]/50 p-6"
            >
              <div className="w-3 h-3 rounded-full bg-solar mb-4" aria-hidden />
              <h3 className="text-[22px] font-medium text-foreground mb-2">
                {t(n.titleKey)}
              </h3>
              <p className="text-base font-light text-foreground/80 tracking-tight">
                {t(n.bodyKey)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
