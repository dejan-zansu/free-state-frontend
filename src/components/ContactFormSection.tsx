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
import { useState } from 'react'
import { Button } from './ui/button'

const ContactFormSection = () => {
  const t = useTranslations('contactForm')

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
                  <SelectTrigger className='w-full '>
                    <SelectValue placeholder={t('entityType.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger className='w-full '>
                    <SelectValue placeholder={t('salutation.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
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
                  className='size-4 rounded border-foreground/60'
                />
                <Label
                  htmlFor='privacy'
                  className='text-xs text-foreground/40 cursor-pointer'
                >
                  {t('privacy')}
                </Label>
              </div>

<Button type='submit' >
  {t('submit')} 
</Button>
            </form>
          </div>

          <div className='relative'>
            <div className='bg-[#B7FE1A] rounded-2xl p-8 text-[#062E25] h-full min-h-[529px] flex flex-col'>
              <div className='pb-6 border-b border-[#062E25]/20'>
                <h3 className='text-[22px] font-medium mb-3 leading-[30px] tracking-[-0.02em]'>
                  {t('card.address.title')}
                </h3>
                <p className='text-[#062E25]/80 text-base font-light leading-6 tracking-[-0.02em]'>
                  {t('card.address.value')}
                </p>
              </div>


              <div className='py-6 border-b border-[#062E25]/20'>
                <h3 className='text-[22px] font-medium mb-3 leading-[30px] tracking-[-0.02em]'>
                  {t('card.contact.title')}
                </h3>
                <p className='text-[#062E25]/80 text-base font-light leading-6 tracking-[-0.02em]'>
                  {t('card.contact.phone')}
                </p>
              </div>


              <div className='py-6 border-b border-[#062E25]/20'>
                <h3 className='text-[22px] font-medium mb-3 leading-[30px] tracking-[-0.02em]'>
                  {t('card.email.title')}
                </h3>
                <p className='text-[#062E25]/80 text-base font-light leading-6 tracking-[-0.02em]'>
                  {t('card.email.value')}
                </p>
              </div>


              <div className='mt-auto pt-6'>
                <h3 className='text-[22px] font-medium mb-5 leading-[30px] tracking-[-0.02em]'>
                  {t('card.social.title')}
                </h3>
                <div className='flex gap-[11.14px]'>

                  <a
                    href='#'
                    className='size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity'
                  >
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                      <path
                        d='M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z'
                        fill='#B7FE1A'
                      />
                    </svg>
                  </a>
                  <a
                    href='#'
                    className='size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity'
                  >
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                      <rect
                        x='2'
                        y='2'
                        width='20'
                        height='20'
                        rx='5'
                        fill='#B7FE1A'
                      />
                      <circle
                        cx='12'
                        cy='12'
                        r='4'
                        fill='#B7FE1A'
                      />
                      <circle cx='17.5' cy='6.5' r='1.5' fill='#B7FE1A' />
                    </svg>
                  </a>
                  <a
                    href='#'
                    className='size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity'
                  >
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                      <path
                        d='M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z'
                        fill='#B7FE1A'
                      />
                      <rect
                        x='2'
                        y='9'
                        width='4'
                        height='12'
                        fill='#B7FE1A'
                      />
                      <circle
                        cx='4'
                        cy='4'
                        r='2'
                        fill='#B7FE1A'
                      />
                    </svg>
                  </a>
                  <a
                    href='#'
                    className='size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity'
                  >
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                      <path
                        d='M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16135 5.19941C1.82072 5.55057 1.57879 5.98541 1.46 6.46C1.14521 8.20556 0.991235 9.97631 1 11.75C0.988687 13.537 1.14266 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17814 18.2945C2.51798 18.6308 2.93882 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0113 9.96295 22.8573 8.1787 22.54 6.42Z'
                        fill='#B7FE1A'
                      />
                      <path
                        d='M9.75 15.02L15.5 11.75L9.75 8.48V15.02Z'
                        fill='#B7FE1A'
                      />
                    </svg>
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
