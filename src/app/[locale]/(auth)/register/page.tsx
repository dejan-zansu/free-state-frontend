'use client'

import { Link, useRouter } from '@/i18n/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, Eye, EyeOff, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth.store'

const languages = [
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'sr', label: 'Srpski', flag: '🇷🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const t = useTranslations('register')
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore()

  const registerSchema = z
    .object({
      email: z.string().email(t('emailError')),
      password: z
        .string()
        .min(8, t('passwordMinError'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t('passwordFormatError')
        ),
      confirmPassword: z.string(),
      firstName: z.string().min(1, t('firstNameRequired')),
      lastName: z.string().min(1, t('lastNameRequired')),
      phone: z.string().optional(),
      preferredLanguage: z.enum(['de', 'fr', 'it', 'en', 'sr', 'es']),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('passwordsNoMatch'),
      path: ['confirmPassword'],
    })

  type RegisterForm = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      preferredLanguage: 'de',
    },
  })

  const password = watch('password')

  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)

  const onSubmit = async (data: RegisterForm) => {
    clearError()
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      router.push('/dashboard')
    } catch {
    }
  }

  return (
    <div className="flex-1 flex">
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-solar/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-40 left-10 w-80 h-80 bg-energy/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="relative z-10 max-w-lg text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-solar flex items-center justify-center">
              <Sun className="w-8 h-8 text-solar-foreground" />
            </div>
            <span className="text-3xl font-bold tracking-tight">
              Free State AG
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            {t('sideTitle')}
          </h1>

          <p className="text-lg text-primary-foreground/80 mb-10 leading-relaxed">
            {t('sideDescription')}
          </p>

          <div className="space-y-4">
            {([
              t('benefit1'),
              t('benefit2'),
              t('benefit3'),
              t('benefit4'),
              t('benefit5'),
              t('benefit6'),
            ]).map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-energy/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-energy" />
                </div>
                <span className="text-primary-foreground/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-solar flex items-center justify-center">
              <Sun className="w-7 h-7 text-solar-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Free State AG
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input
                  id="firstName"
                  placeholder="Max"
                  className="h-11"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input
                  id="lastName"
                  placeholder="Muster"
                  className="h-11"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="max.muster@example.com"
                autoComplete="email"
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('phoneLabel')}{' '}
                <span className="text-muted-foreground font-normal">
                  {t('phoneOptional')}
                </span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+41 79 123 45 67"
                autoComplete="tel"
                className="h-11"
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('languageLabel')}</Label>
              <Select
                defaultValue="de"
                onValueChange={value =>
                  setValue(
                    'preferredLanguage',
                    value as RegisterForm['preferredLanguage']
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('languagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-11 pr-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div
                  className={`flex items-center gap-1.5 ${hasMinLength ? 'text-energy' : 'text-muted-foreground'}`}
                >
                  <Check className="w-3 h-3" />
                  <span>{t('minChars')}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasUppercase ? 'text-energy' : 'text-muted-foreground'}`}
                >
                  <Check className="w-3 h-3" />
                  <span>{t('uppercase')}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasLowercase ? 'text-energy' : 'text-muted-foreground'}`}
                >
                  <Check className="w-3 h-3" />
                  <span>{t('lowercase')}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasNumber ? 'text-energy' : 'text-muted-foreground'}`}
                >
                  <Check className="w-3 h-3" />
                  <span>{t('number')}</span>
                </div>
              </div>

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-11 pr-12"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-solar hover:bg-solar/90 text-solar-foreground mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>{t('creating')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{t('createAccount')}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center mt-4">
              {t('termsText')}{' '}
              <Link href="/terms" className="text-primary hover:underline">
                {t('termsLink')}
              </Link>{' '}
              {t('and')}{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                {t('privacyLink')}
              </Link>
            </p>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:text-primary/80 transition-colors"
              >
                {t('signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
