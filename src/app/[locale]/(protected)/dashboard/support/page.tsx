'use client'

import { ChevronDown, Mail, MessageSquare, Phone, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  customerPortalService,
  type InquirySummary,
} from '@/services/customer-portal.service'

export default function SupportPage() {
  const t = useTranslations('dashboard.support')
  const [inquiries, setInquiries] = useState<InquirySummary[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const FAQ_ITEMS = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
    { q: t('faq6q'), a: t('faq6a') },
  ]

  useEffect(() => {
    customerPortalService.getInquiries().then(setInquiries).catch(console.error)
  }, [])

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    try {
      const inquiry = await customerPortalService.createInquiry({
        subject,
        message,
      })
      setInquiries(prev => [inquiry, ...prev])
      setSubject('')
      setMessage('')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">
            {t('faq')}
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <Card key={i} className="border-[#062E25]/10">
                <button
                  className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-sm text-[#062E25]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#062E25]/40 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[#062E25]/70">{item.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-[#062E25]/10">
            <CardContent className="p-5">
              <h3 className="font-semibold text-[#062E25] mb-3">
                {t('directContact')}
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href="mailto:solar@freestate.ch"
                  className="flex items-center gap-3 text-[#062E25]/70 hover:text-[#062E25]"
                >
                  <Mail className="h-4 w-4" />
                  solar@freestate.ch
                </a>
                <a
                  href="tel:+41526200050"
                  className="flex items-center gap-3 text-[#062E25]/70 hover:text-[#062E25]"
                >
                  <Phone className="h-4 w-4" />
                  +41 52 620 00 50
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">
            {t('sendMessage')}
          </h2>
          <Card className="border-[#062E25]/10">
            <CardContent className="p-5 space-y-4">
              <Input
                placeholder={t('subject')}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
              <Textarea
                placeholder={t('messagePlaceholder')}
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
              />
              <Button
                onClick={handleSubmit}
                disabled={sending || !subject.trim() || !message.trim()}
                className="bg-[#062E25] text-white hover:bg-[#062E25]/90 w-full"
              >
                {sending ? t('sending') : sent ? t('sent') : t('sendButton')}
                {!sending && !sent && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          {inquiries.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                {t('yourMessages')}
              </h2>
              <div className="space-y-2">
                {inquiries.map(inq => (
                  <Card key={inq.id} className="border-[#062E25]/10">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-4 w-4 text-[#062E25]/30 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-[#062E25]">
                            {inq.message}
                          </p>
                          <p className="text-sm text-[#062E25]/40 mt-1">
                            {new Date(inq.createdAt).toLocaleDateString(
                              'de-CH',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
