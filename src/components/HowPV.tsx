'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

type Props = {
  translationNamespace?: string
  row1Image: string
  row2Image?: string
}

const HowPV = ({
  translationNamespace = 'solarAboMulti',
  row1Image,
  row2Image,
}: Props) => {
  const t = useTranslations(`${translationNamespace}.howPV`)

  const rows = [
    {
      image: row1Image,
      title: t('row1.title'),
      description: t('row1.description'),
      imageFirst: true,
    },
    ...(row2Image
      ? [
          {
            image: row2Image,
            title: t('row2.title'),
            description: t('row2.description'),
            imageFirst: false,
          },
        ]
      : []),
  ]

  return (
    <section className="w-full">
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 w-full">
          <div
            className={`relative min-h-[320px] md:min-h-[488px] ${
              row.imageFirst ? 'md:order-1' : 'md:order-2'
            }`}
          >
            <Image
              src={row.image}
              alt={row.title}
              fill
              className="object-cover"
            />
          </div>
          <div
            className={`flex items-center px-6 py-12 md:px-[91px] md:py-[57px] bg-gradient-to-b from-[#F2F4E8] to-[#DCE9E6] ${
              row.imageFirst ? 'md:order-2' : 'md:order-1'
            }`}
          >
            <div className="flex flex-col gap-5 max-w-[535px]">
              <h3 className="font-figtree font-medium text-3xl md:text-[45px] text-[#062E25]">
                {row.title}
              </h3>
              <p className="font-figtree font-light text-[18px] md:text-[22px] tracking-[-0.02em] text-[#062E25]/80 whitespace-pre-line">
                {row.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default HowPV
