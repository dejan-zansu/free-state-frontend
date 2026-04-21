'use client'

import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ComponentProps } from 'react'

import { Link } from '@/i18n/navigation'
import { LinkButton } from '@/components/ui/link-button'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

type Href = ComponentProps<typeof Link>['href']

type ComingSoonProps = {
  exploreHref?: Href
}

export default function ComingSoon({
  exploreHref = '/',
}: ComingSoonProps = {}) {
  const t = useTranslations('comingSoon')

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        paddingTop: '77px',
        background: PAGE_BG,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            'radial-gradient(closest-side, rgba(183, 254, 26, 0.5), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            'radial-gradient(closest-side, rgba(3, 107, 83, 0.35), transparent 70%)',
        }}
      />

      <div className="relative z-10 px-6 sm:px-10 pt-6">
        <Link
          href={exploreHref}
          className="inline-flex items-center gap-1.5 text-sm text-[#062E25]/70 hover:text-[#062E25] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('back')}
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
        <div className="max-w-[720px] w-full text-center sm:text-left">
          <span className="inline-flex items-center rounded-full bg-[#B7FE1A] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#062E25]">
            {t('eyebrow')}
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#062E25] leading-[1.05]">
            {t('title')}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#062E25]/70 max-w-xl mx-auto sm:mx-0 leading-relaxed">
            {t('description')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
            <LinkButton variant="primary" href="/contact" className="w-full sm:w-auto">
              {t('contactCta')}
            </LinkButton>
            <LinkButton
              variant="outline-primary"
              href={exploreHref}
              className="w-full sm:w-auto"
            >
              {t('exploreCta')}
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}
