import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import BlogCard from '@/components/blog/BlogCard'
import { blogTopic, type BlogTopic } from '@/lib/blog/topics'
import { cn } from '@/lib/utils'
import { blogService } from '@/services/blog.service'
import type { AdminBlogPost } from '@/types/admin'

const POST_COUNT = 3
const FETCH_LIMIT = 100

async function loadPosts(topic?: BlogTopic): Promise<AdminBlogPost[]> {
  try {
    const result = await blogService.listPublished(1, FETCH_LIMIT)
    const posts = Array.isArray(result?.data) ? result.data : []
    if (!topic) return posts.slice(0, POST_COUNT)
    const matching = posts.filter(post => blogTopic(post.slug) === topic)
    const rest = posts.filter(post => blogTopic(post.slug) !== topic)
    return [...matching, ...rest].slice(0, POST_COUNT)
  } catch {
    return []
  }
}

const LatestPostsSection = async ({
  topic,
  className,
}: {
  topic?: BlogTopic
  className?: string
}) => {
  const posts = await loadPosts(topic)
  if (posts.length === 0) return null

  const locale = await getLocale()
  const t = await getTranslations('blog')

  return (
    <section className={cn('relative w-full', className)}>
      <div className="max-w-[1214px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h2 className="text-[#062E25] text-2xl md:text-3xl font-medium">
            {t('latestTitle')}
          </h2>
          <Link
            href={locale === 'de' ? '/blog' : `/${locale}/blog`}
            className="group inline-flex items-center gap-2 text-[#062E25] text-base font-medium"
          >
            <span className="border-b border-[#062E25] pb-0.5">
              {t('allPosts')}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LatestPostsSection
