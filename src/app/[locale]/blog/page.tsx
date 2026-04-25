import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { blogService } from '@/services/blog.service'
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
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/blog',
    title: t('blog.title') || '',
    description: t('blog.description') || '',
  })
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

const BlogPage = async () => {
  const locale = await getLocale()
  const t = await getTranslations('blog')
  const result = await blogService.listPublished(1, 12)
  const posts = result.data || []

  const featured = posts[0]
  const featuredTr = featured ? getTranslation(featured, locale) : undefined
  const rest = posts.slice(1)

  return (
    <div
      className="flex-1 h-full"
      style={{
        backgroundImage: 'linear-gradient(180deg, #F2F4E8 0%, #FDFFF5 100%)',
      }}
    >
      <div className="max-w-[1310px] mx-auto px-4 sm:px-6 pt-32 pb-24">
        <div className="mb-14">
          <h1 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em]">
            {t('title')}
          </h1>
        </div>

        {posts.length === 0 ? (
          <p className="text-[#062E25]/60 text-center py-16 text-lg">
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
                    {featured.publishedAt && (
                      <time className="text-base text-[#062E25]/50 font-light tracking-tight">
                        {new Date(featured.publishedAt).toLocaleDateString(
                          locale === 'de' ? 'de-CH' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </time>
                    )}
                    <h2 className="text-[#062E25] text-2xl sm:text-3xl md:text-[34px] font-medium leading-[1.15em]">
                      {featuredTr.title}
                    </h2>
                    {featuredTr.excerpt && (
                      <p className="text-[#062E25]/60 text-base md:text-lg font-light leading-[1.6] line-clamp-3">
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
                {rest.map(post => {
                  const tr = getTranslation(post, locale)
                  if (!tr) return null

                  return (
                    <Link
                      key={post.id}
                      href={`/${locale}/blog/${post.slug}`}
                      className="group block"
                    >
                      <article className="relative h-full rounded-[20px] overflow-hidden border border-[#062E25]/10 bg-white flex flex-col">
                        <div className="relative aspect-16/10 overflow-hidden bg-[#E5E6DE]">
                          {post.coverImageUrl ? (
                            <Image
                              src={post.coverImageUrl}
                              alt={tr.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
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

                        <div className="flex flex-col gap-3 p-6 pb-7 flex-1">
                          {post.publishedAt && (
                            <time className="text-[15px] text-[#062E25]/45 font-light tracking-tight">
                              {new Date(post.publishedAt).toLocaleDateString(
                                locale === 'de' ? 'de-CH' : 'en-US',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}
                            </time>
                          )}
                          <h2 className="text-[#062E25] text-xl font-medium leading-[1.25em] line-clamp-2">
                            {tr.title}
                          </h2>
                          {tr.excerpt && (
                            <p className="text-[#062E25]/55 text-base font-light leading-[1.55] line-clamp-2">
                              {tr.excerpt}
                            </p>
                          )}
                          <div className="mt-auto pt-3 flex items-center gap-2 text-[#062E25] text-base font-medium">
                            <span className="border-b border-[#062E25] pb-0.5">
                              {t('readMore')}
                            </span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default BlogPage
