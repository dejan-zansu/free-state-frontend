'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Calculator, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function HomePage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  const stats = [
    { value: '50+', label: t('home.stats.experience') },
    { value: '500+', label: t('home.stats.customers') },
    { value: '1.000+', label: t('home.stats.installations') },
    { value: '35+', label: t('home.stats.savings') },
  ]

  const features = [
    {
      title: t('home.features.noInvestment.title'),
      description: t('home.features.noInvestment.description'),
      icon: '💰',
    },
    {
      title: t('home.features.fullService.title'),
      description: t('home.features.fullService.description'),
      icon: '🛠️',
    },
    {
      title: t('home.features.longTerm.title'),
      description: t('home.features.longTerm.description'),
      icon: '📈',
    },
  ]

  const portfolioItems = [
    {
      number: '01',
      title: t('home.portfolio.item1.title'),
      details: t('home.portfolio.item1.details'),
    },
    {
      number: '02',
      title: t('home.portfolio.item2.title'),
      details: t('home.portfolio.item2.details'),
    },
    {
      number: '03',
      title: t('home.portfolio.item3.title'),
      details: t('home.portfolio.item3.details'),
    },
  ]

  return (
    <div className='min-h-screen'>
      {/* Hero Section - Matching Figma exactly */}
      <section 
        className='relative text-white overflow-hidden' 
        style={{ 
          backgroundColor: '#4a9a99',
          minHeight: '879px'
        }}
      >
        {/* Background image/gradient overlay */}
        <div 
          className='absolute inset-0'
          style={{
            background: 'linear-gradient(0deg, rgba(74, 154, 153, 0) 0%, rgba(74, 154, 153, 1) 100%)',
            top: '200px',
            height: '229px'
          }}
        />

        <div className='relative container mx-auto px-4' style={{ maxWidth: '1440px' }}>
          {/* Logo - Top Left */}
          <div className='absolute top-9 left-6 flex items-center gap-3'>
            <div 
              className='rounded-lg border-2 flex items-center justify-center'
              style={{
                width: '29.26px',
                height: '29.26px',
                borderColor: '#ffffff',
                borderWidth: '3.92px'
              }}
            >
              <div 
                className='rounded-sm'
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            <span 
              className='font-medium'
              style={{
                fontSize: '24.44px',
                lineHeight: '1.1em',
                letterSpacing: '-0.02em'
              }}
            >
              FreeState AG
            </span>
          </div>

          {/* Navigation Pills - Top Center */}
          <div 
            className='absolute flex items-center gap-0.5'
            style={{
              top: '37px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <Link href={`/${locale}`}>
              <Button
                variant='outline'
                className='rounded-full border-0'
                style={{
                  backgroundColor: '#b7fe1a',
                  color: '#062e25',
                  padding: '5px 15px',
                  fontSize: '16px',
                  lineHeight: '1.125em',
                  borderRadius: '40px'
                }}
              >
                {t('nav.home')}
              </Button>
            </Link>
            <Link href={`/${locale}/calculator`}>
              <Button
                variant='outline'
                className='rounded-full'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  borderWidth: '1px',
                  padding: '5px 15px',
                  fontSize: '16px',
                  borderRadius: '40px'
                }}
              >
                {t('nav.calculator')}
              </Button>
            </Link>
            <Link href={`/${locale}/solutions`}>
              <Button
                variant='outline'
                className='rounded-full'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  borderWidth: '1px',
                  padding: '5px 15px',
                  fontSize: '16px',
                  borderRadius: '40px'
                }}
              >
                {t('nav.solutions')}
              </Button>
            </Link>
            <Link href={`/${locale}/companies`}>
              <Button
                variant='outline'
                className='rounded-full'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#f7f7f8',
                  borderColor: '#ffffff',
                  borderWidth: '1px',
                  padding: '5px 15px',
                  fontSize: '16px',
                  borderRadius: '40px'
                }}
              >
                {t('nav.companies')}
              </Button>
            </Link>
            <Link href={`/${locale}/portfolio`}>
              <Button
                variant='outline'
                className='rounded-full'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#f7f7f8',
                  borderColor: '#ffffff',
                  borderWidth: '1px',
                  padding: '5px 15px',
                  fontSize: '16px',
                  borderRadius: '40px'
                }}
              >
                {t('nav.portfolio')}
              </Button>
            </Link>
            <Link href={`/${locale}/investors`}>
              <Button
                variant='outline'
                className='rounded-full'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#f7f7f8',
                  borderColor: '#ffffff',
                  borderWidth: '1px',
                  padding: '5px 15px',
                  fontSize: '16px',
                  borderRadius: '40px'
                }}
              >
                {t('nav.investors')}
              </Button>
            </Link>
          </div>

          {/* Hero Content - Centered */}
          <div 
            className='absolute text-center'
            style={{
              top: '194px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '670px'
            }}
          >
            <h1 
              className='font-medium mb-6'
              style={{
                fontSize: '65px',
                lineHeight: '1.03em',
                textTransform: 'capitalize',
                color: '#ffffff',
                marginTop: '58px',
                marginBottom: '20px'
              }}
            >
              {t('home.hero.title')}
            </h1>
            <p 
              className='mb-10'
              style={{
                fontSize: '22px',
                lineHeight: '1.36em',
                letterSpacing: '-0.02em',
                color: '#f7f7f8',
                opacity: 0.8,
                marginLeft: '191px',
                marginRight: '191px',
                marginBottom: '0px'
              }}
            >
              {t('home.hero.subtitle')}
            </p>
            
            {/* CTA Button in Hero */}
            <div 
              className='flex justify-center'
              style={{
                marginTop: '20px'
              }}
            >
              <Button
                variant='outline'
                className='rounded-full'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  borderWidth: '1px',
                  padding: '10.54px 15.81px',
                  fontSize: '16px',
                  borderRadius: '31.63px',
                  backdropFilter: 'blur(65px)'
                }}
                asChild
              >
                <Link href={`/${locale}/solarabo`}>
                  Free State Solarabo
                </Link>
              </Button>
            </div>
          </div>

          {/* Mission Cards - Right Side */}
          <div 
            className='absolute'
            style={{
              top: '572px',
              right: '25px',
              width: '1390px',
              display: 'flex',
              gap: '105px',
              justifyContent: 'flex-end'
            }}
          >
            {/* Our Mission Card */}
            <Card 
              className='border'
              style={{
                width: '360px',
                height: '257px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: '1px',
                borderRadius: '15px',
                backdropFilter: 'blur(65px)',
                padding: '30px'
              }}
            >
              <CardContent className='p-0 h-full flex flex-col'>
                <div className='flex items-start gap-4 mb-4'>
                  <div 
                    className='rounded-sm border-2 flex-shrink-0'
                    style={{
                      width: '14px',
                      height: '14px',
                      borderColor: '#ffffff',
                      borderWidth: '1.88px',
                      marginTop: '8px'
                    }}
                  />
                  <h3 
                    className='font-medium'
                    style={{
                      fontSize: '22px',
                      lineHeight: '1.36em',
                      letterSpacing: '-0.02em',
                      color: '#f7f7f8'
                    }}
                  >
                    {t('home.mission.title')}
                  </h3>
                </div>
                <p 
                  className='mb-6 flex-1'
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.5em',
                    letterSpacing: '-0.02em',
                    color: '#f7f7f8',
                    opacity: 0.8,
                    marginLeft: '24px'
                  }}
                >
                  {t('home.mission.description')}
                </p>
                <Link
                  href={`/${locale}/about`}
                  className='inline-flex items-center gap-2 text-sm'
                  style={{
                    color: '#f7f7f8',
                    marginLeft: '24px'
                  }}
                >
                  {t('home.mission.learnMore')}
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </CardContent>
            </Card>

            {/* Smart Energy Card */}
            <Card 
              className='border'
              style={{
                width: '360px',
                height: '152px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: '1px',
                borderRadius: '15px',
                backdropFilter: 'blur(65px)',
                padding: '30px'
              }}
            >
              <CardContent className='p-0 h-full flex flex-col'>
                <div className='flex items-start gap-4 mb-4'>
                  <div 
                    className='rounded-sm border-2 flex-shrink-0'
                    style={{
                      width: '14px',
                      height: '14px',
                      borderColor: '#ffffff',
                      borderWidth: '1.88px',
                      marginTop: '8px'
                    }}
                  />
                  <h3 
                    className='font-medium'
                    style={{
                      fontSize: '22px',
                      lineHeight: '1.36em',
                      letterSpacing: '-0.02em',
                      textTransform: 'capitalize',
                      color: '#f7f7f8'
                    }}
                  >
                    {t('home.smartEnergy.title')}
                  </h3>
                </div>
                <p 
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.5em',
                    letterSpacing: '-0.02em',
                    color: '#f7f7f8',
                    opacity: 0.8,
                    marginLeft: '24px'
                  }}
                >
                  {t('home.smartEnergy.description')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons - Bottom Center */}
          <div 
            className='absolute flex items-center gap-3'
            style={{
              bottom: '335px',
              left: '50%',
              transform: 'translateX(-50%)',
              marginLeft: '175px'
            }}
          >
            <Button
              size='lg'
              className='rounded-full'
              style={{
                backgroundColor: '#b7fe1a',
                color: '#062e25',
                padding: '5px 4px 5px 25px',
                fontSize: '16px',
                borderRadius: '70px',
                height: '48.46px'
              }}
              asChild
            >
              <Link href={`/${locale}/register`}>
                {t('home.hero.cta.primary')}
                <ArrowRight className='ml-2 w-5 h-5' />
              </Link>
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='rounded-full'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                borderColor: '#ffffff',
                borderWidth: '1px',
                padding: '5px 4px 5px 25px',
                fontSize: '16px',
                borderRadius: '70px',
                backdropFilter: 'blur(65px)',
                height: '48.46px'
              }}
              asChild
            >
              <Link href={`/${locale}/calculator`}>
                {locale === 'de' ? 'Kalkulator' : 'Calculator'}
                <Calculator className='ml-2 w-5 h-5' />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className='py-16 text-white relative' style={{ background: 'linear-gradient(54deg, #062e25 74%, #036b53 100%)' }}>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center'>
                <div className='text-5xl md:text-6xl font-semibold mb-2'>
                  {stat.value}
                </div>
                <div className='text-sm md:text-base text-white/80'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of the sections remain the same for now */}
      {/* SolarAbo Section */}
      <section className='py-20 bg-background'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <p className='text-sm text-muted-foreground mb-2'>
              {t('home.solarabo.badge')}
            </p>
            <h2 className='text-4xl md:text-5xl font-semibold mb-4'>
              {t('home.solarabo.title')}
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              {t('home.solarabo.subtitle')}
            </p>
          </div>

          {/* SolarAbo Card */}
          <div className='max-w-2xl mx-auto'>
            <Card className='bg-gradient-to-br from-card via-card to-card/50 border-2 border-border/50 shadow-xl'>
              <CardContent className='p-8 md:p-12'>
                <div className='text-center mb-8'>
                  <h3 className='text-3xl font-semibold mb-2'>
                    {t('home.solarabo.card.title')}
                  </h3>
                  <p className='text-muted-foreground'>
                    {t('home.solarabo.card.subtitle')}
                  </p>
                </div>

                <div className='space-y-4 mb-8'>
                  {[
                    t('home.solarabo.card.feature1'),
                    t('home.solarabo.card.feature2'),
                    t('home.solarabo.card.feature3'),
                    t('home.solarabo.card.feature4'),
                  ].map((feature, index) => (
                    <div key={index} className='flex items-center gap-3'>
                      <Check className='w-5 h-5 flex-shrink-0' style={{ color: '#b7fe1a' }} />
                      <span className='text-sm'>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className='text-center mb-6'>
                  <div className='text-sm mb-1' style={{ color: '#6b7280' }}>
                    {t('home.solarabo.card.term')}
                  </div>
                  <div className='text-3xl font-bold uppercase' style={{ color: '#1f433b' }}>
                    {t('home.solarabo.card.price')}
                  </div>
                </div>

                <div className='space-y-3 mb-8'>
                  {[
                    t('home.solarabo.card.benefit1'),
                    t('home.solarabo.card.benefit2'),
                    t('home.solarabo.card.benefit3'),
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'
                    >
                      <div className='w-2 h-2 rounded-full' style={{ backgroundColor: '#b7fe1a' }} />
                      <span className='text-sm font-medium'>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className='text-center'>
                  <Button
                    size='lg'
                    className='rounded-full hover:opacity-90'
                    style={{ backgroundColor: '#062e25', color: '#ffffff' }}
                    asChild
                  >
                    <Link href={`/${locale}/solarabo`}>
                      {t('home.solarabo.card.cta')}
                      <ArrowRight className='ml-2 w-5 h-5' />
                    </Link>
                  </Button>
                </div>

                <div className='mt-8 p-4 bg-muted/30 rounded-lg'>
                  <p className='text-xs text-muted-foreground mb-2'>
                    {t('home.solarabo.card.explanation.label')}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {t('home.solarabo.card.explanation.text')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-muted/30'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl md:text-5xl font-semibold mb-4'>
              {t('home.features.title')}
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
            {features.map((feature, index) => (
              <Card key={index} className='bg-card border-2'>
                <CardContent className='p-6'>
                  <div className='text-4xl mb-4'>{feature.icon}</div>
                  <h3 className='text-xl font-semibold mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className='py-20 bg-background'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl md:text-5xl font-semibold mb-4'>
              {t('home.portfolio.title')}
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              {t('home.portfolio.subtitle')}
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
            {portfolioItems.map((item, index) => (
              <Card key={index} className='text-white border-0 overflow-hidden' style={{ backgroundColor: '#062e25' }}>
                <div className='aspect-video bg-gradient-to-br from-foreground/80 to-foreground relative'>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-8xl font-bold text-white/20'>
                      {item.number}
                    </div>
                  </div>
                </div>
                <CardContent className='p-6'>
                  <h3 className='text-xl font-semibold mb-2'>{item.title}</h3>
                  <p className='text-sm text-white/80 mb-4'>{item.details}</p>
                  <Link
                    href={`/${locale}/portfolio/${index + 1}`}
                    className='inline-flex items-center gap-2 text-sm hover:underline'
                  >
                    {t('home.portfolio.learnMore')}
                    <ArrowRight className='w-4 h-4' />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
