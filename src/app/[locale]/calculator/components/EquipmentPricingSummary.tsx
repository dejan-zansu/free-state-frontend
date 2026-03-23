'use client'

import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import type { EquipmentQuote } from '@/types/equipment'

interface EquipmentPricingSummaryProps {
  quote: EquipmentQuote | null
  loading: boolean
  subsidyAmount: number
  netAmount: number
  annualSavings: number
}

export default function EquipmentPricingSummary({
  quote,
  loading,
  subsidyAmount,
  netAmount,
  annualSavings,
}: EquipmentPricingSummaryProps) {
  const t = useTranslations('solarAboCalculator.results.pricing')

  return (
    <Card>
      <CardContent className='pt-6'>
        <h2 className='text-lg font-semibold mb-4'>{t('title')}</h2>

        {loading ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : quote && quote.items.length > 0 ? (
          <>
            <div className='space-y-2 mb-4'>
              {quote.items.map(item => (
                <div key={item.equipmentId} className='flex justify-between items-center py-1.5 text-sm'>
                  <span className='text-muted-foreground'>
                    {item.quantity > 1 ? `${item.quantity} × ` : ''}{item.displayName}
                  </span>
                  <span className='font-medium'>
                    CHF {Math.round(item.totalPrice).toLocaleString('de-CH')}
                  </span>
                </div>
              ))}
            </div>

            <div className='space-y-3 border-t pt-3'>
              <div className='flex justify-between items-center py-1'>
                <span className='text-sm text-muted-foreground'>{t('gross')}</span>
                <span className='font-semibold'>
                  CHF {Math.round(quote.subtotal).toLocaleString('de-CH')}
                </span>
              </div>
              <div className='flex justify-between items-center py-1'>
                <span className='text-sm text-muted-foreground'>{t('subsidy')}</span>
                <span className='font-semibold text-green-600'>
                  - CHF {Math.round(subsidyAmount).toLocaleString('de-CH')}
                </span>
              </div>
              <div className='flex justify-between items-center py-3 bg-[#F5F7EE] rounded-lg px-3 -mx-3'>
                <span className='font-semibold'>{t('net')}</span>
                <span className='text-xl font-bold text-[#062E25]'>
                  CHF {Math.round(netAmount).toLocaleString('de-CH')}
                </span>
              </div>
            </div>

            <div className='mt-4 pt-3 border-t'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>{t('annualSavings')}</span>
                <span className='font-semibold'>
                  CHF {Math.round(annualSavings).toLocaleString('de-CH')}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            Select equipment to see pricing
          </p>
        )}
      </CardContent>
    </Card>
  )
}
