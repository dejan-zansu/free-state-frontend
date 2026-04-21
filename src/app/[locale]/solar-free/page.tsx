import {
  QuoteRequestForm,
  SolarAboCTA,
  SolarAboDetails,
  SolarAboFAQ,
  SolarAboHero,
} from '@/components/solar-abo'
import YourBenefits from '@/components/YourBenefits'
import SolarModels from '@/components/SolarModels'
import CustomerStories from '@/components/CustomerStories'

interface SolarFreePageProps {
  params: Promise<{ locale: string }>
}

const SolarFreePage = async ({ params }: SolarFreePageProps) => {
  const { locale } = await params

  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarFreeHome"
        imageSrc="/images/solar-abo-home.png"
        imageAlt="SolarAbo Home"
        ctaVariant="solar-dark"
        statIconBgClassName="bg-[#036B53]"
        statIconClassName="text-white"
      />
      <YourBenefits isCommercial={false} />
      <SolarAboDetails translationNamespace="solarAboHome" />
      <QuoteRequestForm source="SOLAR_FREE" locale={locale} />
      <SolarModels />
      <CustomerStories />
      <SolarAboFAQ translationNamespace="solarAboHome" />
      <SolarAboCTA translationNamespace="solarAboHome" />
    </div>
  )
}

export default SolarFreePage
