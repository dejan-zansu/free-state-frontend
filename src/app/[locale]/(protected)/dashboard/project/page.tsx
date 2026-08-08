'use client'

import { AlertCircle, Sun } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EyebrowPill } from '@/components/ui/eyebrow-pill'
import { PageLoader } from '@/components/ui/page-loader'
import { chf, groupNumber, kwh, kwp } from '@/lib/format-chf'
import { modelLabelKey } from '@/lib/model-label'
import { cn } from '@/lib/utils'
import { customerPortalService, type ProjectSummary } from '@/services/customer-portal.service'

const LIFETIME_YEARS = 25

const PRIMARY_ACTION =
  'inline-flex min-h-11 items-center justify-center rounded-full bg-pine px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-pine/90'

const SECONDARY_ACTION =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-pine px-6 py-2.5 text-base font-medium text-pine transition-colors hover:bg-pine/5'

function ProjectCard({ project, hero }: { project: ProjectSummary; hero: boolean }) {
  const t = useTranslations('dashboard.project')
  const tStatus = useTranslations('dashboard.status')
  const locale = useLocale()

  const system = project.system
  const annualSavings = system?.annualSavings ?? 0
  const hasSavings = annualSavings > 0
  const hasSystem = (system?.systemSizeKwp ?? 0) > 0

  return (
    <Card className="relative gap-0 border-pine/10 py-0 transition-colors hover:border-pine/30">
      <CardContent className={cn('flex flex-col', hero ? 'p-7 sm:p-10' : 'p-6')}>
        <span className="inline-flex">
          <EyebrowPill>{t(`models.${modelLabelKey(project.solarModel)}`)}</EyebrowPill>
        </span>

        <h2
          className={cn(
            'mt-5 font-bold tracking-tight text-pine',
            hero ? 'text-2xl sm:text-3xl' : 'text-xl'
          )}
        >
          {project.address}
        </h2>

        {hasSavings ? (
          <div className={hero ? 'mt-8' : 'mt-6'}>
            <p className="text-base text-pine">{t('card.savingsLabel')}</p>
            <p
              className={cn(
                'mt-1 font-bold tabular-nums text-pine',
                hero ? 'text-4xl sm:text-5xl' : 'text-3xl'
              )}
            >
              {chf(annualSavings)}
            </p>
            <p className="mt-2 text-base text-pine">
              {t('card.lifetimeLine', {
                amount: groupNumber(annualSavings * LIFETIME_YEARS),
              })}
            </p>
          </div>
        ) : (
          <p className={cn('text-base text-pine', hero ? 'mt-8' : 'mt-6')}>
            {t('card.savingsUnavailable')}
          </p>
        )}

        {hasSystem && (
          <p className={cn('text-base text-pine', hero ? 'mt-6' : 'mt-4')}>
            {t('card.systemLine', {
              kwp: kwp(system?.systemSizeKwp ?? 0),
              production: kwh(system?.annualProductionKwh ?? 0),
              co2: groupNumber(system?.co2Savings ?? 0),
            })}
          </p>
        )}

        <p
          className={cn(
            'border-t border-pine/10 pt-6 text-base font-medium text-pine',
            hero ? 'mt-8' : 'mt-6'
          )}
        >
          {tStatus(project.conversionStatus)}
        </p>

        <div className={cn('flex flex-wrap items-center gap-3', hero ? 'mt-7' : 'mt-6')}>
          <Link
            href={`/${locale}/dashboard/project/${project.id}`}
            className={cn(PRIMARY_ACTION, 'after:absolute after:inset-0 after:rounded-xl')}
          >
            {t('card.open')}
          </Link>
          {project.contract && (
            <Link
              href={`/${locale}/dashboard/contract?projectId=${project.id}`}
              className={cn(SECONDARY_ACTION, 'relative z-10')}
            >
              {t('viewContract')}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjectPage() {
  const t = useTranslations('dashboard.project')
  const locale = useLocale()

  const {
    data: projects,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery<ProjectSummary[]>({
    queryKey: ['me', 'projects'],
    queryFn: () => customerPortalService.getProjects(),
  })

  const heading = <h1 className="mb-8 text-2xl font-bold text-pine">{t('title')}</h1>

  if (isPending) {
    return (
      <div className="max-w-5xl">
        {heading}
        <PageLoader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-5xl">
        {heading}
        <Card className="gap-0 border-pine/10 py-0">
          <CardContent className="p-8 text-center sm:p-12">
            <AlertCircle className="mx-auto mb-5 h-12 w-12 text-pine/25" />
            <h2 className="text-xl font-bold text-pine">{t('error.title')}</h2>
            <Button
              onClick={() => refetch()}
              disabled={isRefetching}
              className={cn(PRIMARY_ACTION, 'mt-7')}
            >
              {t('error.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-5xl">
        {heading}
        <Card className="gap-0 border-pine/10 py-0">
          <CardContent className="p-8 text-center sm:p-12">
            <Sun className="mx-auto mb-5 h-12 w-12 text-pine/25" />
            <h2 className="text-xl font-bold text-pine">{t('empty.title')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-pine">{t('empty.body')}</p>
            <Button asChild className={cn(PRIMARY_ACTION, 'mt-7')}>
              <Link href={`/${locale}/calculator`}>{t('empty.cta')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (projects.length === 1) {
    return (
      <div className="max-w-5xl">
        {heading}
        <ProjectCard project={projects[0]} hero />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      {heading}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} hero={false} />
        ))}
      </div>
    </div>
  )
}
