'use client'

import { Box } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import ModelViewer from '@/components/products/ModelViewer'
import { Link } from '@/i18n/navigation'
import { cameraFor, slugForProduct } from '@/lib/products/catalog'
import type { CalculatorPackage } from '@/services/residential-calculator.service'

export type PackageComponent = CalculatorPackage['equipment'][number]

interface Props {
  component: PackageComponent | null
  /** Every component of the package that has a model, for the thumbnail switcher under the stage. */
  components?: PackageComponent[]
  onSelect?: (component: PackageComponent) => void
  /** Load the 3D model straight away instead of waiting for a tap on the poster. */
  eager?: boolean
}

/**
 * The media slot of a package card. Shows the poster of the selected component and turns
 * into a live 3D viewer once the visitor taps it, so a page with twelve cards does not
 * start twelve WebGL loads on its own.
 */
export default function PackageModelStage({ component, components = [], onSelect, eager = false }: Props) {
  const t = useTranslations('packageCatalog.card.models')
  if (!component?.modelUrl) return null

  const slug = slugForProduct({
    nameEn: component.nameEn ?? component.name,
    manufacturerCode: '',
    modelNumber: component.name,
  } as Parameters<typeof slugForProduct>[0])
  const camera = cameraFor(slug)

  return (
    <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
      <ModelViewer
        key={component.modelUrl}
        src={component.modelUrl}
        poster={component.modelPosterUrl ?? null}
        alt={component.name}
        orbit={camera.orbit}
        fieldOfView={camera.fieldOfView}
        reveal={eager ? 'auto' : 'manual'}
        controls={false}
        className="aspect-square w-full rounded-[12px] bg-[#F5F6F0]"
      />
      {components.length > 1 && onSelect && (
        <ul className="flex flex-wrap gap-1.5" aria-label={t('title')}>
          {components.map(item => {
            const active = item.equipmentType === component.equipmentType && item.name === component.name
            return (
              <li key={`${item.equipmentType}:${item.name}`}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-pressed={active}
                  title={item.name}
                  className={`relative block h-10 w-10 overflow-hidden rounded-[8px] border bg-[#F5F6F0] transition ${
                    active ? 'border-[#062E25]' : 'border-transparent hover:border-[#062E25]/40'
                  }`}
                >
                  <ComponentThumb component={item} className="absolute inset-0 block" />
                  <span className="sr-only">{item.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <Link
        href={{ pathname: '/products', query: { p: slug } }}
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#036B53] hover:underline"
      >
        <Box className="h-3.5 w-3.5" aria-hidden />
        {t('viewAll')}
      </Link>
    </div>
  )
}

export function ComponentThumb({ component, className }: { component: PackageComponent; className?: string }) {
  const src = component.modelPosterUrl ?? component.imageUrl
  if (!src) return null
  return (
    <span className={className}>
      <Image src={src} alt="" fill sizes="40px" className="object-contain p-0.5" />
    </span>
  )
}
