'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#062E25] mb-4">{t('invalidLink')}</h2>
          <p className="text-gray-600 mb-6">{t('invalidLinkMessage')}</p>
          <Link href="/login">
            <Button className="bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]">
              {t('goToLogin')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#062E25] mb-2">{t('successTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('successMessage')}</p>
          <Link href="/login">
            <Button className="bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]">
              {t('signIn')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-[#062E25]">{t('title')}</h2>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#062E25]">{t('passwordLabel')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-12 pr-12 border-gray-300 focus:border-[#062E25] focus:ring-[#062E25]"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#062E25] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#062E25]">{t('confirmLabel')}</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-12 border-gray-300 focus:border-[#062E25] focus:ring-[#062E25]"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{t('setting')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{t('setPassword')}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
