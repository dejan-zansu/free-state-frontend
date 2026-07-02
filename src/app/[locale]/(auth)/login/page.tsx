'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { z } from 'zod'

import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'

export default function LoginPage() {
  const t = useTranslations('login')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const loginSchema = z.object({
    email: z.string().email(t('emailError')),
  })

  type LoginForm = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null)
    try {
      await authService.requestMagicLink(data.email)
      setSentTo(data.email)
    } catch {
      setSubmitError(t('magicError'))
    }
  }

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md">
        {sentTo ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#062E25]/5 ring-1 ring-[#062E25]/10">
              <MailCheck className="h-7 w-7 text-[#062E25]" aria-hidden />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-[#062E25]">
              {t('checkEmailTitle')}
            </h2>
            <p className="text-gray-600">
              {t('checkEmailBody', { email: sentTo })}
            </p>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="mt-8 text-sm font-medium text-[#062E25] hover:text-[#062E25]/80 transition-colors"
            >
              {t('useAnotherEmail')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-[#062E25]">
                {t('title')}
              </h2>
              <p className="text-gray-600">{t('magicSubtitle')}</p>
            </div>

            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#062E25]">
                  {t('emailLabel')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  className="h-12 border-gray-300 focus:border-[#062E25] focus:ring-[#062E25]"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-solar hover:bg-solar/90 text-[#062E25]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>{t('sending')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{t('sendLink')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthSplitLayout>
  )
}
