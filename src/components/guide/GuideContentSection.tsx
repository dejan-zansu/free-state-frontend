import NextLink from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { Link } from '@/i18n/navigation'
import { localizedHref } from '@/lib/blog/links'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'
import type { SiteLocale } from '@/lib/seo/site-config'

type GuideLink = { label: string; href: string }

type GuideBlock = {
  title: string
  paragraphs: string[]
  bullets?: string[]
  links?: GuideLink[]
}

type GuideFaq = { question: string; answer: string }

const LINK_CLASS =
  'group inline-flex items-center gap-2 text-[#036B53] text-base font-medium underline underline-offset-4 decoration-[#036B53]/40 hover:decoration-[#B7FE1A]'

// Long-form content for an overview page, read from `<namespace>.guide`.
// A link whose href starts with /blog/ points at a post, anything else is a
// pathname key from the routing table.
const GuideContentSection = async ({ namespace }: { namespace: string }) => {
  const t = await getTranslations(`${namespace}.guide`)
  const locale = (await getLocale()) as SiteLocale
  const blocks = t.raw('sections') as GuideBlock[]
  const faqs = t.raw('faq.items') as GuideFaq[]

  return (
    <>
      <section className="bg-[#FDFFF5] px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-[860px] mx-auto">
          <p className="text-[#036B53] text-base font-medium tracking-wide uppercase mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
            {t('title')}
          </h2>
          <p className="mt-6 text-[#062E25]/80 text-lg md:text-xl font-light">
            {t('intro')}
          </p>

          {blocks.map(block => (
            <div key={block.title} className="mt-14">
              <h3 className="text-[#062E25] text-2xl md:text-3xl font-medium">
                {block.title}
              </h3>
              {block.paragraphs.map(paragraph => (
                <p
                  key={paragraph}
                  className="mt-5 text-[#062E25]/80 text-base md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
              {block.bullets && (
                <ul className="mt-5 space-y-3 list-disc pl-6 marker:text-[#B7FE1A]">
                  {block.bullets.map(bullet => (
                    <li
                      key={bullet}
                      className="text-[#062E25]/80 text-base md:text-lg"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
              {block.links && (
                <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-3">
                  {block.links.map(link =>
                    link.href.startsWith('/blog/') ? (
                      <NextLink
                        key={link.href}
                        href={localizedHref(link.href, locale) ?? link.href}
                        className={LINK_CLASS}
                      >
                        {link.label}
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </NextLink>
                    ) : (
                      <Link
                        key={link.href}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        href={link.href as any}
                        className={LINK_CLASS}
                      >
                        {link.label}
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="bg-[#FDFFF5]">
        <JsonLd data={buildFAQPageJsonLd(faqs)} />
        <FAQAccordionSection
          eyebrow={t('faq.eyebrow')}
          title={t('faq.title')}
          description={t('faq.description')}
          items={faqs}
        />
      </div>
    </>
  )
}

export default GuideContentSection
