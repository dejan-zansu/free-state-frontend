import Link from 'next/link'

import {
  buildExamples,
  chf,
  getCostFigures,
} from '@/lib/pricing/public-cost-figures'
import { getTranslations } from 'next-intl/server'

const CostAnchor = async () => {
  const t = await getTranslations('calculatorV2.costAnchor')
  const figures = await getCostFigures()
  const examples = buildExamples(figures, [10])
  const ten = examples.find(e => e.kwp === 10) ?? examples[0]
  if (!ten) return null

  const values = {
    min: chf(figures.minChfPerKwp),
    max: chf(figures.maxChfPerKwp),
    tenNetMin: chf(ten.netMin),
    tenNetMax: chf(ten.netMax),
    tenSubsidy: chf(ten.subsidy),
  }

  return (
    <section className="border-t border-[#062E25]/10 bg-[#FDFFF5] px-4 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-medium text-[#062E25]">
          {t('title')}
        </h2>
        <p className="mt-3 text-base text-[#062E25] tracking-tight">
          {t('perKwp', values)}
        </p>
        <p className="mt-2 text-base text-[#062E25] tracking-tight">
          {t('example', values)}
        </p>
        <p className="mt-2 text-base text-[#062E25] tracking-tight">
          {t('solarFree')}
        </p>
        <p className="mt-4 text-base text-[#062E25]/70 tracking-tight">
          {t('note')}{' '}
          <Link href="/kosten" className="underline">
            {t('linkLabel')}
          </Link>
        </p>
      </div>
    </section>
  )
}

export default CostAnchor
