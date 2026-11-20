'use client'

import {
  ArrowRight,
  BatteryCharging,
  Cpu,
  Plug,
  Smartphone,
  SunMedium,
  Wrench,
} from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Link } from '@/i18n/navigation'
import { getFromPriceChf, getSystemSpecs } from '@/lib/products/package-math'
import {
  packageBrand,
  packageStorageLabel,
  type PackageGroup,
} from '@/lib/products/package-groups'
import { packageNameToSlug } from '@/lib/products/package-slug'
import { calculatorHref, type SolarModelKey } from '@/lib/solar-models'
import { cn } from '@/lib/utils'
import { LinkButton } from '../ui/link-button'

export type { SolarModelKey }
export { getFromPriceChf }

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

function formatNumber(value: number): string {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 1 })
}

function formatRange(min: number, max: number): string {
  return min === max
    ? formatNumber(min)
    : `${formatNumber(min)}–${formatNumber(max)}`
}

export default function PackageCard({
  group,
  model,
}: {
  group: PackageGroup
  model: SolarModelKey
}) {
  const t = useTranslations('packageCatalog.catalogCard')
  const tCard = useTranslations('packageCatalog.card')
  const [variantIndex, setVariantIndex] = useState(0)

  const pkg = group.variants[variantIndex] ?? group.variants[0]
  const isFree = model === 'solar-free'
  const { minKwp, maxKwp, minKwh, maxKwh } = getSystemSpecs(pkg)
  const fromPrice = getFromPriceChf(pkg)
  const storage = packageStorageLabel(pkg.description)
  const brands = group.variants.map(
    variant => packageBrand(variant.code) ?? variant.name
  )
  const equipment = isFree ? [] : pkg.equipment.filter(item => item.name)

  const specs = [
    minKwp > 0 && {
      label: tCard('capacity'),
      value: `${formatRange(minKwp, maxKwp)} ${tCard('kwpUnit')}`,
    },
    minKwh > 0 && {
      label: tCard('annualProduction'),
      value: `~${formatRange(minKwh, maxKwh)} kWh`,
    },
    storage && { label: t('storage'), value: storage },
  ].filter(Boolean) as { label: string; value: string }[]

  const price =
    model === 'solar-free'
      ? {
          label: t('price.free.label'),
          value: t('price.free.value'),
          note: t('price.free.note', {
            percent: pkg.electricitySavingsPercent,
          }),
        }
      : model === 'solar-abo'
        ? {
            label: t('price.abo.label'),
            value: t('price.abo.value'),
            note: t('price.abo.note'),
          }
        : {
            label: t('price.direct.label'),
            value:
              fromPrice != null
                ? t('price.direct.value', {
                    price: fromPrice.toLocaleString('de-CH'),
                  })
                : '-',
            note: t('price.direct.note'),
          }

  return (
    <article className="relative flex h-full flex-col rounded-[24px] border border-[#062E25]/15 bg-white p-6 text-[#062E25] shadow-[0_8px_24px_rgba(6,46,37,0.06)]">
      {pkg.highlightedFeature && (
        <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-solar px-3 py-1 text-sm font-medium text-[#062E25]">
          {pkg.highlightedFeature}
        </span>
      )}
      <header className="flex items-center md:min-h-[5rem]">
        <div className="flex items-center gap-3">
          {group.size && (
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#062E25] text-lg font-medium text-solar"
            >
              {group.size}
            </span>
          )}
          <div>
            {group.size && (
              <p className="text-sm text-[#062E25]/60">
                {t('sizeLabel', { size: group.size })}
              </p>
            )}
            <h3 className="text-xl font-medium tracking-tight">
              {group.size ? t(`fit.${group.size}`) : pkg.name}
            </h3>
          </div>
        </div>
      </header>

      {pkg.imageUrl && (
        <div className="relative mt-4 h-[150px] w-full overflow-hidden rounded-[16px] bg-[#F2F4E8]">
          <Image
            src={pkg.imageUrl}
            alt={pkg.name}
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 45vw, 90vw"
            className="object-contain p-3 mix-blend-multiply"
          />
        </div>
      )}

      {specs.length > 0 && (
        <dl className="mt-5 flex flex-col">
          {specs.map(spec => (
            <div
              key={spec.label}
              className="flex items-baseline justify-between gap-3 border-b border-[#062E25]/10 py-2.5"
            >
              <dt className="text-sm text-[#062E25]/65">{spec.label}</dt>
              <dd className="text-right text-base font-medium tabular-nums">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {group.variants.length > 1 && (
        <div className="mt-5">
          <p className="text-sm text-[#062E25]/65">{t('brand')}</p>
          <div
            role="group"
            aria-label={t('brand')}
            className="mt-2 flex flex-wrap gap-2"
          >
            {brands.map((brand, index) => (
              <button
                key={group.variants[index].id}
                type="button"
                aria-pressed={index === variantIndex}
                onClick={() => setVariantIndex(index)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  index === variantIndex
                    ? 'border-[#062E25] bg-[#062E25] text-white'
                    : 'border-[#062E25]/25 text-[#062E25] hover:border-[#062E25]'
                )}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {equipment.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2.5">
          {equipment.map(item => {
            const Icon = EQUIPMENT_TYPE_ICONS[item.equipmentType] ?? Cpu
            return (
              <li
                key={`${item.equipmentType}:${item.name}`}
                className="flex items-start gap-2.5 text-sm"
              >
                <Icon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-[#036B53]"
                />
                <span>
                  {item.quantity > 1 ? `${item.quantity}× ` : ''}
                  {item.name}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-auto pt-6">
        <div className="rounded-[16px] bg-[#F2F4E8] p-4">
          <p className="text-sm text-[#062E25]/65">{price.label}</p>
          <p className="mt-0.5 text-[28px] font-medium tracking-tight tabular-nums">
            {price.value}
          </p>
          <p className="mt-1 text-sm text-[#062E25]/80">{price.note}</p>
        </div>

        <LinkButton
          href={calculatorHref(model, pkg.code)}
          variant="tertiary"
          className="mt-4 w-full"
        >
          {t('calculate')}
        </LinkButton>

        {!isFree && (
          <Link
            href={{
              pathname: '/packages/[code]',
              params: { code: packageNameToSlug(pkg.name) },
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-[#036B53] underline-offset-4 hover:underline"
          >
            {t('details')}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        )}
      </div>
    </article>
  )
}
