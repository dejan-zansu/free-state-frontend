'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Sun, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()

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
      router.push('/dashboard')
    } catch {
      // Error is handled by the store
    }
  }

  return (
    <div className='flex-1 flex'>
      {/* Left side - Branding & Info */}
      <div className='hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden'>
        {/* Animated orbs */}
        <div className='absolute top-20 left-20 w-64 h-64 bg-solar/20 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute bottom-20 right-20 w-96 h-96 bg-energy/20 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '1s' }}
        />

        <div className='relative z-10 max-w-lg text-primary-foreground'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-14 h-14 rounded-2xl bg-solar flex items-center justify-center'>
              <Sun className='w-8 h-8 text-solar-foreground' />
            </div>
            <span className='text-3xl font-bold tracking-tight'>
              Free State AG
            </span>
          </div>

          <h1 className='text-4xl font-bold mb-6 leading-tight'>
            Harness the power of the sun for your home
          </h1>

          <p className='text-lg text-primary-foreground/80 mb-10 leading-relaxed'>
            Calculate your solar potential, design your perfect system, and
            receive instant quotes – all in one seamless experience.
          </p>

          {/* Feature highlights */}
          <div className='space-y-4'>
            <div className='flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10'>
              <div className='w-10 h-10 rounded-lg bg-solar/20 flex items-center justify-center'>
                <Zap className='w-5 h-5 text-solar' />
              </div>
              <div>
                <p className='font-medium'>Instant Solar Analysis</p>
                <p className='text-sm text-primary-foreground/60'>
                  Get your roof&apos;s solar potential in seconds
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10'>
              <div className='w-10 h-10 rounded-lg bg-energy/20 flex items-center justify-center'>
                <svg
                  className='w-5 h-5 text-energy'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83' />
                </svg>
              </div>
              <div>
                <p className='font-medium'>30% Lower Energy Costs</p>
                <p className='text-sm text-primary-foreground/60'>
                  Fixed rates with our subscription model
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className='flex-1 flex items-center justify-center p-8 lg:p-12'>
        <div className='w-full max-w-md'>
          {/* Mobile logo */}
          <div className='lg:hidden flex items-center gap-3 mb-10 justify-center'>
            <div className='w-12 h-12 rounded-xl bg-solar flex items-center justify-center'>
              <Sun className='w-7 h-7 text-solar-foreground' />
            </div>
            <span className='text-2xl font-bold tracking-tight'>
              Free State AG
            </span>
          </div>

          <div className='mb-8'>
            <h2 className='text-3xl font-bold mb-2'>Welcome back</h2>
            <p className='text-muted-foreground'>
              Sign in to access your solar dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className='mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email address</Label>
              <Input
                id='email'
                type='email'
                placeholder='name@example.com'
                autoComplete='email'
                className='h-12'
                {...register('email')}
              />
              {errors.email && (
                <p className='text-sm text-destructive'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <Link
                  href='/forgot-password'
                  className='text-sm text-primary hover:text-primary/80 transition-colors'
                >
                  Forgot password?
                </Link>
              </div>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='h-12 pr-12'
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='text-sm text-destructive'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full h-12 text-base font-medium bg-solar hover:bg-solar/90 text-solar-foreground'
              disabled={isLoading}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <svg
                    className='animate-spin w-5 h-5'
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                    />
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <span>Sign in</span>
                  <ArrowRight className='w-5 h-5' />
                </div>
              )}
            </Button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-muted-foreground'>
              Don&apos;t have an account?{' '}
              <Link
                href='/register'
                className='text-primary font-medium hover:text-primary/80 transition-colors'
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className='relative my-8'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-background text-muted-foreground'>
                Or continue as guest
              </span>
            </div>
          </div>

          <Button
            variant='outline'
            className='w-full h-12'
            onClick={() => router.push('/calculator')}
          >
            Try Solar Calculator
          </Button>
        </div>
      </div>
    </div>
  )
}
