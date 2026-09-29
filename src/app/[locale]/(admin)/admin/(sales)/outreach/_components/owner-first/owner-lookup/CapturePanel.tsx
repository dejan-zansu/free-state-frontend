'use client'

// Capture of one extract, fastest path first: paste the text copied from the
// Terravis PDF, or drop the saved PDF, or type into the form. Paste and PDF
// prefill the form, the operator corrects it, the preview shows what will
// happen, and Cmd+Enter (Ctrl+Enter) confirms. "Nicht gefunden", "Nicht
// digitalisiert" and "Falsches Grundstück bezogen" close the item.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ownerLookupService } from '@/services/outreach/owner-lookup.service'
import type {
  ExtractParty,
  ExtractPartyRole,
  OwnerLookupItem,
  PreviewResponse,
  TerravisExtract,
} from '@/types/outreach/owner-lookup'

import { apiErrorCode, cleanExtract, emptyExtract, emptyParty } from './format'
import { ResolutionPreview } from './ResolutionPreview'

type CaptureMethod = 'paste' | 'pdf' | 'form'
type Closing = 'not_found' | 'not_digitised' | 'void' | 'release'

const ROLES: ExtractPartyRole[] = ['OWNER', 'CORRESPONDENCE', 'MANAGER']
const EGRID = /CH[0-9A-Z]{12}/

function sameEgrid(a: string | null, b: string): boolean {
  const compact = (a ?? '').replace(/\s+/g, '').toUpperCase().match(EGRID)?.[0]
  return !compact || compact === b.toUpperCase()
}

export function CapturePanel(props: {
  item: OwnerLookupItem
  onDone: () => void
}) {
  const t = useTranslations('admin.outreach.ownerLookup')
  const { item } = props
  const [text, setText] = useState('')
  const [form, setForm] = useState<TerravisExtract>(() =>
    emptyExtract(item.egrid)
  )
  const [method, setMethod] = useState<CaptureMethod>('form')
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [familyOccupantId, setFamilyOccupantId] = useState<string | null>(null)
  const [pdfNote, setPdfNote] = useState<string | null>(null)
  const [armed, setArmed] = useState<Closing | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  // Bumped on every form change. A preview answer for an older form is
  // dropped, so the operator never confirms against a stale preview.
  const formVersion = useRef(0)

  // Zefix picks are keyed by party position and the family choice by
  // occupant, so both are only valid for the form they were made on.
  const invalidatePreview = () => {
    formVersion.current += 1
    setPreview(null)
    setPicks({})
    setFamilyOccupantId(null)
  }

  const errorToast = useCallback(
    (error: unknown) => {
      const code = apiErrorCode(error)
      const key = code ? `errors.${code}` : null
      toast.error(key && t.has(key) ? t(key) : t('errors.generic'))
    },
    [t]
  )

  const fillFromPreview = (data: PreviewResponse, from: CaptureMethod) => {
    formVersion.current += 1
    setPicks({})
    setFamilyOccupantId(null)
    setPreview(data)
    setMethod(from)
    const parties =
      data.plan.extract.parties.length > 0
        ? data.plan.extract.parties
        : emptyExtract(item.egrid).parties
    setForm({
      ...data.plan.extract,
      egrid: data.plan.extract.egrid ?? item.egrid,
      parties,
    })
  }

  const parseText = useMutation({
    mutationFn: () => ownerLookupService.preview(item.id, { text }),
    onSuccess: data => fillFromPreview(data, 'paste'),
    onError: errorToast,
  })

  const uploadPdf = useMutation({
    mutationFn: (file: File) => ownerLookupService.uploadPdf(item.id, file),
    onSuccess: data => {
      setText(data.text)
      fillFromPreview(data, 'pdf')
      setPdfNote(
        data.stored
          ? t('capture.pdfStored')
          : t('capture.pdfNotStored', { reason: data.storageError ?? '-' })
      )
      if (data.parsed?.warnings.includes('pdf_without_text'))
        toast.error(t('capture.pdfWithoutText'))
    },
    onError: errorToast,
  })

  const refresh = useMutation({
    mutationFn: (input: {
      picks: Record<string, string>
      familyOccupantId: string | null
      extract: TerravisExtract
      version: number
    }) =>
      ownerLookupService.preview(item.id, {
        extract: cleanExtract(input.extract),
        picks: input.picks,
        familyOccupantId: input.familyOccupantId,
      }),
    onSuccess: (data, input) => {
      if (input.version === formVersion.current) setPreview(data)
    },
    onError: errorToast,
  })

  const confirm = useMutation({
    mutationFn: () =>
      ownerLookupService.submitResult(item.id, {
        extract: cleanExtract(form),
        text: text.trim() ? text : undefined,
        picks,
        familyOccupantId,
        captureMethod: method,
      }),
    onSuccess: data => {
      toast.success(
        t('capture.resolved', {
          resolution: t(`resolution.${data.result.resolution}`),
        })
      )
      props.onDone()
    },
    onError: errorToast,
  })

  const close = useMutation({
    mutationFn: (kind: Closing) => {
      if (kind === 'release') return ownerLookupService.release(item.id)
      if (kind === 'void')
        return ownerLookupService.voidLookup(item.id, {
          text: text.trim() ? text : undefined,
        })
      return ownerLookupService.notFound(item.id, { reason: kind })
    },
    onSuccess: () => {
      setArmed(null)
      props.onDone()
    },
    onError: errorToast,
  })

  const busy =
    parseText.isPending ||
    uploadPdf.isPending ||
    refresh.isPending ||
    confirm.isPending ||
    close.isPending
  const hasOwner = form.parties.some(
    party => party.role === 'OWNER' && party.name.trim()
  )
  const mismatch = !sameEgrid(form.egrid, item.egrid)
  const pickMissing =
    preview?.plan.parties.some(
      party => party.needsPick && !picks[String(party.position)]
    ) ?? false
  const canConfirm =
    !busy && hasOwner && !mismatch && !pickMissing && preview !== null

  const doConfirm = () => {
    if (canConfirm) confirm.mutate()
  }

  // Cmd+Enter or Ctrl+Enter anywhere in the panel confirms.
  const confirmRef = useRef(doConfirm)
  useEffect(() => {
    confirmRef.current = doConfirm
  })

  const updateParty = (index: number, patch: Partial<ExtractParty>) => {
    setMethod('form')
    invalidatePreview()
    setForm(current => ({
      ...current,
      parties: current.parties.map((party, i) =>
        i === index ? { ...party, ...patch } : party
      ),
    }))
  }

  const repreview = (next: {
    picks?: Record<string, string>
    familyOccupantId?: string | null
  }) => {
    const nextPicks = next.picks ?? picks
    const nextFamily =
      next.familyOccupantId !== undefined
        ? next.familyOccupantId
        : familyOccupantId
    if (next.picks) setPicks(nextPicks)
    if (next.familyOccupantId !== undefined) setFamilyOccupantId(nextFamily)
    if (hasOwner)
      refresh.mutate({
        picks: nextPicks,
        familyOccupantId: nextFamily,
        extract: form,
        version: formVersion.current,
      })
  }

  const arm = (kind: Closing) => {
    if (armed === kind) close.mutate(kind)
    else setArmed(kind)
  }

  return (
    <div
      className="space-y-4 rounded bg-[#062E25]/[0.03] p-4"
      onKeyDown={event => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          confirmRef.current()
        }
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`paste-${item.id}`}>{t('capture.pasteLabel')}</Label>
          <Textarea
            id={`paste-${item.id}`}
            value={text}
            rows={8}
            placeholder={t('capture.pastePlaceholder')}
            onChange={event => setText(event.target.value)}
          />
          <Button
            variant="outline"
            disabled={!text.trim() || busy}
            onClick={() => parseText.mutate()}
          >
            {parseText.isPending ? t('capture.parsing') : t('capture.parse')}
          </Button>
        </div>
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-4 text-center ${dragging ? 'border-[#062E25]' : 'border-[#062E25]/20'}`}
          onDragOver={event => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={event => {
            event.preventDefault()
            setDragging(false)
            const file = event.dataTransfer.files?.[0]
            if (file) uploadPdf.mutate(file)
          }}
        >
          <p>
            {uploadPdf.isPending
              ? t('capture.pdfReading')
              : t('capture.pdfDrop')}
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0]
              if (file) uploadPdf.mutate(file)
              event.target.value = ''
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            {t('capture.pdfChoose')}
          </Button>
          {pdfNote && <p className="text-[#062E25]/60">{pdfNote}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label htmlFor={`egrid-${item.id}`}>E-GRID</Label>
            <Input
              id={`egrid-${item.id}`}
              value={form.egrid ?? ''}
              className={`mt-1 text-base ${mismatch ? 'border-red-500' : ''}`}
              onChange={event => {
                setMethod('form')
                invalidatePreview()
                setForm({ ...form, egrid: event.target.value })
              }}
            />
          </div>
          <div>
            <Label htmlFor={`parcel-${item.id}`}>
              {t('capture.parcelNumber')}
            </Label>
            <Input
              id={`parcel-${item.id}`}
              value={form.parcelNumber ?? ''}
              className="mt-1 text-base"
              onChange={event => {
                invalidatePreview()
                setForm({ ...form, parcelNumber: event.target.value || null })
              }}
            />
          </div>
          <div>
            <Label htmlFor={`asof-${item.id}`}>{t('capture.dataAsOf')}</Label>
            <Input
              id={`asof-${item.id}`}
              value={form.dataAsOf ?? ''}
              placeholder="TT.MM.JJJJ"
              className="mt-1 text-base"
              onChange={event => {
                invalidatePreview()
                setForm({ ...form, dataAsOf: event.target.value || null })
              }}
            />
          </div>
          <div className="flex items-end gap-2 pb-2">
            <Checkbox
              id={`stwe-${item.id}`}
              checked={form.stockwerkeigentum}
              onCheckedChange={checked => {
                setMethod('form')
                invalidatePreview()
                setForm({ ...form, stockwerkeigentum: checked === true })
              }}
            />
            <Label htmlFor={`stwe-${item.id}`}>
              {t('capture.stockwerkeigentum')}
            </Label>
          </div>
        </div>
        {mismatch && (
          <div className="flex flex-wrap items-center gap-3 p-2 rounded bg-red-50 text-red-700">
            <span>{t('capture.egridMismatch', { lookup: item.egrid })}</span>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => arm('void')}
            >
              {armed === 'void'
                ? t('capture.confirmAgain')
                : t('capture.wrongParcel')}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {form.parties.map((party, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
            >
              <select
                aria-label={t('capture.role')}
                className="md:col-span-2 h-10 rounded border border-[#062E25]/20 bg-white px-2"
                value={party.role}
                onChange={event =>
                  updateParty(index, {
                    role: event.target.value as ExtractPartyRole,
                  })
                }
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {t(`partyRole.${role}`)}
                  </option>
                ))}
              </select>
              <Input
                aria-label={t('capture.name')}
                placeholder={t('capture.name')}
                className="md:col-span-3 text-base"
                value={party.name}
                onChange={event =>
                  updateParty(index, { name: event.target.value })
                }
              />
              {party.role === 'OWNER' ? (
                <>
                  <Input
                    aria-label="UID"
                    placeholder="CHE-..."
                    className="md:col-span-2 text-base"
                    value={party.uid ?? ''}
                    onChange={event =>
                      updateParty(index, { uid: event.target.value || null })
                    }
                  />
                  <Input
                    aria-label={t('capture.share')}
                    placeholder={t('capture.share')}
                    className="md:col-span-2 text-base"
                    value={party.share ?? ''}
                    onChange={event =>
                      updateParty(index, { share: event.target.value || null })
                    }
                  />
                  <Input
                    aria-label={t('capture.seat')}
                    placeholder={t('capture.seat')}
                    className="md:col-span-2 text-base"
                    value={party.seat ?? ''}
                    onChange={event =>
                      updateParty(index, { seat: event.target.value || null })
                    }
                  />
                </>
              ) : (
                <>
                  <Input
                    aria-label={t('capture.street')}
                    placeholder={t('capture.street')}
                    className="md:col-span-3 text-base"
                    value={[party.street, party.houseNumber]
                      .filter(Boolean)
                      .join(' ')}
                    onChange={event =>
                      updateParty(index, {
                        street: event.target.value || null,
                        houseNumber: null,
                      })
                    }
                  />
                  <Input
                    aria-label={t('capture.postalCode')}
                    placeholder={t('capture.postalCode')}
                    className="md:col-span-1 text-base"
                    value={party.postalCode ?? ''}
                    onChange={event =>
                      updateParty(index, {
                        postalCode: event.target.value || null,
                      })
                    }
                  />
                  <Input
                    aria-label={t('capture.city')}
                    placeholder={t('capture.city')}
                    className="md:col-span-2 text-base"
                    value={party.city ?? ''}
                    onChange={event =>
                      updateParty(index, { city: event.target.value || null })
                    }
                  />
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="md:col-span-1"
                onClick={() => {
                  invalidatePreview()
                  setForm({
                    ...form,
                    parties: form.parties.filter((_, i) => i !== index),
                  })
                }}
              >
                {t('capture.remove')}
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                invalidatePreview()
                setForm({
                  ...form,
                  parties: [...form.parties, emptyParty('OWNER')],
                })
              }}
            >
              {t('capture.addOwner')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                invalidatePreview()
                setForm({
                  ...form,
                  parties: [...form.parties, emptyParty('CORRESPONDENCE')],
                })
              }}
            >
              {t('capture.addAddress')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasOwner || busy}
              onClick={() => repreview({})}
            >
              {refresh.isPending
                ? t('capture.previewing')
                : t('capture.preview')}
            </Button>
          </div>
        </div>
      </div>

      {preview && (
        <ResolutionPreview
          plan={preview.plan}
          picks={picks}
          onPick={(position, value) =>
            repreview({ picks: { ...picks, [String(position)]: value } })
          }
          familyOccupantId={familyOccupantId}
          onFamily={id => repreview({ familyOccupantId: id })}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={!canConfirm} onClick={doConfirm}>
          {confirm.isPending ? t('capture.confirming') : t('capture.confirm')}
        </Button>
        {!preview && hasOwner && (
          <span className="text-[#062E25]/60">{t('capture.previewFirst')}</span>
        )}
        <span className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => arm('not_found')}
        >
          {armed === 'not_found'
            ? t('capture.confirmAgain')
            : t('capture.notFound')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => arm('not_digitised')}
        >
          {armed === 'not_digitised'
            ? t('capture.confirmAgain')
            : t('capture.notDigitised')}
        </Button>
        {!mismatch && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => arm('void')}
          >
            {armed === 'void'
              ? t('capture.confirmAgain')
              : t('capture.wrongParcel')}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => arm('release')}
        >
          {armed === 'release'
            ? t('capture.confirmAgain')
            : t('capture.release')}
        </Button>
      </div>
    </div>
  )
}
