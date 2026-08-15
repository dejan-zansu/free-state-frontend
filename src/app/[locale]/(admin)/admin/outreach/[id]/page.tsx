'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { AxiosError } from 'axios'
import { ChevronLeft, ExternalLink, Mail, MapPin, Sun } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { PvVerdictBadge } from '@/components/admin/PvVerdictBadge'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { contactRoleLabel, industryLabel, timelineLabel } from '@/lib/commercial-lead-labels'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type {
  OutboundEmail, OutboundPromoteDuplicateData, OutboundProspectDetail, OutboundProspectStatus,
} from '@/types/admin-outreach'

const REPLY_CLASSIFICATION_COLORS: Record<string, string> = {
  INTERESTED: 'bg-green-100 text-green-700',
  QUESTION: 'bg-blue-100 text-blue-700',
  NOT_INTERESTED: 'bg-red-100 text-red-700',
  NOT_NOW: 'bg-amber-100 text-amber-800',
  WRONG_PERSON: 'bg-orange-100 text-orange-700',
  OOO: 'bg-gray-100 text-gray-700',
  UNSUBSCRIBE: 'bg-red-100 text-red-700',
  BOUNCE: 'bg-red-100 text-red-700',
  UNCLASSIFIED: 'bg-gray-100 text-gray-700',
}

function splitComposedText(text: string, draftBody: string): { head: string; tail: string | null } {
  for (const candidate of [draftBody, draftBody.trimEnd(), draftBody.trim()]) {
    if (candidate && text.startsWith(candidate)) {
      return { head: candidate, tail: text.slice(candidate.length).replace(/^\n+/, '') }
    }
  }
  return { head: text, tail: null }
}

function truncateMessageId(id: string): string {
  return id.length > 24 ? `${id.slice(0, 24)}…` : id
}

type RoofSegment = {
  area: number | null
  tilt: number | null
  azimuthCardinal: string | null
  electricityYield: number | null
  suitabilityClass: number | null
}

function extractSegments(json: unknown): RoofSegment[] {
  const arr = Array.isArray(json)
    ? json
    : json && typeof json === 'object' && Array.isArray((json as { segments?: unknown }).segments)
      ? (json as { segments: unknown[] }).segments
      : null
  if (!arr) return []
  return arr
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object' && !Array.isArray(s))
    .map((s) => ({
      area: typeof s.area === 'number' ? s.area : null,
      tilt: typeof s.tilt === 'number' ? s.tilt : null,
      azimuthCardinal: typeof s.azimuthCardinal === 'string' ? s.azimuthCardinal : null,
      electricityYield: typeof s.electricityYield === 'number' ? s.electricityYield : null,
      suitabilityClass: typeof s.suitabilityClass === 'number' ? s.suitabilityClass : null,
    }))
}

function wmsCropUrl(e: number, n: number, half: number, px: number): string {
  const bbox = `${e - half},${n - half},${e + half},${n + half}`
  return `https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ch.swisstopo.swissimage&STYLES=&CRS=EPSG:2056&BBOX=${bbox}&WIDTH=${px}&HEIGHT=${px}&FORMAT=image/jpeg`
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[#062E25]/75">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide">{children}</h3>
}

function ContactCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState(prospect.contactEmail ?? '')
  const [name, setName] = useState(prospect.contactName ?? '')
  const [role, setRole] = useState(prospect.contactRole ?? '')
  const [phone, setPhone] = useState(prospect.contactPhone ?? '')
  const [isRoleAddress, setIsRoleAddress] = useState(prospect.contactIsRoleAddress)
  const [source, setSource] = useState(prospect.contactSource ?? '')

  const startEditing = () => {
    setEmail(prospect.contactEmail ?? '')
    setName(prospect.contactName ?? '')
    setRole(prospect.contactRole ?? '')
    setPhone(prospect.contactPhone ?? '')
    setIsRoleAddress(prospect.contactIsRoleAddress)
    setSource(prospect.contactSource ?? '')
    setEditing(true)
  }

  const mutation = useMutation({
    mutationFn: () => adminOutreachService.updateContact(prospect.id, {
      contactEmail: email.trim() || null,
      contactName: name.trim() || null,
      contactRole: role.trim() || null,
      contactPhone: phone.trim() || null,
      contactIsRoleAddress: isRoleAddress,
      contactSource: source.trim() || null,
    }),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
    },
  })

  const hasContact = !!(prospect.contactEmail || prospect.contactName || prospect.contactPhone)
  const extractedEmails = prospect.extractedEmails ?? []

  return (
    <Card><CardContent className="p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>{t('contactCard')}</SectionTitle>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEditing}>{t('contactEdit')}</Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3 pt-1">
          <div>
            <Label>{t('contactEmail')}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 text-base" />
          </div>
          <div>
            <Label>{t('contactName')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 text-base" />
          </div>
          <div>
            <Label>{t('contactRole')}</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 text-base" />
          </div>
          <div>
            <Label>{t('contactPhone')}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 text-base" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="contact-role-address"
                      checked={isRoleAddress}
                      onCheckedChange={(v) => setIsRoleAddress(v === true)} />
            <Label htmlFor="contact-role-address">{t('contactIsRoleAddress')}</Label>
          </div>
          <div>
            <Label>{t('contactSource')}</Label>
            <Input value={source} onChange={(e) => setSource(e.target.value)} className="mt-1 text-base" />
          </div>
          {mutation.isError && <p className="text-red-600">{t('saveFailed')}</p>}
          <div className="flex items-center gap-2">
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? t('saving') : t('save')}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} disabled={mutation.isPending}>
              {tc('cancel')}
            </Button>
          </div>
        </div>
      ) : hasContact ? (
        <>
          {prospect.contactName && <p className="font-medium">{prospect.contactName}</p>}
          {prospect.contactRole && <p className="text-[#062E25]">{prospect.contactRole}</p>}
          {prospect.contactEmail && (
            <a href={`mailto:${prospect.contactEmail}`} className="text-blue-600 hover:underline block break-all">
              {prospect.contactEmail}
            </a>
          )}
          {prospect.contactPhone && (
            <a href={`tel:${prospect.contactPhone}`} className="text-blue-600 hover:underline block">
              {prospect.contactPhone}
            </a>
          )}
          {prospect.contactEmail && (
            <p className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#062E25]/5 text-[#062E25]">
              {prospect.contactIsRoleAddress ? t('roleAddress') : t('personalAddress')}
            </p>
          )}
          {prospect.contactSource && (
            <a href={prospect.contactSource} target="_blank" rel="noreferrer"
               className="text-blue-600 hover:underline block truncate"
               title={prospect.contactSource}>
              {t('contactSource')}
            </a>
          )}
        </>
      ) : (
        <p className="text-[#062E25]/75">{t('noContact')}</p>
      )}

      {extractedEmails.length > 0 && (
        <div className="pt-1">
          <p className="text-[#062E25]/75">{t('extractedEmails')}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {extractedEmails.map((addr) => (
              <button key={addr}
                      onClick={() => {
                        if (!editing) startEditing()
                        setEmail(addr)
                      }}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#062E25]/5 hover:bg-[#062E25]/10 break-all">
                {addr}
              </button>
            ))}
          </div>
        </div>
      )}
    </CardContent></Card>
  )
}

function CompanyCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const [purposeOpen, setPurposeOpen] = useState(false)

  return (
    <Card><CardContent className="p-4 space-y-2">
      <SectionTitle>{t('companyCard')}</SectionTitle>
      <p>
        {prospect.addressStreet}{prospect.addressNumber ? ' ' + prospect.addressNumber : ''},{' '}
        {prospect.addressPostalCode} {prospect.addressCity}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {prospect.uid && (
          <a href={`https://www.zefix.ch/de/search/entity/list?name=${encodeURIComponent(prospect.companyName)}`}
             target="_blank" rel="noreferrer"
             className="text-blue-600 hover:underline inline-flex items-center gap-1">
            {prospect.uid}<ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {prospect.website && (
          <a href={prospect.website} target="_blank" rel="noreferrer"
             className="text-blue-600 hover:underline inline-flex items-center gap-1 max-w-full">
            <span className="truncate">{prospect.website.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        )}
        {prospect.lat != null && prospect.lng != null && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${prospect.lat},${prospect.lng}`}
             target="_blank" rel="noreferrer"
             className="text-blue-600 hover:underline inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />{t('openMaps')}
          </a>
        )}
      </div>
      {prospect.companiesAtEgid > 1 && (
        <p className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
          {t('companiesAtEgid', { count: prospect.companiesAtEgid })}
        </p>
      )}
      {prospect.purposeText && (
        <div>
          <p className={cn('text-[#062E25]', !purposeOpen && 'line-clamp-2')}>{prospect.purposeText}</p>
          <button onClick={() => setPurposeOpen((v) => !v)}
                  className="text-blue-600 hover:underline">
            {purposeOpen ? t('purposeHide') : t('purposeShow')}
          </button>
        </div>
      )}
      <p className="text-[#062E25]/60">{t('attribution')}</p>
    </CardContent></Card>
  )
}

function RoofCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const [segmentsOpen, setSegmentsOpen] = useState(false)

  const segments = useMemo(
    () => extractSegments(prospect.sonnendachJson).sort(
      (a, b) => (b.electricityYield ?? 0) - (a.electricityYield ?? 0),
    ),
    [prospect.sonnendachJson],
  )
  const suitable = segments.filter((s) => (s.suitabilityClass ?? 0) >= 3)
  const suitableArea = Math.round(suitable.reduce((n, s) => n + (s.area ?? 0), 0))
  const suitableMwh = Math.round(suitable.reduce((n, s) => n + (s.electricityYield ?? 0), 0) / 1000)

  const e = prospect.lv95E
  const n = prospect.lv95N

  const registry = prospect.pvRegistryJson as
    | { totalPowerKw?: number | string | null; beginningOfOperation?: string | null; address?: string | null }
    | null

  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>{t('roofCard')}</SectionTitle>
        <PvVerdictBadge verdict={prospect.pvVerdict} />
      </div>

      {e != null && n != null && (
        <figure>
          <img
            src={wmsCropUrl(e, n, 60, 640)}
            alt={t('satelliteAlt', { company: prospect.companyName })}
            loading="lazy"
            className="w-full aspect-square object-cover rounded-lg border border-[#062E25]/10"
          />
          <figcaption className="mt-1 flex items-center justify-between gap-2 text-[#062E25]/60">
            <span>{t('satelliteCaption')}</span>
            <a href={`https://map.geo.admin.ch/#/map?center=${e},${n}&z=12&bgLayer=ch.swisstopo.swissimage`}
               target="_blank" rel="noreferrer"
               className="text-blue-600 hover:underline inline-flex items-center gap-1 whitespace-nowrap">
              {t('satelliteOpenMap')}<ExternalLink className="w-3.5 h-3.5" />
            </a>
          </figcaption>
        </figure>
      )}

      <div className="space-y-1">
        <Row label={t('roofArea')}>
          {prospect.roofAreaM2 != null
            ? `${Math.round(Number(prospect.roofAreaM2)).toLocaleString('de-CH')} m²`
            : '-'}
        </Row>
        <Row label={t('roofKwh')}>
          {prospect.roofKwhYear != null
            ? `${prospect.roofKwhYear.toLocaleString('de-CH')} kWh/Jahr`
            : '-'}
        </Row>
        {prospect.buildingYear != null && <Row label={t('buildingYear')}>{prospect.buildingYear}</Row>}
        {prospect.imageryVerdict && (
          <Row label={t('imageryVerdict')}>
            {prospect.imageryVerdict}{prospect.imageryYear != null ? ` (${prospect.imageryYear})` : ''}
          </Row>
        )}
        <Row label={t('pvCheckedAt')}>
          {prospect.pvCheckedAt ? new Date(prospect.pvCheckedAt).toLocaleDateString('de-CH') : '-'}
        </Row>
      </div>

      {prospect.pvVerdict === 'REGISTRY_HIT' && registry && (
        <div className="p-2 rounded bg-red-50 text-red-800 space-y-1">
          <p className="font-medium">{t('pvRegistryDetails')}</p>
          {registry.totalPowerKw != null && <Row label={t('pvRegPower')}>{String(registry.totalPowerKw)} kW</Row>}
          {registry.beginningOfOperation && <Row label={t('pvRegDate')}>{registry.beginningOfOperation}</Row>}
        </div>
      )}

      {segments.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 text-[#062E25]">
            <Sun className="w-4 h-4 shrink-0 text-amber-500" />
            {t('segmentsSummary', {
              count: segments.length,
              area: suitableArea.toLocaleString('de-CH'),
              mwh: suitableMwh.toLocaleString('de-CH'),
            })}
          </p>
          <button onClick={() => setSegmentsOpen((v) => !v)} className="text-blue-600 hover:underline">
            {segmentsOpen ? t('segmentsHide') : t('segmentsShow')}
          </button>
          {segmentsOpen && (
            <div className="overflow-x-auto mt-2">
              <Table className="text-base">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-right">{t('segArea')}</TableHead>
                    <TableHead className="text-right">{t('segTilt')}</TableHead>
                    <TableHead>{t('segOrientation')}</TableHead>
                    <TableHead className="text-right">{t('segYield')}</TableHead>
                    <TableHead className="text-right">{t('segClass')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((s, i) => (
                    <TableRow key={i} className={cn((s.suitabilityClass ?? 0) < 3 && 'text-[#062E25]/40')}>
                      <TableCell className="text-right tabular-nums">
                        {s.area != null ? Math.round(s.area).toLocaleString('de-CH') : '-'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.tilt != null ? `${s.tilt}°` : '-'}
                      </TableCell>
                      <TableCell>{s.azimuthCardinal ?? '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.electricityYield != null ? Math.round(s.electricityYield).toLocaleString('de-CH') : '-'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{s.suitabilityClass ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </CardContent></Card>
  )
}

function WebsiteTextCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const [open, setOpen] = useState(false)
  const text = prospect.websiteText
  if (!text) return null

  return (
    <Card><CardContent className="p-4">
      <SectionTitle>{t('websiteTextCard')}</SectionTitle>
      {open ? (
        <>
          <div className="max-h-96 overflow-auto mt-2">
            <p className="whitespace-pre-wrap break-words text-[#062E25]">{text}</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-blue-600 hover:underline mt-2">
            {t('showLess')}
          </button>
        </>
      ) : (
        <button onClick={() => setOpen(true)} className="text-blue-600 hover:underline mt-2 block">
          {t('websiteTextShow', { chars: text.length.toLocaleString('de-CH') })}
        </button>
      )}
    </CardContent></Card>
  )
}

function DraftEditor({ prospect, draft }: { prospect: OutboundProspectDetail; draft: OutboundEmail }) {
  const t = useTranslations('admin.outreach.detail')
  const tc = useTranslations('admin.common')
  const te = useTranslations('admin.outreach.sendErrors')
  const queryClient = useQueryClient()

  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.bodyText)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [sendOpen, setSendOpen] = useState(false)
  const [sentResult, setSentResult] = useState<{ messageId: string } | null>(null)

  const { data: templates } = useQuery({
    queryKey: ['admin', 'outreach', 'templates'],
    queryFn: () => adminOutreachService.listTemplates(),
  })
  const template = draft.templateId ? templates?.find((tp) => tp.id === draft.templateId) : undefined

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })

  const saveMutation = useMutation({
    mutationFn: () => adminOutreachService.updateEmail(draft.id, { subject, bodyText: body }),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: () => adminOutreachService.rejectEmail(draft.id, rejectReason.trim() || undefined),
    onSuccess: () => {
      setRejectOpen(false)
      invalidate()
    },
  })

  const previewQuery = useQuery({
    queryKey: ['admin', 'outreach', 'email-preview', draft.id],
    queryFn: () => adminOutreachService.getEmailPreview(draft.id),
    enabled: sendOpen && !sentResult,
    retry: false,
  })
  const preview = previewQuery.data

  const sendMutation = useMutation({
    mutationFn: () => adminOutreachService.sendEmail(draft.id),
    onSuccess: (res) => setSentResult({ messageId: res.messageId }),
  })

  const openSendDialog = () => {
    setSentResult(null)
    sendMutation.reset()
    setSendOpen(true)
  }

  const closeSendDialog = () => {
    setSendOpen(false)
    if (sentResult) invalidate()
  }

  const sendErrorCode = sendMutation.isError
    ? (sendMutation.error as AxiosError<{ error?: { code?: string } }>)?.response?.data?.error?.code ?? null
    : null

  const composed = preview ? splitComposedText(preview.text, draft.bodyText) : null
  const sendBlocked = !preview || preview.violations.length > 0 || preview.suppressed || preview.relationshipHit

  const dirty = subject !== draft.subject || body !== draft.bodyText

  const applyOpener = () => {
    const opener = prospect.openerSuggestion
    if (!opener) return
    const idx = body.indexOf('\n\n')
    if (idx === -1) {
      setBody(`${opener}\n\n${body}`)
      return
    }
    setBody(`${body.slice(0, idx + 2)}${opener}\n\n${body.slice(idx + 2)}`)
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30"><CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-600" />
          <SectionTitle>{t('draftCard')}</SectionTitle>
        </div>
        <div className="flex items-center gap-2">
          {draft.editedByHuman && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
              {t('editedByHuman')}
            </span>
          )}
          {template && (
            <span className="text-[#062E25]/60 whitespace-nowrap">
              {t('templateUsed', { key: template.key, version: template.version })}
            </span>
          )}
        </div>
      </div>

      {prospect.openerSuggestion && (
        <div className="p-3 rounded bg-white border border-[#062E25]/10 space-y-2">
          <p className="font-medium">{t('openerTitle')}</p>
          <p className="text-[#062E25]">{prospect.openerSuggestion}</p>
          <Button variant="outline" size="sm" onClick={applyOpener}>{t('openerApply')}</Button>
        </div>
      )}

      <div>
        <Label>{t('draftSubject')}</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 text-base bg-white" />
      </div>
      <div>
        <Label>{t('draftBody')}</Label>
        <Textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 text-base bg-white" />
      </div>

      <p className="text-[#062E25]/60">{t('draftHint')}</p>

      {saveMutation.isError && <p className="text-red-600">{t('saveFailed')}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={openSendDialog} disabled={dirty || saveMutation.isPending}
                className="bg-[#062E25] hover:bg-[#062E25]/90">
          {t('send')}
        </Button>
        <Button variant="outline" onClick={() => saveMutation.mutate()} disabled={!dirty || saveMutation.isPending}>
          {saveMutation.isPending ? t('saving') : t('save')}
        </Button>
        <Button variant="outline" onClick={() => setRejectOpen(true)} disabled={rejectMutation.isPending}
                className="text-red-600 hover:text-red-700">
          {t('draftReject')}
        </Button>
        {dirty && <span className="text-[#062E25]/60">{t('sendDirtyHint')}</span>}
      </div>

      <Dialog open={sendOpen} onOpenChange={(open) => { if (!open) closeSendDialog() }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('sendDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('sendDialogDescription', { email: prospect.contactEmail ?? '-' })}
            </DialogDescription>
          </DialogHeader>

          {sentResult ? (
            <div className="space-y-3">
              <p className="p-3 rounded bg-green-50 text-green-700 font-medium">{t('sentSuccess')}</p>
              {sentResult.messageId && (
                <p className="text-[#062E25]/75 break-all">
                  {t('messageIdLabel')}: <span className="font-mono">{sentResult.messageId}</span>
                </p>
              )}
              <DialogFooter>
                <Button onClick={closeSendDialog}>{t('closeDialog')}</Button>
              </DialogFooter>
            </div>
          ) : previewQuery.isLoading ? (
            <p className="text-[#062E25]/75">{t('previewLoading')}</p>
          ) : previewQuery.isError || !preview ? (
            <>
              <p className="text-red-600">{t('previewFailed')}</p>
              <DialogFooter>
                <Button variant="outline" onClick={closeSendDialog}>{tc('cancel')}</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[#062E25]/75">{t('composedSubject')}</p>
                <p className="font-medium">{preview.subject}</p>
              </div>

              <div className="max-h-80 overflow-y-auto rounded border border-[#062E25]/10">
                <p className="whitespace-pre-wrap break-words p-3 text-base text-[#062E25]">
                  {composed?.head ?? preview.text}
                </p>
                {composed?.tail && (
                  <div className="border-t border-dashed border-[#062E25]/25 bg-[#062E25]/5 p-3">
                    <p className="text-[#062E25]/75 mb-1">{t('composedBlocksLabel')}</p>
                    <p className="whitespace-pre-wrap break-words text-base text-[#062E25]">{composed.tail}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full',
                  preview.capUsedToday >= preview.capLimit ? 'bg-red-100 text-red-700' : 'bg-[#062E25]/5 text-[#062E25]'
                )}>
                  {t('capToday', { used: preview.capUsedToday, limit: preview.capLimit })}
                </span>
              </div>

              {preview.violations.length > 0 && (
                <div className="p-3 rounded bg-red-50 text-red-700">
                  <p className="font-medium">{t('violationsTitle')}</p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    {preview.violations.map((v) => <li key={v}>{v}</li>)}
                  </ul>
                </div>
              )}
              {preview.suppressed && (
                <p className="p-3 rounded bg-red-50 text-red-700">{t('suppressedWarning')}</p>
              )}
              {preview.relationshipHit && (
                <p className="p-3 rounded bg-red-50 text-red-700">{t('relationshipWarning')}</p>
              )}
              {preview.pvRecheckDue && (
                <p className="p-3 rounded bg-blue-50 text-blue-700">{t('pvRecheckInfo')}</p>
              )}
              {!preview.withinBusinessHours && (
                <p className="p-3 rounded bg-amber-50 text-amber-800">{t('outsideBusinessHours')}</p>
              )}

              {sendMutation.isError && (
                <p className="p-3 rounded bg-red-50 text-red-700">
                  {sendErrorCode && te.has(sendErrorCode) ? te(sendErrorCode) : te('GENERIC')}
                </p>
              )}

              <p className="text-[#062E25]/75">{t('manualDispatchHint')}</p>

              <DialogFooter>
                <Button variant="outline" onClick={closeSendDialog} disabled={sendMutation.isPending}>
                  {tc('cancel')}
                </Button>
                <Button onClick={() => sendMutation.mutate()} disabled={sendBlocked || sendMutation.isPending}>
                  {sendMutation.isPending ? t('sending') : t('sendConfirm')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectTitle')}</DialogTitle>
            <DialogDescription>{t('rejectDescription')}</DialogDescription>
          </DialogHeader>
          <div>
            <Label>{t('rejectReasonLabel')}</Label>
            <Textarea rows={3} value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)} className="mt-1 text-base" />
          </div>
          {rejectMutation.isError && <p className="text-red-600">{t('saveFailed')}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={rejectMutation.isPending}>
              {tc('cancel')}
            </Button>
            <Button onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white">
              {rejectMutation.isPending ? t('saving') : t('rejectConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent></Card>
  )
}

function InboundEmailCard({ email }: { email: OutboundEmail }) {
  const t = useTranslations('admin.outreach.detail')
  const tr = useTranslations('admin.outreach.replyClassifications')
  const [expanded, setExpanded] = useState(false)

  const lines = email.bodyText.split('\n')
  const collapsible = lines.length > 12
  const shownText = !expanded && collapsible ? lines.slice(0, 12).join('\n') : email.bodyText

  return (
    <li className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 mr-6 lg:mr-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium break-all">{email.fromAddress ?? t('emailInbound')}</p>
        {email.replyClassification && (
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full whitespace-nowrap',
            REPLY_CLASSIFICATION_COLORS[email.replyClassification] ?? 'bg-gray-100 text-gray-700'
          )}>
            {tr.has(email.replyClassification) ? tr(email.replyClassification) : email.replyClassification}
          </span>
        )}
      </div>
      <p className="text-[#062E25]/75">
        {t('emailInbound')} · {new Date(email.receivedAt ?? email.createdAt).toLocaleString('de-CH')}
      </p>
      {email.bodyText && (
        <>
          <p className="mt-2 whitespace-pre-wrap break-words text-[#062E25]">
            {shownText}{!expanded && collapsible ? '…' : ''}
          </p>
          {collapsible && (
            <button onClick={() => setExpanded((v) => !v)} className="text-blue-600 hover:underline mt-1">
              {expanded ? t('showLess') : t('showMore')}
            </button>
          )}
        </>
      )}
    </li>
  )
}

function OutboundEmailRow({ email }: { email: OutboundEmail }) {
  const t = useTranslations('admin.outreach.detail')
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="p-3 rounded-lg bg-[#062E25]/5 ml-6 lg:ml-12">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{email.subject}</p>
        <StatusBadge status={email.status} />
      </div>
      <p className="text-[#062E25]/75">
        {t('emailOutbound', { step: email.sequenceStep })} · {new Date(email.sentAt ?? email.createdAt).toLocaleString('de-CH')}
        {email.sentBy && <> · {t('sentBy', { name: `${email.sentBy.firstName} ${email.sentBy.lastName}` })}</>}
      </p>
      {email.bodyText && (
        <button onClick={() => setExpanded((v) => !v)} className="text-blue-600 hover:underline mt-1">
          {expanded ? t('showLess') : t('showBody')}
        </button>
      )}
      {expanded && (
        <p className="mt-2 whitespace-pre-wrap break-words text-[#062E25]">{email.bodyText}</p>
      )}
      {expanded && email.messageId && (
        <p className="text-[#062E25]/60 font-mono mt-1" title={email.messageId}>
          {truncateMessageId(email.messageId)}
        </p>
      )}
    </li>
  )
}

const PROMOTABLE_STATUSES: OutboundProspectStatus[] = [
  'CONTACT_FOUND', 'DRAFTED', 'CONTACTED', 'FOLLOW_UP_DUE', 'REPLIED',
]

function PromoteCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.promote')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('__none__')
  const [industry, setIndustry] = useState('__none__')
  const [timeline, setTimeline] = useState('__none__')
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: () => adminOutreachService.promoteProspect(prospect.id, {
      contactFirstName: firstName.trim() || undefined,
      contactLastName: lastName.trim() || undefined,
      contactPhone: phone.trim() || undefined,
      contactRole: role === '__none__' ? undefined : role,
      industry: industry === '__none__' ? undefined : industry,
      timeline: timeline === '__none__' ? undefined : timeline,
      note: note.trim() || undefined,
    }),
  })

  const openDialog = () => {
    const name = prospect.contactName?.trim() ?? ''
    const spaceIdx = name.indexOf(' ')
    setFirstName(spaceIdx > 0 ? name.slice(0, spaceIdx) : '')
    setLastName(spaceIdx > 0 ? name.slice(spaceIdx + 1).trim() : '')
    setPhone(prospect.contactPhone ?? '')
    setRole('__none__')
    setIndustry('__none__')
    setTimeline('__none__')
    setNote('')
    mutation.reset()
    setOpen(true)
  }

  const closeDialog = () => {
    setOpen(false)
    if (mutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
    }
  }

  const promoted = mutation.data
  const axiosError = mutation.isError
    ? (mutation.error as AxiosError<{
        error?: { code?: string; data?: OutboundPromoteDuplicateData }
        data?: OutboundPromoteDuplicateData
      }>)
    : null
  const errorCode = axiosError?.response?.data?.error?.code ?? null
  const duplicate = errorCode === 'DUPLICATE_COMMERCIAL_LEAD'
    ? axiosError?.response?.data?.error?.data ?? axiosError?.response?.data?.data ?? null
    : null

  if (prospect.status === 'CONVERTED') {
    return (
      <Card className="border-green-200 bg-green-50/40"><CardContent className="p-4 space-y-2">
        <p className="text-[#062E25]">{t('convertedHint')}</p>
        {prospect.commercialLeadId && (
          <Link href={`/${locale}/admin/commercial-leads/${prospect.commercialLeadId}`}
                className="text-blue-600 hover:underline block">
            {t('openLead')}
          </Link>
        )}
      </CardContent></Card>
    )
  }

  if (!PROMOTABLE_STATUSES.includes(prospect.status)) return null

  return (
    <>
      <Button variant="outline" onClick={openDialog}>{t('button')}</Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('dialogTitle')}</DialogTitle>
            <DialogDescription>{t('dialogDescription')}</DialogDescription>
          </DialogHeader>

          {promoted ? (
            <div className="space-y-3">
              <p className="p-3 rounded bg-green-50 text-green-700 font-medium">{t('successTitle')}</p>
              <Link href={`/${locale}/admin/commercial-leads/${promoted.id}`}
                    className="text-blue-600 hover:underline block">
                {t('openCreated', { reference: promoted.reference })}
              </Link>
              <DialogFooter>
                <Button onClick={closeDialog}>{t('close')}</Button>
              </DialogFooter>
            </div>
          ) : duplicate ? (
            <div className="space-y-3">
              <p className="p-3 rounded bg-amber-50 text-amber-800 font-medium">{t('duplicateTitle')}</p>
              <Link href={`/${locale}/admin/commercial-leads/${duplicate.existingLeadId}`}
                    className="text-blue-600 hover:underline block">
                {t('openExisting', { reference: duplicate.existingReference })}
              </Link>
              <p className="text-[#062E25]/75">{t('duplicateMatchedOn', { matchedOn: duplicate.matchedOn })}</p>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>{t('close')}</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded bg-[#062E25]/5 space-y-1">
                <Row label={t('summaryCompany')}><span className="font-medium">{prospect.companyName}</span></Row>
                <Row label={t('summaryEmail')}><span className="break-all">{prospect.contactEmail ?? '-'}</span></Row>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('firstName')}</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 text-base" />
                </div>
                <div>
                  <Label>{t('lastName')}</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 text-base" />
                </div>
              </div>
              <div>
                <Label>{t('phone')}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 text-base" />
              </div>
              <div>
                <Label>{t('role')}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="mt-1 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t('noSelection')}</SelectItem>
                    {Object.entries(contactRoleLabel).map(([v, label]) => (
                      <SelectItem key={v} value={v}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('industry')}</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-1 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t('noSelection')}</SelectItem>
                    {Object.entries(industryLabel).map(([v, label]) => (
                      <SelectItem key={v} value={v}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('timeline')}</Label>
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger className="mt-1 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t('noSelection')}</SelectItem>
                    {Object.entries(timelineLabel).map(([v, label]) => (
                      <SelectItem key={v} value={v}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('note')}</Label>
                <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 text-base" />
              </div>

              {mutation.isError && (
                <p className="p-3 rounded bg-red-50 text-red-700">
                  {errorCode === 'PROSPECT_NOT_PROMOTABLE' ? t('notPromotable') : t('failed')}
                </p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog} disabled={mutation.isPending}>
                  {tc('cancel')}
                </Button>
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                  {mutation.isPending ? t('submitting') : t('submit')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function ThreadCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const nonDraft = prospect.emails.filter((e) => !(e.direction === 'OUTBOUND' && e.status === 'DRAFT'))

  return (
    <Card><CardContent className="p-4">
      <SectionTitle>{t('emailsCard')}</SectionTitle>
      {nonDraft.length === 0 ? (
        <p className="text-[#062E25]/75 mt-2">{t('noEmails')}</p>
      ) : (
        <ol className="space-y-2 mt-2">
          {nonDraft.map((e) => (
            e.direction === 'INBOUND'
              ? <InboundEmailCard key={e.id} email={e} />
              : <OutboundEmailRow key={e.id} email={e} />
          ))}
        </ol>
      )}
    </CardContent></Card>
  )
}

function ActivityCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const ta = useTranslations('admin.outreach.activityTypes')
  const [showAll, setShowAll] = useState(false)

  const activities = showAll ? prospect.activities : prospect.activities.slice(0, 6)

  return (
    <Card><CardContent className="p-4">
      <SectionTitle>{t('activityCard')}</SectionTitle>
      {prospect.activities.length === 0 ? (
        <p className="text-[#062E25]/75 mt-2">{t('noActivity')}</p>
      ) : (
        <>
          <ol className="mt-1">
            {activities.map((a) => {
              const payload = a.payload && Object.keys(a.payload).length > 0
                ? JSON.stringify(a.payload)
                : null
              const note = a.payload && typeof (a.payload as { note?: unknown }).note === 'string'
                ? String((a.payload as { note: string }).note)
                : null
              return (
                <li key={a.id} className="py-2 border-b border-[#062E25]/5 last:border-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium">{ta.has(a.type) ? ta(a.type) : a.type.replace(/_/g, ' ')}</p>
                    <span className="text-[#062E25]/60 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString('de-CH')}
                    </span>
                  </div>
                  {a.actor && <p className="text-[#062E25]/75">{a.actor.firstName} {a.actor.lastName}</p>}
                  {note ? (
                    <p className="text-[#062E25] mt-0.5">{note}</p>
                  ) : payload ? (
                    <p className="text-[#062E25]/60 truncate" title={payload}>{payload}</p>
                  ) : null}
                </li>
              )
            })}
          </ol>
          {prospect.activities.length > 6 && (
            <button onClick={() => setShowAll((v) => !v)} className="text-blue-600 hover:underline mt-2">
              {showAll ? t('showLess') : t('activityShowAll', { count: prospect.activities.length })}
            </button>
          )}
        </>
      )}
    </CardContent></Card>
  )
}

export default function AdminOutreachDetailPage() {
  const params = useParams<{ id: string }>()
  const locale = useLocale()
  const t = useTranslations('admin.outreach.detail')

  const { data: prospect, isLoading } = useQuery({
    queryKey: ['admin', 'outreach', 'prospect', params.id],
    queryFn: () => adminOutreachService.getProspect(params.id),
  })

  if (isLoading || !prospect) return <AdminPageLoader />

  const draft = prospect.emails.find((e) => e.direction === 'OUTBOUND' && e.status === 'DRAFT')

  return (
    <div className="max-w-[1400px]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <Link href={`/${locale}/admin/outreach`}
                className="inline-flex items-center gap-1 text-[#062E25]/60 hover:text-[#062E25]">
            <ChevronLeft className="w-4 h-4" />{t('back')}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-[#062E25] truncate">{prospect.companyName}</h1>
            <StatusBadge status={prospect.status} />
            <span className="font-mono text-[#062E25]/50">{prospect.reference}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-5">
          <PromoteCard prospect={prospect} />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5 text-[#062E25]/75">
        <span>
          {prospect.addressStreet}{prospect.addressNumber ? ' ' + prospect.addressNumber : ''},{' '}
          {prospect.addressPostalCode} {prospect.addressCity}
        </span>
        {prospect.contactEmail && <span className="break-all">{prospect.contactEmail}</span>}
        {prospect.roofAreaM2 != null && (
          <span className="tabular-nums">
            {Math.round(Number(prospect.roofAreaM2)).toLocaleString('de-CH')} m²
            {prospect.roofKwhYear != null
              ? ` · ${Math.round(prospect.roofKwhYear / 1000).toLocaleString('de-CH')} MWh/Jahr`
              : ''}
          </span>
        )}
        {prospect.disqualifyReason && (
          <span className="text-red-700">{t('disqualifyReason')}: {prospect.disqualifyReason}</span>
        )}
        {prospect.nextActionAt && (
          <span>{t('nextActionAt')}: {new Date(prospect.nextActionAt).toLocaleDateString('de-CH')}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          {draft && (
            <DraftEditor key={`${draft.id}-${draft.updatedAt}`} prospect={prospect} draft={draft} />
          )}
          <ContactCard prospect={prospect} />
          <ThreadCard prospect={prospect} />
          <WebsiteTextCard prospect={prospect} />
        </div>
        <div className="space-y-5">
          <RoofCard prospect={prospect} />
          <CompanyCard prospect={prospect} />
          <ActivityCard prospect={prospect} />
        </div>
      </div>
    </div>
  )
}
