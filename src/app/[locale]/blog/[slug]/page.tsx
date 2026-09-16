import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { blogService } from '@/services/blog.service'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  buildArticleJsonLd,
  buildBreadcrumbListJsonLd,
} from '@/lib/seo/structured-data'
import {
  prepareArticle,
  readingTimeMinutes,
  splitIntro,
} from '@/lib/blog/article'
import { blogTopic, relatedPosts } from '@/lib/blog/topics'
import BlogCalculatorTeaser from '@/components/blog/BlogCalculatorTeaser'
import BlogCard from '@/components/blog/BlogCard'
import CalculatorSection from '@/components/home/CalculatorSection'
import BlogReadTracker from '@/components/blog/BlogReadTracker'
import ReadingProgress from '@/components/blog/ReadingProgress'
import TocRail from '@/components/blog/TocRail'

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
  const availableLocales = siteConfig.locales.filter(l =>
    post.translations.some(t => t.language === l)
  )
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: `/blog/${slug}`,
    title: tr.metaTitle || `${tr.title} | Free State AG`,
    description: tr.metaDescription || tr.excerpt || tr.title,
    availableLocales,
    ogImage: post.coverImageUrl
      ? { url: post.coverImageUrl, width: 1200, height: 630, alt: tr.title }
      : undefined,
  })
}

interface Props {
  params: Promise<{ slug: string }>
}

const ARTICLE_PROSE =
  'prose prose-lg max-w-none prose-headings:text-[#062E25] prose-headings:font-medium prose-h2:mt-14 prose-h2:scroll-mt-28 prose-p:text-[#062E25]/80 prose-a:text-[#036B53] prose-a:underline-offset-4 prose-a:decoration-[#036B53]/40 hover:prose-a:decoration-[#B7FE1A] prose-strong:text-[#062E25] prose-li:text-[#062E25]/80 prose-li:marker:text-[#B7FE1A] prose-em:text-[#062E25]'
const INTRO_STYLE = '[&>p:first-of-type]:text-xl [&>p:first-of-type]:font-light'
const SOURCES_STYLE =
  '[&>p:last-of-type:has(em)]:border-t [&>p:last-of-type:has(em)]:border-[#062E25]/10 [&>p:last-of-type:has(em)]:pt-6 [&>p:last-of-type:has(em)]:text-base [&>p:last-of-type:has(em)]:text-[#062E25]/75'

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

  const { html, headings } = prepareArticle(tr.content)
  const { intro, rest } = splitIntro(html)
  const topic = blogTopic(post.slug)
  const minutes = readingTimeMinutes(tr.content)
  const relatedResult = await blogService.listPublished(1, 50)
  const related = relatedPosts(post, relatedResult.data || [])

  return (
    <>
      <JsonLd
        data={buildArticleJsonLd({
          headline: tr.title,
          url: `https://www.freestate.ch/blog/${post.slug}`,
          image: post.coverImageUrl ?? undefined,
          authorName: `${post.author.firstName} ${post.author.lastName}`,
          datePublished: post.publishedAt ?? new Date().toISOString(),
          dateModified: post.updatedAt ?? undefined,
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
      <ReadingProgress targetId="article-content" />
      <BlogReadTracker
        slug={post.slug}
        targetId="article-content"
        locale={locale}
      />

      <div className="bg-[#062E25]">
        <div className="max-w-[1310px] mx-auto px-4 sm:px-6 pt-32 pb-16 lg:pb-20">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-base text-[#FDFFF5]/60 hover:text-[#FDFFF5] transition-colors mb-10"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToBlog')}
          </Link>
          <div
            className={
              post.coverImageUrl
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-10 lg:gap-16 lg:items-center'
                : ''
            }
          >
            <div>
              <p className="text-[#B7FE1A] text-base font-medium tracking-wide uppercase mb-4">
                Blog
              </p>
              <h1 className="text-[#FDFFF5] text-3xl sm:text-4xl md:text-5xl font-medium max-w-[900px]">
                {tr.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-6 text-base text-[#FDFFF5]/60 font-light">
                {post.publishedAt && (
                  <time>
                    {new Date(post.publishedAt).toLocaleDateString(
                      locale === 'de' ? 'de-CH' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </time>
                )}
                <span className="w-1 h-1 rounded-full bg-[#B7FE1A]" />
                <span>{t('readingTime', { minutes })}</span>
                <span className="w-1 h-1 rounded-full bg-[#B7FE1A]" />
                <span>
                  {post.author.firstName} {post.author.lastName}
                </span>
              </div>
            </div>
            {post.coverImageUrl && (
              <div className="relative h-64 sm:h-80 lg:h-[360px] rounded-[20px] overflow-hidden">
                <Image
                  src={post.coverImageUrl}
                  alt={tr.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 440px"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex-1"
        style={{
          backgroundImage: 'linear-gradient(180deg, #F2F4E8 0%, #FDFFF5 100%)',
        }}
      >
        <div className="max-w-[1310px] mx-auto px-4 sm:px-6 py-14 lg:py-20">
          <div className="lg:grid lg:grid-cols-[minmax(0,720px)_280px] lg:gap-16 lg:justify-center">
            <div className="max-w-[720px] mx-auto lg:mx-0">
              <article id="article-content">
                <div
                  className={`${ARTICLE_PROSE} ${INTRO_STYLE} ${rest ? '' : SOURCES_STYLE}`}
                  dangerouslySetInnerHTML={{ __html: intro }}
                />
                <BlogCalculatorTeaser topic={topic} />
                {rest && (
                  <div
                    className={`${ARTICLE_PROSE} ${SOURCES_STYLE}`}
                    dangerouslySetInnerHTML={{ __html: rest }}
                  />
                )}
              </article>

              <div className="mt-12 flex items-center gap-4 border-t border-[#062E25]/10 pt-8">
                <div className="w-12 h-12 rounded-full bg-[#062E25] text-[#FDFFF5] flex items-center justify-center text-base font-medium">
                  {post.author.firstName[0]}
                  {post.author.lastName[0]}
                </div>
                <div>
                  <p className="text-[#062E25] text-base font-medium">
                    {post.author.firstName} {post.author.lastName}
                  </p>
                  <p className="text-[#062E25]/75 text-base font-light">
                    Free State AG
                  </p>
                </div>
              </div>
            </div>

            <aside className="hidden lg:block">
              {headings.length > 0 && (
                <TocRail headings={headings} label={t('toc')} />
              )}
            </aside>
          </div>

          <div className="mt-20 rounded-[24px] overflow-clip">
            <CalculatorSection />
          </div>
          <p className="mt-8 text-center text-[#062E25]/75 text-base font-light">
            {t('ctaText')}{' '}
            <Link
              href={`/${locale}/contact`}
              className="font-medium text-[#036B53] underline underline-offset-4 decoration-[#036B53]/40 hover:decoration-[#B7FE1A]"
            >
              {t('ctaSecondary')}
            </Link>
          </p>

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="text-[#062E25] text-2xl md:text-3xl font-medium mb-8">
                {t('related')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map(p => (
                  <BlogCard key={p.id} post={p} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
export default BlogPostPage
