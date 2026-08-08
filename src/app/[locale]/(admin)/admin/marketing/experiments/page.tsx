'use client'

import { useState } from 'react'
import { Play, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type {
  Experiment,
  ExperimentStatus,
  ExperimentVariantKind,
  MarketingExperiments,
  UpdateExperimentInput,
} from '@/types/admin-marketing'

const DAY_MS = 24 * 60 * 60 * 1000

const VARIANT_KINDS: ExperimentVariantKind[] = ['ad', 'adset', 'campaign', 'lp-variant']

const STATUS_STYLES: Record<ExperimentStatus, string> = {
  RUNNING: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-700',
  DECIDED: 'bg-blue-100 text-blue-700',
  ABANDONED: 'bg-gray-100 text-gray-600',
}

type VariantForm = { kind: ExperimentVariantKind; label: string; refId: string }

const EMPTY_VARIANT: VariantForm = { kind: 'ad', label: '', refId: '' }

const EMPTY_FORM = {
  name: '',
  hypothesis: '',
  variable: '',
  primaryMetric: '',
  minSample: '',
}

function daysRunning(startAt: string | null) {
  if (!startAt) return null
  return Math.max(0, Math.floor((Date.now() - new Date(startAt).getTime()) / DAY_MS))
}

export default function AdminMarketingExperimentsPage() {
  const t = useTranslations('admin.marketing.experiments')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [variants, setVariants] = useState<VariantForm[]>([{ ...EMPTY_VARIANT }])
  const [decideTarget, setDecideTarget] = useState<Experiment | null>(null)
  const [decisionText, setDecisionText] = useState('')
  const [learningsText, setLearningsText] = useState('')

  const { data, isLoading } = useQuery<MarketingExperiments>({
    queryKey: ['admin', 'marketing', 'experiments'],
    queryFn: () => adminMarketingService.getExperiments(),
  })

  const resetCreateForm = () => {
    setForm(EMPTY_FORM)
    setVariants([{ ...EMPTY_VARIANT }])
  }

  const closeDecideDialog = () => {
    setDecideTarget(null)
    setDecisionText('')
    setLearningsText('')
  }

  const createMutation = useMutation({
    mutationFn: () => {
      const minSample = form.minSample.trim() === '' ? undefined : Number(form.minSample)
      return adminMarketingService.createExperiment({
        name: form.name.trim(),
        hypothesis: form.hypothesis.trim(),
        variable: form.variable.trim(),
        primaryMetric: form.primaryMetric.trim(),
        minSample,
        variants: variants.map((variant) => ({
          kind: variant.kind,
          label: variant.label.trim(),
          refId: variant.refId.trim() || undefined,
        })),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'experiments'] })
      setCreateOpen(false)
      resetCreateForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExperimentInput }) =>
      adminMarketingService.updateExperiment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'experiments'] })
      closeDecideDialog()
    },
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  const kindLabel = (kind: ExperimentVariantKind) => {
    switch (kind) {
      case 'ad':
        return t('kindAd')
      case 'adset':
        return t('kindAdset')
      case 'campaign':
        return t('kindCampaign')
      case 'lp-variant':
        return t('kindLpVariant')
    }
  }

  const statusLabel = (status: ExperimentStatus) => {
    switch (status) {
      case 'DRAFT':
        return t('statusDraft')
      case 'RUNNING':
        return t('statusRunning')
      case 'DECIDED':
        return t('statusDecided')
      case 'ABANDONED':
        return t('statusAbandoned')
    }
  }

  const setVariantField = (index: number, field: keyof VariantForm, value: string) => {
    setVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant)),
    )
  }

  const minSampleValue = form.minSample.trim() === '' ? undefined : Number(form.minSample)
  const minSampleValid =
    minSampleValue === undefined || (Number.isInteger(minSampleValue) && minSampleValue > 0)
  const canSave =
    form.name.trim() !== '' &&
    form.hypothesis.trim() !== '' &&
    form.variable.trim() !== '' &&
    form.primaryMetric.trim() !== '' &&
    minSampleValid &&
    variants.length > 0 &&
    variants.every((variant) => variant.label.trim() !== '')

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <div className="ml-auto">
          <Button
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('newExperiment')}
          </Button>
        </div>
      </div>
      <p className="text-[#062E25] mb-6">{t('intro')}</p>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          {data.rows.length === 0 ? (
            <p className="text-center py-12 text-[#062E25]">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('metric')}</TableHead>
                    <TableHead className="text-right">{t('variantsCount')}</TableHead>
                    <TableHead>{t('startedAt')}</TableHead>
                    <TableHead>{t('runtime')}</TableHead>
                    <TableHead>{t('decision')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row) => {
                    const running = row.status === 'RUNNING' ? daysRunning(row.startAt) : null
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="max-w-[240px]">
                          <p className="font-medium text-[#062E25] truncate" title={row.name}>
                            {row.name}
                          </p>
                          <p className="text-sm text-[#062E25] truncate" title={row.variable}>
                            {row.variable}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn('font-medium border-0', STATUS_STYLES[row.status])}
                          >
                            {statusLabel(row.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[#062E25]/80">
                          {row.primaryMetric}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {row.variants.length}
                        </TableCell>
                        <TableCell className="text-sm text-[#062E25] tabular-nums">
                          {row.startAt ? new Date(row.startAt).toLocaleDateString('de-CH') : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-[#062E25]/80 tabular-nums">
                          {running !== null ? t('runtimeDays', { count: running }) : '—'}
                        </TableCell>
                        <TableCell className="max-w-[240px]">
                          {row.decision ? (
                            <p className="text-sm text-[#062E25]/80 truncate" title={row.decision}>
                              {row.decision}
                            </p>
                          ) : (
                            <span className="text-[#062E25]/75">—</span>
                          )}
                          {(row.status === 'DECIDED' || row.status === 'ABANDONED') &&
                            row.learnings && (
                              <details className="mt-1">
                                <summary className="text-xs text-[#062E25] cursor-pointer">
                                  {t('learnings')}
                                </summary>
                                <p className="text-xs text-[#062E25] mt-1 whitespace-pre-wrap">
                                  {row.learnings}
                                </p>
                              </details>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.status === 'DRAFT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateMutation.isPending}
                              onClick={() =>
                                updateMutation.mutate({ id: row.id, input: { status: 'RUNNING' } })
                              }
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {t('start')}
                            </Button>
                          )}
                          {row.status === 'RUNNING' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setDecideTarget(row)
                                  setDecisionText('')
                                  setLearningsText('')
                                }}
                              >
                                {t('decide')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={updateMutation.isPending}
                                onClick={() => {
                                  if (confirm(t('abandonConfirm'))) {
                                    updateMutation.mutate({
                                      id: row.id,
                                      input: { status: 'ABANDONED' },
                                    })
                                  }
                                }}
                              >
                                {t('abandon')}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('newExperiment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="experiment-name">{t('formName')}</Label>
              <Input
                id="experiment-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-hypothesis">{t('formHypothesis')}</Label>
              <Textarea
                id="experiment-hypothesis"
                rows={3}
                placeholder={t('formHypothesisHint')}
                value={form.hypothesis}
                onChange={(e) => setForm((prev) => ({ ...prev, hypothesis: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-variable">{t('formVariable')}</Label>
              <Input
                id="experiment-variable"
                placeholder={t('formVariableHint')}
                value={form.variable}
                onChange={(e) => setForm((prev) => ({ ...prev, variable: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experiment-metric">{t('formMetric')}</Label>
                <Input
                  id="experiment-metric"
                  placeholder={t('formMetricHint')}
                  value={form.primaryMetric}
                  onChange={(e) => setForm((prev) => ({ ...prev, primaryMetric: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experiment-min-sample">{t('formMinSample')}</Label>
                <Input
                  id="experiment-min-sample"
                  type="number"
                  min={1}
                  value={form.minSample}
                  onChange={(e) => setForm((prev) => ({ ...prev, minSample: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('formVariants')}</Label>
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={variant.kind}
                      onValueChange={(value) => setVariantField(index, 'kind', value)}
                    >
                      <SelectTrigger className="w-40 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIANT_KINDS.map((kind) => (
                          <SelectItem key={kind} value={kind}>
                            {kindLabel(kind)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="flex-1"
                      placeholder={t('formVariantLabel')}
                      value={variant.label}
                      onChange={(e) => setVariantField(index, 'label', e.target.value)}
                    />
                    <Input
                      className="w-36 shrink-0"
                      placeholder={t('formVariantRefId')}
                      value={variant.refId}
                      onChange={(e) => setVariantField(index, 'refId', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      disabled={variants.length <= 1}
                      aria-label={t('removeVariant')}
                      onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={variants.length >= 10}
                onClick={() => setVariants((prev) => [...prev, { ...EMPTY_VARIANT }])}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addVariant')}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false)
                resetCreateForm()
              }}
            >
              {t('formCancel')}
            </Button>
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              disabled={!canSave || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {t('formSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={decideTarget !== null}
        onOpenChange={(open) => {
          if (!open) closeDecideDialog()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('decideTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {decideTarget && <p className="text-sm text-[#062E25]">{decideTarget.name}</p>}
            <div className="space-y-2">
              <Label htmlFor="experiment-decision">{t('decisionLabel')}</Label>
              <Textarea
                id="experiment-decision"
                rows={3}
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-learnings">{t('learningsLabel')}</Label>
              <Textarea
                id="experiment-learnings"
                rows={4}
                value={learningsText}
                onChange={(e) => setLearningsText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDecideDialog}>
              {t('formCancel')}
            </Button>
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              disabled={!decisionText.trim() || updateMutation.isPending}
              onClick={() => {
                if (!decideTarget) return
                updateMutation.mutate({
                  id: decideTarget.id,
                  input: {
                    status: 'DECIDED',
                    decision: decisionText.trim(),
                    learnings: learningsText.trim() || undefined,
                  },
                })
              }}
            >
              {t('decideSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
