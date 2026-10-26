'use client'

import { useMutation } from '@tanstack/react-query'
import {
  CalendarCheck,
  ChevronLeft,
  Download,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDateTime, mapsHref, personName, telHref } from '@/lib/sales-lead'
import { salesLeadErrorKey } from '@/lib/sales-lead-errors'
import { cn } from '@/lib/utils'
import { salesLeadService } from '@/services/sales-lead.service'
import type { SalesLeadDetail } from '@/types/sales-lead'

import { useLeadCache } from './leadMutations'
import { OUTLINE_BUTTON, PRIMARY_BUTTON } from './leadUtils'
import { ContactLine, Pill } from './parts'

function DisabledAction({
  reason,
  className,
  children,
}: {
  reason: string
  className?: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            'flex rounded-md focus-visible:outline-2 focus-visible:outline-[#062E25]',
            className
          )}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="sales-type-scale max-w-xs text-base">
        {reason}
      </TooltipContent>
    </Tooltip>
  )
}

export function LeadHeader({ lead }: { lead: SalesLeadDetail }) {
  const t = useTranslations('admin.salesLeads.detail')
  const tErr = useTranslations('admin.salesLeads.errors')
  const locale = useLocale()
  const { setDetail } = useLeadCache(lead.id)

  const user = lead.customer.user
  const name = personName(user) || user.email
  const phone = user.phone?.trim() ? user.phone : null
  const hasCalculation = !!lead.project?.solarCalculation
  const isOwner = lead.project?.isPropertyOwner ?? lead.customer.isPropertyOwner

  const consultation = useMutation({
    mutationFn: () => salesLeadService.markConsultationBooked(lead.id),
    onSuccess: detail => {
      setDetail(detail)
      toast.success(t('toast.consultationBooked'))
    },
    onError: error => toast.error(tErr(salesLeadErrorKey(error))),
  })

  const report = useMutation({
    mutationFn: () =>
      salesLeadService.downloadReport(lead.id, lead.propertyAddress),
    onError: () => toast.error(t('toast.reportFailed')),
  })

  return (
    <header className="mb-6">
      <Link
        href={`/${locale}/admin/residential-leads`}
        className="inline-flex items-center gap-1 text-base font-medium text-[#062E25]/75 hover:text-[#062E25]"
      >
        <ChevronLeft className="size-4" />
        {t('back')}
      </Link>

      <div className="mt-3 grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#062E25] sm:text-2xl">
            {name}
          </h1>
          {lead.propertyAddress && (
            <a
              href={mapsHref(lead.propertyAddress)}
              target="_blank"
              rel="noopener noreferrer"
              title={t('header.openMap')}
              className="mt-1 inline-flex items-start gap-1.5 text-base text-[#062E25]/75 hover:text-[#062E25] hover:underline"
            >
              <MapPin className="mt-1 size-4 shrink-0" />
              <span className="break-words">{lead.propertyAddress}</span>
            </a>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
            {phone ? (
              <ContactLine
                icon={<Phone className="size-4" />}
                href={telHref(phone)}
                value={phone}
                copyLabel={t('contact.copyPhone')}
              />
            ) : (
              <p className="flex items-center gap-2 text-base text-[#062E25]/60">
                <Phone className="size-4 shrink-0" />
                {t('contact.noPhone')}
              </p>
            )}
            <ContactLine
              icon={<Mail className="size-4" />}
              href={`mailto:${user.email}`}
              value={user.email}
              copyLabel={t('contact.copyEmail')}
            />
          </div>
          {(!isOwner || lead.offerCount > 0 || lead.consultationBookedAt) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!isOwner && (
                <Pill tone="bg-amber-100 text-amber-800">
                  {t('header.notOwner')}
                </Pill>
              )}
              {lead.offerCount > 0 && (
                <Pill
                  tone="bg-emerald-50 text-emerald-700"
                  title={
                    lead.offerSentAt
                      ? formatDateTime(lead.offerSentAt)
                      : undefined
                  }
                >
                  {t('header.offerRequested', { count: lead.offerCount })}
                </Pill>
              )}
              {lead.consultationBookedAt && (
                <Pill
                  tone="bg-blue-50 text-blue-700"
                  icon={<CalendarCheck className="size-4" />}
                  title={formatDateTime(lead.consultationBookedAt)}
                >
                  {t('header.consultationBooked')}
                </Pill>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 xl:w-[34rem]">
          {phone ? (
            <Button asChild size="lg" className={cn(PRIMARY_BUTTON, 'w-full')}>
              <a href={telHref(phone)}>
                <Phone />
                {t('header.call')}
              </a>
            </Button>
          ) : (
            <DisabledAction reason={t('header.callMissing')}>
              <Button
                size="lg"
                disabled
                className={cn(PRIMARY_BUTTON, 'w-full')}
              >
                <Phone />
                {t('header.call')}
              </Button>
            </DisabledAction>
          )}
          <Button
            asChild
            size="lg"
            variant="outline"
            className={cn(OUTLINE_BUTTON, 'w-full')}
          >
            <a href={`mailto:${user.email}`}>
              <Mail />
              {t('header.email')}
            </a>
          </Button>
          {hasCalculation ? (
            <Button
              size="lg"
              variant="outline"
              onClick={() => report.mutate()}
              disabled={report.isPending}
              className={cn(OUTLINE_BUTTON, 'w-full col-span-2 sm:col-span-1')}
            >
              {report.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}
              {t('header.report')}
            </Button>
          ) : (
            <DisabledAction
              reason={t('header.reportNoCalculation')}
              className="col-span-2 sm:col-span-1"
            >
              <Button
                size="lg"
                variant="outline"
                disabled
                className={cn(OUTLINE_BUTTON, 'w-full')}
              >
                <Download />
                {t('header.report')}
              </Button>
            </DisabledAction>
          )}
          {!lead.consultationBookedAt && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => consultation.mutate()}
              disabled={consultation.isPending}
              title={t('header.consultationHint')}
              className={cn(OUTLINE_BUTTON, 'w-full col-span-2 sm:col-span-1')}
            >
              {consultation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CalendarCheck />
              )}
              {t('header.markConsultationBooked')}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
