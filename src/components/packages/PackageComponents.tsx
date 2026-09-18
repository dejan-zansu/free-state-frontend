'use client'

import { ArrowRight, BatteryCharging, Cpu, Plug, Smartphone, SunMedium, Wrench } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'

import ModelViewer from '@/components/products/ModelViewer'
import { Link } from '@/i18n/navigation'
import { cameraFor, type ProductSpec } from '@/lib/products/catalog'
import type { PublicEvCharger } from '@/services/residential-calculator.service'

export interface PackageComponentView {
  key: string
  equipmentType: string
  name: string
  quantity: number
  isOptional: boolean
  imageUrl: string | null
  modelUrl: string | null
  modelPosterUrl: string | null
  slug: string | null
  spec: ProductSpec | null
}

const TYPE_ICONS: Record<string, typeof SunMedium> = {
  SOLAR_PANEL: SunMedium,
  INVERTER: Cpu,
  BATTERY: BatteryCharging,
  MOUNTING_SYSTEM: Wrench,
  ENERGY_MANAGEMENT_SYSTEM: Smartphone,
  EV_CHARGER: Plug,
}

interface Props {
  components: PackageComponentView[]
  charger: (PublicEvCharger & { slug: string | null; spec: ProductSpec | null }) | null
}

function ComponentCard({ c, index }: { c: PackageComponentView; index: number }) {
  const t = useTranslations('packagePage.components')
  const tCat = useTranslations('solarAboCalculator.results.equipmentCard.category')
  const Icon = TYPE_ICONS[c.equipmentType] ?? Cpu
  const camera = c.slug ? cameraFor(c.slug) : { orbit: '-30deg 78deg auto', fieldOfView: '24deg' }
  const catKey =
    c.equipmentType === 'SOLAR_PANEL' ? 'PANEL' : c.equipmentType === 'ENERGY_MANAGEMENT_SYSTEM' ? 'EMS' : c.equipmentType === 'MOUNTING_SYSTEM' ? 'MOUNTING' : c.equipmentType
  const category = ['PANEL', 'INVERTER', 'BATTERY', 'MOUNTING', 'EMS', 'HEAT_PUMP'].includes(catKey) ? tCat(catKey as 'PANEL') : t('evCharger')
  const title = c.spec?.displayName ?? c.name

  return (
    <article className="grid overflow-hidden rounded-[24px] border border-pine/10 bg-white md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="p-3">
        {c.modelUrl ? (
          <ModelViewer
            src={c.modelUrl}
            poster={c.modelPosterUrl}
            alt={title}
            orbit={camera.orbit}
            fieldOfView={camera.fieldOfView}
            reveal={index === 0 ? 'auto' : 'manual'}
            className="aspect-square w-full"
          />
        ) : (
          <div className="relative flex aspect-square w-full items-center justify-center rounded-[20px] bg-[#F5F6F0]">
            {c.imageUrl ? (
              <Image src={c.imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-contain p-8" />
            ) : (
              <Icon className="h-12 w-12 text-pine/25" aria-hidden />
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <p className="flex items-center gap-2 text-base font-semibold uppercase tracking-[0.08em] text-pine/60">
          <Icon className="h-4 w-4 text-teal-deep" aria-hidden />
          {category}
          {c.isOptional && <span className="rounded-full bg-sage px-2 py-0.5 text-sm normal-case tracking-normal text-pine/70 sm:text-base">{t('optional')}</span>}
        </p>
        <h3 className="mt-2 text-2xl font-medium leading-tight tracking-tight text-pine">
          {c.quantity > 1 ? `${c.quantity} x ` : ''}
          {title}
        </h3>
        {c.spec?.summary && <p className="mt-3 line-clamp-4 text-base leading-relaxed text-pine/80">{c.spec.summary}</p>}
        {c.spec && c.spec.keyFacts.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 gap-2.5">
            {c.spec.keyFacts.map((f) => (
              <div key={f.key} className="rounded-[14px] bg-[#F5F6F0] px-3.5 py-3">
                <dt className="text-sm leading-snug text-pine/60 sm:text-base">{f.label}</dt>
                <dd className="mt-1 text-base font-semibold leading-snug text-pine tabular-nums">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {c.slug && (
          <Link
            href={{ pathname: '/products', query: { p: c.slug } }}
            className="mt-auto inline-flex items-center gap-1.5 pt-6 text-base font-medium text-teal-deep hover:underline"
          >
            {t('allSpecs')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  )
}

export default function PackageComponents({ components, charger }: Props) {
  const t = useTranslations('packagePage.components')
  const locale = useLocale()
  const chargerView: PackageComponentView | null = charger
    ? {
        key: `EV_CHARGER:${charger.id}`,
        equipmentType: 'EV_CHARGER',
        name: charger.displayName,
        quantity: 1,
        isOptional: true,
        imageUrl: charger.imageUrl ?? null,
        modelUrl: charger.modelUrl ?? null,
        modelPosterUrl: charger.modelPosterUrl ?? null,
        slug: charger.slug,
        spec: charger.spec,
      }
    : null
  const all = chargerView ? [...components, chargerView] : components
  const priceFmt = new Intl.NumberFormat(locale === 'en' ? 'de-CH' : `${locale}-CH`)

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-[1290px] px-4 py-14 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-medium tracking-tight text-pine sm:text-[40px]">{t('title')}</h2>
          <p className="mt-3 text-base text-pine/70 sm:text-xl">{t('subtitle', { count: all.length })}</p>
        </div>
        <div className="mt-10 flex flex-col gap-6">
          {all.map((c, i) => (
            <ComponentCard key={c.key} c={c} index={i} />
          ))}
        </div>
        {charger && charger.priceChf != null && (
          <p className="mt-4 text-base text-pine/65">{t('chargerNote', { price: priceFmt.format(charger.priceChf) })}</p>
        )}
      </div>
    </section>
  )
}
