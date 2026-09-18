'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, MessageSquareText, Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { productService, type ProductEquipmentType } from '@/services/product.service'

interface Props {
  equipmentType: ProductEquipmentType
  equipmentId: string
  productName: string
  approvedCount: number
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn('h-4 w-4', n <= value ? 'fill-lime text-lime' : 'text-pine/20')} />
      ))}
    </span>
  )
}

export default function ProductComments({ equipmentType, equipmentId, productName, approvedCount }: Props) {
  const t = useTranslations('products.comments')
  const locale = useLocale()
  const queryClient = useQueryClient()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['product-comments', equipmentType, equipmentId],
    queryFn: () => productService.getComments(equipmentType, equipmentId),
    staleTime: 60_000,
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [website, setWebsite] = useState('')
  const [touched, setTouched] = useState(false)

  const nameOk = name.trim().length >= 2
  const bodyOk = body.trim().length >= 10
  const emailOk = email.trim() === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())

  const mutation = useMutation({
    mutationFn: () =>
      productService.createComment({
        equipmentType,
        equipmentId,
        authorName: name.trim(),
        authorEmail: email.trim() || undefined,
        body: body.trim(),
        rating,
        language: ['de', 'en', 'fr', 'it'].includes(locale) ? locale : 'de',
        website,
      }),
    onSuccess: () => {
      setName('')
      setEmail('')
      setBody('')
      setRating(null)
      setTouched(false)
      void queryClient.invalidateQueries({ queryKey: ['product-comments', equipmentType, equipmentId] })
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!nameOk || !bodyOk || !emailOk) return
    mutation.mutate()
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === 'en' ? 'en-CH' : `${locale}-CH`, { dateStyle: 'medium' })

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(320px,420px)] lg:gap-14">
      <section>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-medium tracking-tight text-pine sm:text-[32px]">{t('title')}</h2>
          <span className="rounded-full bg-sage px-3 py-1 text-base font-medium text-pine/80 tabular-nums">
            {comments.length || approvedCount}
          </span>
        </div>
        <p className="mt-1 text-base text-pine/70">{t('subtitle', { name: productName })}</p>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-base text-pine/60">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t('loading')}
          </div>
        ) : comments.length === 0 ? (
          <div className="mt-8 flex items-start gap-3 rounded-[20px] border border-dashed border-pine/15 bg-white p-6 text-base text-pine/70">
            <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-teal-deep" aria-hidden />
            {t('empty')}
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-pine/8">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-4 py-6 first:pt-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage text-base font-semibold text-pine">
                  {initials(c.authorName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-base font-semibold text-pine">{c.authorName}</p>
                    <time dateTime={c.createdAt} className="text-base text-pine/55">
                      {dateFormatter.format(new Date(c.createdAt))}
                    </time>
                    {c.rating != null && (
                      <span className="flex items-center gap-1">
                        <Stars value={c.rating} />
                        <span className="sr-only">{t('ratingOf', { value: c.rating })}</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-pine/85">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside>
        <form
          onSubmit={submit}
          noValidate
          className="rounded-[24px] border border-pine/10 bg-white p-6 shadow-[0_8px_24px_rgba(6,46,37,0.06)] sm:p-7"
        >
          <h3 className="text-xl font-medium tracking-tight text-pine">{t('formTitle')}</h3>
          <p className="mt-1 text-base text-pine/65">{t('formSubtitle')}</p>

          {mutation.isSuccess && (
            <p role="status" className="mt-4 rounded-[14px] bg-lime/30 px-4 py-3 text-base text-pine">
              {t('success')}
            </p>
          )}
          {mutation.isError && (
            <p role="alert" className="mt-4 rounded-[14px] bg-energy/10 px-4 py-3 text-base text-energy">
              {t('error')}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <Label htmlFor="pc-name" className="text-base text-pine">
                {t('name')}
              </Label>
              <Input
                id="pc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
                className="mt-1.5 h-11 text-base"
                aria-invalid={touched && !nameOk}
              />
              {touched && !nameOk && <p className="mt-1 text-base text-energy">{t('nameError')}</p>}
            </div>
            <div>
              <Label htmlFor="pc-email" className="text-base text-pine">
                {t('email')} <span className="text-pine/50">({t('optional')})</span>
              </Label>
              <Input
                id="pc-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                maxLength={200}
                className="mt-1.5 h-11 text-base"
                aria-invalid={touched && !emailOk}
              />
              <p className="mt-1 text-base text-pine/55">{t('emailHint')}</p>
              {touched && !emailOk && <p className="mt-1 text-base text-energy">{t('emailError')}</p>}
            </div>
            <div>
              <p className="text-base text-pine">
                {t('rating')} <span className="text-pine/50">({t('optional')})</span>
              </p>
              <div className="mt-1.5 flex items-center gap-1" role="radiogroup" aria-label={t('rating')}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={t('ratingOf', { value: n })}
                    onClick={() => setRating(rating === n ? null : n)}
                    className="rounded-md p-1 transition hover:scale-110"
                  >
                    <Star className={cn('h-6 w-6', rating != null && n <= rating ? 'fill-lime text-lime' : 'text-pine/25')} aria-hidden />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="pc-body" className="text-base text-pine">
                {t('body')}
              </Label>
              <Textarea
                id="pc-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('bodyPlaceholder')}
                rows={5}
                maxLength={2000}
                className="mt-1.5 min-h-[130px] text-base"
                aria-invalid={touched && !bodyOk}
              />
              {touched && !bodyOk && <p className="mt-1 text-base text-energy">{t('bodyError')}</p>}
            </div>
            {/* Honeypot, hidden from people, filled by bots */}
            <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
              <label htmlFor="pc-website">Website</label>
              <input id="pc-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-pine px-6 text-base font-medium text-white transition hover:bg-teal-deep disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {t('submitting')}
                </>
              ) : (
                t('submit')
              )}
            </button>
            <p className="text-sm text-pine/55 sm:text-base">{t('moderationNote')}</p>
          </div>
        </form>
      </aside>
    </div>
  )
}
