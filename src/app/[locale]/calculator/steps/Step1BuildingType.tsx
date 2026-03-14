'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useSolarAboCalculatorStore, type BuildingType } from '@/stores/solar-abo-calculator.store'

const packages: {
  type: BuildingType
  titleKey: string
  descKey: string
  image: string
  imageWidth: number
  imageHeight: number
}[] = [
  {
    type: 'single_family',
    titleKey: 'home.title',
    descKey: 'home.description',
    image: '/images/calculator/package-home-1d3295.png',
    imageWidth: 215,
    imageHeight: 156,
  },
  {
    type: 'apartment',
    titleKey: 'multi.title',
    descKey: 'multi.description',
    image: '/images/calculator/package-multi-28f430.png',
    imageWidth: 233,
    imageHeight: 186,
  },
]

export default function Step1BuildingType() {
  const t = useTranslations('solarAboCalculator.step1Packages')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { solarModel, setBuildingType, nextStep, setSolarModel, setShowMultiInterstitial } = useSolarAboCalculatorStore()

  const modelLabel = solarModel === 'solar-direct' ? 'SolarDirect' : 'SolarAbo'

  const handleSelect = (type: BuildingType) => {
    setBuildingType(type)
    if (type === 'apartment') {
      setShowMultiInterstitial(true)
    } else {
      nextStep()
    }
  }

  const handleBack = () => {
    setSolarModel(null)
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
            {t('title', { model: modelLabel })}
          </h1>
          <p className="mt-5 text-lg sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-[830px] items-stretch pt-14">
          {packages.map((pkg) => (
            <button
              key={pkg.type}
              type="button"
              onClick={() => handleSelect(pkg.type)}
              className="group relative flex-1 overflow-visible rounded-[11px] border border-[#546963]/50 text-left transition-all hover:border-[#062E25] hover:shadow-lg"
              style={{
                backgroundColor: pkg.type === 'single_family' ? '#F5F7EE' : '#EEEFE5',
                height: '136px',
              }}
            >
              {pkg.type === 'single_family' && (
                <div
                  className="absolute -top-[50px] right-0 w-[237px] h-[237px] rounded-full pointer-events-none"
                  style={{ background: 'rgba(183, 254, 26, 0.2)', filter: 'blur(161px)' }}
                />
              )}

              <div className="absolute left-[18px] top-[30px] z-10 w-[40%]">
                <h2 className="text-[22px] font-medium text-[#062E25]">
                  {t(pkg.titleKey, { model: modelLabel })}
                </h2>
                <p className="mt-2.5 text-xs font-light text-[#062E25]/80 tracking-tight">
                  {t(pkg.descKey)}
                </p>
              </div>

              <div
                className="absolute right-0 bottom-0 z-0 pointer-events-none"
                style={{
                  width: `${pkg.imageWidth}px`,
                  height: pkg.type === 'single_family' ? '180px' : '220px',
                }}
              >
                <Image
                  src={pkg.image}
                  alt={t(pkg.titleKey, { model: modelLabel })}
                  fill
                  className="object-cover object-bottom"
                />
              </div>

            </button>
          ))}
        </div>

        <p className="mt-5 text-xs font-light text-[#062E25]/60 tracking-tight">
          {t('learnMore', { model: modelLabel })}
        </p>

        <div className="fixed bottom-6 right-6 z-50 flex gap-3">
          <Button
            variant="outline"
            className="rounded-full border-[#062E25] text-[#062E25] px-6"
            onClick={handleBack}
          >
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
