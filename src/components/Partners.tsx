'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'

const Partners = () => {
  const partners = [
    {
      name: 'Allianz',
      image: '/images/partners/allianz.png',
    },
    {
      name: 'UBS',
      image: '/images/partners/ubs.png',
    },
    {
      name: 'ZURICH',
      image: '/images/partners/zurich.png',
    },
  ]

  const repeatedPartners = Array(10).fill(partners).flat()

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
    },
    [
      AutoScroll({
        speed: 0.5,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    ]
  )

  return (
    <section className='py-8 bg-solar'>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex items-center'>
          {repeatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className='flex-none px-4 lg:px-8'
            >
              <Image
                src={partner.image}
                alt={partner.name}
                width={100}
                height={100}
                className='object-contain'
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Partners
