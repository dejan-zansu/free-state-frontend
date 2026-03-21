'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Loader2, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/admin/ImageUpload'

export interface FieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'json' | 'image'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  step?: string
  section?: string
}

export interface TranslationFieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'json'
}

interface EquipmentFormPageProps {
  title: string
  backPath: string
  fields: FieldDef[]
  queryKey: string
  translationFields?: TranslationFieldDef[]
  fetcher?: (id: string) => Promise<any>
  creator: (data: Record<string, unknown>) => Promise<any>
  updater: (id: string, data: Record<string, unknown>) => Promise<any>
  deleter?: (id: string) => Promise<void>
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
]

export function EquipmentFormPage({
  title,
  backPath,
  queryKey,
  fields,
  translationFields,
  fetcher,
  creator,
  updater,
  deleter,
}: EquipmentFormPageProps) {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const queryClient = useQueryClient()
  const id = params?.id as string | undefined
  const isNew = id === 'new'

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [translations, setTranslations] = useState<Record<string, Record<string, any>>>({})
  const [dataLoaded, setDataLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const { isLoading: loading } = useQuery({
    queryKey: ['admin', queryKey, 'detail', id],
    queryFn: async () => {
      if (!fetcher || !id) return null
      const data = await fetcher(id)
      const { translations: trans, ...rest } = data
      setFormData(rest)
      if (trans && Array.isArray(trans)) {
        const transMap: Record<string, Record<string, any>> = {}
        trans.forEach((t: any) => {
          transMap[t.language] = t
        })
        setTranslations(transMap)
      }
      setDataLoaded(true)
      return data
    },
    enabled: !isNew && !!id && !!fetcher,
  })

  const setField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const setTranslationField = (lang: string, field: string, value: any) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], language: lang, [field]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const transArray = Object.values(translations).filter(
        (t) => t.language && Object.keys(t).length > 1
      )
      const { id: _id, createdAt: _ca, updatedAt: _ua, _count, items: _items, ...rest } = formData
      const payload: Record<string, unknown> = { ...rest, translations: transArray }

      if (isNew) {
        const result = await creator(payload)
        queryClient.invalidateQueries({ queryKey: ['admin', queryKey] })
        setMessage('Created successfully')
        router.push(`/${locale}${backPath}/${result?.id || ''}`)
      } else if (id) {
        await updater(id, payload)
        queryClient.invalidateQueries({ queryKey: ['admin', queryKey] })
        setMessage('Saved successfully')
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.error?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || isNew || !deleter) return
    if (!confirm('Are you sure you want to deactivate this item?')) return
    try {
      await deleter(id)
      queryClient.invalidateQueries({ queryKey: ['admin', queryKey] })
      router.push(`/${locale}${backPath}`)
    } catch {
      setMessage('Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
      </div>
    )
  }

  const sections = new Map<string, FieldDef[]>()
  fields.forEach((f) => {
    const sec = f.section || 'General'
    if (!sections.has(sec)) sections.set(sec, [])
    sections.get(sec)!.push(f)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}${backPath}`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? `New ${title}` : `Edit ${title}`}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && deleter && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Deactivate
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-4 text-sm p-3 rounded-md bg-muted">{message}</div>
      )}

      <div className="space-y-6">
        {Array.from(sections.entries()).map(([sectionName, sectionFields]) => (
          <Card key={sectionName}>
            <CardHeader>
              <CardTitle className="text-base">{sectionName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionFields.map((field) => (
                  <div key={field.name} className={field.type === 'textarea' || field.type === 'json' || field.type === 'image' ? 'col-span-full' : ''}>
                    <Label htmlFor={field.name} className="text-sm">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {field.type === 'image' ? (
                      <ImageUpload
                        value={formData[field.name]}
                        onChange={(url) => setField(field.name, url)}
                      />
                    ) : field.type === 'boolean' ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Checkbox
                          id={field.name}
                          checked={!!formData[field.name]}
                          onCheckedChange={(checked) => setField(field.name, !!checked)}
                        />
                        <Label htmlFor={field.name} className="text-sm font-normal cursor-pointer">
                          {formData[field.name] ? 'Yes' : 'No'}
                        </Label>
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        id={field.name}
                        className="w-full rounded-md border px-3 py-2 text-sm mt-1"
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setField(field.name, e.target.value || null)}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setField(field.name, e.target.value || null)}
                        rows={3}
                        className="mt-1"
                      />
                    ) : field.type === 'json' ? (
                      <div className="mt-1 space-y-2">
                        {(Array.isArray(formData[field.name])
                          ? formData[field.name]
                          : []
                        ).map((item: string, fi: number) => (
                          <div key={fi} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const updated = [...(formData[field.name] || [])]
                                updated[fi] = e.target.value
                                setField(field.name, updated)
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = (formData[field.name] || []).filter((_: string, i: number) => i !== fi)
                                setField(field.name, updated)
                              }}
                              className="text-destructive hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setField(field.name, [...(Array.isArray(formData[field.name]) ? formData[field.name] : []), ''])}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    ) : field.type === 'number' ? (
                      <Input
                        id={field.name}
                        type="number"
                        step={field.step || 'any'}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setField(field.name, e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder={field.placeholder}
                        className="mt-1"
                      />
                    ) : (
                      <Input
                        id={field.name}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setField(field.name, e.target.value || null)}
                        placeholder={field.placeholder}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {translationFields && translationFields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {LANGUAGES.map((lang) => (
                  <div key={lang.code} className="border rounded-lg p-4">
                    <p className="font-medium text-sm mb-3">{lang.label} ({lang.code})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {translationFields.map((tf) => (
                        <div key={tf.name} className={tf.type === 'textarea' || tf.type === 'json' ? 'col-span-full' : ''}>
                          <Label className="text-sm">{tf.label}</Label>
                          {tf.type === 'textarea' ? (
                            <Textarea
                              value={translations[lang.code]?.[tf.name] ?? ''}
                              onChange={(e) => setTranslationField(lang.code, tf.name, e.target.value || null)}
                              rows={2}
                              className="mt-1"
                            />
                          ) : tf.type === 'json' ? (
                            <div className="mt-1 space-y-2">
                              {(Array.isArray(translations[lang.code]?.[tf.name])
                                ? translations[lang.code][tf.name]
                                : []
                              ).map((item: string, fi: number) => (
                                <div key={fi} className="flex items-center gap-2">
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const updated = [...(translations[lang.code]?.[tf.name] || [])]
                                      updated[fi] = e.target.value
                                      setTranslationField(lang.code, tf.name, updated)
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updated = (translations[lang.code]?.[tf.name] || []).filter((_: string, i: number) => i !== fi)
                                      setTranslationField(lang.code, tf.name, updated)
                                    }}
                                    className="text-destructive hover:text-destructive shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const current = Array.isArray(translations[lang.code]?.[tf.name])
                                    ? translations[lang.code][tf.name]
                                    : []
                                  setTranslationField(lang.code, tf.name, [...current, ''])
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </Button>
                            </div>
                          ) : (
                            <Input
                              value={translations[lang.code]?.[tf.name] ?? ''}
                              onChange={(e) => setTranslationField(lang.code, tf.name, e.target.value || null)}
                              className="mt-1"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
