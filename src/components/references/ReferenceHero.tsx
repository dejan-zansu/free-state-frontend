import { getTranslations } from 'next-intl/server'
import { Building2, Calendar, MapPin, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { AdminReference, AdminReferenceTranslation } from '@/types/admin'
import { REFERENCE_CONTAINER } from './reference-utils'

interface Props {
  reference: AdminReference
  translation: AdminReferenceTranslation
  hasGallery: boolean
}

const ReferenceHero = async ({ reference, translation, hasGallery }: Props) => {
  const t = await getTranslations('referencePage')

  const metaCells: { icon: LucideIcon; label: string; value: string }[] = []
  if (reference.location) {
    metaCells.push({
      icon: MapPin,
      label: t('meta.location'),
      value: reference.location,
    })
  }
  if (reference.year) {
    metaCells.push({
      icon: Calendar,
      label: t('meta.year'),
      value: String(reference.year),
    })
  }
  if (reference.clientName) {
    metaCells.push({
      icon: Building2,
      label: t('meta.client'),
      value: reference.clientName,
    })
  }
  if (reference.contactPerson) {
    metaCells.push({
      icon: User,
      label: t('meta.contact'),
      value: reference.contactPerson,
    })
  }

  return (
    <section
      className={cn(
        'bg-[#F3FFDD] pb-12 pt-[104px] md:pt-[128px]',
        hasGallery && metaCells.length > 0 && 'lg:pb-[158px]',
        hasGallery && metaCells.length === 0 && 'lg:pb-[206px]',
        !hasGallery && 'lg:pb-16'
      )}
    >
      <div className={REFERENCE_CONTAINER}>
        <nav
          aria-label={t('breadcrumbRoot')}
          className="flex flex-wrap items-center gap-2 text-[13px]"
        >
          <Link
            href="/portfolio"
            className="text-[#7C918C] transition-colors hover:text-[#062E25]"
          >
            {t('breadcrumbRoot')}
          </Link>
          <span className="text-[#7C918C]" aria-hidden="true">
            ›
          </span>
          <span className="font-bold text-[#062E25]">{translation.title}</span>
        </nav>

        <div className="mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <h1 className="text-[36px] font-bold leading-[1.05] tracking-[-0.01em] text-[#062E25] sm:text-[46px] lg:text-[62px]">
            <span className="block">{translation.title}</span>
            {translation.subtitle && (
              <span className="block">{translation.subtitle}</span>
            )}
          </h1>

          <span className="inline-flex h-[34px] shrink-0 items-center gap-2 self-start rounded-full border border-[#062E25]/15 px-4 lg:self-auto">
            <span className="h-[7px] w-[7px] rounded-full bg-[#B7FE1A]" />
            <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#062E25]">
              {t(`categories.${reference.category}`)}
            </span>
          </span>
        </div>

        {metaCells.length > 0 && (
          <div className="mt-12 flex flex-wrap border-t border-[#D3E2C3] lg:mt-[52px]">
            {metaCells.map((cell, index) => {
              const Icon = cell.icon
              return (
                <div
                  key={cell.label}
                  className={cn(
                    'min-w-0 basis-1/2 border-[#D3E2C3] pb-8 pt-[22px] lg:basis-0 lg:grow',
                    index % 2 === 1 && 'border-l pl-5',
                    'lg:border-l lg:pl-8',
                    index === 0 && 'lg:border-l-0 lg:pl-0'
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[#7C918C]">
                    <Icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em]">
                      {cell.label}
                    </span>
                  </div>
                  <p className="mt-3.5 text-[17px] font-bold text-[#062E25] lg:text-[19px]">
                    {cell.value}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default ReferenceHero
