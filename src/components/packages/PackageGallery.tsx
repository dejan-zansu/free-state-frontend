'use client'

import { ArrowDown, BatteryCharging, Box, Cpu, Plug, Smartphone, SunMedium, Wrench } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import ModelViewer from '@/components/products/ModelViewer'
import { cn } from '@/lib/utils'

import { componentAnchor, type PackageComponentView } from './types'

export const TYPE_ICONS: Record<string, typeof SunMedium> = {
  SOLAR_PANEL: SunMedium,
  INVERTER: Cpu,
  BATTERY: BatteryCharging,
  MOUNTING_SYSTEM: Wrench,
  ENERGY_MANAGEMENT_SYSTEM: Smartphone,
  EV_CHARGER: Plug,
}

const CATEGORY_KEYS: Record<string, 'PANEL' | 'INVERTER' | 'BATTERY' | 'MOUNTING' | 'EMS'> = {
  SOLAR_PANEL: 'PANEL',
  INVERTER: 'INVERTER',
  BATTERY: 'BATTERY',
  MOUNTING_SYSTEM: 'MOUNTING',
  ENERGY_MANAGEMENT_SYSTEM: 'EMS',
}

export function useCategoryLabel() {
  const tCat = useTranslations('solarAboCalculator.results.equipmentCard.category')
  const t = useTranslations('packagePage.components')
  return (equipmentType: string) => {
    const key = CATEGORY_KEYS[equipmentType]
    return key ? tCat(key) : t('evCharger')
  }
}

/**
 * Product gallery of a package, laid out like a shop detail page: the components as small
 * images on the left, the selected one as a slowly rotating 3D model on the right.
 */
export default function PackageGallery({ components }: { components: PackageComponentView[] }) {
  const t = useTranslations('packagePage.gallery')
  const categoryLabel = useCategoryLabel()
  const [index, setIndex] = useState(0)
  const selected = components[Math.min(index, components.length - 1)]
  if (!selected) return null
  const title = selected.spec?.displayName ?? selected.name
  const Icon = TYPE_ICONS[selected.equipmentType] ?? Cpu

  return (
    <div>
      <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
        <ul
          aria-label={t('thumbnails')}
          className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:max-h-[560px] lg:w-[88px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {components.map((c, i) => {
            const thumb = c.modelPosterUrl ?? c.imageUrl
            const ThumbIcon = TYPE_ICONS[c.equipmentType] ?? Cpu
            const active = i === index
            return (
              <li key={c.key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={active}
                  title={c.spec?.displayName ?? c.name}
                  className={cn(
                    'relative block h-20 w-20 overflow-hidden rounded-[14px] border-2 bg-[#F5F6F0] transition lg:h-[88px] lg:w-[88px]',
                    active ? 'border-pine' : 'border-transparent hover:border-pine/30'
                  )}
                >
                  {thumb ? (
                    <Image src={thumb} alt="" fill sizes="88px" className="object-contain p-2" />
                  ) : (
                    <ThumbIcon className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-pine/30" aria-hidden />
                  )}
                  {c.modelUrl && (
                    <span className="absolute bottom-1 right-1 flex h-5 items-center gap-0.5 rounded-full bg-white/90 px-1.5 text-[11px] font-semibold text-pine">
                      <Box className="h-3 w-3" aria-hidden />
                      3D
                    </span>
                  )}
                  <span className="sr-only">{c.spec?.displayName ?? c.name}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="min-w-0 flex-1">
          {selected.modelUrl ? (
            <ModelViewer
              key={selected.key}
              src={selected.modelUrl}
              poster={selected.modelPosterUrl}
              alt={title}
              orbit={selected.orbit}
              fieldOfView={selected.fieldOfView}
              className="aspect-square w-full sm:aspect-[4/3] lg:aspect-auto lg:h-[560px]"
            />
          ) : (
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[24px] border border-pine/10 bg-[#F5F6F0] sm:aspect-[4/3] lg:aspect-auto lg:h-[560px]">
              {selected.imageUrl ? (
                <Image src={selected.imageUrl} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-10" />
              ) : (
                <Icon className="h-14 w-14 text-pine/25" aria-hidden />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 lg:pl-[104px]">
        <p className="flex min-w-0 items-center gap-2 text-base text-pine">
          <Icon className="h-4 w-4 shrink-0 text-teal-deep" aria-hidden />
          <span className="text-pine/60">{categoryLabel(selected.equipmentType)}</span>
          <span className="truncate font-medium">
            {selected.quantity > 1 ? `${selected.quantity} x ` : ''}
            {title}
          </span>
          {selected.isOptional && <span className="rounded-full bg-sage px-2 py-0.5 text-sm text-pine/70 sm:text-base">{t('optional')}</span>}
        </p>
        <a href={`#${componentAnchor(selected.key)}`} className="inline-flex items-center gap-1 text-base font-medium text-teal-deep hover:underline">
          {t('toDetails')}
          <ArrowDown className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  )
}
