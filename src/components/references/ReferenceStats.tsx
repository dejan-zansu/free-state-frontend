import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/utils'
import type { AdminReference } from '@/types/admin'
import { REFERENCE_CONTAINER, formatSwissNumber } from './reference-utils'

interface Props {
  reference: AdminReference
}

const ReferenceStats = async ({ reference }: Props) => {
  const t = await getTranslations('referencePage')

  const stats: { value: string; unit?: string; caption: string }[] = []

  if (reference.installedKwp !== null) {
    stats.push({
      value: formatSwissNumber(reference.installedKwp),
      unit: 'kWp',
      caption: t('stats.installedPower'),
    })
  }
  if (reference.moduleCount !== null) {
    stats.push({
      value: formatSwissNumber(reference.moduleCount),
      caption:
        reference.moduleWattPeak !== null
          ? t('stats.modules', { wp: reference.moduleWattPeak })
          : t('stats.modulesPlain'),
    })
  }
  if (reference.batteryKwh !== null) {
    stats.push({
      value: formatSwissNumber(reference.batteryKwh),
      unit: 'kWh',
      caption: t('stats.battery'),
    })
  }
  if (reference.annualYieldKwh !== null) {
    stats.push({
      value: formatSwissNumber(reference.annualYieldKwh),
      unit: 'kWh',
      caption: t('stats.annualYield'),
    })
  }

  if (stats.length === 0) return null

  return (
    <section className="bg-white pt-16 lg:pt-24">
      <div className={REFERENCE_CONTAINER}>
        <div className="flex flex-wrap border-y border-[#E1E6E4]">
          {stats.map((stat, index) => (
            <div
              key={stat.caption}
              className={cn(
                'min-w-0 basis-1/2 border-[#EEF2F1] pb-10 lg:basis-0 lg:grow',
                index % 2 === 1 && 'border-l pl-5',
                'lg:border-l lg:pl-8',
                index === 0 && 'lg:border-l-0 lg:pl-0'
              )}
            >
              <span className="-mt-px block h-[3px] w-[30px] bg-[#B7FE1A]" />
              <p className="mt-8 text-[26px] font-bold text-[#062E25] sm:text-[34px] md:text-[40px] lg:mt-[34px] lg:text-[46px]">
                {stat.value}
                {stat.unit && (
                  <span className="ml-px text-[14px] font-normal text-[#7C918C] sm:text-[16px] lg:text-[19px]">
                    {stat.unit}
                  </span>
                )}
              </p>
              <p className="mt-4 text-[13px] leading-4 text-[#7C918C]">
                {stat.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ReferenceStats
