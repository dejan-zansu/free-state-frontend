import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'
import { LearnMoreLink } from './ui/learn-more-link'
import CheckBulletIcon from './icons/CheckBulletIcon'
import CheckIcon from './icons/CheckIcon'
import Image from 'next/image'
import WalletIcon from './icons/WalletIcon'
import SmallWalletIcon from './icons/SmallWalletIcon'

const AdvantageList = ({ items }: { items: string[] }) => (
  <div className="flex flex-col gap-2.5">
    {items.map(item => (
      <div key={item} className="flex items-center gap-1">
        <CheckBulletIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-sm italic font-light text-foreground/80 tracking-tight">
          {item}
        </span>
      </div>
    ))}
  </div>
)

const IncludedList = ({ items }: { items: string[] }) => (
  <div className="flex flex-col gap-2.5">
    {items.map(item => (
      <div key={item} className="flex items-center gap-1">
        <CheckIcon className="w-3 h-3 shrink-0 text-[#295823]" />
        <span className="text-sm italic font-light text-foreground/80 tracking-tight">
          {item}
        </span>
      </div>
    ))}
  </div>
)

const SolarModels = async () => {
  const t = await getTranslations('home.solarModels')

  const solarFreeIncluded = t.raw('solarFree.included') as string[]
  const solarFreeAdvantages = t.raw('solarFree.advantages') as string[]
  const solarDirectIncluded = t.raw('solarDirect.included') as string[]
  const solarDirectAdvantages = t.raw('solarDirect.advantages') as string[]

  return (
    <section className="w-full flex flex-col items-center px-4 sm:px-6 py-16 md:py-24">
      <div className="max-w-[952px] w-full flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-5 w-full">
          <Badge
            variant="outline"
            className="border-foreground text-foreground font-light text-base backdrop-blur-[65px]"
          >
            {t('eyebrow')}
          </Badge>
          <div className="flex flex-col items-center gap-5 w-full">
            <h3 className="text-3xl md:text-[45px] font-medium text-center text-foreground">
              {t('title')}
            </h3>
            <p className="text-lg md:text-[22px] font-light text-center text-foreground/80 tracking-tight">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-[30px] w-full pt-12">
          <div className="w-full lg:flex-1 relative bg-[#F5F7EE] border border-[#546963]/50 rounded-xl">
            <Badge className="absolute top-0 left-5 -translate-y-1/2 z-10 bg-solar text-foreground border-0 font-light text-base">
              {t('onlineBadge')}
            </Badge>

            <div className="absolute -top-12 right-0 w-[150px] h-[120px] sm:w-[200px] sm:h-[160px] lg:w-[232px] lg:h-[190px] pointer-events-none z-10">
              <Image
                src="/images/solar-free-card-11b71d.png"
                alt={t('solarFree.title')}
                width={232}
                height={190}
                className="object-contain w-full h-full"
              />
            </div>

            <div className="relative flex flex-col h-full p-5 pt-8">
              <div className="flex flex-col gap-2 mb-6 max-w-[165px]">
                <h4 className="text-[22px] font-medium text-foreground">
                  {t('solarFree.title')}
                </h4>
                <p className="text-sm font-light text-foreground/80 tracking-tight">
                  {t('solarFree.description')}
                </p>
              </div>

              <div className="border-t border-[#1F433B]/20 my-1" />

              <div className="flex flex-col gap-2.5 my-4">
                <span className="text-sm font-bold text-foreground">
                  {t('solarFree.advantagesTitle')}
                </span>
                <AdvantageList items={solarFreeAdvantages} />
              </div>

              <div className="border-t border-[#1F433B]/20 my-1" />

              <div className="flex items-center gap-2 my-4">
                <SmallWalletIcon />
                <span className="text-sm font-medium text-foreground/80 tracking-tight">
                  {t('solarFree.highlight')}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 my-4">
                <span className="text-sm font-bold text-foreground">
                  {t('solarFree.includedTitle')}
                </span>
                <IncludedList items={solarFreeIncluded} />
              </div>

              {/* <div className="mt-auto flex flex-col items-start gap-5 pt-6">
                <LinkButton href="/solar-free" variant="tertiary">
                  {t('cta')}
                </LinkButton>
                <LearnMoreLink href="/solar-free">
                  {t('learnMore')}
                </LearnMoreLink>
              </div> */}
            </div>
          </div>

          <div className="w-full lg:flex-1 relative bg-[#F5F7EE] border border-[#546963]/50 rounded-xl">
            <Badge className="absolute top-0 left-5 -translate-y-1/2 z-10 bg-solar text-foreground border-0 font-light text-base">
              Volles Eigentum
            </Badge>

            <div className="absolute -top-16 right-0 w-[150px] h-[130px] sm:w-[200px] sm:h-[180px] lg:w-[251px] lg:h-[220px] pointer-events-none z-10">
              <Image
                src="/images/solar-direct.png"
                alt={t('solarDirect.title')}
                width={251}
                height={220}
                className="object-contain w-full h-full"
              />
            </div>

            <div className="relative flex flex-col h-full p-5 pt-8">
              <div className="flex flex-col gap-2 mb-6 max-w-[165px]">
                <h4 className="text-[22px] font-medium text-foreground">
                  {t('solarDirect.title')}
                </h4>
                <p className="text-sm font-light text-foreground/80 tracking-tight">
                  {t('solarDirect.description')}
                </p>
              </div>

              <div className="border-t border-[#1F433B]/20 my-1" />

              <div className="flex flex-col gap-2.5 my-4">
                <span className="text-sm font-bold text-foreground">
                  {t('solarDirect.advantagesTitle')}
                </span>
                <AdvantageList items={solarDirectAdvantages} />
              </div>

              <div className="border-t border-[#1F433B]/20 my-1" />

              <div className="flex items-center gap-2 my-4">
                <SmallWalletIcon />
                <span className="text-sm font-medium text-foreground/80 tracking-tight">
                  {t('solarDirect.highlight')}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 my-4">
                <span className="text-sm font-bold text-foreground">
                  {t('solarDirect.includedTitle')}
                </span>
                <IncludedList items={solarDirectIncluded} />
              </div>

              {/* <div className="mt-auto flex flex-col items-start gap-5 pt-6">
                <LinkButton href="/solar-calculator" variant="tertiary">
                  {t('cta')}
                </LinkButton>
                <LearnMoreLink href="/solar-calculator">
                  {t('learnMore')}
                </LearnMoreLink>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarModels
