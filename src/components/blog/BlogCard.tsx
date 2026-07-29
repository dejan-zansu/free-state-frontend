import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { AdminBlogPost, AdminBlogPostTranslation } from '@/types/admin'
import { readingTimeMinutes } from '@/lib/blog/article'

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

const BlogCard = async ({
  post,
  locale,
}: {
  post: AdminBlogPost
  locale: string
}) => {
  const t = await getTranslations('blog')
  const tr = getTranslation(post, locale)
  if (!tr) return null
  const minutes = readingTimeMinutes(tr.content)

  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="group block">
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
          <div className="flex items-center gap-2 text-base text-[#062E25]/45 font-light tracking-tight">
            {post.publishedAt && (
              <time>
                {new Date(post.publishedAt).toLocaleDateString(
                  locale === 'de' ? 'de-CH' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </time>
            )}
            <span className="w-1 h-1 rounded-full bg-[#062E25]/30" />
            <span>{t('readingTime', { minutes })}</span>
          </div>
          <h2 className="text-[#062E25] text-xl font-medium line-clamp-2">
            {tr.title}
          </h2>
          {tr.excerpt && (
            <p className="text-[#062E25]/55 text-base font-light line-clamp-2">
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
}
export default BlogCard
