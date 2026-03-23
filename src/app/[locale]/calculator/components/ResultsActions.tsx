'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

interface ResultsActionsProps {
  onError?: (error: string) => void
}

export default function ResultsActions({ onError }: ResultsActionsProps) {
  const t = useTranslations('solarAboCalculator.results')
  const store = useSolarAboCalculatorStore()

  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [offerRequesting, setOfferRequesting] = useState(false)
  const [offerRequested, setOfferRequested] = useState(false)

  const handleEmailReport = async () => {
    setEmailSending(true)
    try {
      await store.emailReport()
      setEmailSent(true)
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setEmailSending(false)
    }
  }

  const handleRequestOffer = async () => {
    setOfferRequesting(true)
    try {
      await store.requestOffer()
      setOfferRequested(true)
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err.message : 'Failed to request offer')
    } finally {
      setOfferRequesting(false)
    }
  }

  const handleSignContract = () => {
    store.setResultsPath('contract')
    store.nextStep()
  }

  return (
    <div className='space-y-3'>
      <div className='rounded-2xl border border-[#062E25]/15 bg-white/80 p-5 backdrop-blur-sm'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='min-w-0'>
            <h3 className='text-base font-semibold text-[#062E25]'>{t('actions.downloadTitle')}</h3>
            <p className='mt-1 text-sm text-[#062E25]/65'>{t('actions.downloadDescription')}</p>
          </div>
          <Button
            variant='outline'
            onClick={handleEmailReport}
            disabled={emailSending || emailSent}
            style={{ borderColor: '#062E25', color: '#062E25' }}
            className='w-full sm:w-auto shrink-0'
          >
            {emailSending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {emailSent && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
            {emailSent ? t('actions.emailSent') : t('actions.downloadButton')}
          </Button>
        </div>
      </div>

      <div className='rounded-2xl border border-[#062E25]/15 bg-white/80 p-5 backdrop-blur-sm'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='min-w-0'>
            <h3 className='text-base font-semibold text-[#062E25]'>{t('actions.offerTitle')}</h3>
            <p className='mt-1 text-sm text-[#062E25]/65'>{t('actions.offerDescription')}</p>
          </div>
          <Button
            variant='outline'
            onClick={handleRequestOffer}
            disabled={offerRequesting || offerRequested}
            style={{ borderColor: '#062E25', color: '#062E25' }}
            className='w-full sm:w-auto shrink-0'
          >
            {offerRequesting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {offerRequested && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
            {offerRequested ? t('actions.offerSent') : t('actions.offerButton')}
          </Button>
        </div>
      </div>

      <div className='rounded-2xl border border-[#062E25]/30 bg-[#F5F7EE] p-5'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='min-w-0'>
            <h3 className='text-base font-semibold text-[#062E25]'>{t('actions.contractTitle')}</h3>
            <p className='mt-1 text-sm text-[#062E25]/65'>{t('actions.contractDescription')}</p>
          </div>
          <Button
            onClick={handleSignContract}
            className='w-full sm:w-auto shrink-0 bg-[#062E25] text-white hover:bg-[#062E25]/90'
          >
            {t('actions.contractButton')}
          </Button>
        </div>
      </div>
    </div>
  )
}
