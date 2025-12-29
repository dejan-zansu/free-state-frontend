'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const InvestorsForm = () => {
  const t = useTranslations('investorsPage.form')

  const [formData, setFormData] = useState({
    type: 'private',
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    language: 'german',
    privacy: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <section className='relative py-24 bg-background'>
      <div className='max-w-327.5 mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-foreground text-4xl font-semibold mb-6'>
            {t('title')}
          </h2>
          <p className='text-foreground/80 text-lg font-light max-w-3xl mx-auto leading-relaxed'>
            {t('description')}
          </p>
        </div>

        <div className='max-w-2xl mx-auto'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <Label className='text-foreground mb-3 block'>
                {t('type')}
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                className='flex gap-6'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='private' id='private' />
                  <Label htmlFor='private' className='cursor-pointer'>
                    {t('typePrivate')}
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='company' id='company' />
                  <Label htmlFor='company' className='cursor-pointer'>
                    {t('typeCompany')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className='text-foreground mb-3 block'>
                {t('salutation')}
              </Label>
              <Select
                value={formData.salutation}
                onValueChange={(value) =>
                  setFormData({ ...formData, salutation: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('salutation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='mr'>{t('salutationMr')}</SelectItem>
                  <SelectItem value='mrs'>{t('salutationMrs')}</SelectItem>
                  <SelectItem value='diverse'>
                    {t('salutationDiverse')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='firstName' className='text-foreground mb-2 block'>
                  First Name
                </Label>
                <Input
                  id='firstName'
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='lastName' className='text-foreground mb-2 block'>
                  Last Name
                </Label>
                <Input
                  id='lastName'
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {formData.type === 'company' && (
              <div>
                <Label htmlFor='company' className='text-foreground mb-2 block'>
                  Company
                </Label>
                <Input
                  id='company'
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor='email' className='text-foreground mb-2 block'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label className='text-foreground mb-3 block'>
                {t('language')}
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='german'>{t('languageGerman')}</SelectItem>
                  <SelectItem value='english'>{t('languageEnglish')}</SelectItem>
                  <SelectItem value='french'>{t('languageFrench')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='privacy'
                checked={formData.privacy}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, privacy: checked as boolean })
                }
                required
              />
              <Label
                htmlFor='privacy'
                className='text-sm text-foreground/80 cursor-pointer'
              >
                {t('privacy')}
              </Label>
            </div>

            <div className='pt-4'>
              <Button type='submit' className='w-full'>
                {t('submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default InvestorsForm
