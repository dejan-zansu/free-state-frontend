import { useTranslations } from 'next-intl'

const NODES = [
  { titleKey: 'node2008Title', bodyKey: 'node2008Body' },
  { titleKey: 'node2008_2024Title', bodyKey: 'node2008_2024Body' },
  { titleKey: 'node2024Title', bodyKey: 'node2024Body' },
  { titleKey: 'nodeTodayTitle', bodyKey: 'nodeTodayBody' },
] as const

export function TelemiivaTimeline() {
  const t = useTranslations('telemiivaTimeline')
  return (
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-3">{t('sectionHeading')}</h2>
        <p className="text-base text-zinc-600">{t('subheading')}</p>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
        <div className="hidden md:block absolute top-6 left-12 right-12 h-px bg-zinc-200" aria-hidden />
        {NODES.map((n) => (
          <li key={n.titleKey} className="relative bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="w-3 h-3 rounded-full bg-amber-500 mb-4" aria-hidden />
            <h3 className="text-base font-semibold mb-2">{t(n.titleKey)}</h3>
            <p className="text-base text-zinc-700">{t(n.bodyKey)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
