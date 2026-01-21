'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Facebook, FacebookIcon, InstagramIcon, LinkedinIcon } from 'lucide-react'
import { ArrowButton } from './ui/arrow-button'

const ContactFormSection = () => {
  const t = useTranslations('contactForm')
  const locale = useParams().locale as string

  const [formData, setFormData] = useState({
    entityType: '',
    salutation: '',
    firstName: '',
    lastName: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    message: '',
    privacy: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <section className='relative py-24'>
      <div className='max-w-[1310px] mx-auto px-6'>
        <div className='mb-10'>
              <span className='inline-block px-4 py-2.5 rounded-full border border-foreground/20 text-sm font-medium backdrop-blur-[65px] mb-5'>
                {t('eyebrow')}
              </span>
              <h2 className='text-foreground text-[45px] font-medium leading-[1em] max-w-[400px]'>
                {t('title')}
              </h2>
            </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24'>
          <div>
            
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <Select
                  value={formData.entityType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, entityType: value })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={t('entityType.placeholder')} />
                  </SelectTrigger>
                  <SelectContent position='popper'>
                    <SelectItem value='company'>{t('entityType.company')}</SelectItem>
                    <SelectItem value='private'>{t('entityType.private')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={formData.salutation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, salutation: value })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={t('salutation.placeholder')} />
                  </SelectTrigger>
                  <SelectContent position='popper'>
                    <SelectItem value='mr'>{t('salutation.mr')}</SelectItem>
                    <SelectItem value='mrs'>{t('salutation.mrs')}</SelectItem>
                    <SelectItem value='diverse'>{t('salutation.diverse')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-1.5'>
                  <Label className='text-foreground/60 text-xs'>
                    {t('firstName.label')}
                  </Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder={t('firstName.placeholder')}
                    className='h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-foreground/60 text-xs'>
                    {t('lastName.label')}
                  </Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder={t('lastName.placeholder')}
                    className='h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-1.5'>
                  <Label className='text-foreground/60 text-xs'>
                    {t('postalCode.label')}
                  </Label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    placeholder={t('postalCode.placeholder')}
                    className='h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-foreground/60 text-xs'>
                    {t('city.label')}
                  </Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder={t('city.placeholder')}
                    className='h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-1.5'>
                  <Label className='text-foreground/60 text-xs'>
                    {t('phone.label')}
                  </Label>
                  <Input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder={t('phone.placeholder')}
                    className='h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-foreground/60 text-xs'>
                    {t('email.label')}
                  </Label>
                  <Input
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={t('email.placeholder')}
                    className='h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]'
                  />
                </div>
              </div>

              <div className='h-px bg-foreground/20 my-5' />

              <div className='space-y-1.5'>
                <Label className='text-foreground/60 text-xs'>
                  {t('message.label')}
                </Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={t('message.placeholder')}
                  className='min-h-[120px] bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] resize-none'
                />
              </div>

              <div className='flex items-center gap-2.5'>
                <Checkbox
                  id='privacy'
                  checked={formData.privacy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, privacy: checked as boolean })
                  }
                  className='size-6 rounded border-foreground/60 '
                />
                <Label
                  htmlFor='privacy'
                  className='text-xs text-foreground/40 cursor-pointer'
                >
                  <Link
                    href={`/${locale}/pirvacy-policy`}
                    onClick={(e) => e.stopPropagation()}
                    className='hover:underline'
                  >
                    {t('privacy')}
                  </Link>
                </Label>
              </div>

      <ArrowButton type='submit' variant='primary' >
  {t('submit')} 
</ArrowButton>
            </form>
          </div>

          <div className='relative'>
            <div className='bg-solar rounded-2xl p-8 text-[#062E25] flex flex-col'>
              <div className='pb-6 border-b border-[#062E25]/20'>
                <h3 className='text-[22px] font-medium mb-3 leading-[30px]'>
                  {t('card.address.title')}
                </h3>
                <p className='text-[#062E25]/80 text-base font-light leading-6'>
                  {t('card.address.value')}
                </p>
              </div>


              <div className='py-6 border-b border-[#062E25]/20'>
                <h3 className='text-[22px] font-medium mb-3 leading-[30px]'>
                  {t('card.contact.title')}
                </h3>
                <p className='text-[#062E25]/80 text-base font-light leading-6'>
                  {t('card.contact.phone')}
                </p>
              </div>


              <div className='py-6 border-b border-[#062E25]/20'>
                <h3 className='text-[22px] font-medium mb-3 leading-[30px]'>
                  {t('card.email.title')}
                </h3>
                <p className='text-[#062E25]/80 text-base font-light leading-6'>
                  {t('card.email.value')}
                </p>
              </div>


              <div className='pt-6'>
                <h3 className='text-[22px] font-medium mb-5 leading-[30px]'>
                  {t('card.social.title')}
                </h3>
                <div className='flex gap-[11.14px]'>
                  <a
                    href='#'
                    className='size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity'
                  >
                    <Facebook className='size-6 text-solar' />
                  </a>
                  <a
                    href='#'
                    className='size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity'
                  >
                    <InstagramIcon className='size-6 text-solar' />
                  </a>
                  <a
                    href='https://www.linkedin.com/company/agribusiness-training-institute-of-free-state/'
                    className='size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity'
                  >
                    <LinkedinIcon className='size-6 text-solar' />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactFormSection
