import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { blogService } from '@/services/blog.service'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('blog')
  const post = await blogService.getBySlug(slug)

  if (!post) {
    notFound()
  }

  const tr =
    post.translations.find((t) => t.language === locale) ||
    post.translations.find((t) => t.language === 'de') ||
    post.translations[0]

  if (!tr) {
    notFound()
  }

  return (
    <>
      <article className="max-w-[800px] mx-auto px-6 py-24">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-sm text-[#062E25]/60 hover:text-[#062E25] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToBlog')}
        </Link>

        {post.coverImageUrl && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.coverImageUrl}
              alt={tr.title}
              fill
              className="object-cover"
              unoptimized
              priority
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
      <div className="h-[40px] bg-[#062E25]" />
    </>
  )
}
