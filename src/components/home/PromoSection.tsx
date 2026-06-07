import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { ReactNode } from 'react'
import PromoCarousel from './PromoCarousel'

type PromoFeature = {
  icon: string
  title: string
  subtitle: string
}

const accent = (chunks: ReactNode) => (
  <span className="text-[#036B53]">{chunks}</span>
)

const PromoBadge = ({
  text,
  showPercent = false,
}: {
  text: string
  showPercent?: boolean
}) => (
  <div className="absolute right-4 top-4 z-10 flex size-[130px] flex-col items-center justify-center gap-1 rounded-full bg-[#036B53] text-center lg:right-10 lg:top-12 lg:size-[187px]">
    {showPercent ? (
      <span className="text-[26px] font-medium text-[#B7FE1A] lg:text-[40px]">
        %
      </span>
    ) : (
      <Image
        src="/images/promo/badge-gift.svg"
        alt=""
        width={44}
        height={44}
        className="w-7 lg:w-10"
      />
    )}
    <span className="whitespace-pre-line text-[13px] font-medium capitalize text-white lg:text-[22px]">
      {text}
    </span>
  </div>
)

const ReferralSlide = async () => {
  const t = await getTranslations('home.promo')
  return (
    <div className="relative flex h-full flex-col lg:block lg:h-[718px]">
      <div className="relative z-10 mx-auto flex w-full max-w-360 px-4 pb-12 pt-12 sm:px-6 lg:h-full lg:items-center lg:px-12 lg:py-0 xl:px-[118px]">
        <div className="flex max-w-[534px] flex-col items-start">
          <Image
            src="/images/promo/referral-icon.svg"
            alt=""
            width={104}
            height={94}
            className="w-20 lg:w-[104px]"
          />
          <h2 className="mt-6 whitespace-pre-line text-3xl font-medium capitalize text-foreground sm:text-4xl xl:text-[50px]">
            {t.rich('referral.title', { accent })}
          </h2>
          <p className="mt-5 whitespace-pre-line text-lg font-light text-foreground/80 xl:text-[22px]">
            {t('referral.subtitle')}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 lg:gap-6">
            <LinkButton
              variant="solar-dark"
              href="/calculator"
              iconWrapperClassName="bg-[#A3E60C]"
            >
              {t('referral.cta.primary')}
            </LinkButton>
            <LinkButton
              variant="outline-tertiary"
              href="/contact"
              className="shadow-[0_8px_24px_rgba(0,0,0,0.24)]"
              iconWrapperClassName="bg-[#A3E60C]"
            >
              {t('referral.cta.secondary')}
            </LinkButton>
          </div>
        </div>
      </div>
      <div className="relative min-h-[300px] grow sm:min-h-[380px] lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <Image
          src="/images/promo/slide-referral-photo.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <PromoBadge text={t('referral.badge')} />
      </div>
    </div>
  )
}

const FamilySlide = async () => {
  const t = await getTranslations('home.promo')
  return (
    <div className="relative flex h-full flex-col lg:block lg:h-[718px]">
      <div className="relative z-10 mx-auto flex w-full max-w-360 px-4 pb-12 pt-12 sm:px-6 lg:h-full lg:items-center lg:px-12 lg:py-0 xl:px-[118px]">
        <div className="flex max-w-[534px] flex-col items-start">
          <Image
            src="/images/promo/family-icon.svg"
            alt=""
            width={116}
            height={109}
            className="w-[88px] lg:w-[116px]"
          />
          <h2 className="mt-6 whitespace-pre-line text-3xl font-medium capitalize text-foreground sm:text-4xl xl:text-[50px]">
            {t.rich('family.title', { accent })}
          </h2>
          <p className="mt-5 whitespace-pre-line text-lg font-light text-foreground/80 xl:text-[22px]">
            {t('family.subtitle')}
          </p>
          <div className="mt-10">
            <LinkButton
              variant="solar-dark"
              href="/contact"
              iconWrapperClassName="bg-[#A3E60C]"
            >
              {t('family.cta')}
            </LinkButton>
          </div>
        </div>
      </div>
      <div className="relative min-h-[300px] grow sm:min-h-[380px] lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <Image
          src="/images/promo/slide-family-photo.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <PromoBadge text={t('family.badge')} showPercent />
      </div>
    </div>
  )
}

const CompleteSlide = async () => {
  const t = await getTranslations('home.promo')
  const features = t.raw('complete.features') as PromoFeature[]
  return (
    <div className="relative flex h-full flex-col lg:block lg:h-[718px]">
      <div className="relative z-10 mx-auto flex w-full max-w-360 px-4 pb-12 pt-12 sm:px-6 lg:h-full lg:items-center lg:px-12 lg:py-0 xl:px-[118px]">
        <div className="flex max-w-[646px] flex-col items-start">
          <span className="rounded-[20px] bg-[#036B53] px-4 py-2.5 text-base font-light text-white">
            {t('complete.eyebrow')}
          </span>
          <h2 className="mt-5 whitespace-pre-line text-3xl font-medium capitalize text-foreground sm:text-4xl xl:text-[50px]">
            {t.rich('complete.title', { accent })}
          </h2>
          <p className="mt-5 whitespace-pre-line text-lg font-light text-foreground/80 xl:text-[22px]">
            {t('complete.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {features.map(feature => (
              <div key={feature.title} className="flex max-w-[100px] flex-col">
                <Image src={feature.icon} alt="" width={39} height={39} />
                <span className="mt-2 text-[10px] font-bold text-foreground">
                  {feature.title}
                </span>
                <span className="text-[10px] font-normal text-foreground/70">
                  {feature.subtitle}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <LinkButton
              variant="solar-dark"
              href="/solar-abo"
              iconWrapperClassName="bg-[#A3E60C]"
            >
              {t('complete.cta')}
            </LinkButton>
          </div>
          <div className="mt-10 w-full max-w-[463px] border-t border-[#4D6960]/40" />
          <p className="mt-7 text-lg font-bold text-foreground/80 xl:text-[22px]">
            {t('complete.partnersLabel')}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Image
              src="/images/promo/logo-huawei.webp"
              alt="Huawei"
              width={98}
              height={24}
              className="h-6 w-auto"
            />
            <div className="hidden h-12 w-px bg-[#4D6960]/40 sm:block" />
            <Image
              src="/images/promo/logo-sigenergy.svg"
              alt="SigEnergy"
              width={143}
              height={17}
              className="h-4 w-auto"
            />
            <div className="hidden h-12 w-px bg-[#4D6960]/40 sm:block" />
            <Image
              src="/images/promo/logo-sofar.svg"
              alt="SOFAR"
              width={80}
              height={15}
              className="h-[15px] w-auto"
            />
            <div className="hidden h-12 w-px bg-[#4D6960]/40 sm:block" />
            <Image
              src="/images/promo/logo-goodwe.svg"
              alt="GoodWe"
              width={116}
              height={15}
              className="h-[15px] w-auto"
            />
          </div>
        </div>
      </div>
      <div className="relative min-h-[340px] grow bg-[linear-gradient(270deg,#B7FE1A_50%,#9ED427_100%)] lg:absolute lg:inset-y-0 lg:right-0 lg:w-[37%]">
        <Image
          src="/images/promo/complete-product.webp"
          alt=""
          width={644}
          height={611}
          className="absolute bottom-0 left-1/2 h-[300px] w-auto -translate-x-1/2 lg:bottom-[60px] lg:left-auto lg:right-5 lg:h-auto lg:w-[420px] lg:translate-x-0 xl:-left-[217px] xl:bottom-[42px] xl:right-auto xl:w-[644px]"
        />
        <PromoBadge text={t('complete.badge')} />
      </div>
    </div>
  )
}

const PromoSection = async () => {
  const t = await getTranslations('home.promo')
  return (
    <section>
      <PromoCarousel
        label={t('carouselLabel')}
        prevLabel={t('prevSlide')}
        nextLabel={t('nextSlide')}
      >
        <ReferralSlide />
        <FamilySlide />
        <CompleteSlide />
      </PromoCarousel>
    </section>
  )
}

export default PromoSection
