import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { blogService } from '@/services/blog.service'
import BlogCard from '@/components/blog/BlogCard'
import { readingTimeMinutes } from '@/lib/blog/article'
import type { AdminBlogPost, AdminBlogPostTranslation } from '@/types/admin'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  const base = await generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/blog',
    title: t('blog.title') || '',
    description: t('blog.description') || '',
  })
  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: {
        'application/rss+xml': [
          {
            url: `/${locale}/blog/rss.xml`,
            title: `Free State AG Blog (${locale.toUpperCase()})`,
          },
        ],
      },
    },
  }
}

function getTranslation(
  post: AdminBlogPost,
  locale: string
): AdminBlogPostTranslation | undefined {
  return (
    post.translations.find(t => t.language === locale) ||
    post.translations.find(t => t.language === 'de') ||
    post.translations[0]
  )
}

const BlogPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) => {
  const locale = await getLocale()
  const t = await getTranslations('blog')
  const rawPage = Number((await searchParams).page)
  const requested = Number.isInteger(rawPage) && rawPage > 1 ? rawPage : 1
  let page = requested
  let result = await blogService.listPublished(page, 12)
  if ((result.data || []).length === 0 && page > 1) {
    page = 1
    result = await blogService.listPublished(1, 12)
  }
  const posts = result.data || []
  const totalPages = result.meta?.totalPages || 1

  const featured = page === 1 ? posts[0] : undefined
  const featuredTr = featured ? getTranslation(featured, locale) : undefined
  const rest = page === 1 ? posts.slice(1) : posts

  const pageHref = (n: number) =>
    n === 1 ? `/${locale}/blog` : `/${locale}/blog?page=${n}`

  return (
    <div
      className="flex-1 h-full"
      style={{
        backgroundImage: 'linear-gradient(180deg, #F2F4E8 0%, #FDFFF5 100%)',
      }}
    >
      <div className="max-w-[1310px] mx-auto px-4 sm:px-6 pt-32 pb-24">
        <div className="mb-14">
          <h1 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
            {t('title')}
          </h1>
        </div>

        {posts.length === 0 ? (
          <p className="text-[#062E25] text-center py-16 text-lg">
            {t('noPosts')}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {featured && featuredTr && (
              <Link
                href={`/${locale}/blog/${featured.slug}`}
                className="group block"
              >
                <article className="relative grid grid-cols-1 lg:grid-cols-2 rounded-[20px] overflow-hidden border border-[#062E25]/10 bg-white min-h-[420px]">
                  <div className="relative min-h-[280px] lg:min-h-full overflow-hidden bg-[#E5E6DE]">
                    {featured.coverImageUrl ? (
                      <Image
                        src={featured.coverImageUrl}
                        alt={featuredTr.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'linear-gradient(135deg, #E5E6DE 0%, #D1D4C4 100%)',
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col justify-center gap-5 p-8 md:p-12 lg:p-14">
                    <div className="flex items-center gap-2 text-base text-[#062E25]/75 font-light tracking-tight">
                      {featured.publishedAt && (
                        <time>
                          {new Date(featured.publishedAt).toLocaleDateString(
                            locale === 'de' ? 'de-CH' : 'en-US',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                        </time>
                      )}
                      <span className="w-1 h-1 rounded-full bg-[#062E25]/30" />
                      <span>
                        {t('readingTime', {
                          minutes: readingTimeMinutes(featuredTr.content),
                        })}
                      </span>
                    </div>
                    <h2 className="text-[#062E25] text-2xl sm:text-3xl md:text-[34px] font-medium">
                      {featuredTr.title}
                    </h2>
                    {featuredTr.excerpt && (
                      <p className="text-[#062E25] text-base md:text-lg line-clamp-3">
                        {featuredTr.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[#062E25] text-base font-medium pt-2">
                      <span className="border-b border-[#062E25] pb-0.5">
                        {t('readMore')}
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map(post => (
                  <BlogCard key={post.id} post={post} locale={locale} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-4 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    aria-label={t('paginationPrev')}
                    className="w-10 h-10 rounded-full border border-[#062E25]/15 text-[#062E25] hover:border-[#062E25]/40 flex items-center justify-center transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <Link
                    key={n}
                    href={pageHref(n)}
                    aria-current={n === page ? 'page' : undefined}
                    className={
                      n === page
                        ? 'w-10 h-10 rounded-full bg-[#B7FE1A] text-[#062E25] flex items-center justify-center text-base font-medium'
                        : 'w-10 h-10 rounded-full border border-[#062E25]/15 text-[#062E25] hover:border-[#062E25]/40 flex items-center justify-center text-base font-medium transition-colors'
                    }
                  >
                    {n}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    aria-label={t('paginationNext')}
                    className="w-10 h-10 rounded-full border border-[#062E25]/15 text-[#062E25] hover:border-[#062E25]/40 flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default BlogPage
