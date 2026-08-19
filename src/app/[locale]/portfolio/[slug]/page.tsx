import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { referenceService } from '@/services/reference.service'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import ReferenceHero from '@/components/references/ReferenceHero'
import ReferenceGallery from '@/components/references/ReferenceGallery'
import type { ReferenceGalleryImage } from '@/components/references/ReferenceGallery'
import ReferenceStats from '@/components/references/ReferenceStats'
import ReferenceProject from '@/components/references/ReferenceProject'
import ReferenceQuote from '@/components/references/ReferenceQuote'
import ReferenceRelated from '@/components/references/ReferenceRelated'
import ReferenceCta from '@/components/references/ReferenceCta'
import { pickReferenceTranslation } from '@/components/references/reference-utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const reference = await referenceService.getBySlug(slug)
  if (!reference) {
    return {
      robots: { index: false, follow: false },
      title: 'Portfolio | Free State AG',
    }
  }

  const tr = pickReferenceTranslation(reference, locale)
  if (!tr) {
    return {
      robots: { index: false, follow: false },
      title: 'Portfolio | Free State AG',
    }
  }

  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: `/portfolio/${slug}`,
    title: tr.metaTitle || `${tr.title} | Free State AG`,
    description: tr.metaDescription || tr.lead || tr.subtitle || tr.title,
    ogImage: reference.coverImageUrl
      ? {
          url: reference.coverImageUrl,
          width: 1200,
          height: 630,
          alt: tr.title,
        }
      : undefined,
  })
}

interface Props {
  params: Promise<{ slug: string }>
}

const ReferenceDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const locale = await getLocale()
  const reference = await referenceService.getBySlug(slug)

  if (!reference) {
    notFound()
  }

  const tr = pickReferenceTranslation(reference, locale)

  if (!tr) {
    notFound()
  }

  const galleryImages: ReferenceGalleryImage[] =
    reference.images.length > 0
      ? reference.images.map(image => ({ url: image.url, alt: image.alt }))
      : reference.coverImageUrl
        ? [{ url: reference.coverImageUrl, alt: tr.title }]
        : []

  const related = await referenceService.getRelated(slug, 3)

  return (
    <div className="bg-white">
      <ReferenceHero
        reference={reference}
        translation={tr}
        hasGallery={galleryImages.length > 0}
      />

      {galleryImages.length > 0 && (
        <div className="relative lg:-mt-[148px]">
          <ReferenceGallery images={galleryImages} title={tr.title} />
        </div>
      )}

      <ReferenceStats reference={reference} />
      <ReferenceProject reference={reference} translation={tr} />
      <ReferenceQuote reference={reference} translation={tr} />
      <ReferenceRelated references={related} locale={locale} />
      <ReferenceCta />
    </div>
  )
}

export default ReferenceDetailPage
