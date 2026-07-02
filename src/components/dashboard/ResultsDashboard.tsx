'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { StageTimeline } from '@/components/dashboard/StageTimeline'
import {
  customerPortalService,
  type Milestone,
} from '@/services/customer-portal.service'
import { useAuthStore } from '@/stores/auth.store'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

export default function ResultsDashboard() {
  const t = useTranslations('solarAboCalculator.results.dashboard')
  const user = useAuthStore(s => s.user)
  const contactFirstName = useSolarAboCalculatorStore(s => s.contact.firstName)
  const firstName = user?.firstName || contactFirstName || ''

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [milestonesLoading, setMilestonesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    customerPortalService
      .getDashboard()
      .then(data => {
        if (!cancelled) setMilestones(data.milestones ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMilestonesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="flex flex-col gap-6 rounded-[24px] border border-[rgba(84,105,99,0.55)] bg-white/40 p-5 backdrop-blur-md sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-medium uppercase tracking-tight text-[#036B53]">
            {t('eyebrow')}
          </p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight text-[#062E25] sm:text-3xl">
            {firstName ? t('greeting', { firstName }) : t('greetingNoName')}
          </h2>
          <p className="mt-1 text-sm text-[#062E25]/70 sm:text-base">
            {t('subtitle')}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#062E25] bg-white/20 px-5 py-2.5 text-sm sm:text-base font-medium text-[#062E25] backdrop-blur transition-colors hover:bg-white/40"
        >
          {t('openDashboard')}
          <ArrowRight
            className="h-4 w-4 -rotate-45 transition-transform group-hover:rotate-0"
            aria-hidden
          />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-medium text-[#062E25]">{t('whatsNext')}</h3>
        {milestonesLoading ? (
          <div
            className="h-24 w-full animate-pulse rounded-2xl bg-[#062E25]/5"
            role="status"
            aria-label={t('loadingTimeline')}
          />
        ) : (
          <StageTimeline milestones={milestones} />
        )}
      </div>
    </section>
  )
}
