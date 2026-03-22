'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { Save, Trash2, Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { adminService } from '@/services/admin.service'
import type { AdminBlogPost } from '@/types/admin'

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', required: true },
  { code: 'en', label: 'English' },
]

interface TranslationData {
  title: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
}

const emptyTranslation = (): TranslationData => ({
  title: '',
  excerpt: '',
  content: '',
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

interface BlogPostFormProps {
  post?: AdminBlogPost
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const locale = useLocale()
  const t = useTranslations('admin.blog')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [slug, setSlug] = useState(post?.slug || '')
  const [slugManual, setSlugManual] = useState(!!post)
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl || '')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(post?.status || 'DRAFT')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const initTranslations = () => {
    const map: Record<string, TranslationData> = {}
    LANGUAGES.forEach((lang) => {
      const existing = post?.translations.find((tr) => tr.language === lang.code)
      if (existing) {
        map[lang.code] = {
          title: existing.title,
          excerpt: existing.excerpt || '',
          content: existing.content,
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
      const url = await adminService.uploadImage(file)
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
        .filter(([, data]) => data.title.trim() && data.content.trim())
        .map(([language, data]) => ({
          language,
          title: data.title,
          excerpt: data.excerpt || null,
          content: data.content,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
        }))

      const payload = {
        slug,
        coverImageUrl: coverImageUrl || null,
        status,
        translations: translationArray,
      }

      if (post) {
        await adminService.updateBlogPost(post.id, payload)
      } else {
        await adminService.createBlogPost(payload)
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] })
      router.push(`/${locale}/admin/blog`)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!post || !window.confirm(t('confirmDelete'))) return
    setDeleting(true)
    try {
      await adminService.deleteBlogPost(post.id)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] })
      router.push(`/${locale}/admin/blog`)
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
          {post ? t('editPost') : t('newPost')}
        </h1>
        <div className="flex items-center gap-3">
          {post && (
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
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>{t('slug')}</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugManual(true)
                }}
                placeholder="my-blog-post"
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label>{t('status')}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'DRAFT' | 'PUBLISHED')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{t('draft')}</SelectItem>
                  <SelectItem value="PUBLISHED">{t('published')}</SelectItem>
                </SelectContent>
              </Select>
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
                        <span className="text-sm text-[#062E25]/40">{t('uploadImage')}</span>
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
                <div>
                  <Label>
                    {t('postTitle')} {lang.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    value={translations[lang.code].title}
                    onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)}
                    placeholder={t('titlePlaceholder')}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('excerpt')}</Label>
                  <Textarea
                    value={translations[lang.code].excerpt}
                    onChange={(e) => updateTranslation(lang.code, 'excerpt', e.target.value)}
                    placeholder={t('excerptPlaceholder')}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>
                    {t('content')} {lang.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="mt-1">
                    <RichTextEditor
                      value={translations[lang.code].content}
                      onChange={(html) => updateTranslation(lang.code, 'content', html)}
                      placeholder={t('contentPlaceholder')}
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
