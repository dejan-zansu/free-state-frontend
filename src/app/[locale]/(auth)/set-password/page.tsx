'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  AuthErrorMark,
  AuthSplitLayout,
  AuthSuccessMark,
  authPanelCardClass,
} from '@/components/auth/AuthSplitLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'

export default function SetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('setPassword')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const setPasswordSchema = z
    .object({
      password: z.string().min(8, t('passwordMinError')),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('passwordsNoMatch'),
      path: ['confirmPassword'],
    })

  type SetPasswordForm = z.infer<typeof setPasswordSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
  })

  const onSubmit = async (data: SetPasswordForm) => {
    if (!token) return
    setIsLoading(true)
    setError(null)

    try {
      await authService.resetPassword(token, data.password)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('expiredError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthSplitLayout>
        <div className="w-full max-w-md">
          <div className={authPanelCardClass}>
            <AuthErrorMark />
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('invalidLink')}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {t('invalidLinkMessage')}
            </p>
            <div className="mt-8">
              <Link href="/login" className="inline-flex w-full sm:w-auto">
                <Button className="h-12 w-full rounded-xl bg-[#CDEA67] px-8 text-base font-semibold text-[#062E25] shadow-md shadow-[#062E25]/10 transition-all hover:bg-[#CDEA67]/90 hover:shadow-lg hover:shadow-[#062E25]/15">
                  {t('goToLogin')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthSplitLayout>
    )
  }

  if (isSuccess) {
    return (
      <AuthSplitLayout>
        <div className="w-full max-w-md">
          <div className={authPanelCardClass}>
            <AuthSuccessMark />
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('successTitle')}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {t('successMessage')}
            </p>
            <div className="mt-8">
              <Link href="/login" className="inline-flex w-full sm:w-auto">
                <Button className="h-12 w-full rounded-xl bg-[#CDEA67] px-8 text-base font-semibold text-[#062E25] shadow-md shadow-[#062E25]/10 transition-all hover:bg-[#CDEA67]/90 hover:shadow-lg hover:shadow-[#062E25]/15">
                  {t('signIn')}
                  <ArrowRight className="ml-2 h-4 w-4" />
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
          {t('goToLogin')}
        </Link>

        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CDEA67]/25 ring-1 ring-[#062E25]/6">
          <KeyRound className="h-6 w-6 text-[#062E25]" strokeWidth={1.75} />
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
            <Label htmlFor="password" className="text-[#062E25]">
              {t('passwordLabel')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-12 rounded-xl border-[#062E25]/12 bg-white pr-12 text-[15px] shadow-sm transition-shadow focus-visible:border-[#062E25]/35 focus-visible:ring-[#062E25]/20"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#062E25]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#062E25]">
              {t('confirmLabel')}
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-12 rounded-xl border-[#062E25]/12 bg-white text-[15px] shadow-sm transition-shadow focus-visible:border-[#062E25]/35 focus-visible:ring-[#062E25]/20"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
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
                {t('setting')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {t('setPassword')}
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </AuthSplitLayout>
  )
}
