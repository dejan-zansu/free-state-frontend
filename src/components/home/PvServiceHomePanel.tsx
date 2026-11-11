import { RevealStagger } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import {
  PV_SERVICE_PACKAGE_KEYS,
  PV_SERVICE_PRICE_ROWS,
} from '@/components/pv-service/pv-service-api'
import { formatChf } from '@/components/roof-renovation/roof-renovation-api'
import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const POINTS = ['free', 'anyInstaller', 'wholeSwitzerland'] as const

const PvServiceHomePanel = async () => {
  const t = await getTranslations('home.pvService')
  const tPoints = await getTranslations('pvService.hero.points')
  const tPackages = await getTranslations('pvService.packages')
  const lowest = PV_SERVICE_PRICE_ROWS[0].annualChf

  return (
    <section
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)',
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col">
          <div className="relative min-h-[300px] flex-1 lg:min-h-0">
            <Image
              src="/images/pv-service/roof-pv-mounting-work.webp"
              alt={t('imageAlt')}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[70%_60%]"
            />
          </div>
          <Link
            href={{ pathname: '/service', hash: 'rechner' }}
            className="group flex items-center justify-between gap-4 bg-[#3D3858] px-6 py-4 text-base font-medium text-white sm:px-8 md:text-lg"
          >
            {t('toolLink')}
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white transition-transform group-hover:translate-x-1">
              <ArrowRight aria-hidden className="size-5 text-[#3D3858]" />
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 py-14 sm:px-12 lg:px-0">
          <div className="flex max-w-[400px] flex-col gap-5">
            <RevealText
              as="h2"
              className="text-3xl font-medium text-foreground md:text-[45px]"
            >
              {t('title')}
            </RevealText>
            <RevealStagger as="div" className="flex flex-col gap-[30px]">
              <div className="flex flex-col gap-5">
                <p className="text-lg tracking-tight text-foreground/80">
                  {t('subtitle')}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {POINTS.map(point => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-base font-medium tracking-tight text-foreground/80"
                    >
                      <CircleCheck
                        aria-hidden
                        className="size-5 shrink-0 text-[#3D3858]"
                      />
                      {tPoints(point)}
                    </li>
                  ))}
                </ul>
                <div className="rounded-[20px] bg-white p-5">
                  <p className="text-base font-medium">{t('pricesTitle')}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {PV_SERVICE_PACKAGE_KEYS.map(key => (
                      <li
                        key={key}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <span className="text-base">
                          {tPackages(`${key}.name`)}
                        </span>
                        <span className="text-lg font-medium tabular-nums">
                          {lowest
                            ? tPackages('price', {
                                value: formatChf(lowest[key]),
                              })
                            : tPackages('onRequest')}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-base text-foreground/70">
                    {t('pricesNote')}
                  </p>
                </div>
              </div>
              <LinkButton
                href="/service"
                variant="quaternary"
                className="w-fit"
              >
                {t('cta')}
              </LinkButton>
            </RevealStagger>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PvServiceHomePanel
