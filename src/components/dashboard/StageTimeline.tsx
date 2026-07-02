'use client'

import { Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import type { Milestone, MilestoneStage } from '@/types/milestone'

const STAGE_ORDER: MilestoneStage[] = [
  'CONSULTATION',
  'ON_SITE_VISIT',
  'FINAL_OFFER',
  'INSTALLATION',
]

const STAGE_KEYS: Record<MilestoneStage, { label: string; desc: string }> = {
  CONSULTATION: { label: 'stageConsultation', desc: 'consultationDesc' },
  ON_SITE_VISIT: { label: 'stageOnSiteVisit', desc: 'onSiteVisitDesc' },
  FINAL_OFFER: { label: 'stageFinalOffer', desc: 'finalOfferDesc' },
  INSTALLATION: { label: 'stageInstallation', desc: 'installationDesc' },
}

export function StageTimeline({ milestones }: { milestones: Milestone[] }) {
  const t = useTranslations('dashboard.stages')
  const locale = useLocale()

  function formatDate(value: string | null) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    const dateLocale = `${locale}-CH`
    return date.toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const byStage = new Map(milestones.map((m) => [m.stage, m]))
  const ordered: Milestone[] = STAGE_ORDER.map(
    (stage) =>
      byStage.get(stage) ?? {
        stage,
        status: 'PENDING',
        scheduledAt: null,
        completedAt: null,
        note: null,
      }
  )

  return (
    <section className="rounded-2xl border border-[#062E25]/10 bg-white p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#062E25]">{t('title')}</h2>
        <p className="mt-1 text-sm text-[#062E25]/60">{t('subtitle')}</p>
      </div>

      <ol className="relative space-y-6">
        {ordered.map((milestone, index) => {
          const isDone = milestone.status === 'DONE'
          const isActive = milestone.status === 'ACTIVE'
          const isLast = index === ordered.length - 1
          const scheduled = formatDate(milestone.scheduledAt)
          const completed = formatDate(milestone.completedAt)

          return (
            <li key={milestone.stage} className="relative flex gap-4">
              {!isLast && (
                <span
                  className={cn(
                    'absolute left-[15px] top-8 bottom-[-24px] w-px',
                    isDone ? 'bg-[#062E25]' : 'bg-[#062E25]/15'
                  )}
                  aria-hidden
                />
              )}

              <span
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                  isDone && 'border-[#062E25] bg-[#062E25] text-white',
                  isActive && 'border-[#062E25] bg-[#CDEA67] text-[#062E25]',
                  !isDone &&
                    !isActive &&
                    'border-[#062E25]/20 bg-white text-[#062E25]/30'
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </span>

              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={cn(
                      'text-base font-semibold',
                      isActive || isDone ? 'text-[#062E25]' : 'text-[#062E25]/50'
                    )}
                  >
                    {t(STAGE_KEYS[milestone.stage].label)}
                  </h3>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      isDone && 'bg-[#062E25]/10 text-[#062E25]',
                      isActive && 'bg-[#CDEA67] text-[#062E25]',
                      !isDone && !isActive && 'bg-[#062E25]/5 text-[#062E25]/50'
                    )}
                  >
                    {isDone
                      ? t('statusDone')
                      : isActive
                        ? t('statusActive')
                        : t('statusPending')}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#062E25]/60">
                  {t(STAGE_KEYS[milestone.stage].desc)}
                </p>

                {scheduled && !isDone && (
                  <p className="mt-2 text-sm font-medium text-[#062E25]">
                    {t('scheduledLabel')}: {scheduled}
                  </p>
                )}
                {completed && isDone && (
                  <p className="mt-2 text-sm text-[#062E25]/50">
                    {t('completedLabel')}: {completed}
                  </p>
                )}
                {milestone.note && (
                  <p className="mt-2 rounded-lg bg-[#F2F4E8] px-3 py-2 text-sm text-[#062E25]/80">
                    {milestone.note}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default StageTimeline
