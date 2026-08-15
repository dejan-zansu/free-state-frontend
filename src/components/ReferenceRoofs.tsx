import { getTranslations } from 'next-intl/server'
import { Reveal, RevealStagger } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'

type ReferenceEntry = {
  name: string
  description: string
}

const ReferenceRoofs = async () => {
  const t = await getTranslations('home.referenceRoofs')
  const entries = t.raw('entries') as ReferenceEntry[]

  return (
    <section className="w-full bg-[#FDFFF5] py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-[1120px] mx-auto flex flex-col items-center gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-5 max-w-[536px] text-center">
          <RevealText
            as="h2"
            className="text-foreground text-3xl md:text-[45px] font-medium"
          >
            {t('title')}
          </RevealText>
          <Reveal
            as="p"
            delay={0.2}
            className="text-foreground/80 text-lg md:text-[22px] tracking-tight"
          >
            {t('subtitle')}
          </Reveal>
        </div>

        <RevealStagger as="div" className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
          {entries.map((entry, index) => (
            <div
              key={entry.name}
              className={`flex flex-col items-center text-center gap-5 md:px-10 md:items-start md:text-left ${
                index > 0 ? 'md:border-l md:border-foreground/30' : ''
              }`}
            >
              <h3 className="text-[22px] font-bold text-foreground">{entry.name}</h3>
              <p className="text-base text-foreground/80 tracking-tight">
                {entry.description}
              </p>
            </div>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

export default ReferenceRoofs
