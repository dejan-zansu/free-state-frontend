import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const CustomerTestimonialSection = async () => {
  const t = await getTranslations('solarSystemCarport')

  return (
    <section
      className="relative overflow-hidden py-12 md:py-[50px]"
      style={{
        background:
          'linear-gradient(9deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 0%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div className="absolute top-[-160px] right-[calc(50%-357px)] w-[374px] h-[374px] rounded-full bg-[rgba(183,254,26,0.5)] blur-[490px]" />
      <div className="absolute top-[-256px] right-[-17px] w-[291px] h-[291px] rounded-full bg-[rgba(183,254,26,0.5)] blur-[170px]" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[100px] justify-center">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center lg:text-left shrink-0">
            {t('testimonial.title')}
          </h2>

          <div className="relative bg-[rgba(123,135,126,0.32)] border border-[rgba(246,246,246,0.4)] backdrop-blur-[70px] rounded-2xl p-[30px] w-full max-w-[524px]">
            <div className="absolute top-[30px] left-[30px] pointer-events-none">
              <svg width={26} height={19} viewBox="0 0 26 19" fill="none">
                <path
                  d="M0 18.786L5.115 0H11.718L5.208 18.786H0Z"
                  fill="#B7FE1A"
                />
                <path
                  d="M13.58 18.786L18.694 0H25.298L18.788 18.786H13.58Z"
                  fill="#B7FE1A"
                />
              </svg>
            </div>

            <div className="flex flex-col gap-10 pt-6">
              <p className="text-white/80 text-lg md:text-[22px] font-light text-justify">
                {t('testimonial.quote')}
                <svg
                  width={26}
                  height={19}
                  viewBox="0 0 26 19"
                  fill="none"
                  className="inline-block ml-2 align-baseline relative -top-px"
                >
                  <path
                    d="M26 0.214L20.885 19H14.282L20.792 0.214H26Z"
                    fill="#B7FE1A"
                  />
                  <path
                    d="M12.42 0.214L7.306 19H0.702L7.212 0.214H12.42Z"
                    fill="#B7FE1A"
                  />
                </svg>
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-[59px] h-[59px] rounded-full overflow-hidden shrink-0">
                    <Image
                      src="/images/testimonial-avatar.png"
                      alt={t('testimonial.authorName')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-medium">
                        {t('testimonial.authorName')}
                      </span>
                      <span className="flex items-center gap-1 text-white/90 text-xs font-light">
                        {t('testimonial.verifiedOwner')}
                        <svg
                          width={13}
                          height={13}
                          viewBox="0 0 13 13"
                          fill="none"
                        >
                          <path
                            d="M6.5 0L7.94 1.82L10.27 1.27L10.17 3.66L12.35 4.78L10.89 6.5L12.35 8.22L10.17 9.34L10.27 11.73L7.94 11.18L6.5 13L5.06 11.18L2.73 11.73L2.83 9.34L0.65 8.22L2.11 6.5L0.65 4.78L2.83 3.66L2.73 1.27L5.06 1.82L6.5 0Z"
                            fill="#062E25"
                          />
                          <path
                            d="M4.5 6.5L5.75 7.75L8.5 5"
                            stroke="white"
                            strokeWidth={1}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                    <svg width={90} height={15} viewBox="0 0 90 15" fill="none">
                      {[0, 18.543, 37.088, 55.631, 74.174].map(x => (
                        <path
                          key={x}
                          d={`M${x + 7.1} 2.287a.87.87 0 0 1 1.667.009l1.105 2.624a.87.87 0 0 0 .779.553l2.839.176c.826.05 1.157 1.091.512 1.61l-2.104 1.69a.87.87 0 0 0-.307.943l.708 2.622c.212.784-.635 1.429-1.334 1.017l-2.605-1.535a.87.87 0 0 0-.922.001l-2.58 1.53c-.698.414-1.547-.228-1.338-1.012l.7-2.644a.87.87 0 0 0-.309-.938l-2.092-1.685c-.644-.519-.313-1.559.513-1.61l2.85-.176a.87.87 0 0 0 .775-.544l1.143-2.64Z`}
                          fill="#B7FE1A"
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-[10px] px-[11px] py-2 border border-white rounded-[5px] backdrop-blur-[65px] opacity-70">
                  <svg width={16} height={15} viewBox="0 0 16 15" fill="none">
                    <path
                      d="M7.1 2.287a.87.87 0 0 1 1.667.009l1.105 2.624a.87.87 0 0 0 .779.553l2.839.176c.826.05 1.157 1.091.512 1.61l-2.104 1.69a.87.87 0 0 0-.307.943l.708 2.622c.212.784-.635 1.429-1.334 1.017l-2.605-1.535a.87.87 0 0 0-.922.001l-2.58 1.53c-.698.414-1.547-.228-1.338-1.012l.7-2.644a.87.87 0 0 0-.309-.938L1.82 7.259c-.644-.519-.313-1.559.513-1.61l2.85-.176a.87.87 0 0 0 .775-.544L7.1 2.287Z"
                      fill="#04DA8D"
                    />
                  </svg>
                  <span className="text-white text-xs font-medium">
                    Trustpilot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default CustomerTestimonialSection
