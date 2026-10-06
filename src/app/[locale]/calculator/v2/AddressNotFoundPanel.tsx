'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

const ACTION_CLASS =
  'min-h-12 w-full whitespace-normal rounded-xl border-[#062E25]/25 bg-white text-base text-[#062E25] hover:bg-[#062E25]/5'

export default function AddressNotFoundPanel({
  onEdit,
  onMap,
  onManual,
}: {
  onEdit: () => void
  onMap?: () => void
  onManual: () => void
}) {
  const t = useTranslations('calculatorV2.screen1.notFound')

  return (
    <div
      data-hj-suppress
      data-cs-mask
      className="mt-4 rounded-2xl border border-[#062E25]/15 bg-white p-4 shadow-sm"
    >
      <div role="alert">
        <p className="text-lg font-medium text-[#062E25]">{t('title')}</p>
        <p className="mt-1 text-base text-[#062E25]/80 tracking-tight">
          {t('body')}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          onMouseDown={event => event.preventDefault()}
          onClick={onEdit}
          className={ACTION_CLASS}
        >
          {t('edit')}
        </Button>
        {onMap && (
          <Button
            type="button"
            variant="outline"
            onClick={onMap}
            className={ACTION_CLASS}
          >
            {t('map')}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onManual}
          className={ACTION_CLASS}
        >
          {t('manual')}
        </Button>
      </div>
    </div>
  )
}
