import { getTranslations } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { REFERENCE_CONTAINER } from './reference-utils'

const ReferenceCta = async () => {
  const t = await getTranslations('referencePage')

  return (
    <section className="bg-[#062E25] py-16 lg:py-24">
      <div className={REFERENCE_CONTAINER}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-[560px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">
              {t('cta.eyebrow')}
            </p>
            <h2 className="mt-5 text-[32px] font-bold leading-[1.12] text-white sm:text-[38px] lg:text-[44px]">
              {t('cta.title')}
            </h2>
            <p className="mt-6 max-w-[450px] text-base leading-[26px] text-white/60">
              {t('cta.description')}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3.5 sm:flex-row sm:items-center">
            <Link
              href="/contact"
              className="inline-flex h-[52px] items-center rounded-full border border-white/25 px-8 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
            >
              {t('cta.contact')}
            </Link>

            <Link
              href="/solar-calculator"
              className="inline-flex h-[52px] items-center gap-4 rounded-full bg-[#B7FE1A] pl-[26px] pr-2 text-[15px] font-bold text-[#062E25] transition-opacity hover:opacity-90"
            >
              {t('cta.calculator')}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#062E25]">
                <ArrowUpRight className="h-4 w-4 text-[#B7FE1A]" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReferenceCta
