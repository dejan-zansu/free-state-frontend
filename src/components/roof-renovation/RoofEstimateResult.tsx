'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { ArrowButton } from '@/components/ui/arrow-button'
import { LearnMoreLink } from '@/components/ui/learn-more-link'
import { LinkButton } from '@/components/ui/link-button'

import {
  formatChf,
  formatDecimal,
  type RoofEstimateOk,
  type RoofSubsidy,
} from './roof-renovation-api'

const COMMERCIAL_SEGMENTS = ['multi_family', 'hall', 'commercial']

interface RoofEstimateResultProps {
  estimate: RoofEstimateOk
  onRequest: () => void
  showRequestButton: boolean
}

const Note = ({ title, children }: { title?: string; children: ReactNode }) => (
  <div className="rounded-2xl bg-[#EAEDDF] p-5">
    {title && <p className="text-base font-medium">{title}</p>}
    <div className={title ? 'mt-1 text-base' : 'text-base'}>{children}</div>
  </div>
)

const SubsidyBlock = ({ subsidy }: { subsidy: RoofSubsidy }) => {
  const t = useTranslations('roofRenovation.estimator.result.subsidy')
  const low = subsidy.chfLow ?? 0
  const high = subsidy.chfHigh ?? 0

  let body: string
  if (subsidy.status === 'not_checked') {
    body = t('notChecked')
  } else if (subsidy.status === 'not_eligible') {
    body = t('notEligible')
  } else if (subsidy.rateChfPerM2 != null && subsidy.chfHigh == null) {
    body = t('rate', { rate: formatChf(subsidy.rateChfPerM2) })
  } else if (high <= 0) {
    body = t('belowMinimum')
  } else if (low <= 0) {
    body = t('upTo', { high: formatChf(high) })
  } else {
    body = t('range', { low: formatChf(low), high: formatChf(high) })
  }

  return (
    <Note title={t('title')}>
      <p className="text-base">{body}</p>
      {subsidy.status === 'estimated' && (
        <>
          <p className="mt-3 text-base">{t('conditionsTitle')}</p>
          <ul className="mt-1 list-disc pl-5">
            {subsidy.conditions.map(condition => (
              <li key={condition} className="text-base">
                {t(`conditions.${condition}`)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-base">{t('notSubtracted')}</p>
        </>
      )}
    </Note>
  )
}

export default function RoofEstimateResult({
  estimate,
  onRequest,
  showRequestButton,
}: RoofEstimateResultProps) {
  const t = useTranslations('roofRenovation.estimator.result')
  const locale = useLocale()
  const {
    display,
    price,
    marketReference,
    reason,
    subsidy,
    existingPv,
    pvPotential,
  } = estimate
  const calculatorHref = COMMERCIAL_SEGMENTS.includes(estimate.building.segment)
    ? '/commercial/calculator'
    : '/calculator'

  return (
    <div className="flex flex-col gap-5">
      {display === 'market_reference' && marketReference && (
        <div className="rounded-[24px] bg-[#062E25] p-6 text-white sm:p-8">
          <p className="text-base font-medium text-white/85">
            {t('marketReference.heading')}
          </p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.02em] text-solar tabular-nums sm:text-[34px]">
            {t(
              marketReference.kind === 'chf_job'
                ? 'marketReference.chfJob.value'
                : 'marketReference.chfM2.value',
              {
                low: formatChf(marketReference.p25),
                high: formatChf(marketReference.p75),
              }
            )}
          </p>
          <p className="mt-2 text-base text-white/85 tabular-nums">
            {t(
              marketReference.kind === 'chf_job'
                ? 'marketReference.chfJob.label'
                : 'marketReference.chfM2.label',
              { median: formatChf(marketReference.median) }
            )}
          </p>
          <p className="mt-4 border-t border-white/15 pt-4 text-base text-white/85">
            {t('marketReference.note')}
          </p>
        </div>
      )}

      {display === 'per_m2' && price && (
        <div className="rounded-[24px] bg-[#062E25] p-6 text-white sm:p-8">
          <p className="text-base font-medium text-white/85">
            {t('perM2.label')}
          </p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.02em] text-solar tabular-nums sm:text-[34px]">
            {t('perM2.inclVat', {
              low: formatChf(price.perM2Low),
              high: formatChf(price.perM2High),
            })}
          </p>
          <p className="mt-2 text-base text-white/85 tabular-nums">
            {t('perM2.exclVat', {
              low: formatChf(price.perM2LowExclVat),
              high: formatChf(price.perM2HighExclVat),
            })}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/15 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-base font-medium">
                {t('perM2.includedTitle')}
              </p>
              <p className="mt-1 text-base text-white/85">
                {t('perM2.included')}
              </p>
            </div>
            <div>
              <p className="text-base font-medium">{t('perM2.onTopTitle')}</p>
              <ul className="mt-1 list-disc pl-5 text-white/85">
                {price.exclusions.map(exclusion => (
                  <li key={exclusion} className="text-base">
                    {t(`perM2.exclusions.${exclusion}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 text-base text-white/85">
            {t('perM2.disclaimer')}
          </p>
        </div>
      )}

      {display === 'visit_only' && (
        <div>
          <p className="text-xl font-medium tracking-tight">
            {t('visit.title')}
          </p>
          <p className="mt-2 text-base">
            {t(`visit.reasons.${reason ?? 'other'}`)}
          </p>
        </div>
      )}

      {display === 'young_roof' && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-xl font-medium tracking-tight">
            {t('young.body')}
          </p>
          <LinkButton variant="tertiary" href={calculatorHref}>
            {t('young.link')}
          </LinkButton>
        </div>
      )}

      {subsidy && <SubsidyBlock subsidy={subsidy} />}

      {existingPv && (
        <Note>
          <p className="text-base">
            {existingPv.kw == null
              ? existingPv.startYear != null
                ? t('existingPv.noFigureWithYear', {
                    year: String(existingPv.startYear),
                  })
                : t('existingPv.noFigure')
              : existingPv.startYear != null
                ? t('existingPv.withYear', {
                    kw: formatDecimal(existingPv.kw, locale),
                    year: String(existingPv.startYear),
                  })
                : t('existingPv.withoutYear', {
                    kw: formatDecimal(existingPv.kw, locale),
                  })}
          </p>
        </Note>
      )}

      {pvPotential && (
        <Note>
          <p className="text-base">
            {t('pvPotential.body', {
              kwp: formatDecimal(pvPotential.kwp, locale),
              kwh: formatChf(pvPotential.kwhYear),
            })}
          </p>
          <LearnMoreLink href="/roof-renovation/solar" className="mt-2">
            {t('pvPotential.link')}
          </LearnMoreLink>
        </Note>
      )}

      {estimate.asbestosCheck && (
        <Note>
          <p className="text-base">{t('asbestos')}</p>
        </Note>
      )}

      {showRequestButton && (
        <ArrowButton
          type="button"
          variant="primary"
          size="lg"
          onClick={onRequest}
          className="w-fit text-base"
        >
          {t('request')}
        </ArrowButton>
      )}

      <div className="flex flex-col gap-2 border-t border-[#062E25]/10 pt-4 text-base text-[#062E25]/70">
        <p className="text-base">{t('sources')}</p>
        <button
          type="button"
          onClick={onRequest}
          className="w-fit underline underline-offset-4 hover:text-[#062E25]"
        >
          {t('wrongData')}
        </button>
      </div>
    </div>
  )
}
