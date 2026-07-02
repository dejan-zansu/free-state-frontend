'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { z } from 'zod'

import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const t = useTranslations('login')
  const tAdmin = useTranslations('adminLogin')
  const tErrors = useTranslations('apiErrors')

  const loginSchema = z.object({
    email: z.string().email(t('emailError')),
    password: z.string().min(1, t('passwordError')),
  })

  type LoginForm = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    clearError()
    try {
      await login(data)
      const user = useAuthStore.getState().user
      router.push(user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    } catch {}
  }

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-[#062E25]">
            {tAdmin('title')}
          </h2>
          <p className="text-gray-600">{tAdmin('subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {tErrors.has(error) ? tErrors(error) : tErrors('unknown')}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#062E25]">
                {t('passwordLabel')}
              </Label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#062E25] hover:text-[#062E25]/80 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-12 pr-12 border-gray-300 focus:border-[#062E25] focus:ring-[#062E25]"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#062E25] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-solar hover:bg-solar/90 text-[#062E25]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>{t('signingIn')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{t('signIn')}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </form>
      </div>
    </AuthSplitLayout>
  )
}
