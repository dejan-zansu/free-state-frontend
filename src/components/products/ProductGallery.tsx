'use client'

import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'
import type { PublicProduct } from '@/services/product.service'

interface Props {
  name: string
  images: string[]
  references: PublicProduct['references']
}

export default function ProductGallery({ name, images, references }: Props) {
  const t = useTranslations('products.gallery')
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % images.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, images.length])

  if (images.length === 0 && references.length === 0) return null

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(280px,360px)] lg:gap-12">
      {images.length > 0 && (
        <section>
          <h2 className="text-2xl font-medium tracking-tight text-pine sm:text-[32px]">{t('title')}</h2>
          <p className="mt-1 text-base text-pine/70">{t('subtitle', { name })}</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {images.map((url, i) => (
              <li key={url}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-[18px] border border-pine/10 bg-white"
                  aria-label={t('openImage', { index: i + 1 })}
                >
                  <Image
                    src={url}
                    alt={`${name}, ${t('imageAlt', { index: i + 1 })}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 30vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {references.length > 0 && (
        <aside>
          <h2 className="text-2xl font-medium tracking-tight text-pine sm:text-[32px]">{t('references')}</h2>
          <p className="mt-1 text-base text-pine/70">{t('referencesSubtitle')}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {references.map((r) => (
              <li key={r.slug}>
                <Link
                  href={{ pathname: '/portfolio/[slug]', params: { slug: r.slug } }}
                  className="group flex items-center gap-4 rounded-[18px] border border-pine/10 bg-white p-3 transition hover:border-teal-deep/40"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[12px] bg-sage">
                    {r.coverImageUrl && (
                      <Image src={r.coverImageUrl} alt={r.title} fill sizes="96px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-pine group-hover:text-teal-deep">{r.title}</p>
                    {r.location && (
                      <p className="mt-1 flex items-center gap-1 text-base text-pine/65">
                        <MapPin className="h-4 w-4" aria-hidden />
                        {r.location}
                      </p>
                    )}
                    <p className="mt-1 text-base text-teal-deep">{t('viewReference')}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {open !== null && images[open] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={name}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-pine/90 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen((open - 1 + images.length) % images.length)
                }}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
                aria-label={t('previous')}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen((open + 1) % images.length)
                }}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
                aria-label={t('next')}
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          )}
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open]} alt={`${name}, ${t('imageAlt', { index: open + 1 })}`} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
