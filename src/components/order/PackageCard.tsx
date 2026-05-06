'use client'

import {
  Activity,
  BadgeCheck,
  BatteryCharging,
  Check,
  Cpu,
  Plug,
  Smartphone,
  SunMedium,
  Wrench,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import type { CalculatorPackage } from '@/services/residential-calculator.service'
import WarrrentyIcon from '../icons/WarrrentyIcon'
import ChceckIcon from '../icons/ChceckIcon'
import { Button } from '../ui/button'

export type SolarModelKey = 'solar-free' | 'solar-direct'

const STROMPREIS_CHF_PER_KWH = 0.18
const SWISS_AVG_YIELD_KWH_PER_KWP = 950

function brandFromCode(code: string): 'HUAWEI' | 'SIGENERGY' | null {
  if (code.toUpperCase().endsWith('_HUAWEI')) return 'HUAWEI'
  if (code.toUpperCase().endsWith('_SIGENERGY')) return 'SIGENERGY'
  return null
}

function fmtChf(n: number | null | undefined): string {
  return n != null ? n.toLocaleString('de-CH') : '—'
}

function getSystemSpecs(pkg: CalculatorPackage) {
  if (pkg.minCapacityKwp != null && pkg.maxCapacityKwp != null) {
    return {
      minKwp: pkg.minCapacityKwp,
      maxKwp: pkg.maxCapacityKwp,
      minKwh: Math.round(pkg.minCapacityKwp * SWISS_AVG_YIELD_KWH_PER_KWP),
      maxKwh: Math.round(pkg.maxCapacityKwp * SWISS_AVG_YIELD_KWH_PER_KWP),
    }
  }
  const panel = pkg.equipment.find(e => e.equipmentType === 'SOLAR_PANEL')
  const peakKwp = ((panel?.quantity ?? 0) * (panel?.panelWattageW ?? 0)) / 1000
  const annualKwh = Math.round(peakKwp * SWISS_AVG_YIELD_KWH_PER_KWP)
  return { minKwp: peakKwp, maxKwp: peakKwp, minKwh: annualKwh, maxKwh: annualKwh }
}

function fmtKwpRange(min: number, max: number): string {
  const opts = { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  return min === max
    ? min.toLocaleString('de-CH', opts)
    : `${min.toLocaleString('de-CH', opts)}–${max.toLocaleString('de-CH', opts)}`
}

function fmtKwhRange(min: number, max: number): string {
  return min === max
    ? `~${min.toLocaleString('de-CH')}`
    : `~${min.toLocaleString('de-CH')}–${max.toLocaleString('de-CH')}`
}

function getFromPriceChf(pkg: CalculatorPackage): number | null {
  if (pkg.pricePerKwp != null && pkg.minCapacityKwp != null) {
    return Math.round(pkg.pricePerKwp * pkg.minCapacityKwp)
  }
  return pkg.purchasePriceChf ?? null
}

const BRAND_LOGOS: Record<string, string> = {
  HUAWEI: '/images/packages/huawei-logo.png',
}

const EQUIPMENT_TYPE_ICONS: Record<string, typeof SunMedium> = {
  SOLAR_PANEL: SunMedium,
  INVERTER: Cpu,
  BATTERY: BatteryCharging,
  BATTERY_STORAGE: BatteryCharging,
  MOUNTING_SYSTEM: Wrench,
  ENERGY_MANAGEMENT_SYSTEM: Smartphone,
  EMS: Smartphone,
  HEAT_PUMP: Plug,
  EV_CHARGER: Plug,
}

const STATIC_EXTRAS = [
  { icon: BadgeCheck, key: 'quality' as const },
  { icon: Smartphone, key: 'app' as const },
  { icon: Wrench, key: 'service' as const },
]

export default function PackageCard(props: {
  pkg: CalculatorPackage
  model: SolarModelKey
  locale: string
  isSelected?: boolean
  isRecommended?: boolean
  onSelect?: () => void
  recommendedLabel?: string
}) {
  const t = useTranslations('packageCatalog.card')
  const router = useRouter()
  const {
    pkg,
    model,
    locale,
    isSelected,
    isRecommended,
    onSelect,
    recommendedLabel,
  } = props

  const selectorMode = typeof onSelect === 'function'
  const localePrefix = locale === 'de' ? '' : `/${locale}`
  const href = `${localePrefix}/calculator?model=${model}`
  const goOrder = () => router.push(href)

  const brand = brandFromCode(pkg.code)
  const isFree = model === 'solar-free'
  const tag = pkg.highlightedFeature ?? t('tag.specialOffer')

  const heroImage = pkg.imageUrl
  const brandLogo = brand ? BRAND_LOGOS[brand] : null
  const brandTagline = brand
    ? t(
        `details.tagline.${brand}` as `details.tagline.${'HUAWEI' | 'SIGENERGY'}`
      )
    : pkg.description

  const { minKwp, maxKwp, minKwh, maxKwh } = getSystemSpecs(pkg)
  const fromPrice = getFromPriceChf(pkg)

  return (
    <div
      className={`relative mx-auto flex h-full w-full max-w-[480px] flex-col ${
        isRecommended ? 'pt-4' : ''
      }`}
    >
      {isRecommended && (
        <span className="absolute left-1/2 top-4 z-10 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-[#036B53] px-4 py-1.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(3,107,83,0.25)]">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          {recommendedLabel ?? t('recommended')}
        </span>
      )}
      <article
        onClick={selectorMode ? onSelect : undefined}
        role={selectorMode ? 'button' : undefined}
        tabIndex={selectorMode ? 0 : undefined}
        onKeyDown={
          selectorMode
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect?.()
                }
              }
            : undefined
        }
        aria-pressed={selectorMode ? !!isSelected : undefined}
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-[24px] border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
          selectorMode
            ? 'cursor-pointer transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]'
            : ''
        } ${isSelected ? 'ring-2 ring-[#062E25]' : ''}`}
        style={{ borderColor: 'rgba(6, 46, 37, 0.18)' }}
      >
      <section className="px-6 pt-6 pb-6 bg-white">
        <div
          className={`mb-5 flex items-center gap-3 ${
            brandLogo ? 'justify-between' : 'justify-end'
          }`}
        >
          {brandLogo && (
            <Image
              src={brandLogo}
              alt={brand ?? ''}
              width={120}
              height={28}
              className="h-7 w-auto object-contain"
            />
          )}
          <SwissBadge
            line1={t('hero.swissBadgeLine1')}
            line2={t('hero.swissBadgeLine2')}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold text-[#062E25]"
            style={{
              background:
                'linear-gradient(135deg, rgba(183, 254, 26, 1) 0%, rgba(127, 177, 16, 1) 100%)',
            }}
          >
            {tag}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#036B53]">
            {t('details.label')}
          </span>
        </div>
        <h3 className="mt-3 text-2xl font-bold leading-none text-[#062E25]">
          {brand ?? pkg.name}
        </h3>
        <p className="mt-2 text-[13px] italic font-light text-[#062E25]/80">
          {brandTagline}
        </p>

        {minKwp > 0 && (
          <div
            className="mt-4 grid grid-cols-2 gap-3 rounded-[12px] border px-4 py-3"
            style={{
              borderColor: 'rgba(3, 107, 83, 0.2)',
              backgroundColor: 'rgba(242, 244, 232, 0.6)',
            }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#062E25]/60">
                {t('capacity')}
              </div>
              <div className="text-[18px] font-extrabold text-[#062E25]">
                {fmtKwpRange(minKwp, maxKwp)}{' '}
                <span className="text-[12px] font-bold">{t('kwpUnit')}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#062E25]/60">
                {t('annualProduction')}
              </div>
              <div className="text-[18px] font-extrabold text-[#062E25]">
                {fmtKwhRange(minKwh, maxKwh)}{' '}
                <span className="text-[12px] font-bold">
                  {t('kwhPerYearUnit')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_minmax(180px,210px)]">
          <ul className="space-y-3">
            {!isFree &&
              pkg.equipment
                .filter(item => item.name)
                .map(item => {
                  const Icon = EQUIPMENT_TYPE_ICONS[item.equipmentType] ?? Cpu
                  return (
                    <li
                      key={`${item.equipmentType}:${item.name}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: 'rgba(3, 107, 83, 0.1)' }}
                      >
                        <Icon className="h-4 w-4 text-[#036B53]" />
                      </span>
                      <div>
                        <div className="text-[13px] font-bold text-[#062E25]">
                          {item.quantity > 1 ? `${item.quantity}× ` : ''}
                          {item.name}
                        </div>
                      </div>
                    </li>
                  )
                })}
            {STATIC_EXTRAS.map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: 'rgba(3, 107, 83, 0.1)' }}
                >
                  <Icon className="h-4 w-4 text-[#036B53]" />
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#062E25]">
                    {t(
                      `equipment.${key}.name` as `equipment.${'quality' | 'app' | 'service'}.name`
                    )}
                  </div>
                  <div className="text-[11px] text-[#062E25]/70">
                    {t(
                      `equipment.${key}.desc` as `equipment.${'quality' | 'app' | 'service'}.desc`
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-1">
            {heroImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px]">
                <Image
                  src={heroImage}
                  alt={pkg.name}
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>
            )}

            <div
              className="rounded-[14px] border p-4"
              style={{
                borderColor: 'rgba(3, 107, 83, 0.4)',
                background:
                  'linear-gradient(180deg, rgba(242, 244, 232, 1) 66%, rgba(220, 233, 230, 1) 100%)',
              }}
            >
              <div className="flex">
                {isFree ? (
                  <>
                    <div className="w-fit min-w-[70px]">
                      <div className="text-[10px] uppercase tracking-wider text-[#062E25]/60">
                        {t('priceLabels.from')}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-[28px] font-extrabold leading-none text-[#062E25]"
                          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >
                          0
                        </span>
                        <span
                          className="text-[12px] font-bold text-[#062E25]"
                          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >
                          CHF
                        </span>
                      </div>
                      <span
                        className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold text-[#062E25]"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(183, 254, 26, 1) 0%, rgba(127, 177, 16, 1) 100%)',
                        }}
                      >
                        {t('priceLabels.solarFreePill')}
                      </span>
                    </div>
                    <div className="border-l border-[#062E25]/10 pl-2 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-[#062E25]/60">
                        {t('priceLabels.alternative')}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-[20px] font-bold leading-none text-[#062E25]"
                          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >
                          {fmtChf(fromPrice)}
                        </span>
                        <span
                          className="text-[10px] font-bold text-[#062E25]"
                          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >
                          CHF
                        </span>
                      </div>
                      <div className="mt-1 text-[9px] uppercase tracking-wider text-[#062E25]/55">
                        {t('priceLabels.exclVat')}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-[#062E25]/60">
                      {t('priceLabels.from')}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-[28px] font-extrabold leading-none text-[#062E25]"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                      >
                        {fmtChf(fromPrice)}
                      </span>
                      <span
                        className="text-[12px] font-bold text-[#062E25]"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                      >
                        CHF
                      </span>
                    </div>
                    <div className="mt-1 text-[9px] uppercase tracking-wider text-[#062E25]/55">
                      {t('priceLabels.exclVat')}
                    </div>
                  </div>
                )}
              </div>

              {isFree && (
                <div
                  className="mt-3 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-[#062E25]"
                  style={{ backgroundColor: 'rgba(183, 254, 26, 0.4)' }}
                >
                  <Zap className="h-3.5 w-3.5 text-[#036B53]" />
                  <span>
                    {t('priceLabels.electricityFrom', {
                      rate: STROMPREIS_CHF_PER_KWH.toFixed(2),
                    })}
                  </span>
                </div>
              )}

              <ul className="mt-3 space-y-1.5 text-[11px] text-[#062E25]/85">
                {([0, 1, 2, 3] as const).map(i => (
                  <li key={i} className="flex items-start gap-2">
                    <ChceckIcon />
                    <span>{t(`selling.bullets.${i}` as const)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-6">
        <div
          className="rounded-[20px] p-4"
          style={{ backgroundColor: '#F2F4E8' }}
        >
          <div className="grid grid-cols-1 divide-y divide-[#062E25]/15 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:divide-x">
            <div className="flex items-center gap-3 pb-3 sm:pb-0 sm:pr-3">
              <WarrrentyIcon className="w-8 h-8" />
              <div>
                <div className="text-[12px] font-extrabold leading-tight text-[#062E25]">
                  {t('trust.warranty.title')}
                </div>
                <div className="mt-1 text-[9px] leading-snug text-[#062E25]/65">
                  {t('trust.warranty.desc')}
                </div>
              </div>
            </div>
            <TrustItemCentered
              icon={BadgeCheck}
              title={t('trust.reliable.title')}
              desc={t('trust.reliable.desc')}
            />
            <TrustItemCentered
              icon={Activity}
              title={t('trust.efficient.title')}
              desc={t('trust.efficient.desc')}
            />
            <TrustItemCentered
              icon={SunMedium}
              title={t('trust.sustainable.title')}
              desc={t('trust.sustainable.desc')}
            />
          </div>
        </div>
      </section>

      {!selectorMode && (
        <div className="mt-auto px-6 pb-6">
          <Button
            variant="solar-gradient"
            onClick={goOrder}
            className="w-full uppercase"
          >
            {t('cta.orderFinal')}
          </Button>
        </div>
      )}
    </article>
    </div>
  )
}

function TrustItemCentered({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Check
  title: string
  desc: string
}) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <Icon className="h-5 w-5 text-[#036B53]" strokeWidth={1.8} />
      <div className="mt-1.5 text-[12px] font-extrabold text-[#062E25]">
        {title}
      </div>
      <div className="mt-1 text-[9px] leading-snug text-[#062E25]/65">
        {desc}
      </div>
    </div>
  )
}

function SwissBadge({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[10px] border border-[#062E25]/15 bg-white px-2 py-1.5">
      <span
        aria-hidden
        className="relative flex h-5 w-5 items-center justify-center rounded-[3px]"
        style={{ backgroundColor: '#D8232A' }}
      >
        <span className="absolute h-[2px] w-[10px] rounded-[1px] bg-white" />
        <span className="absolute h-[10px] w-[2px] rounded-[1px] bg-white" />
      </span>
      <span className="text-[10px] leading-tight text-[#062E25]">
        <span className="block font-medium">{line1}</span>
        <span className="block font-medium">{line2}</span>
      </span>
    </span>
  )
}
