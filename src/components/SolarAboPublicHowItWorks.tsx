'use client'

import { useTranslations } from 'next-intl'
import HowItWorks, { HowItWorksStep } from './HowItWorks'
import { HomeIcon, MoneySignIcon } from './icons'
import HandIcon from './icons/HandIcon'
import LightBulbIcon from './icons/LihghtBulbIcon'
import WalletIcon from './icons/WalletIcon'

const SolarAboPublicHowItWorks = () => {
  const t = useTranslations('solarAboPublic.howItWorks')

  const steps: HowItWorksStep[] = [
    {
      number: '01',
      text: t('steps.step1'),
      icon: HomeIcon,
      bubblePosition: 'top',
      iconStyle: { width: 40 },
    },
    {
      number: '02',
      text: t('steps.step2'),
      icon: MoneySignIcon,
      bubblePosition: 'bottom',
      iconStyle: { width: 44, height: 44 },
    },
    {
      number: '03',
      text: t('steps.step3'),
      icon: LightBulbIcon,
      bubblePosition: 'top',
    },
    {
      number: '04',
      text: t('steps.step4'),
      icon: WalletIcon,
      bubblePosition: 'bottom',
    },
    {
      number: '05',
      text: t('steps.step5'),
      icon: HandIcon,
      bubblePosition: 'top',
    },
  ]

  return (
    <HowItWorks
      title={t('title')}
      subtitle={t('subtitle')}
      steps={steps}
      isCommercial
    />
  )
}

export default SolarAboPublicHowItWorks
