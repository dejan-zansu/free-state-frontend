'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { AxiosError } from 'axios'
import { ExternalLink, Mail, MapPin, Sun } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { useGateReasonLabel } from '../prospect-table'
import { PvVerdictBadge } from '@/components/admin/PvVerdictBadge'
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
import { formatRoofMwh, leadHasCustomerTouch } from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import { adminLinkedinService } from '@/services/admin-linkedin.service'
import { adminOutreachService } from '@/services/admin-outreach.service'
import { CallFlagControl } from '../_components/owner-first/CallFlagControl'
import { LetterPanel } from '../_components/owner-first/LetterPanel'
import { OwnershipPanel } from '../_components/owner-first/OwnershipPanel'
import { CARD_CLASS, OUTLINE_BUTTON, PRIMARY_BUTTON } from '../../residential-leads/[id]/leadUtils'
import { LeadDraftContext } from './_lead/LeadDraftContext'
import { LeadFacts } from './_lead/LeadFacts'
import { LeadHeader } from './_lead/LeadHeader'
import { LeadNoteComposer } from './_lead/LeadNoteComposer'
import { LeadOwnerSummary } from './_lead/LeadOwnerSummary'
import { LeadProtocolIntro } from './_lead/LeadProtocolIntro'
import { LeadTabs, type LeadTabValue } from './_lead/LeadTabs'
import { LeadTimeline } from './_lead/LeadTimeline'
import { LEAD_COMPOSER_TEXT_ID, LEAD_REPLY_BLOCKED_STATUSES } from './_lead/lead-shared'
import { buildLeadTimeline } from './_lead/lead-timeline-entries'
import { StandCard } from './_lead/StandCard'
import type {
  OutboundActivity, OutboundPromoteDuplicateData, OutboundProspectDetail, OutboundProspectEmail,
  OutboundProspectStatus,
} from '@/types/admin-outreach'
import {
  OUTBOUND_CHANNELS, QRL_CRITERIA, type OutboundChannel, type QrlCriterion,
} from '@/types/outreach/owner-first'

function splitComposedText(text: string, draftBody: string): { head: string; tail: string | null } {
  for (const candidate of [draftBody, draftBody.trimEnd(), draftBody.trim()]) {
    if (candidate && text.startsWith(candidate)) {
      return { head: candidate, tail: text.slice(candidate.length).replace(/^\n+/, '') }
    }
  }
  return { head: text, tail: null }
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

function LinkedinCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(prospect.linkedinProfileUrl ?? '')
  const [name, setName] = useState(prospect.linkedinPersonName ?? prospect.contactName ?? '')
  const [role, setRole] = useState(prospect.linkedinPersonRole ?? prospect.contactRole ?? '')
  const touch = prospect.linkedinTouch
  const rejected = prospect.linkedinConfidence === 'rejected'
  const hasProfile = Boolean(prospect.linkedinProfileUrl) && !rejected

  const save = useMutation({
    mutationFn: (profileUrl: string | null) => adminLinkedinService.setProfile(prospect.id, {
      profileUrl,
      ...(profileUrl && name.trim() ? { personName: name.trim() } : {}),
      ...(profileUrl && role.trim() ? { personRole: role.trim() } : {}),
    }),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach', 'prospect', prospect.id] })
    },
  })
  const saveError = save.error
    ? (save.error as AxiosError<{ error?: { code?: string } }>)?.response?.data?.error?.code ?? 'generic'
    : null

  return (
    <Card><CardContent className="p-4 space-y-2">
      <SectionTitle>{t('cardTitle')}</SectionTitle>
      {hasProfile ? (
        <div className="space-y-1">
          <p className="font-medium">{prospect.linkedinPersonName ?? prospect.contactName ?? '-'}</p>
          {prospect.linkedinPersonRole && <p className="text-[#062E25]/75">{prospect.linkedinPersonRole}</p>}
          <div className="flex flex-wrap gap-x-4">
            <a href={prospect.linkedinProfileUrl!} target="_blank" rel="noreferrer"
               className="text-blue-600 hover:underline inline-flex items-center gap-1">
              {t('openProfile')}<ExternalLink className="w-3.5 h-3.5" />
            </a>
            {prospect.linkedinCompanyUrl && (
              <a href={prospect.linkedinCompanyUrl} target="_blank" rel="noreferrer"
                 className="text-blue-600 hover:underline inline-flex items-center gap-1">
                {t('openCompanyPage')}<ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-[#062E25]/60">
            {prospect.linkedinSource && t.has(`sources.${prospect.linkedinSource}`)
              ? t(`sources.${prospect.linkedinSource}`) : prospect.linkedinSource}
            {prospect.linkedinConfidence === 'review' ? ` · ${t('needsReview')}` : ''}
          </p>
        </div>
      ) : (
        <p className="text-[#062E25]/75">{rejected ? t('profileRejected') : t('noProfile')}</p>
      )}

      {touch && (
        <div className="pt-2 border-t border-[#062E25]/10 space-y-1">
          <p className="font-medium">{t(`touchStatus.${touch.status}`)}</p>
          <p className="text-[#062E25]/75">
            {t('touchBy', {
              name: `${touch.sender.user.firstName} ${touch.sender.user.lastName}`.trim(),
              date: new Date(touch.requestedAt).toLocaleDateString('de-CH'),
            })}
          </p>
          {touch.replyOutcome && <p className="text-[#062E25]/75">{t(`outcomes.${touch.replyOutcome}`)}</p>}
        </div>
      )}

      {!touch && !editing && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            {hasProfile ? t('changeProfile') : t('addProfile')}
          </Button>
          {hasProfile && (
            <Button size="sm" variant="ghost" disabled={save.isPending} onClick={() => save.mutate(null)}>
              {t('removeProfile')}
            </Button>
          )}
        </div>
      )}
      {!touch && editing && (
        <div className="space-y-2 pt-1">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.linkedin.com/in/..." />
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('personName')} />
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t('personRole')} />
          {saveError && (
            <p className="text-red-700">{t.has(`errors.${saveError}`) ? t(`errors.${saveError}`) : t('errors.generic')}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" disabled={!url.trim() || save.isPending} onClick={() => save.mutate(url.trim())}>
              {t('save')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>{t('cancel')}</Button>
          </div>
        </div>
      )}
    </CardContent></Card>
  )
}

function RoofCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const tw = useTranslations('admin.outreach.work')
  const [segmentsOpen, setSegmentsOpen] = useState(true)

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
        <SectionTitle>{tw('roof.title')}</SectionTitle>
        <PvVerdictBadge verdict={prospect.pvVerdict} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {e != null && n != null && (
        <figure className="max-w-xl">
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
        <Row label={tw('facts.potential')}>
          {prospect.roofKwhYear != null ? (
            <>
              {tw('facts.potentialValue', { mwh: formatRoofMwh(prospect.roofKwhYear) })}
              <span className="block text-[#062E25]/60">{tw('facts.potentialHint')}</span>
            </>
          ) : '-'}
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
        {prospect.linkOpens.map((open) => (
          <Row key={open.kind} label={t(open.kind === 'roof' ? 'linkOpenedRoof' : 'linkOpenedReference')}>
            {t('linkOpenedValue', {
              views: open.views,
              last: new Date(open.lastAt).toLocaleString('de-CH', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          </Row>
        ))}
      </div>
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
          <p className="text-[#062E25]/60">{tw('facts.potentialHint')}</p>
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

function DraftEditor({
  prospect, draft, context,
}: { prospect: OutboundProspectDetail; draft: OutboundProspectEmail; context?: React.ReactNode }) {
  const t = useTranslations('admin.outreach.detail')
  const tw = useTranslations('admin.outreach.work')
  const tc = useTranslations('admin.common')
  const te = useTranslations('admin.outreach.sendErrors')
  const gateReason = useGateReasonLabel()
  const queryClient = useQueryClient()

  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.bodyText)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [sendOpen, setSendOpen] = useState(false)
  const [sentResult, setSentResult] = useState<{ messageId: string } | null>(null)
  const [previewOnly, setPreviewOnly] = useState(false)

  const template = draft.template

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })

  const saveMutation = useMutation({
    mutationFn: () => adminOutreachService.updateEmail(draft.id, { subject, bodyText: body }),
    onSuccess: () => {
      toast.success(tw('toast.draftSaved'))
      invalidate()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => adminOutreachService.rejectEmail(draft.id, rejectReason.trim() || undefined),
    onSuccess: () => {
      setRejectOpen(false)
      toast.success(tw('toast.draftDiscarded'))
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

  const openSendDialog = (onlyPreview = false) => {
    setPreviewOnly(onlyPreview)
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
    <Card id="lead-draft" className="mb-6 scroll-mt-4 border-amber-200 bg-amber-50 py-0"><CardContent className="p-4 space-y-3 text-base">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-600" />
          {prospect.work.draft
            ? <h3 className="text-lg font-semibold text-[#062E25]">{tw('draft.title')}</h3>
            : <SectionTitle>{t('draftCard')}</SectionTitle>}
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

      {context}

      {prospect.openerSuggestion && (
        <div className="p-3 rounded bg-white border border-[#062E25]/10 space-y-2">
          <p className="font-medium">{t('openerTitle')}</p>
          <p className="text-[#062E25]">{prospect.openerSuggestion}</p>
          <Button variant="outline" size="sm" onClick={applyOpener}>{t('openerApply')}</Button>
        </div>
      )}

      <div>
        <Label className="text-base">{t('draftSubject')}</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 text-base md:text-base bg-white" />
      </div>
      <div>
        <Label className="text-base">{t('draftBody')}</Label>
        <Textarea id="lead-draft-text" aria-label={tw('draft.textAria')} rows={14} value={body}
                  onChange={(e) => setBody(e.target.value)} className="mt-1 text-base md:text-base bg-white" />
      </div>

      {prospect.status === 'REPLIED' || prospect.status === 'ANSWERED' ? (
        <p className="text-[#062E25]/60">{t('draftHintReply')}</p>
      ) : prospect.draftGate ? (
        <p className="text-red-700">
          {t('draftHintGated', { reason: gateReason(prospect.draftGate.reason), detail: prospect.draftGate.detail })}
        </p>
      ) : (
        <p className="text-[#062E25]/60">{t('draftHintCold')}</p>
      )}

      {saveMutation.isError && <p className="text-red-600">{t('saveFailed')}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg" onClick={() => openSendDialog()} disabled={dirty || saveMutation.isPending}
                className={PRIMARY_BUTTON}>
          {tw('draft.send')}
        </Button>
        <Button size="lg" variant="outline" onClick={() => saveMutation.mutate()} disabled={!dirty || saveMutation.isPending}
                className={OUTLINE_BUTTON}>
          {saveMutation.isPending ? t('saving') : t('save')}
        </Button>
        <Button size="lg" variant="outline" onClick={() => openSendDialog(true)} disabled={dirty || saveMutation.isPending}
                className={OUTLINE_BUTTON}>
          {tw('draft.preview')}
        </Button>
        <Button size="lg" variant="outline" onClick={() => setRejectOpen(true)} disabled={rejectMutation.isPending}
                className={cn(OUTLINE_BUTTON, 'text-red-600 hover:text-red-700')}>
          {tw('draft.discard')}
        </Button>
        {dirty && <span className="text-[#062E25]/60">{t('sendDirtyHint')}</span>}
      </div>
      <p className="text-[#062E25]/60">{tw('draft.footnote')}</p>

      <Dialog open={sendOpen} onOpenChange={(open) => { if (!open) closeSendDialog() }}>
        <DialogContent className="sales-type-scale sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewOnly ? tw('draft.preview') : t('sendDialogTitle')}</DialogTitle>
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

              {!previewOnly && <p className="text-[#062E25]/75">{t('manualDispatchHint')}</p>}

              <DialogFooter>
                <Button variant="outline" onClick={closeSendDialog} disabled={sendMutation.isPending}>
                  {previewOnly ? t('closeDialog') : tc('cancel')}
                </Button>
                {!previewOnly && (
                  <Button onClick={() => sendMutation.mutate()} disabled={sendBlocked || sendMutation.isPending}>
                    {sendMutation.isPending ? t('sending') : t('sendConfirm')}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sales-type-scale">
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

const PROMOTABLE_STATUSES: OutboundProspectStatus[] = [
  'CONTACT_FOUND', 'DRAFTED', 'CONTACTED', 'FOLLOW_UP_DUE', 'REPLIED', 'ANSWERED', 'SNOOZED',
]

function defaultFollowUpDate(): string {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function PromoteCard({ prospect, onClose }: { prospect: OutboundProspectDetail; onClose: () => void }) {
  const t = useTranslations('admin.outreach.promote')
  const tl = useTranslations('admin.outreach.leads')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const queryClient = useQueryClient()

  const contactName = prospect.contactName?.trim() ?? ''
  const spaceIdx = contactName.indexOf(' ')

  const [leadCriterion, setLeadCriterion] = useState<QrlCriterion>('OFFER_REQUEST')
  const [leadChannel, setLeadChannel] = useState<OutboundChannel>('EMAIL')
  const [assignedToId, setAssignedToId] = useState(prospect.assignedTo?.id ?? '')
  const [nextFollowUpAt, setNextFollowUpAt] = useState(defaultFollowUpDate)
  const [firstName, setFirstName] = useState(spaceIdx > 0 ? contactName.slice(0, spaceIdx) : '')
  const [lastName, setLastName] = useState(spaceIdx > 0 ? contactName.slice(spaceIdx + 1).trim() : '')
  const [phone, setPhone] = useState(prospect.contactPhone ?? '')
  const [role, setRole] = useState('__none__')
  const [industry, setIndustry] = useState('__none__')
  const [timeline, setTimeline] = useState('__none__')
  const [note, setNote] = useState('')

  const { data: assignees } = useQuery({
    queryKey: ['admin', 'outreach', 'assignees'],
    queryFn: () => adminOutreachService.listAssignees(),
  })

  const mutation = useMutation({
    mutationFn: () => adminOutreachService.promoteProspect(prospect.id, {
      assignedToId,
      nextFollowUpAt: nextFollowUpAt
        ? new Date(`${nextFollowUpAt}T09:00:00`).toISOString()
        : undefined,
      contactFirstName: firstName.trim() || undefined,
      contactLastName: lastName.trim() || undefined,
      contactPhone: phone.trim() || undefined,
      contactRole: role === '__none__' ? undefined : role,
      industry: industry === '__none__' ? undefined : industry,
      timeline: timeline === '__none__' ? undefined : timeline,
      note: note.trim() || undefined,
      leadCriterion,
      leadChannel,
    }),
  })

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

  const attachMutation = useMutation({
    mutationFn: () => {
      if (!duplicate) throw new Error('no duplicate lead to attach')
      return adminOutreachService.attachLead(prospect.id, duplicate.existingLeadId, {
        leadCriterion,
        leadChannel,
        note: note.trim() || undefined,
      })
    },
  })

  const closeDialog = () => {
    onClose()
    if (mutation.isSuccess || attachMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
    }
  }

  return (
    <>
      <Dialog open onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="sales-type-scale sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
            attachMutation.data ? (
              <div className="space-y-3">
                <p className="p-3 rounded bg-green-50 text-green-700 font-medium">{t('attachSuccess')}</p>
                <Link href={`/${locale}/admin/commercial-leads/${attachMutation.data.id}`}
                      className="text-blue-600 hover:underline block">
                  {t('openExisting', { reference: attachMutation.data.reference })}
                </Link>
                <DialogFooter>
                  <Button onClick={closeDialog}>{t('close')}</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="p-3 rounded bg-amber-50 text-amber-800 font-medium">{t('duplicateTitle')}</p>
                <Link href={`/${locale}/admin/commercial-leads/${duplicate.existingLeadId}`}
                      className="text-blue-600 hover:underline block">
                  {t('openExisting', { reference: duplicate.existingReference })}
                </Link>
                <p className="text-[#062E25]/75">{t('duplicateMatchedOn', { matchedOn: duplicate.matchedOn })}</p>
                <p className="text-[#062E25]/75">{t('attachHint')}</p>
                {attachMutation.isError && (
                  <p className="p-3 rounded bg-red-50 text-red-700">{t('attachFailed')}</p>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog} disabled={attachMutation.isPending}>
                    {t('close')}
                  </Button>
                  <Button onClick={() => attachMutation.mutate()} disabled={attachMutation.isPending}>
                    {attachMutation.isPending ? t('attaching') : t('attachExisting')}
                  </Button>
                </DialogFooter>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded bg-[#062E25]/5 space-y-1">
                <Row label={t('summaryCompany')}><span className="font-medium">{prospect.companyName}</span></Row>
                <Row label={t('summaryEmail')}><span className="break-all">{prospect.contactEmail ?? '-'}</span></Row>
              </div>

              <div>
                <Label>{t('assignee')}</Label>
                <Select value={assignedToId} onValueChange={setAssignedToId}>
                  <SelectTrigger className="mt-1 text-base">
                    <SelectValue placeholder={t('assigneePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(assignees ?? []).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('nextFollowUpAt')}</Label>
                <Input type="date" value={nextFollowUpAt}
                       onChange={(e) => setNextFollowUpAt(e.target.value)} className="mt-1 text-base" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('leadCriterion')}</Label>
                  <Select value={leadCriterion} onValueChange={(v) => setLeadCriterion(v as QrlCriterion)}>
                    <SelectTrigger className="mt-1 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QRL_CRITERIA.map((value) => (
                        <SelectItem key={value} value={value}>{tl(`criterion.${value}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('leadChannel')}</Label>
                  <Select value={leadChannel} onValueChange={(v) => setLeadChannel(v as OutboundChannel)}>
                    <SelectTrigger className="mt-1 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OUTBOUND_CHANNELS.map((value) => (
                        <SelectItem key={value} value={value}>{tl(`channel.${value}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[#062E25]/75">{t('leadHint')}</p>

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
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !assignedToId}>
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

function ReplyComposer({ prospect, onClose }: { prospect: OutboundProspectDetail; onClose: () => void }) {
  const t = useTranslations('admin.outreach.detail')
  const tw = useTranslations('admin.outreach.work')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const lastSent = [...prospect.emails]
    .filter((e) => e.direction === 'OUTBOUND' && e.status === 'SENT')
    .sort((a, b) => new Date(b.sentAt ?? b.createdAt).getTime() - new Date(a.sentAt ?? a.createdAt).getTime())[0]

  const greeting = prospect.contactName?.trim()
    ? `Guten Tag ${prospect.contactName.trim()}`
    : 'Sehr geehrte Damen und Herren'

  const [replySubject, setReplySubject] = useState(lastSent?.subject ?? '')
  const [replyBody, setReplyBody] = useState(`${greeting}\n\n\n\nFreundliche Grüsse\nIvan Miric`)

  useEffect(() => {
    const field = bodyRef.current
    if (!field) return
    const caret = greeting.length + 2
    field.focus({ preventScroll: true })
    field.setSelectionRange(caret, caret)
  }, [greeting])

  const replyMutation = useMutation({
    mutationFn: () => adminOutreachService.createManualReply(prospect.id, {
      bodyText: replyBody,
      ...(replySubject.trim() ? { subject: replySubject.trim() } : {}),
    }),
    onSuccess: () => {
      toast.success(tw('toast.draftSaved'))
      onClose()
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
    },
  })

  return (
    <div id="lead-composer" className="mb-6 scroll-mt-4 p-3 rounded-lg border border-[#062E25]/10 bg-[#062E25]/5 space-y-2 text-base">
      <p className="font-medium">{leadHasCustomerTouch(prospect.work) ? t('replyTitle') : t('composeTitle')}</p>
      <div>
        <Label className="text-base">{t('draftSubject')}</Label>
        <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)}
               className="mt-1 text-base md:text-base bg-white" />
      </div>
      <Textarea ref={bodyRef} id={LEAD_COMPOSER_TEXT_ID} aria-label={t('draftBody')} rows={8} value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="text-base md:text-base bg-white" />
      <p className="text-[#062E25]/60">{t('replyHint')}</p>
      {replyMutation.isError && <p className="text-red-600">{t('replyFailed')}</p>}
      <div className="flex items-center gap-2">
        <Button size="lg" onClick={() => replyMutation.mutate()}
                disabled={replyMutation.isPending || !replyBody.trim() || !replySubject.trim()}
                className={PRIMARY_BUTTON}>
          {replyMutation.isPending ? t('saving') : t('replyCreate')}
        </Button>
        <Button size="lg" variant="outline" onClick={onClose} disabled={replyMutation.isPending}
                className={OUTLINE_BUTTON}>
          {tc('cancel')}
        </Button>
      </div>
    </div>
  )
}

type ActivityGroup = {
  key: string
  type: OutboundActivity['type']
  payload: Record<string, unknown> | null
  actor: OutboundActivity['actor']
  createdAt: string
  count: number
}

function groupActivities(activities: OutboundActivity[]): ActivityGroup[] {
  const groups: ActivityGroup[] = []
  for (const activity of activities) {
    const signature = `${activity.type}|${JSON.stringify(activity.payload ?? {})}|${activity.actorId ?? ''}`
    const previous = groups[groups.length - 1]
    if (previous && previous.key === signature) {
      previous.count += 1
      continue
    }
    groups.push({
      key: signature,
      type: activity.type,
      payload: activity.payload,
      actor: activity.actor,
      createdAt: activity.createdAt,
      count: 1,
    })
  }
  return groups
}

function asText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  return null
}

function ActivityRow({ group }: { group: ActivityGroup }) {
  const t = useTranslations('admin.outreach.detail')
  const ta = useTranslations('admin.outreach.activityTypes')
  const tf = useTranslations('admin.outreach.activityFields')
  const ts = useTranslations('admin.outreach.activitySources')
  const trs = useTranslations('admin.outreach.activityReasons')
  const trc = useTranslations('admin.outreach.replyClassifications')
  const tli = useTranslations('admin.outreach.linkedin')
  const [open, setOpen] = useState(false)

  const payload = group.payload ?? {}
  const note = asText(payload.note)
  const chips: string[] = []

  const source = asText(payload.source)
  if (source) chips.push(ts.has(source) ? ts(source) : source)

  const reason = asText(payload.reason)
  if (reason) chips.push(trs.has(reason) ? trs(reason) : reason)

  const linkedinAction = group.type === 'LINKEDIN' ? asText(payload.action) : null
  if (linkedinAction) {
    chips.push(tli.has(`actions.${linkedinAction}`) ? tli(`actions.${linkedinAction}`) : linkedinAction)
  }
  const linkedinOutcome = group.type === 'LINKEDIN' ? asText(payload.outcome) : null
  if (linkedinOutcome && tli.has(`outcomes.${linkedinOutcome}`)) chips.push(tli(`outcomes.${linkedinOutcome}`))

  const classification = asText(payload.classification)
  if (classification) {
    chips.push(trc.has(classification) ? trc(classification) : classification)
  }
  if (typeof payload.confidence === 'number') {
    chips.push(tf('confidence', { value: Math.round(payload.confidence * 100) }))
  }

  const egid = asText(payload.egid)
  if (egid) chips.push(tf('egid', { value: egid }))
  if (Array.isArray(payload.companies)) {
    chips.push(tf('companies', { count: payload.companies.length }))
  }
  if (typeof payload.garea === 'number') {
    chips.push(`${Math.round(payload.garea).toLocaleString('de-CH')} m²`)
  }

  const osmName = asText(payload.osmName)
  if (osmName) chips.push(osmName)
  const zefixName = asText(payload.zefixName)
  if (zefixName) chips.push(zefixName)

  if (typeof payload.version === 'number') chips.push(tf('version', { value: payload.version }))
  if (typeof payload.sequenceStep === 'number') {
    chips.push(tf('step', { value: payload.sequenceStep }))
  }

  const to = asText(payload.to)
  if (to) chips.push(tf('to', { value: to }))
  const fromAddress = asText(payload.fromAddress)
  if (fromAddress) chips.push(tf('from', { value: fromAddress }))
  const subject = asText(payload.subject)
  if (subject) chips.push(`«${subject}»`)
  const keyword = asText(payload.keyword)
  if (keyword) chips.push(tf('keyword', { value: keyword }))
  const statusCode = asText(payload.statusCode)
  if (statusCode) chips.push(tf('statusCode', { value: statusCode }))
  const match = asText(payload.match)
  if (match) chips.push(tf('match', { value: match }))
  const email = asText(payload.email)
  if (email) chips.push(email)

  const hasPayload = Object.keys(payload).length > 0

  return (
    <li className="py-2.5 border-b border-[#062E25]/5 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-medium">
          {ta.has(group.type) ? ta(group.type) : group.type.replace(/_/g, ' ')}
          {group.count > 1 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-[#062E25]/5 text-[#062E25]/75">
              {t('activityRepeat', { count: group.count })}
            </span>
          )}
        </p>
        <span className="text-[#062E25]/60 whitespace-nowrap">
          {new Date(group.createdAt).toLocaleString('de-CH')}
          {group.actor ? ` · ${group.actor.firstName} ${group.actor.lastName}` : ''}
        </span>
      </div>

      {chips.length > 0 && (
        <p className="text-[#062E25]/75 break-words">{chips.join(' · ')}</p>
      )}
      {note && <p className="text-[#062E25] mt-0.5 whitespace-pre-wrap break-words">{note}</p>}

      {hasPayload && (
        <>
          <button onClick={() => setOpen((v) => !v)} className="text-blue-600 hover:underline mt-1">
            {open ? t('activityDetailsHide') : t('activityDetails')}
          </button>
          {open && (
            <pre className="mt-1 p-2 rounded bg-[#062E25]/5 overflow-x-auto font-mono text-[#062E25]/75">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
        </>
      )}
    </li>
  )
}

function ActivityCard({ prospect }: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.detail')
  const [showAll, setShowAll] = useState(false)

  const groups = useMemo(() => groupActivities(prospect.activities), [prospect.activities])
  const shown = showAll ? groups : groups.slice(0, 8)

  return (
    <Card><CardContent className="p-4">
      <SectionTitle>{t('activityCard')}</SectionTitle>
      {groups.length === 0 ? (
        <p className="text-[#062E25]/75 mt-2">{t('noActivity')}</p>
      ) : (
        <>
          <ol className="mt-1">
            {shown.map((group) => <ActivityRow key={`${group.key}-${group.createdAt}`} group={group} />)}
          </ol>
          {groups.length > 8 && (
            <button onClick={() => setShowAll((v) => !v)} className="text-blue-600 hover:underline mt-2">
              {showAll ? t('showLess') : t('activityShowAll', { count: groups.length })}
            </button>
          )}
        </>
      )}
    </CardContent></Card>
  )
}

function ProspectWorkspace({ prospect }: { prospect: OutboundProspectDetail }) {
  const [tab, setTab] = useState<LeadTabValue>('verlauf')
  const [composerOpen, setComposerOpen] = useState(false)
  const [promoteOpen, setPromoteOpen] = useState(false)
  const timelineCount = useMemo(() => buildLeadTimeline(prospect).length, [prospect])

  const draft = prospect.emails.find((e) => e.id === prospect.work.draft?.id)
    ?? prospect.emails.find((e) => e.direction === 'OUTBOUND' && e.status === 'DRAFT')
  const hasLead = prospect.leads.length > 0
  const canReply = !!prospect.contactEmail && !LEAD_REPLY_BLOCKED_STATUSES.includes(prospect.status)
  const reopenedClosedRow = prospect.work.reopened
    && (prospect.status === 'NOT_INTERESTED' || prospect.status === 'EXPIRED')
  const canPromote = !prospect.commercialLeadId
    && (PROMOTABLE_STATUSES.includes(prospect.status) || reopenedClosedRow)

  const revealInVerlauf = (targetId: string, focusId?: string) => {
    setTab('verlauf')
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true })
    })
  }

  const openDraft = () => revealInVerlauf('lead-draft', 'lead-draft-text')

  const openWriter = () => {
    if (draft) {
      openDraft()
      return
    }
    setComposerOpen(true)
    revealInVerlauf('lead-composer', LEAD_COMPOSER_TEXT_ID)
  }

  return (
    <div className="sales-type-scale max-w-[1400px]">
      <LeadHeader
        prospect={prospect}
        hasLead={hasLead}
        hasDraft={!!draft}
        canReply={canReply}
        canPromote={canPromote}
        onOpenDraft={openDraft}
        onWrite={openWriter}
        onPromote={() => setPromoteOpen(true)}
        onOpenContact={() => setTab('firma')}
      />
      <StandCard prospect={prospect} hasLead={hasLead} />
      <LeadFacts prospect={prospect} />

      <LeadTabs
        value={tab}
        onValueChange={setTab}
        counts={{ verlauf: timelineCount, protokoll: prospect.activities.length }}
        panels={{
          verlauf: (
            <Card className={cn(CARD_CLASS, 'mb-6')}><CardContent className="p-4 sm:p-6">
              {draft && (
                <DraftEditor key={`${draft.id}-${draft.updatedAt}`} prospect={prospect} draft={draft}
                             context={<LeadDraftContext prospect={prospect} />} />
              )}
              {composerOpen && <ReplyComposer prospect={prospect} onClose={() => setComposerOpen(false)} />}
              <LeadNoteComposer prospectId={prospect.id} />
              <LeadTimeline prospect={prospect} onShowProtocol={() => setTab('protokoll')} />
            </CardContent></Card>
          ),
          dach: <RoofCard prospect={prospect} />,
          eigentum: (
            <>
              <LeadOwnerSummary prospect={prospect} />
              <OwnershipPanel prospect={prospect} />
            </>
          ),
          firma: (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <ContactCard prospect={prospect} />
                <CompanyCard prospect={prospect} />
              </div>
              <CallFlagControl prospect={prospect} />
              <WebsiteTextCard prospect={prospect} />
            </div>
          ),
          brief: (
            <div className="space-y-5">
              <LetterPanel prospect={prospect} />
              <LinkedinCard key={`${prospect.linkedinProfileUrl}-${prospect.linkedinConfidence}`} prospect={prospect} />
            </div>
          ),
          protokoll: (
            <>
              <LeadProtocolIntro prospect={prospect} />
              <ActivityCard prospect={prospect} />
            </>
          ),
        }}
      />

      {promoteOpen && <PromoteCard prospect={prospect} onClose={() => setPromoteOpen(false)} />}
    </div>
  )
}

export default function AdminOutreachDetailPage() {
  const params = useParams<{ id: string }>()

  const { data: prospect, isLoading } = useQuery({
    queryKey: ['admin', 'outreach', 'prospect', params.id],
    queryFn: () => adminOutreachService.getProspect(params.id),
  })

  if (isLoading || !prospect) return <AdminPageLoader />

  return <ProspectWorkspace key={prospect.id} prospect={prospect} />
}
