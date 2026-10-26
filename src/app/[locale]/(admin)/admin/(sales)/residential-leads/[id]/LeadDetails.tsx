'use client'

import { Mail, Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { chf } from '@/lib/format-chf'
import {
  formatDate,
  formatDateTime,
  formatRelative,
  telHref,
} from '@/lib/sales-lead'
import { cn } from '@/lib/utils'
import type { SalesLeadDetail } from '@/types/sales-lead'

import { CARD_CLASS } from './leadUtils'
import { ContactLine, Field, Pill, usePackageLabel } from './parts'

function Group({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'py-5 first:pt-0 last:pb-0 xl:px-8 xl:py-0 xl:first:pl-0 xl:last:pr-0',
        className
      )}
    >
      <h2 className="mb-4 text-lg font-semibold text-[#062E25]">{title}</h2>
      {children}
    </section>
  )
}

export function LeadDetails({ lead }: { lead: SalesLeadDetail }) {
  const t = useTranslations('admin.salesLeads.detail')
  const tl = useTranslations('admin.statusLabels')
  const locale = useLocale()
  const packageLabel = usePackageLabel()

  const customer = lead.customer
  const user = customer.user
  const attribution = lead.attribution

  const isOwner = lead.project?.isPropertyOwner ?? customer.isPropertyOwner
  const selectedPackage = lead.project?.selectedPackage ?? null

  const ownerName = customer.propertyOwnerName?.trim() || null
  const ownerEmail = customer.propertyOwnerEmail?.trim() || null
  const ownerPhone = customer.propertyOwnerPhone?.trim() || null
  const hasOwnerContact = !!(ownerName || ownerEmail || ownerPhone)

  const alternatePhone = customer.alternatePhone?.trim() || null
  const alternateEmail = customer.alternateEmail?.trim() || null
  const language = user.preferredLanguage?.trim() || null

  const channel = attribution?.channel ?? null
  const channelLabel =
    channel && t.has(`source.channels.${channel}`)
      ? t(`source.channels.${channel}`)
      : (channel ?? '-')
  const campaign = attribution?.utmCampaign?.trim() || null
  const landingPage = attribution?.landingPage?.trim() || null
  const referrerHost = attribution?.referrerHost?.trim() || null

  const notes = customer.notes?.trim() || null
  const addressAdditional = customer.addressAdditional?.trim() || null

  return (
    <Card className={cn(CARD_CLASS, 'mb-6')}>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 divide-y divide-[#062E25]/10 xl:grid-cols-3 xl:divide-x xl:divide-y-0">
          <Group title={t('property.title')}>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label={t('property.package')}>
                {lead.interestedPackage
                  ? packageLabel(lead.interestedPackage)
                  : '-'}
              </Field>
              {selectedPackage &&
                selectedPackage !== lead.interestedPackage && (
                  <Field label={t('property.selectedPackage')}>
                    {packageLabel(selectedPackage)}
                  </Field>
                )}
              <Field label={t('property.budget')}>
                {lead.estimatedBudget != null ? chf(lead.estimatedBudget) : '-'}
              </Field>
              <Field label={t('property.ownership')}>
                {isOwner ? (
                  <Pill tone="bg-emerald-50 text-emerald-700">
                    {t('property.owner')}
                  </Pill>
                ) : (
                  <Pill tone="bg-amber-100 text-amber-800">
                    {t('property.notOwner')}
                  </Pill>
                )}
              </Field>
            </dl>

            {!isOwner && (
              <div className="mt-5 border-t border-[#062E25]/10 pt-4">
                <p className="mb-2 text-base font-medium text-[#062E25]">
                  {t('property.ownerContact')}
                </p>
                {hasOwnerContact ? (
                  <div className="grid gap-1">
                    {ownerName && (
                      <p className="break-words text-base font-medium text-[#062E25]">
                        {ownerName}
                      </p>
                    )}
                    {ownerPhone && (
                      <ContactLine
                        icon={<Phone className="size-4" />}
                        href={telHref(ownerPhone)}
                        value={ownerPhone}
                        copyLabel={t('contact.copyPhone')}
                      />
                    )}
                    {ownerEmail && (
                      <ContactLine
                        icon={<Mail className="size-4" />}
                        href={`mailto:${ownerEmail}`}
                        value={ownerEmail}
                        copyLabel={t('contact.copyEmail')}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-base text-[#062E25]/75">
                    {t('property.ownerContactMissing')}
                  </p>
                )}
              </div>
            )}
          </Group>

          <Group title={t('customer.title')}>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {alternatePhone && (
                <Field label={t('contact.alternatePhone')}>
                  <ContactLine
                    icon={<Phone className="size-4" />}
                    href={telHref(alternatePhone)}
                    value={alternatePhone}
                    copyLabel={t('contact.copyPhone')}
                  />
                </Field>
              )}
              {alternateEmail && (
                <Field label={t('contact.alternateEmail')}>
                  <ContactLine
                    icon={<Mail className="size-4" />}
                    href={`mailto:${alternateEmail}`}
                    value={alternateEmail}
                    copyLabel={t('contact.copyEmail')}
                  />
                </Field>
              )}
              <Field label={t('contact.language')}>
                <span className="uppercase">{language ?? '-'}</span>
              </Field>
              <Field label={t('contact.lastLogin')}>
                {user.lastLoginAt ? (
                  <time
                    dateTime={user.lastLoginAt}
                    title={formatDateTime(user.lastLoginAt)}
                  >
                    {formatRelative(user.lastLoginAt, locale)}
                  </time>
                ) : (
                  '-'
                )}
              </Field>
            </dl>
          </Group>

          <Group title={t('source.title')}>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label={t('source.channel')}>{channelLabel}</Field>
              <Field label={t('source.source')}>
                {tl.has(lead.source) ? tl(lead.source) : lead.source}
              </Field>
              {campaign && (
                <Field label={t('source.campaign')}>{campaign}</Field>
              )}
              {landingPage && (
                <Field label={t('source.landingPage')}>
                  <span className="break-all">{landingPage}</span>
                </Field>
              )}
              {referrerHost && (
                <Field label={t('source.referrer')}>{referrerHost}</Field>
              )}
              <Field label={t('source.created')}>
                <time
                  dateTime={lead.createdAt}
                  title={formatDateTime(lead.createdAt)}
                >
                  {formatDate(lead.createdAt)}
                </time>
                <span className="font-normal text-[#062E25]/75">
                  {' · '}
                  {formatRelative(lead.createdAt, locale)}
                </span>
              </Field>
            </dl>
          </Group>
        </div>

        {(notes || addressAdditional) && (
          <div className="mt-6 border-t border-[#062E25]/10 pt-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              {notes && (
                <Field label={t('remarks.notes')}>
                  <span className="whitespace-pre-wrap">{notes}</span>
                </Field>
              )}
              {addressAdditional && (
                <Field label={t('remarks.addressAdditional')}>
                  <span className="whitespace-pre-wrap">
                    {addressAdditional}
                  </span>
                </Field>
              )}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
