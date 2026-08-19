'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { REFERENCE_CONTAINER } from './reference-utils'

export interface ReferenceGalleryImage {
  url: string
  alt: string | null
}

interface Props {
  images: ReferenceGalleryImage[]
  title: string
}

const pad = (value: number) => String(value).padStart(2, '0')

const ReferenceGallery = ({ images, title }: Props) => {
  const t = useTranslations('common')
  const [active, setActive] = useState(0)

  if (images.length === 0) return null

  const total = images.length
  const current = images[Math.min(active, total - 1)]
  const hasControls = total > 1

  const go = (next: number) => setActive((next + total) % total)

  return (
    <section>
      <div className={REFERENCE_CONTAINER}>
        <div
          tabIndex={hasControls ? 0 : -1}
          onKeyDown={event => {
            if (!hasControls) return
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              go(active - 1)
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              go(active + 1)
            }
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]/30 focus-visible:ring-offset-4"
        >
          <div className="relative aspect-[1240/660] w-full overflow-hidden rounded-[20px] bg-[#EAF0E4]">
            <Image
              key={current.url}
              src={current.url}
              alt={current.alt || title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1240px"
              className="object-cover"
            />

            {hasControls && (
              <>
                <div className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-[#062E25]/70 px-[18px] py-2.5 text-[13px] font-bold backdrop-blur-md sm:bottom-6 sm:left-6">
                  <span className="text-[#B7FE1A]">{pad(active + 1)}</span>
                  <span className="text-white">&nbsp;/ {pad(total)}</span>
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-6 sm:right-6">
                  <button
                    type="button"
                    aria-label={t('previous')}
                    onClick={() => go(active - 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 backdrop-blur-md transition-colors hover:bg-white sm:h-[52px] sm:w-[52px]"
                  >
                    <ChevronLeft className="h-5 w-5 text-[#062E25]" />
                  </button>
                  <button
                    type="button"
                    aria-label={t('next')}
                    onClick={() => go(active + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 backdrop-blur-md transition-colors hover:bg-white sm:h-[52px] sm:w-[52px]"
                  >
                    <ChevronRight className="h-5 w-5 text-[#062E25]" />
                  </button>
                </div>
              </>
            )}
          </div>

          {hasControls && (
            <div className="mt-[15px] flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={index === active}
                  className={cn(
                    'relative aspect-[301/177] w-[45%] shrink-0 overflow-hidden rounded-[10px] bg-[#EAF0E4] md:w-auto',
                    index === active && 'ring-2 ring-[#062E25]'
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || title}
                    fill
                    sizes="(max-width: 768px) 45vw, 301px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ReferenceGallery
