'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'

const ExpandIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    viewBox="0 0 25 24"
    fill="none"
    className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
  >
    <circle cx={12.5} cy={12} r={11.5} fill="#B7FE1A" stroke="#3D3858" strokeWidth={0.57} />
    <path
      d="M9.5 15L15.5 9M15.5 9H10.5M15.5 9V14"
      stroke="#3D3858"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const steps = ['propertySearch', 'projectDevelopment', 'building', 'commissioning', 'result'] as const

const OurApproachSection = () => {
  const t = useTranslations('projectDevelopment')
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="relative min-h-[872px] overflow-hidden">
      <div className="absolute inset-0 rounded-t-[40px] overflow-hidden">
        <Image
          src="/images/commercial/project-development/our-approach-bg-5dbca8.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{ background: 'rgba(168, 200, 193, 0.4)' }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background:
            'linear-gradient(0deg, rgba(242, 244, 232, 0) 18%, rgba(242, 244, 232, 1) 92%)',
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px] border border-[#63836F]"
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('approach.title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[652px]">
            {steps.map((step, i) => {
              const isOpen = openIndex === i

              return (
                <div key={step} className="relative rounded-2xl overflow-hidden">
                  <div
                    className="absolute inset-0 backdrop-blur-[70px]"
                    style={{
                      background: 'rgba(198, 213, 202, 0.32)',
                      border: '1px solid rgba(246, 246, 246, 0.4)',
                      borderRadius: '16px',
                    }}
                  />
                  <div className="relative z-10 p-[30px]">
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      className="flex items-center justify-between gap-[50px] w-full text-left"
                    >
                      <span className="text-[#062E25]/80 text-lg font-normal tracking-[-0.02em]">
                        {t(`approach.steps.${step}.title`)}
                      </span>
                      <ExpandIcon open={isOpen} />
                    </button>

                    {isOpen && (
                      <>
                        <div
                          className="my-5 h-px"
                          style={{ background: 'rgba(48, 82, 74, 0.2)' }}
                        />
                        <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em]">
                          {t(`approach.steps.${step}.description`)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurApproachSection
