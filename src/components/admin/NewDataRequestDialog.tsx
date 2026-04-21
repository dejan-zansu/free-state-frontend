'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const typeOptions: { value: DataRequestItemType; label: string }[] = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'TEXT', label: 'Text answer' },
  { value: 'CONFIRMATION', label: 'Yes / No confirmation' },
]

export function NewDataRequestDialog({ contractId, open, onClose }: Props) {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<NewDataRequestItemInput[]>([emptyItem(0)])
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: NewDataRequestInput) => dataRequestService.adminCreate(contractId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'data-requests', 'contract', contractId] })
      onClose()
      setTitle('')
      setDescription('')
      setDueDate('')
      setItems([emptyItem(0)])
      setError(null)
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Request failed')
    },
  })

  if (!open) return null

  const updateItem = (idx: number, patch: Partial<NewDataRequestItemInput>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, position: i })))
  }
  const addItem = () => {
    setItems((prev) => [...prev, emptyItem(prev.length)])
  }

  const onSubmit = () => {
    setError(null)
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (items.some((it) => !it.label.trim())) {
      setError('Every item needs a label')
      return
    }
    const input: NewDataRequestInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#062E25]/10">
          <h2 className="text-lg font-semibold text-[#062E25]">New data request</h2>
          <button onClick={onClose} className="text-[#062E25]/60 hover:text-[#062E25]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <Label htmlFor="dr-title">Title</Label>
            <Input
              id="dr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Site visit preparation"
            />
          </div>

          <div>
            <Label htmlFor="dr-desc">Description (optional)</Label>
            <Textarea
              id="dr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="dr-due">Due date (optional)</Label>
            <Input
              id="dr-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Checklist items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="border border-[#062E25]/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#062E25]/60 w-6">{idx + 1}.</span>
                    <select
                      className="border border-[#062E25]/20 rounded px-2 py-1 text-sm"
                      value={item.type}
                      onChange={(e) =>
                        updateItem(idx, { type: e.target.value as DataRequestItemType })
                      }
                    >
                      {typeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-sm text-[#062E25]/70 ml-auto">
                      <input
                        type="checkbox"
                        checked={item.required !== false}
                        onChange={(e) => updateItem(idx, { required: e.target.checked })}
                      />
                      Required
                    </label>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Label (e.g. Photo of roof from street)"
                    value={item.label}
                    onChange={(e) => updateItem(idx, { label: e.target.value })}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={item.description ?? ''}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    rows={2}
                  />

                  {(item.type === 'PHOTO' || item.type === 'DOCUMENT') && (
                    <div className="flex gap-3">
                      <div>
                        <Label className="text-sm">Min count</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.minCount ?? 1}
                          onChange={(e) =>
                            updateItem(idx, { minCount: Number(e.target.value) || 0 })
                          }
                          className="w-24"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Max count</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.maxCount ?? 5}
                          onChange={(e) =>
                            updateItem(idx, { maxCount: Number(e.target.value) || 1 })
                          }
                          className="w-24"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#062E25]/10">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Sending…' : 'Send request'}
          </Button>
        </div>
      </div>
    </div>
  )
}
