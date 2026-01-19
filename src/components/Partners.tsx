'use client'

import { cn } from '@/lib/utils'
import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'
import { usePathname } from 'next/navigation'
import PartnerAllianzIcon from './icons/PartnerAllianzIcon'
import PartnerBluesunIcon from './icons/PartnerBluesunIcon'
import PartnerFusionSolarIcon from './icons/PartnerFusionSolarIcon'
import PartnerK2Icon from './icons/PartnerK2Icon'
import PartnerSofarIcon from './icons/PartnerSofarIcon'
import PartnerSolarMarketIcon from './icons/PartnerSolarMarketIcon'
import PartnerSparIcon from './icons/PartnerSparIcon'
import PartnerUBSIcon from './icons/PartnerUBSIcon'

const Partners = () => {
  const pathname = usePathname()
  const isCommercial = pathname?.includes('/commercial')
  const partners = [
    {
      name: 'Allianz',
      Icon: PartnerAllianzIcon,
    },
    {
      name: 'UBS',
      Icon: PartnerUBSIcon,
    },
    {
      name: 'Sofar',
      Icon: PartnerSofarIcon,
    },
    {
      name: 'Bluesun',
      Icon: PartnerBluesunIcon,
    },
    {
      name: 'Fusion Solar',
      Icon: PartnerFusionSolarIcon,
    },
    {
      name: 'K2',
      Icon: PartnerK2Icon,
    },
    {
      name: 'Spar',
      Icon: PartnerSparIcon,
    },
    {
      name: 'Solar Market',
      Icon: PartnerSolarMarketIcon,
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
    <section className={cn('py-5', isCommercial ? 'bg-[#3D3858]' : 'bg-solar')}>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex items-center'>
          {repeatedPartners.map((partner, index) => {
            const Icon = partner.Icon
            return (
              <div
                key={`${partner.name}-${index}`}
                className='flex-none px-4 lg:px-8 flex items-center justify-center'
              >
                <Icon className={cn(isCommercial ? 'text-white' : 'text-[#062E25]')} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Partners
