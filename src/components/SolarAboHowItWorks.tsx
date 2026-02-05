import { DollarSign, FileText, Handshake, Home, Lightbulb } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import HowItWorks, { HowItWorksStep } from './HowItWorks'

const SolarAboHowItWorks = async () => {
  const t = await getTranslations('solarAboHome.howItWorks')

  const steps: HowItWorksStep[] = [
    {
      number: '01',
      text: t('steps.step1'),
      icon: Home,
      bubblePosition: 'top',
    },
    {
      number: '02',
      text: t('steps.step2'),
      icon: DollarSign,
      bubblePosition: 'bottom',
    },
    {
      number: '03',
      text: t('steps.step3'),
      icon: Lightbulb,
      bubblePosition: 'top',
    },
    {
      number: '04',
      text: t('steps.step4'),
      icon: FileText,
      bubblePosition: 'bottom',
    },
    {
      number: '05',
      text: t('steps.step5'),
      icon: Handshake,
      bubblePosition: 'top',
    },
  ]

  return (
    <HowItWorks
      title={t('title')}
      subtitle={t('subtitle')}
      steps={steps}
    />
  )
}

export default SolarAboHowItWorks
