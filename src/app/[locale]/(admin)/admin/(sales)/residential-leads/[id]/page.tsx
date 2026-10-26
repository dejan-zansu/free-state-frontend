'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { salesLeadErrorKey } from '@/lib/sales-lead-errors'
import { salesLeadService } from '@/services/sales-lead.service'

import { ActivityTimeline } from './ActivityTimeline'
import { CalculationTab } from './CalculationTab'
import { LeadDetails } from './LeadDetails'
import { LeadHeader } from './LeadHeader'
import {
  CARD_CLASS,
  isNotFoundError,
  leadKey,
  OUTLINE_BUTTON,
} from './leadUtils'
import { NoteComposer } from './NoteComposer'
import { ProjectTab } from './ProjectTab'
import { StatusPipeline } from './StatusPipeline'
import { WorkStrip } from './WorkStrip'

const TAB_TRIGGER_CLASS =
  'h-auto flex-none rounded-none border-0 border-b-2 px-4 py-3 text-base text-[#062E25]/75 shadow-none data-[state=active]:border-[#062E25] data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[#062E25] data-[state=active]:shadow-none'

function TabCount({ value }: { value: number }) {
  if (value <= 0) return null
  return (
    <span className="rounded-full bg-[#062E25]/10 px-2 text-sm font-medium text-[#062E25] sm:text-base">
      {value}
    </span>
  )
}

export default function SalesLeadDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const locale = useLocale()
  const t = useTranslations('admin.salesLeads.detail')
  const tErr = useTranslations('admin.salesLeads.errors')

  const {
    data: lead,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: leadKey(id),
    queryFn: () => salesLeadService.get(id),
    retry: (failureCount, err) => !isNotFoundError(err) && failureCount < 2,
  })

  if (isLoading) return <AdminPageLoader className="h-64" />

  if (!lead) {
    const notFound = isNotFoundError(error)
    return (
      <div className="flex max-w-xl flex-col items-start gap-3">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {notFound ? t('notFound.title') : t('loadFailed.title')}
        </h1>
        <p className="text-base text-[#062E25]/75">
          {notFound ? t('notFound.text') : t('loadFailed.text')}
        </p>
        <div className="flex flex-wrap gap-2">
          {!notFound && (
            <Button
              size="lg"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
            >
              {t('loadFailed.retry')}
            </Button>
          )}
          <Button
            asChild
            size="lg"
            variant="outline"
            className={OUTLINE_BUTTON}
          >
            <Link href={`/${locale}/admin/residential-leads`}>
              <ChevronLeft />
              {t('back')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const activityCount = lead.activities.length
  const contractCount = lead.project?.contracts?.length ?? 0

  return (
    <div>
      {isError && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-base text-red-700">
            {tErr(salesLeadErrorKey(error))}
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(OUTLINE_BUTTON, 'bg-white sm:shrink-0')}
          >
            {t('loadFailed.retry')}
          </Button>
        </div>
      )}
      <LeadHeader lead={lead} />
      <StatusPipeline lead={lead}>
        <WorkStrip lead={lead} />
      </StatusPipeline>
      <LeadDetails lead={lead} />

      <Tabs defaultValue="activity" className="gap-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-[#062E25]/10 bg-transparent p-0">
          <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
            {t('tabs.activity')}
            <TabCount value={activityCount} />
          </TabsTrigger>
          <TabsTrigger value="calculation" className={TAB_TRIGGER_CLASS}>
            {t('tabs.calculation')}
          </TabsTrigger>
          <TabsTrigger value="project" className={TAB_TRIGGER_CLASS}>
            {t('tabs.project')}
            <TabCount value={contractCount} />
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="activity"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <Card className={cn(CARD_CLASS, 'mb-6')}>
            <CardContent className="p-4 sm:p-6">
              <NoteComposer leadId={lead.id} />
              <ActivityTimeline lead={lead} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calculation">
          <CalculationTab lead={lead} />
        </TabsContent>
        <TabsContent value="project">
          <ProjectTab lead={lead} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
