'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  AuthSplitLayout,
  AuthSuccessMark,
  authPanelCardClass,
} from '@/components/auth/AuthSplitLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('emailError')),
  })

  type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.forgotPassword(data.email)
      setIsSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('genericError')
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthSplitLayout>
        <div className="w-full max-w-md">
          <div className={authPanelCardClass}>
            <AuthSuccessMark />
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('checkEmail')}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {t('checkEmailMessage')}
            </p>
            <div className="mt-8">
              <Link href="/login" className="inline-flex w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-12 w-full border-[#062E25]/15 bg-white px-8 text-[#062E25] shadow-sm transition-colors hover:bg-[#062E25]/4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToLogin')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthSplitLayout>
    )
  }

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#062E25]/70 transition-colors hover:text-[#062E25]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToLogin')}
        </Link>

        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CDEA67]/25 ring-1 ring-[#062E25]/6">
          <Mail className="h-6 w-6 text-[#062E25]" strokeWidth={1.75} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#062E25] sm:text-[2rem]">
            {t('title')}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {error && (
          <div
            className="mb-6 flex gap-3 rounded-xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-700 shadow-sm"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden
            />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#062E25]">
              {t('emailLabel')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              className="h-12 rounded-xl border-[#062E25]/12 bg-white text-[15px] shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-[#062E25]/35 focus-visible:ring-[#062E25]/20"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-[#062E25]/10 transition-all hover:shadow-lg hover:shadow-[#062E25]/15 bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                {t('sending')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {t('sendResetLink')}
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </form>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          {t('rememberPassword')}{' '}
          <Link
            href="/login"
            className="font-semibold text-[#062E25] underline-offset-4 transition-colors hover:text-[#062E25]/85 hover:underline"
          >
            {t('signInInstead')}
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  )
}
