'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { ProductSpec } from '@/lib/products/catalog'
import { cn } from '@/lib/utils'

const COLLAPSED_ROWS = 6

function SpecGroupCard({ group }: { group: ProductSpec['groups'][number] }) {
  const t = useTranslations('products.specs')
  const [open, setOpen] = useState(false)
  const rows = open ? group.rows : group.rows.slice(0, COLLAPSED_ROWS)
  const hidden = group.rows.length - COLLAPSED_ROWS

  return (
    <section className="mb-4 break-inside-avoid rounded-[20px] border border-pine/10 bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-pine/60">{group.label}</h3>
      <dl className="mt-3 divide-y divide-pine/8">
        {rows.map((row) => {
          // Short values sit on the label's line, long free text drops under it
          const long = row.value.length > 34
          return (
            <div
              key={row.key}
              className={cn('py-2.5', long ? 'flex flex-col gap-1' : 'grid grid-cols-[1fr_auto] items-baseline gap-4')}
            >
              <dt className="text-base text-pine/75">{row.label}</dt>
              <dd className={cn('text-base font-medium text-pine tabular-nums', long ? 'text-left leading-snug' : 'text-right')}>
                {row.value}
              </dd>
            </div>
          )
        })}
      </dl>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-base font-medium text-teal-deep hover:underline"
          aria-expanded={open}
        >
          {open ? t('showLess') : t('showMore', { count: hidden })}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      )}
    </section>
  )
}

export default function ProductSpecTable({ spec }: { spec: ProductSpec }) {
  const t = useTranslations('products.specs')

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-pine sm:text-[32px]">{t('title')}</h2>
          <p className="mt-1 text-base text-pine/70">{t('subtitle', { name: spec.displayName })}</p>
        </div>
        {spec.datasheetUrl && (
          <a
            href={spec.datasheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-teal-deep underline-offset-4 hover:underline"
          >
            {t('datasheet')}
          </a>
        )}
      </div>
      <div className="gap-4 md:columns-2 xl:columns-3">
        {spec.groups.map((group) => (
          <SpecGroupCard key={group.key} group={group} />
        ))}
      </div>
      {spec.certifications.length > 0 && (
        <p className="mt-6 text-base text-pine/70">
          <span className="font-medium text-pine">{t('certifications')} </span>
          {spec.certifications.join(', ')}
        </p>
      )}
      <p className="mt-3 text-sm text-pine/55 sm:text-base">{t('source')}</p>
    </div>
  )
}
