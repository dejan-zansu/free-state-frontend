'use client'

import { Link, useRouter } from '@/i18n/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
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
import Image from 'next/image'

const languages = [
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  // { value: 'fr', label: 'Français', flag: '🇫🇷' },
  // { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  // { value: 'sr', label: 'Srpski', flag: '🇷🇸' },
  // { value: 'es', label: 'Español', flag: '🇪🇸' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const t = useTranslations('register')
  const tErrors = useTranslations('apiErrors')
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore()

  const registerSchema = z
    .object({
      email: z.string().email(t('emailError')),
      password: z.string().min(6, t('passwordMinError')),
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

  const onSubmit = async (data: RegisterForm) => {
    clearError()
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      router.push('/dashboard')
    } catch {}
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/about-us-last-section-image-52b37f.webp"
          alt="Solar panels on rooftops"
          fill
          className="object-cover"
          priority
          quality={100}
          unoptimized
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {tErrors.has(error) ? tErrors(error) : tErrors('unknown')}
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

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('confirmPasswordLabel')}
              </Label>
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
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>{t('creating')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{t('createAccount')}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>

            <p className="text-sm lg:text-base text-muted-foreground text-center mt-4">
              {t('termsText')}{' '}
              <Link href="/agb" className="text-primary hover:underline">
                {t('termsLink')}
              </Link>{' '}
              {t('and')}{' '}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline"
              >
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
