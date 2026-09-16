import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { TOPIC_PATHS, isPageTopic, type BlogTopic } from '@/lib/blog/topics'
import CalculatorJumpButton from './CalculatorJumpButton'

const BlogCalculatorTeaser = async ({ topic }: { topic: BlogTopic | null }) => {
  const t = await getTranslations('blog')
  const locale = await getLocale()
  const showTopicLink =
    isPageTopic(topic) &&
    (topic !== 'subsidies' || locale === 'de' || locale === 'en')

  return (
    <aside className="not-prose my-10 rounded-[20px] border border-[#062E25]/10 bg-white px-6 py-7 md:px-8">
      <p className="text-[#036B53] text-base font-medium uppercase tracking-wide">
        {t('calcTeaserEyebrow')}
      </p>
      <p className="mt-2 text-[#062E25] text-xl md:text-2xl font-medium">
        {t('calcTeaserTitle')}
      </p>
      <p className="mt-2 text-[#062E25]/75 text-base font-light">
        {t('calcTeaserText')}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <CalculatorJumpButton label={t('ctaPrimary')} />
        {showTopicLink && isPageTopic(topic) && (
          <Link
            href={TOPIC_PATHS[topic]}
            className="inline-flex items-center gap-2 text-base font-medium text-[#036B53] underline underline-offset-4 decoration-[#036B53]/40 hover:decoration-[#B7FE1A]"
          >
            {t(`topicLink.${topic}`)}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  )
}

export default BlogCalculatorTeaser
