import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { blogService } from '@/services/blog.service'
import type { AdminBlogPost, AdminBlogPostTranslation } from '@/types/admin'

function getTranslation(post: AdminBlogPost, locale: string): AdminBlogPostTranslation | undefined {
  return (
    post.translations.find((t) => t.language === locale) ||
    post.translations.find((t) => t.language === 'sr') ||
    post.translations[0]
  )
}

export default async function BlogPage() {
  const locale = await getLocale()
  const t = await getTranslations('blog')
  const result = await blogService.listPublished(1, 12)
  const posts = result.data || []

  return (
    <div className="max-w-[1310px] mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-[#062E25] mb-12">{t('title')}</h1>

      {posts.length === 0 ? (
        <p className="text-[#062E25]/60 text-center py-16">{t('noPosts')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const tr = getTranslation(post, locale)
            if (!tr) return null

            return (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="group block"
              >
                <article className="border border-[#062E25]/10 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  {post.coverImageUrl ? (
                    <div className="relative h-48 bg-[#F2F4E8]">
                      <Image
                        src={post.coverImageUrl}
                        alt={tr.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-[#F2F4E8]" />
                  )}
                  <div className="p-6">
                    <time className="text-sm text-[#062E25]/40">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('de-CH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : ''}
                    </time>
                    <h2 className="text-lg font-semibold text-[#062E25] mt-2 group-hover:text-[#062E25]/80 transition-colors">
                      {tr.title}
                    </h2>
                    {tr.excerpt && (
                      <p className="text-sm text-[#062E25]/60 mt-2 line-clamp-3">
                        {tr.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
