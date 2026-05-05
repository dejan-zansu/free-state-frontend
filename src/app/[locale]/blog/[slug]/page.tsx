import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { blogService } from '@/services/blog.service'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  buildArticleJsonLd,
  buildBreadcrumbListJsonLd,
} from '@/lib/seo/structured-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await blogService.getBySlug(slug)
  if (!post) {
    return {
      robots: { index: false, follow: false },
      title: 'Blog | Free State AG',
    }
  }
  const tr =
    post.translations.find(t => t.language === locale) ||
    post.translations.find(t => t.language === 'de') ||
    post.translations[0]
  if (!tr) {
    return {
      robots: { index: false, follow: false },
      title: 'Blog | Free State AG',
    }
  }
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: `/blog/${slug}`,
    title: `${tr.title} | Free State AG`,
    description: tr.excerpt || tr.title,
    ogImage: post.coverImageUrl
      ? { url: post.coverImageUrl, width: 1200, height: 630, alt: tr.title }
      : undefined,
  })
}

interface Props {
  params: Promise<{ slug: string }>
}

const BlogPostPage = async ({ params }: Props) => {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('blog')
  const post = await blogService.getBySlug(slug)

  if (!post) {
    notFound()
  }

  const tr =
    post.translations.find(t => t.language === locale) ||
    post.translations.find(t => t.language === 'de') ||
    post.translations[0]

  if (!tr) {
    notFound()
  }

  return (
    <>
      <JsonLd
        data={buildArticleJsonLd({
          headline: tr.title,
          url: `https://www.freestate.ch/blog/${post.slug}`,
          image: post.coverImageUrl ?? undefined,
          authorName: `${post.author.firstName} ${post.author.lastName}`,
          datePublished: post.publishedAt ?? new Date().toISOString(),
          description: tr.excerpt ?? tr.title,
        })}
      />
      <JsonLd
        data={buildBreadcrumbListJsonLd([
          { name: 'Home', url: 'https://www.freestate.ch/' },
          { name: 'Blog', url: 'https://www.freestate.ch/blog' },
          { name: tr.title, url: `https://www.freestate.ch/blog/${post.slug}` },
        ])}
      />
      <article className="max-w-[1440px] mx-auto px-6 py-24">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-sm text-[#062E25]/60 hover:text-[#062E25] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToBlog')}
        </Link>

        {post.coverImageUrl && (
          <div className="relative h-72 md:h-[560px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.coverImageUrl}
              alt={tr.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#062E25] mb-4">
            {tr.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[#062E25]/50">
            <span>
              {post.author.firstName} {post.author.lastName}
            </span>
            {post.publishedAt && (
              <>
                <span>&middot;</span>
                <time>
                  {new Date(post.publishedAt).toLocaleDateString('de-CH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </>
            )}
          </div>
        </header>

        <div
          className="prose prose-lg max-w-none prose-headings:text-[#062E25] prose-p:text-[#062E25]/80 prose-a:text-[#062E25] prose-strong:text-[#062E25]"
          dangerouslySetInnerHTML={{ __html: tr.content }}
        />
      </article>
    </>
  )
}
export default BlogPostPage
