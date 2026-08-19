'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { Save, Trash2, Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

import { PhotoGalleryUpload } from '@/components/admin/PhotoGalleryUpload'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminService } from '@/services/admin.service'
import type {
  AdminReference,
  ReferenceCategory,
  ReferenceMountingType,
  ReferenceStatus,
} from '@/types/admin'

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', required: true },
  { code: 'en', label: 'English' },
]

const CATEGORIES: ReferenceCategory[] = [
  'INDUSTRIEDACH',
  'GEWERBE',
  'OEFFENTLICHE_GEBAEUDE',
  'LANDWIRTSCHAFT',
  'WOHNGEBAEUDE',
  'FREIFLAECHE',
]

const MOUNTING_TYPES: ReferenceMountingType[] = [
  'AUFDACH',
  'INDACH',
  'FLACHDACH',
  'FASSADE',
  'FREIFLAECHE',
  'CARPORT',
]

const NO_MOUNTING_TYPE = '__none__'

const IMAGE_FOLDER = 'references'

interface TranslationData {
  title: string
  subtitle: string
  lead: string
  body: string
  situation: string
  approach: string
  outcome: string
  quoteText: string
  quoteAuthorRole: string
  metaTitle: string
  metaDescription: string
}

const emptyTranslation = (): TranslationData => ({
  title: '',
  subtitle: '',
  lead: '',
  body: '',
  situation: '',
  approach: '',
  outcome: '',
  quoteText: '',
  quoteAuthorRole: '',
  metaTitle: '',
  metaDescription: '',
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[đ]/g, 'dj')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[äàáâ]/g, 'a')
    .replace(/[öòóô]/g, 'o')
    .replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e')
    .replace(/[ïìíî]/g, 'i')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toInput(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

function toNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function toMonthInput(value: string | null | undefined): string {
  return value ? value.slice(0, 7) : ''
}

function fromMonthInput(value: string): string | null {
  if (!/^\d{4}-\d{2}$/.test(value)) return null
  return new Date(`${value}-01T00:00:00.000Z`).toISOString()
}

interface ReferenceFormProps {
  reference?: AdminReference
}

export function ReferenceForm({ reference }: ReferenceFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const locale = useLocale()
  const t = useTranslations('admin.references')
  const tr = useTranslations('referencePage')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [slug, setSlug] = useState(reference?.slug || '')
  const [slugManual, setSlugManual] = useState(!!reference)
  const [status, setStatus] = useState<ReferenceStatus>(reference?.status || 'DRAFT')
  const [category, setCategory] = useState<ReferenceCategory>(reference?.category || 'INDUSTRIEDACH')
  const [mountingType, setMountingType] = useState<ReferenceMountingType | null>(
    reference?.mountingType ?? null
  )
  const [featured, setFeatured] = useState(reference?.featured ?? false)
  const [sortOrder, setSortOrder] = useState(toInput(reference?.sortOrder ?? 0))
  const [coverImageUrl, setCoverImageUrl] = useState(reference?.coverImageUrl || '')

  const [location, setLocation] = useState(reference?.location || '')
  const [year, setYear] = useState(toInput(reference?.year))
  const [clientName, setClientName] = useState(reference?.clientName || '')
  const [contactPerson, setContactPerson] = useState(reference?.contactPerson || '')

  const [installedKwp, setInstalledKwp] = useState(toInput(reference?.installedKwp))
  const [moduleCount, setModuleCount] = useState(toInput(reference?.moduleCount))
  const [moduleWattPeak, setModuleWattPeak] = useState(toInput(reference?.moduleWattPeak))
  const [batteryKwh, setBatteryKwh] = useState(toInput(reference?.batteryKwh))
  const [annualYieldKwh, setAnnualYieldKwh] = useState(toInput(reference?.annualYieldKwh))

  const [productModel, setProductModel] = useState(reference?.productModel || '')
  const [inverter, setInverter] = useState(reference?.inverter || '')
  const [storageSystem, setStorageSystem] = useState(reference?.storageSystem || '')
  const [buildDurationWeeks, setBuildDurationWeeks] = useState(
    toInput(reference?.buildDurationWeeks)
  )
  const [commissionedAt, setCommissionedAt] = useState(toMonthInput(reference?.commissionedAt))

  const [gallery, setGallery] = useState<string[]>(
    reference?.images.map((image) => image.url) || []
  )
  const [quoteAuthorName, setQuoteAuthorName] = useState(reference?.quoteAuthorName || '')

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const initTranslations = () => {
    const map: Record<string, TranslationData> = {}
    LANGUAGES.forEach((lang) => {
      const existing = reference?.translations.find((tl) => tl.language === lang.code)
      if (existing) {
        map[lang.code] = {
          title: existing.title,
          subtitle: existing.subtitle || '',
          lead: existing.lead || '',
          body: existing.body || '',
          situation: existing.situation || '',
          approach: existing.approach || '',
          outcome: existing.outcome || '',
          quoteText: existing.quoteText || '',
          quoteAuthorRole: existing.quoteAuthorRole || '',
          metaTitle: existing.metaTitle || '',
          metaDescription: existing.metaDescription || '',
        }
      } else {
        map[lang.code] = emptyTranslation()
      }
    })
    return map
  }

  const [translations, setTranslations] = useState<Record<string, TranslationData>>(initTranslations)

  const updateTranslation = (lang: string, field: keyof TranslationData, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }))

    if (lang === 'de' && field === 'title' && !slugManual) {
      setSlug(slugify(value))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await adminService.uploadImage(file, IMAGE_FOLDER)
      setCoverImageUrl(url)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const translationArray = Object.entries(translations)
        .filter(([, data]) => data.title.trim())
        .map(([language, data]) => ({
          language,
          title: data.title,
          subtitle: data.subtitle || null,
          lead: data.lead || null,
          body: data.body || null,
          situation: data.situation || null,
          approach: data.approach || null,
          outcome: data.outcome || null,
          quoteText: data.quoteText || null,
          quoteAuthorRole: data.quoteAuthorRole || null,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
        }))

      const payload = {
        slug,
        status,
        category,
        featured,
        sortOrder: toNumber(sortOrder) ?? 0,
        coverImageUrl: coverImageUrl || null,
        location: location || null,
        year: toNumber(year),
        clientName: clientName || null,
        contactPerson: contactPerson || null,
        installedKwp: toNumber(installedKwp),
        moduleCount: toNumber(moduleCount),
        moduleWattPeak: toNumber(moduleWattPeak),
        batteryKwh: toNumber(batteryKwh),
        annualYieldKwh: toNumber(annualYieldKwh),
        mountingType,
        productModel: productModel || null,
        inverter: inverter || null,
        storageSystem: storageSystem || null,
        buildDurationWeeks: toNumber(buildDurationWeeks),
        commissionedAt: fromMonthInput(commissionedAt),
        quoteAuthorName: quoteAuthorName || null,
        images: gallery.map((url) => ({ url })),
        translations: translationArray,
      }

      if (reference) {
        await adminService.updateReference(reference.id, payload)
      } else {
        await adminService.createReference(payload)
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'references'] })
      router.push(`/${locale}/admin/references`)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!reference || !window.confirm(t('confirmDelete'))) return
    setDeleting(true)
    try {
      await adminService.deleteReference(reference.id)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'references'] })
      router.push(`/${locale}/admin/references`)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {reference ? t('editReference') : t('newReference')}
        </h1>
        <div className="flex items-center gap-3">
          {reference && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {t('delete')}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !slug.trim() || !translations.de.title.trim()}
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {t('save')}
          </Button>
        </div>
      </div>

      <Card className="border-[#062E25]/10 mb-6">
        <CardHeader>
          <CardTitle className="text-[#062E25]">{t('basics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>{t('slug')}</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugManual(true)
                }}
                placeholder="industriegebaeude-zuerich"
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label>{t('status')}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ReferenceStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{t('draft')}</SelectItem>
                  <SelectItem value="PUBLISHED">{t('published')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('category')}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ReferenceCategory)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {tr(`categories.${item}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('mountingType')}</Label>
              <Select
                value={mountingType ?? NO_MOUNTING_TYPE}
                onValueChange={(v) =>
                  setMountingType(v === NO_MOUNTING_TYPE ? null : (v as ReferenceMountingType))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_MOUNTING_TYPE}>-</SelectItem>
                  {MOUNTING_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {tr(`mounting.${item}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('sortOrder')}</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 h-10">
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                <Label htmlFor="featured" className="font-normal cursor-pointer text-sm">
                  {t('featured')}
                </Label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>{t('coverImage')}</Label>
              <div className="mt-1">
                {coverImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-[#062E25]/10">
                    <Image src={coverImageUrl} alt="" width={400} height={200} className="w-full h-32 object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-2 border-dashed border-[#062E25]/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#062E25]/40 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#062E25]/40" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-[#062E25]/40" />
                        <span className="text-sm text-[#062E25]/75">{t('uploadImage')}</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardHeader>
          <CardTitle className="text-[#062E25]">{t('meta')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>{t('location')}</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Schaffhausen SH"
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('year')}</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('client')}</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('contactPerson')}</Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardHeader>
          <CardTitle className="text-[#062E25]">{t('stats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>{t('installedKwp')}</Label>
              <Input
                type="number"
                step="0.01"
                value={installedKwp}
                onChange={(e) => setInstalledKwp(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('moduleCount')}</Label>
              <Input
                type="number"
                value={moduleCount}
                onChange={(e) => setModuleCount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('moduleWattPeak')}</Label>
              <Input
                type="number"
                value={moduleWattPeak}
                onChange={(e) => setModuleWattPeak(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('batteryKwh')}</Label>
              <Input
                type="number"
                step="0.01"
                value={batteryKwh}
                onChange={(e) => setBatteryKwh(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('annualYieldKwh')}</Label>
              <Input
                type="number"
                value={annualYieldKwh}
                onChange={(e) => setAnnualYieldKwh(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardHeader>
          <CardTitle className="text-[#062E25]">{t('specs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>{t('productModel')}</Label>
              <Input
                value={productModel}
                onChange={(e) => setProductModel(e.target.value)}
                placeholder="SolarFree"
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('inverter')}</Label>
              <Input
                value={inverter}
                onChange={(e) => setInverter(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('storageSystem')}</Label>
              <Input
                value={storageSystem}
                onChange={(e) => setStorageSystem(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('buildDurationWeeks')}</Label>
              <Input
                type="number"
                value={buildDurationWeeks}
                onChange={(e) => setBuildDurationWeeks(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('commissionedAt')}</Label>
              <Input
                type="month"
                value={commissionedAt}
                onChange={(e) => setCommissionedAt(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardHeader>
          <CardTitle className="text-[#062E25]">{t('gallery')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoGalleryUpload
            value={gallery}
            onChange={setGallery}
            folder={IMAGE_FOLDER}
            maxPhotos={20}
          />
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardHeader>
          <CardTitle className="text-[#062E25]">{t('quote')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-sm">
            <Label>{t('quoteAuthorName')}</Label>
            <Input
              value={quoteAuthorName}
              onChange={(e) => setQuoteAuthorName(e.target.value)}
              className="mt-1"
            />
          </div>

          <Tabs defaultValue="de">
            <TabsList className="mb-4">
              {LANGUAGES.map((lang) => (
                <TabsTrigger key={lang.code} value={lang.code} className="gap-1.5">
                  {lang.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map((lang) => (
              <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                <div>
                  <Label>{t('quoteText')}</Label>
                  <Textarea
                    value={translations[lang.code].quoteText}
                    onChange={(e) => updateTranslation(lang.code, 'quoteText', e.target.value)}
                    placeholder={t('quoteTextPlaceholder')}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('quoteAuthorRole')}</Label>
                  <Input
                    value={translations[lang.code].quoteAuthorRole}
                    onChange={(e) => updateTranslation(lang.code, 'quoteAuthorRole', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardHeader>
          <CardTitle className="text-[#062E25]">{t('content')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="de">
            <TabsList className="mb-4">
              {LANGUAGES.map((lang) => {
                const hasContent = translations[lang.code]?.title.trim()
                return (
                  <TabsTrigger key={lang.code} value={lang.code} className="gap-1.5">
                    {lang.label}
                    {lang.required && <span className="text-red-500">*</span>}
                    {!lang.required && hasContent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {LANGUAGES.map((lang) => (
              <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>
                      {t('referenceTitle')} {lang.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      value={translations[lang.code].title}
                      onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)}
                      placeholder={t('titlePlaceholder')}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('subtitle')}</Label>
                    <Input
                      value={translations[lang.code].subtitle}
                      onChange={(e) => updateTranslation(lang.code, 'subtitle', e.target.value)}
                      placeholder={t('subtitlePlaceholder')}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t('lead')}</Label>
                  <Textarea
                    value={translations[lang.code].lead}
                    onChange={(e) => updateTranslation(lang.code, 'lead', e.target.value)}
                    placeholder={t('leadPlaceholder')}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('body')}</Label>
                  <div className="mt-1">
                    <RichTextEditor
                      value={translations[lang.code].body}
                      onChange={(html) => updateTranslation(lang.code, 'body', html)}
                      placeholder={t('bodyPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{t('situation')}</Label>
                    <Textarea
                      value={translations[lang.code].situation}
                      onChange={(e) => updateTranslation(lang.code, 'situation', e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('approach')}</Label>
                    <Textarea
                      value={translations[lang.code].approach}
                      onChange={(e) => updateTranslation(lang.code, 'approach', e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('outcome')}</Label>
                    <Textarea
                      value={translations[lang.code].outcome}
                      onChange={(e) => updateTranslation(lang.code, 'outcome', e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#062E25]/10">
                  <div>
                    <Label>{t('metaTitle')}</Label>
                    <Input
                      value={translations[lang.code].metaTitle}
                      onChange={(e) => updateTranslation(lang.code, 'metaTitle', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('metaDescription')}</Label>
                    <Input
                      value={translations[lang.code].metaDescription}
                      onChange={(e) => updateTranslation(lang.code, 'metaDescription', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
