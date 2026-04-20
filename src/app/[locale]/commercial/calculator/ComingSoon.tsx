'use client'

import { useTranslations } from 'next-intl'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

export default function ComingSoon() {
  const t = useTranslations('common')

  return (
    <div
      className="h-screen overflow-hidden relative flex items-center justify-center px-4"
      style={{
        paddingTop: '77px',
        background: PAGE_BG,
      }}
    >
      <div
        className="rounded-3xl px-6 py-10 sm:px-12 sm:py-14 max-w-[640px] w-full text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(156, 169, 166, 0.3)',
          backdropFilter: 'blur(29px)',
          boxShadow: '0px 25px 34px 0px rgba(183, 254, 26, 0.1)',
        }}
      >
        <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#062E25]">
          {t('comingSoon')}
        </h1>
      </div>
    </div>
  )
}
