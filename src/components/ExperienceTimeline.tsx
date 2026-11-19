import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Reveal, RevealStagger } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import { cn } from '@/lib/utils'

const NODES = [
  { titleKey: 'node2008Title', bodyKey: 'node2008Body' },
  { titleKey: 'node2008_2024Title', bodyKey: 'node2008_2024Body' },
  { titleKey: 'node2024Title', bodyKey: 'node2024Body' },
  { titleKey: 'nodeTodayTitle', bodyKey: 'nodeTodayBody' },
] as const

export default function ExperienceTimeline() {
  const t = useTranslations('experienceTimeline')
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-[1290px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-end mb-14 md:mb-20">
          <div className="flex flex-col gap-5">
            <RevealText
              as="h2"
              className="text-4xl md:text-6xl font-medium text-foreground tracking-tight"
            >
              {t('sectionHeading')}
            </RevealText>
            <Reveal
              as="p"
              delay={0.2}
              className="text-lg md:text-[22px] text-foreground/80 tracking-tight max-w-[480px]"
            >
              {t('subheading')}
            </Reveal>
          </div>
          <Reveal
            as="div"
            delay={0.1}
            className="relative h-[260px] sm:h-[360px] lg:h-[420px] rounded-[30px] overflow-hidden"
          >
            <Image
              src="/images/photography/installers-handing-module-on-roof-1196.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 700px, 100vw"
              className="object-cover object-[25%_center]"
            />
          </Reveal>
        </div>

        <RevealStagger
          as="ol"
          className="relative grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8"
        >
          <div
            className="hidden md:block absolute top-[7px] left-0 right-0 h-px bg-[linear-gradient(90deg,rgba(6,46,37,0.15)_0%,rgba(6,46,37,0.15)_70%,var(--color-solar)_100%)]"
            aria-hidden
          />
          <div
            className="md:hidden absolute left-[7px] top-2 bottom-2 w-px bg-[linear-gradient(180deg,rgba(6,46,37,0.15)_0%,rgba(6,46,37,0.15)_70%,var(--color-solar)_100%)]"
            aria-hidden
          />
          {NODES.map((n, index) => {
            const isToday = index === NODES.length - 1
            return (
              <li key={n.titleKey} className="relative pl-10 md:pl-0 md:pt-12">
                <span
                  className="absolute left-0 top-1.5 md:top-0 flex size-[15px]"
                  aria-hidden
                >
                  {isToday && (
                    <span className="absolute inset-0 rounded-full bg-solar opacity-60 animate-ping motion-reduce:hidden" />
                  )}
                  <span
                    className={cn(
                      'relative size-[15px] rounded-full border-2',
                      isToday
                        ? 'bg-solar border-solar'
                        : 'bg-background border-foreground/30'
                    )}
                  />
                </span>
                <h3 className="text-3xl md:text-[34px] font-medium text-foreground tracking-tight mb-3">
                  {t(n.titleKey)}
                </h3>
                <p className="text-base md:text-lg text-foreground/75 tracking-tight">
                  {t(n.bodyKey)}
                </p>
              </li>
            )
          })}
        </RevealStagger>
      </div>
    </section>
  )
}
