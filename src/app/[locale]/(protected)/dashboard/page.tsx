'use client'

import {
  ArrowRight,
  BarChart3,
  Calculator,
  FileText,
  Leaf,
  LogOut,
  Settings,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore, useUser } from '@/stores/auth.store'

export default function DashboardPage() {
  const router = useRouter()
  const user = useUser()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const quickActions = [
    {
      title: 'Solar Calculator',
      description: "Calculate your roof's solar potential",
      icon: Calculator,
      href: '/calculator' as const,
      color: 'bg-solar/10 text-solar',
    },
    {
      title: 'My Quotes',
      description: 'View and manage your quotes',
      icon: FileText,
      href: '/quotes' as const,
      color: 'bg-energy/10 text-energy',
    },
    {
      title: 'Analytics',
      description: 'Track your energy production',
      icon: BarChart3,
      href: '/analytics' as const,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Settings',
      description: 'Manage your account settings',
      icon: Settings,
      href: '/settings' as const,
      color: 'bg-muted text-muted-foreground',
    },
  ]

  const stats = [
    {
      label: 'Potential Savings',
      value: 'CHF 1,200',
      subtext: 'per year',
      icon: TrendingUp,
      color: 'text-energy',
    },
    {
      label: 'Energy Production',
      value: '8,500',
      subtext: 'kWh/year',
      icon: Zap,
      color: 'text-solar',
    },
    {
      label: 'CO₂ Offset',
      value: '3.2',
      subtext: 'tons/year',
      icon: Leaf,
      color: 'text-energy',
    },
  ]

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-1'>
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className='text-muted-foreground'>
            Here&apos;s an overview of your solar journey
          </p>
        </div>
        <Button variant='outline' onClick={handleLogout} className='w-fit'>
          <LogOut className='w-4 h-4 mr-2' />
          Sign out
        </Button>
      </div>

      {/* Stats cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        {stats.map((stat, index) => (
          <Card key={index} className='relative overflow-hidden'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>
                    {stat.label}
                  </p>
                  <p className='text-3xl font-bold'>{stat.value}</p>
                  <p className='text-sm text-muted-foreground'>
                    {stat.subtext}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className='w-6 h-6' />
                </div>
              </div>
            </CardContent>
            <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-solar via-energy to-solar' />
          </Card>
        ))}
      </div>

      {/* Call to Action Banner */}
      <Card className='mb-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-solar/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <CardContent className='p-8 relative z-10'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-2xl bg-solar flex items-center justify-center'>
                <Sun className='w-9 h-9 text-solar-foreground' />
              </div>
              <div>
                <h2 className='text-2xl font-bold mb-1'>
                  Start Your Solar Project
                </h2>
                <p className='text-primary-foreground/80'>
                  Use our calculator to get an instant estimate for your
                  property
                </p>
              </div>
            </div>
            <Button
              size='lg'
              className='bg-solar hover:bg-solar/90 text-solar-foreground'
              onClick={() => router.push('/calculator')}
            >
              Launch Calculator
              <ArrowRight className='w-5 h-5 ml-2' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-4'>Quick Actions</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className='h-full hover:shadow-md transition-shadow cursor-pointer group'>
                <CardHeader className='pb-2'>
                  <div
                    className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className='w-6 h-6' />
                  </div>
                  <CardTitle className='text-lg'>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Recent Activity</h2>
        <Card>
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4'>
              <FileText className='w-8 h-8 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium mb-2'>No recent activity</h3>
            <p className='text-muted-foreground mb-4'>
              Start by using our solar calculator to get your first quote
            </p>
            <Button onClick={() => router.push('/calculator')}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
