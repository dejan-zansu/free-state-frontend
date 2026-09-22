import ContactPerson from '@/components/ContactPerson'
import HowPV from '@/components/HowPV'
import SolarAboMultiFamilyHowItWorks from '@/components/SolarAboMultiFamilyHowItWorks'
import SolarAboMultiFamilyPublicSpaces from '@/components/SolarAboMultiFamilyPublicSpaces'
import {
  FullWidthVideo,
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
} from '@/components/solar-abo'
import { Link } from '@/i18n/navigation'
import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/commercial/solar-free/solar-free-multi-family',
    title: t('commercialSolarFreeMultiFamily.title') || '',
    description: t('commercialSolarFreeMultiFamily.description') || '',
  })
}

const SolarAboMultiFamilyPage = () => {
  const t = useTranslations('solarAboMulti')
  const items = [
    {
      image: '/images/illustrations/solar-modules-commercial.png',
      title: t('includes.items.solarModules.title'),
      subtitle: t('includes.items.solarModules.subtitle'),
    },
    {
      image: '/images/illustrations/inverter-commercial.png',
      title: t('includes.items.inverter.title'),
      subtitle: t('includes.items.inverter.subtitle'),
    },
    {
      image: '/images/illustrations/billing-platform.png',
      title: t('includes.items.zevBillingPlatform.title'),
      subtitle: t('includes.items.zevBillingPlatform.subtitle'),
    },
    {
      image: '/images/illustrations/monitoring-app-commercial.png',
      title: t('includes.items.monitoringApp.title'),
      subtitle: t('includes.items.monitoringApp.subtitle'),
    },
    {
      image: '/images/illustrations/installation-commercial.png',
      title: t('includes.items.installation.title'),
      subtitle: t('includes.items.installation.subtitle'),
    },
    {
      image: '/images/illustrations/battery-storage-commercial.png',
      title: t('includes.items.batteryStorage.title'),
      subtitle: t('includes.items.batteryStorage.subtitle'),
    },
  ]
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboMulti"
        imageSrc="/images/solar-abo-multi.png"
        imageAlt="SolarAbo Multi"
        isCommercial
      />
      <FullWidthVideo src="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/videos/FreeState%20-%20Multi.mp4" />
      <SolarAboIncludes
        translationNamespace="solarAboMulti"
        items={items}
        isCommercial
      />
      <section className="bg-[#EAEDDF] px-4 py-14 text-[#062E25] sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 rounded-[24px] border border-[#062E25]/10 bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {t('communitiesLink.title')}
            </h2>
            <p className="mt-2 max-w-2xl text-base text-[#062E25]/80">
              {t('communitiesLink.text')}
            </p>
          </div>
          <Link
            href="/ratgeber/energiegemeinschaften"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#062E25] px-5 py-2.5 text-base font-medium text-white hover:bg-[#062E25]/90"
          >
            {t('communitiesLink.cta')}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
      <HowPV
        translationNamespace="solarAboMulti"
        row1Image="/images/solar-free/multi-family-how-pv-1-5c41b2.webp"
        row2Image="/images/solar-free/multi-family-how-pv-2-71b467.webp"
      />
      <SolarAboMultiFamilyHowItWorks />
      <SolarAboMultiFamilyPublicSpaces />
      <ContactPerson />

      <SolarAboCTA translationNamespace="solarAboMulti" commercial />
    </div>
  )
}

export default SolarAboMultiFamilyPage
