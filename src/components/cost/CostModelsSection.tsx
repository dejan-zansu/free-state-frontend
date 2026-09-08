import CheckIcon from '@/components/icons/CheckIcon'
import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const models = [
  { key: 'direct', href: '/solar-direct', accent: false },
  { key: 'abo', href: '/solar-abo', accent: false },
  { key: 'free', href: '/solar-free', accent: true },
] as const

const pointKeys = ['1', '2', '3'] as const

const CostModelsSection = async () => {
  const t = await getTranslations('cost')

  return (
    <section className="relative bg-[#FDFFF5] overflow-hidden">
      <div className="max-w-[1214px] mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col items-center gap-5 text-center mb-12 md:mb-16">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1.05] max-w-[820px]">
            {t('models.title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg md:text-[22px] leading-[1.3] tracking-[-0.02em] max-w-[760px]">
            {t('models.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {models.map(model => (
            <article
              key={model.key}
              className={`flex flex-col gap-6 rounded-[24px] border p-7 md:p-8 ${
                model.accent
                  ? 'bg-[#062E25] border-[#062E25] text-white'
                  : 'bg-[#F2F4E8] border-[#809792]/60 text-[#062E25]'
              }`}
            >
              <div className="flex flex-col gap-2">
                <span
                  className={`text-sm font-medium uppercase tracking-[0.08em] ${
                    model.accent ? 'text-[#B7FE1A]' : 'text-[#036B53]'
                  }`}
                >
                  {t(`models.${model.key}.name`)}
                </span>
                <h3 className="text-2xl md:text-[28px] font-medium leading-[1.1]">
                  {t(`models.${model.key}.headline`)}
                </h3>
                <p
                  className={`text-base md:text-lg leading-[1.35] ${
                    model.accent ? 'text-white/75' : 'text-[#062E25]/75'
                  }`}
                >
                  {t(`models.${model.key}.tagline`)}
                </p>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {pointKeys.map(p => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckIcon
                      className={`w-5 h-5 mt-0.5 shrink-0 ${
                        model.accent ? 'text-[#B7FE1A]' : 'text-[#036B53]'
                      }`}
                    />
                    <span
                      className={`text-sm md:text-base leading-[1.35] ${
                        model.accent ? 'text-white/85' : 'text-[#062E25]/85'
                      }`}
                    >
                      {t(`models.${model.key}.points.${p}`)}
                    </span>
                  </li>
                ))}
              </ul>

              <LinkButton
                variant={model.accent ? 'primary' : 'outline-primary'}
                href={model.href}
                className="w-fit"
              >
                {t(`models.${model.key}.cta`)}
              </LinkButton>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CostModelsSection
