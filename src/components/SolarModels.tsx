import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'
import { LearnMoreLink } from './ui/learn-more-link'
import CheckBulletIcon from './icons/CheckBulletIcon'
import CheckIcon from './icons/CheckIcon'
import Image from 'next/image'
import WalletIcon from './icons/WalletIcon'
import SmallWalletIcon from './icons/SmallWalletIcon'

const AdvantageList = ({
  items,
  isCommercial = false,
}: {
  items: string[]
  isCommercial?: boolean
}) => (
  <div className="flex flex-col gap-2.5">
    {items.map(item => (
      <div key={item} className="flex items-center gap-1">
        {isCommercial ? (
          <CommercialCheckIcon />
        ) : (
          <CheckBulletIcon className="w-3.5 h-3.5 shrink-0" />
        )}
        <span className="text-sm italic font-light text-foreground/80 tracking-tight">
          {item}
        </span>
      </div>
    ))}
  </div>
)

const CommercialCheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    fill="none"
    className="shrink-0"
  >
    <path
      fill="#9f3e4f"
      d="M4.753.751c.383-.326.575-.49.775-.585a1.7 1.7 0 0 1 1.465 0c.2.096.391.259.774.585.153.13.229.195.31.25.187.125.397.212.617.255.096.02.196.027.396.043.501.04.752.06.962.134.484.171.864.552 1.035 1.036.074.21.094.46.134.962.016.2.024.3.043.395.044.22.13.43.256.617.054.081.119.158.249.31.326.383.49.575.585.775a1.7 1.7 0 0 1 0 1.465c-.095.2-.259.391-.585.774-.13.153-.195.229-.25.31a1.7 1.7 0 0 0-.255.617 4 4 0 0 0-.043.396c-.04.501-.06.752-.134.962-.17.484-.551.864-1.035 1.035-.21.074-.46.094-.962.134-.2.016-.3.024-.396.043-.22.044-.43.13-.617.256-.081.054-.157.119-.31.249-.383.326-.574.49-.774.585a1.7 1.7 0 0 1-1.465 0c-.2-.095-.392-.259-.775-.585a4 4 0 0 0-.31-.25 1.7 1.7 0 0 0-.617-.255 4 4 0 0 0-.395-.043c-.502-.04-.753-.06-.962-.134a1.7 1.7 0 0 1-1.036-1.035c-.074-.21-.094-.46-.134-.962-.016-.2-.024-.3-.043-.396-.043-.22-.13-.43-.255-.617a4 4 0 0 0-.25-.31c-.326-.383-.49-.574-.585-.774a1.7 1.7 0 0 1 0-1.465c.096-.2.259-.392.585-.775.13-.152.195-.229.25-.31.125-.187.212-.396.255-.617.02-.096.027-.196.043-.395.04-.502.06-.753.134-.962A1.7 1.7 0 0 1 2.47 1.433c.21-.074.46-.094.962-.134.2-.016.3-.024.395-.043.22-.043.43-.13.617-.255.081-.055.158-.12.31-.25"
    />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth=".894"
      d="m3.882 6.6 1.36 1.358 3.396-3.396"
    />
  </svg>
)

const IncludedList = ({ items }: { items: string[] }) => (
  <div className="flex flex-col gap-2.5">
    {items.map(item => (
      <div key={item} className="flex items-center gap-1">
        <span className="w-1 h-1 rounded-full shrink-0 bg-[#295823]" />
        <span className="text-sm italic font-bold text-foreground/80 tracking-tight">
          {item}
        </span>
      </div>
    ))}
  </div>
)

const SolarModels = async ({ isCommercial = false }: { isCommercial?: boolean } = {}) => {
  const t = await getTranslations('home.solarModels')

  const solarFreeIncluded = t.raw('solarFree.included') as string[]
  const solarFreeAdvantages = t.raw('solarFree.advantages') as string[]
  const solarDirectIncluded = t.raw('solarDirect.included') as string[]
  const solarDirectAdvantages = t.raw('solarDirect.advantages') as string[]

  const solarFreeImage = isCommercial
    ? '/images/commercial-solar-free.png'
    : '/images/solar-free-card-11b71d.webp'
  const solarDirectImage = isCommercial
    ? '/images/commercial-solar-direct.png'
    : '/images/solar-direct.png'

  return (
    <section
      className="relative w-full flex flex-col items-center px-4 sm:px-6 py-16 md:py-24 overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(180deg, #F2F4E8 0%, #DCE9E6 79%)',
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[289px] h-[419px] -translate-x-1/2 -translate-y-1/3 rounded-full"
        style={{
          background: 'rgba(183, 254, 26, 0.2)',
          filter: 'blur(180px)',
        }}
      />
      <div className="relative max-w-[952px] w-full flex flex-col items-center gap-10">
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
          <div className="w-full lg:flex-1 relative bg-[#FDFEFA] border border-[#546963]/50 rounded-xl">
            <Badge className={`absolute top-0 left-5 -translate-y-1/2 z-10 border-0 font-light text-base ${isCommercial ? 'bg-[#9F3E4F] text-white' : 'bg-solar text-foreground'}`}>
              {t('onlineBadge')}
            </Badge>

            <div className="absolute -top-12 right-0 w-[150px] h-[120px] sm:w-[200px] sm:h-[160px] lg:w-[232px] lg:h-[190px] pointer-events-none z-10">
              <div
                className="pointer-events-none absolute -bottom-6 -right-6 w-[60%] h-[60%] rounded-full"
                style={{
                  background: 'rgba(183, 254, 26, 0.18)',
                  filter: 'blur(50px)',
                }}
              />
              <Image
                src={solarFreeImage}
                alt={t('solarFree.title')}
                width={232}
                height={190}
                className="relative object-contain w-full h-full"
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
                <AdvantageList items={solarFreeAdvantages} isCommercial={isCommercial} />
              </div>

              <div className="border-t border-[#1F433B]/20 my-1" />

              <div className="flex items-center gap-2 my-4">
                <SmallWalletIcon
                  bgColor={isCommercial ? '#9F3E4F' : '#b7fe1a'}
                  fgColor={isCommercial ? '#FFFFFF' : '#062e25'}
                />
                <span className="text-sm font-medium text-foreground/80 tracking-tight">
                  {t('solarFree.highlight')}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 my-4">
                <p className="font-bold text-foreground">
                  {t('solarFree.includedTitle')}
                </p>
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

          <div className="w-full lg:flex-1 relative bg-[#FDFEFA] border border-[#546963]/50 rounded-xl">
            <Badge className={`absolute top-0 left-5 -translate-y-1/2 z-10 border-0 font-light text-base ${isCommercial ? 'bg-[#9F3E4F] text-white' : 'bg-solar text-foreground'}`}>
              Volles Eigentum
            </Badge>

            <div className="absolute -top-16 right-0 w-[150px] h-[130px] sm:w-[200px] sm:h-[180px] lg:w-[251px] lg:h-[220px] pointer-events-none z-10">
              <div
                className="pointer-events-none absolute -bottom-6 -right-6 w-[60%] h-[60%] rounded-full"
                style={{
                  background: 'rgba(183, 254, 26, 0.18)',
                  filter: 'blur(50px)',
                }}
              />
              <Image
                src={solarDirectImage}
                alt={t('solarDirect.title')}
                width={251}
                height={220}
                className="relative object-contain w-full h-full"
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
                <AdvantageList items={solarDirectAdvantages} isCommercial={isCommercial} />
              </div>

              <div className="border-t border-[#1F433B]/20 my-1" />

              <div className="flex items-center gap-2 my-4">
                <SmallWalletIcon
                  bgColor={isCommercial ? '#9F3E4F' : '#b7fe1a'}
                  fgColor={isCommercial ? '#FFFFFF' : '#062e25'}
                />
                <span className="text-sm font-medium text-foreground/80 tracking-tight">
                  {t('solarDirect.highlight')}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 my-4">
                <p className="font-bold text-foreground">
                  {t('solarDirect.includedTitle')}
                </p>
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
