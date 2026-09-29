'use client'

// Letter track (doc 69 W2-11, M-6, M-12 and the homeowner letters of §7.6):
// the gate settings, every letter with its PDF and status, the submission of
// rendered letters to Pingen (ADMIN) and the homeowner and farm targets.

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, FileText } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { outreachLettersService } from '@/services/outreach/letters.service'
import { useAuthStore } from '@/stores/auth.store'
import {
  LETTER_TARGET_KINDS,
  LETTER_TARGET_STATUSES,
  OUTBOUND_LETTER_KINDS,
  OUTBOUND_LETTER_STATUSES,
  type LetterTargetKind,
  type LetterTargetStatus,
  type OutboundLetterKind,
  type OutboundLetterStatus,
} from '@/types/outreach/owner-first'
import type {
  LetterSettings,
  SubmitDueResponse,
} from '@/types/outreach/letters'

const CANCELLABLE = new Set<OutboundLetterStatus>([
  'QUEUED',
  'RENDERED',
  'SUBMITTED',
])

function day(value: string | null): string {
  return value ? new Date(value).toLocaleDateString('de-CH') : '-'
}

function swiss(value: number | null): string {
  return value == null
    ? '-'
    : Math.round(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

function SettingsStrip({ settings }: { settings: LetterSettings }) {
  const t = useTranslations('admin.outreach.letters')
  const items: Array<[string, string]> = [
    [t('settingEnabled'), settings.lettersEnabled ? t('on') : t('off')],
    [t('settingAutosubmit'), settings.autosubmit ? t('on') : t('off')],
    [t('settingToday'), `${settings.submittedToday} / ${settings.dailyMax}`],
    [
      t('settingUnknownOwner'),
      settings.unknownOwnerEnabled
        ? `${settings.unknownOwnerThisWeek} / ${settings.weeklyMax}`
        : t('off'),
    ],
    [
      t('settingPingen'),
      settings.pingenConfigured ? settings.pingenEnv : t('notConfigured'),
    ],
    [
      t('settingLanding'),
      settings.onePagerBaseSet ? t('on') : t('notConfigured'),
    ],
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {items.map(([label, value]) => (
        <Card key={label}>
          <CardContent className="p-3">
            <p className="text-[#062E25]/75">{label}</p>
            <p className="font-semibold text-[#062E25]">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Select<T extends string>(props: {
  id: string
  label: string
  value: T | ''
  options: readonly T[]
  optionLabel: (value: T) => string
  allLabel: string
  onChange: (value: T | '') => void
}) {
  return (
    <label htmlFor={props.id} className="flex flex-col gap-1 text-[#062E25]">
      {props.label}
      <select
        id={props.id}
        className="border border-[#062E25]/20 rounded px-2 py-1 text-base bg-white"
        value={props.value}
        onChange={e => props.onChange(e.target.value as T | '')}
      >
        <option value="">{props.allLabel}</option>
        {props.options.map(option => (
          <option key={option} value={option}>
            {props.optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function AdminOutreachLettersPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.letters')
  const queryClient = useQueryClient()
  const isAdmin = useAuthStore(state => state.user?.role === 'ADMIN')
  const [tab, setTab] = useState<'letters' | 'targets'>('letters')
  const [status, setStatus] = useState<OutboundLetterStatus | ''>('')
  const [kind, setKind] = useState<OutboundLetterKind | ''>('')
  const [targetKind, setTargetKind] = useState<LetterTargetKind | ''>('')
  const [targetStatus, setTargetStatus] = useState<LetterTargetStatus | ''>('')
  const [message, setMessage] = useState<string | null>(null)

  const letters = useQuery({
    queryKey: ['admin', 'outreach', 'letters', status, kind],
    queryFn: () =>
      outreachLettersService.list({
        status: status || undefined,
        kind: kind || undefined,
      }),
  })
  const targets = useQuery({
    queryKey: ['admin', 'outreach', 'letter-targets', targetKind, targetStatus],
    queryFn: () =>
      outreachLettersService.listTargets({
        kind: targetKind || undefined,
        status: targetStatus || undefined,
      }),
    enabled: tab === 'targets',
  })

  // A cancelled letter also moves its target to EXCLUDED, so both lists reload.
  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'outreach', 'letters'],
    })
    queryClient.invalidateQueries({
      queryKey: ['admin', 'outreach', 'letter-targets'],
    })
  }

  const cancel = useMutation({
    mutationFn: (id: string) => outreachLettersService.cancel(id),
    onSuccess: () => {
      setMessage(null)
      refresh()
    },
    onError: () => setMessage(t('cancelFailed')),
  })

  const submit = useMutation({
    mutationFn: (dryRun: boolean) =>
      outreachLettersService.submitDue({ dryRun }),
    onSuccess: (result: SubmitDueResponse) => {
      setMessage(
        result.dryRun
          ? t('submitDryResult', {
              submitted: result.submitted,
              skipped: result.skipped,
            })
          : t('submitResult', {
              submitted: result.submitted,
              skipped: result.skipped,
            })
      )
      refresh()
    },
    onError: () => setMessage(t('submitFailed')),
  })

  const openPdf = async (id: string) => {
    try {
      const url = await outreachLettersService.pdfUrl(id)
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setMessage(t('pdfFailed'))
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>
        </Button>
      </div>

      {letters.data && <SettingsStrip settings={letters.data.settings} />}

      {message && (
        <p className="mb-4 p-3 rounded bg-[#062E25]/5 text-[#062E25]">
          {message}
        </p>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          variant={tab === 'letters' ? 'default' : 'outline'}
          onClick={() => setTab('letters')}
        >
          {t('tabLetters')}
        </Button>
        <Button
          variant={tab === 'targets' ? 'default' : 'outline'}
          onClick={() => setTab('targets')}
        >
          {t('tabTargets')}
        </Button>
      </div>

      {tab === 'letters' ? (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div className="flex flex-wrap gap-4">
                <Select
                  id="letter-status"
                  label={t('filterStatus')}
                  value={status}
                  options={OUTBOUND_LETTER_STATUSES}
                  optionLabel={value => t(`status.${value}`)}
                  allLabel={t('all')}
                  onChange={setStatus}
                />
                <Select
                  id="letter-kind"
                  label={t('filterKind')}
                  value={kind}
                  options={OUTBOUND_LETTER_KINDS}
                  optionLabel={value => t(`kind.${value}`)}
                  allLabel={t('all')}
                  onChange={setKind}
                />
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={submit.isPending}
                    onClick={() => submit.mutate(true)}
                  >
                    {t('submitDry')}
                  </Button>
                  <Button
                    disabled={
                      submit.isPending ||
                      !letters.data?.settings.lettersEnabled ||
                      !letters.data?.settings.pingenConfigured
                    }
                    className="bg-[#062E25] hover:bg-[#062E25]/90"
                    onClick={() => {
                      if (window.confirm(t('submitConfirm')))
                        submit.mutate(false)
                    }}
                  >
                    {t('submit')}
                  </Button>
                </div>
              )}
            </div>
            {letters.isLoading ? (
              <AdminPageLoader />
            ) : letters.isError ? (
              <p className="p-3 rounded bg-red-50 text-red-700">
                {t('loadFailed')}
              </p>
            ) : (letters.data?.items.length ?? 0) === 0 ? (
              <p className="text-[#062E25]/75">{t('empty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-base min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('colCreated')}</TableHead>
                      <TableHead>{t('colKind')}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                      <TableHead>{t('colRecipient')}</TableHead>
                      <TableHead>{t('colSent')}</TableHead>
                      <TableHead>{t('colCallDue')}</TableHead>
                      <TableHead>{t('colNote')}</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {letters.data!.items.map(letter => (
                      <TableRow key={letter.id}>
                        <TableCell className="tabular-nums">
                          {day(letter.createdAt)}
                        </TableCell>
                        <TableCell>{t(`kind.${letter.kind}`)}</TableCell>
                        <TableCell>
                          {t(`status.${letter.status}`)}
                          {letter.providerStatus && (
                            <span className="block text-[#062E25]/60">
                              Pingen: {letter.providerStatus}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {letter.prospect ? (
                            <Link
                              href={`/${locale}/admin/outreach/${letter.prospect.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {letter.recipientName}
                            </Link>
                          ) : (
                            letter.recipientName
                          )}
                          <span className="block text-[#062E25]/60">
                            {letter.recipientStreet},{' '}
                            {letter.recipientPostalCode} {letter.recipientCity}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {day(letter.sentAt ?? letter.submittedAt)}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {day(letter.callDueAt)}
                        </TableCell>
                        <TableCell className="max-w-[240px] break-words text-[#062E25]/75">
                          {letter.failedReason ?? '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => openPdf(letter.id)}
                            >
                              <FileText className="w-4 h-4" />
                              {t('pdf')}
                            </Button>
                            {CANCELLABLE.has(letter.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={cancel.isPending}
                                onClick={() => {
                                  if (window.confirm(t('cancelConfirm')))
                                    cancel.mutate(letter.id)
                                }}
                              >
                                {t('cancel')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <Select
                id="target-kind"
                label={t('filterKind')}
                value={targetKind}
                options={LETTER_TARGET_KINDS}
                optionLabel={value => t(`targetKind.${value}`)}
                allLabel={t('all')}
                onChange={setTargetKind}
              />
              <Select
                id="target-status"
                label={t('filterStatus')}
                value={targetStatus}
                options={LETTER_TARGET_STATUSES}
                optionLabel={value => t(`targetStatus.${value}`)}
                allLabel={t('all')}
                onChange={setTargetStatus}
              />
            </div>
            {targets.isLoading ? (
              <AdminPageLoader />
            ) : targets.isError ? (
              <p className="p-3 rounded bg-red-50 text-red-700">
                {t('loadFailed')}
              </p>
            ) : (targets.data?.items.length ?? 0) === 0 ? (
              <p className="text-[#062E25]/75">{t('targetsEmpty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-base min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('colKind')}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                      <TableHead>{t('colAddress')}</TableHead>
                      <TableHead className="text-right">
                        {t('colKwh')}
                      </TableHead>
                      <TableHead>{t('colNote')}</TableHead>
                      <TableHead>{t('colLetter')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targets.data!.items.map(target => (
                      <TableRow key={target.id}>
                        <TableCell>{t(`targetKind.${target.kind}`)}</TableCell>
                        <TableCell>
                          {t(`targetStatus.${target.status}`)}
                        </TableCell>
                        <TableCell>
                          {[
                            [target.addressStreet, target.addressNumber]
                              .filter(Boolean)
                              .join(' '),
                            [target.addressPostalCode, target.addressCity]
                              .filter(Boolean)
                              .join(' '),
                          ]
                            .filter(Boolean)
                            .join(', ') || '-'}
                          <span className="block text-[#062E25]/60">
                            EGID {target.egid}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {swiss(target.roofKwhYear)}
                        </TableCell>
                        <TableCell>{target.excludeReason ?? '-'}</TableCell>
                        <TableCell>
                          {target.lastLetter
                            ? `${t(`status.${target.lastLetter.status}`)} ${day(target.lastLetter.sentAt)}`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
