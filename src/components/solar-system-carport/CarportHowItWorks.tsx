'use client'

import { useTranslations } from 'next-intl'
import HowItWorks, { HowItWorksStep } from '../HowItWorks'
import CarportPriceIcon from '../icons/CarportPriceIcon'
import CarportSelectIcon from '../icons/CarportSelectIcon'
import ClipboardIcon from '../icons/ClipboardIcon'
import CompassIcon from '../icons/CompassIcon'
import HeadsetIcon from '../icons/HeadsetIcon'

const CarportHowItWorks = () => {
  const t = useTranslations('solarSystemCarport.howItWorks')

  const steps: HowItWorksStep[] = [
    {
      number: '01',
      text: t('steps.step1'),
      icon: CarportSelectIcon,
      bubblePosition: 'top',
      iconStyle: { width: 47 },
    },
    {
      number: '02',
      text: t('steps.step2'),
      icon: CarportPriceIcon,
      bubblePosition: 'bottom',
      iconStyle: { width: 47 },
    },
    {
      number: '03',
      text: t('steps.step3'),
      icon: HeadsetIcon,
      bubblePosition: 'top',
      iconStyle: { width: 40 },
    },
    {
      number: '04',
      text: t('steps.step4'),
      icon: ClipboardIcon,
      bubblePosition: 'bottom',
      iconStyle: { width: 39, height: 48 },
    },
    {
      number: '05',
      text: t('steps.step5'),
      icon: CompassIcon,
      bubblePosition: 'top',
      iconStyle: { width: 45 },
    },
  ]

  return (
    <HowItWorks
      title={t('title')}
      subtitle={t('subtitle')}
      steps={steps}
      className="bg-[#EAEDDF]"
    />
  )
}

export default CarportHowItWorks
