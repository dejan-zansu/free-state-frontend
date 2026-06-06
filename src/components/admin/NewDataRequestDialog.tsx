'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { CalendarIcon, ChevronDown, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { dataRequestService } from '@/services/data-request.service'
import type {
  DataRequestItemType,
  NewDataRequestInput,
  NewDataRequestItemInput,
} from '@/types/data-request'

interface Props {
  contractId: string
  open: boolean
  onClose: () => void
}

const emptyItem = (position: number): NewDataRequestItemInput => ({
  type: 'PHOTO',
  label: '',
  position,
  required: true,
  minCount: 1,
  maxCount: 5,
})

const typeValues: DataRequestItemType[] = [
  'PHOTO',
  'DOCUMENT',
  'TEXT',
  'CONFIRMATION',
]

export function NewDataRequestDialog({ contractId, open, onClose }: Props) {
  const qc = useQueryClient()
  const t = useTranslations('admin.dataRequests')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [dueDateOpen, setDueDateOpen] = useState(false)
  const [items, setItems] = useState<NewDataRequestItemInput[]>([emptyItem(0)])
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle('')
    setDescription('')
    setDueDate(undefined)
    setDueDateOpen(false)
    setItems([emptyItem(0)])
    setError(null)
  }

  const mutation = useMutation({
    mutationFn: (input: NewDataRequestInput) =>
      dataRequestService.adminCreate(contractId, input),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['admin', 'data-requests', 'contract', contractId],
      })
      onClose()
      reset()
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : t('errorRequestFailed'))
    },
  })

  const updateItem = (
    idx: number,
    patch: Partial<NewDataRequestItemInput>,
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    )
  }
  const removeItem = (idx: number) => {
    setItems((prev) =>
      prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, position: i })),
    )
  }
  const addItem = () => {
    setItems((prev) => [...prev, emptyItem(prev.length)])
  }

  const onSubmit = () => {
    setError(null)
    if (!title.trim()) {
      setError(t('errorTitleRequired'))
      return
    }
    if (items.some((it) => !it.label.trim())) {
      setError(t('errorItemLabelRequired'))
      return
    }
    const input: NewDataRequestInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      items: items.map((it, i) => ({
        ...it,
        position: i,
        label: it.label.trim(),
        description: it.description?.trim() || undefined,
      })),
    }
    mutation.mutate(input)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#062E25]">
            {t('dialogTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="dr-title">{t('titleLabel')}</Label>
            <Input
              id="dr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dr-desc">{t('descriptionOptional')}</Label>
            <Textarea
              id="dr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t('dueDateOptional')}</Label>
            <Collapsible open={dueDateOpen} onOpenChange={setDueDateOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start font-normal',
                    !dueDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate
                    ? dueDate.toLocaleDateString('de-CH')
                    : t('pickDate')}
                  <ChevronDown
                    className={cn(
                      'ml-auto h-4 w-4 transition-transform',
                      dueDateOpen && 'rotate-180',
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="rounded-md border bg-popover p-2">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(d) => {
                      setDueDate(d)
                      setDueDateOpen(false)
                    }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate(undefined)}
                className="text-xs text-[#062E25]/60 hover:text-[#062E25] underline"
              >
                {t('clearDate')}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('checklistItems')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-1" /> {t('addItem')}
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const needsCount =
                  item.type === 'PHOTO' || item.type === 'DOCUMENT'
                return (
                  <Card key={idx} className="border-[#062E25]/10 shadow-none">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#062E25]/60 w-6 shrink-0">
                          {idx + 1}.
                        </span>

                        <Select
                          value={item.type}
                          onValueChange={(v) =>
                            updateItem(idx, { type: v as DataRequestItemType })
                          }
                        >
                          <SelectTrigger size="sm" className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {typeValues.map((v) => (
                              <SelectItem key={v} value={v}>
                                {t(`itemTypes.${v}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 ml-auto">
                          <Checkbox
                            id={`req-${idx}`}
                            checked={item.required !== false}
                            onCheckedChange={(v) =>
                              updateItem(idx, { required: v === true })
                            }
                          />
                          <Label
                            htmlFor={`req-${idx}`}
                            className="text-sm font-normal text-[#062E25]/70 cursor-pointer"
                          >
                            {t('required')}
                          </Label>
                        </div>

                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Input
                        placeholder={t('itemLabelPlaceholder')}
                        value={item.label}
                        onChange={(e) =>
                          updateItem(idx, { label: e.target.value })
                        }
                      />
                      <Textarea
                        placeholder={t('descriptionOptional')}
                        value={item.description ?? ''}
                        onChange={(e) =>
                          updateItem(idx, { description: e.target.value })
                        }
                        rows={2}
                      />

                      {needsCount && (
                        <div className="flex gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">{t('minCount')}</Label>
                            <Input
                              type="number"
                              min={0}
                              value={item.minCount ?? 1}
                              onChange={(e) =>
                                updateItem(idx, {
                                  minCount: Number(e.target.value) || 0,
                                })
                              }
                              className="w-24"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">{t('maxCount')}</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.maxCount ?? 5}
                              onChange={(e) =>
                                updateItem(idx, {
                                  maxCount: Number(e.target.value) || 1,
                                })
                              }
                              className="w-24"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? t('sending') : t('sendRequest')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
