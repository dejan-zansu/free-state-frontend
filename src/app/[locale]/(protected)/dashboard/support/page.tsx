'use client'

import {
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Ticket,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  customerPortalService,
  type InquirySummary,
} from '@/services/customer-portal.service'

const CATEGORIES = [
  { value: 'general', icon: HelpCircle },
  { value: 'contract', icon: Ticket },
  { value: 'technical', icon: MessageSquare },
  { value: 'billing', icon: Mail },
]

export default function SupportPage() {
  const t = useTranslations('dashboard.support')
  const queryClient = useQueryClient()

  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [category, setCategory] = useState('general')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const { data: inquiries = [] } = useQuery<InquirySummary[]>({
    queryKey: ['customer', 'inquiries'],
    queryFn: () => customerPortalService.getInquiries(),
  })

  const FAQ_ITEMS = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
    { q: t('faq6q'), a: t('faq6a') },
  ]

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    try {
      await customerPortalService.createInquiry({
        subject: `[${category.toUpperCase()}] ${subject}`,
        message,
      })
      queryClient.invalidateQueries({ queryKey: ['customer', 'inquiries'] })
      setSubject('')
      setMessage('')
      setCategory('general')
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setDialogOpen(false)
      }, 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
          <p className="text-sm text-[#062E25]/60 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <Tabs defaultValue="help" className="gap-6">
        <TabsList className="h-10">
          <TabsTrigger value="help" className="gap-2 px-4">
            <HelpCircle className="h-4 w-4" />
            {t('tabHelp')}
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2 px-4">
            <Ticket className="h-4 w-4" />
            {t('tabTickets')}
            {inquiries.length > 0 && (
              <span className="ml-1 text-xs bg-[#062E25] text-white rounded-full px-1.5 py-0.5">
                {inquiries.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="help">
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-[#062E25]/10">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#062E25]/5 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#062E25]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#062E25]">{t('callUs')}</p>
                    <a href="tel:+41526200050" className="text-sm text-[#062E25]/70 hover:text-[#062E25]">
                      +41 52 620 00 50
                    </a>
                  </div>
                  <p className="text-xs text-[#062E25]/50">{t('callHours')}</p>
                </CardContent>
              </Card>

              <Card className="border-[#062E25]/10">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#062E25]/5 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#062E25]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#062E25]">{t('emailUs')}</p>
                    <a href="mailto:solar@freestate.ch" className="text-sm text-[#062E25]/70 hover:text-[#062E25]">
                      solar@freestate.ch
                    </a>
                  </div>
                  <p className="text-xs text-[#062E25]/50">{t('emailResponse')}</p>
                </CardContent>
              </Card>

              <Card className="border-[#062E25]/10">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#062E25]/5 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-[#062E25]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#062E25]">{t('openTicket')}</p>
                    <p className="text-sm text-[#062E25]/70">{t('openTicketDesc')}</p>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-[#062E25]/20 text-[#062E25]">
                        {t('newTicket')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{t('newTicketTitle')}</DialogTitle>
                      </DialogHeader>
                      {sent ? (
                        <div className="py-8 text-center">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                            <Send className="h-6 w-6 text-green-600" />
                          </div>
                          <p className="font-medium text-[#062E25]">{t('ticketSent')}</p>
                          <p className="text-sm text-[#062E25]/60 mt-1">{t('ticketSentDesc')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-2">
                          <div>
                            <Label>{t('categoryLabel')}</Label>
                            <Select value={category} onValueChange={setCategory}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {t(`category_${cat.value}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>{t('subject')}</Label>
                            <Input
                              className="mt-1"
                              placeholder={t('subjectPlaceholder')}
                              value={subject}
                              onChange={e => setSubject(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>{t('messageLabel')}</Label>
                            <Textarea
                              className="mt-1"
                              placeholder={t('messagePlaceholder')}
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              rows={5}
                            />
                          </div>
                          <Button
                            onClick={handleSubmit}
                            disabled={sending || !subject.trim() || !message.trim()}
                            className="bg-[#062E25] text-white hover:bg-[#062E25]/90 w-full"
                          >
                            {sending ? t('sending') : t('submitTicket')}
                            {!sending && <Send className="ml-2 h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('faq')}</h2>
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => (
                  <Card key={i} className="border-[#062E25]/10 overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center justify-between text-left"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-medium text-sm text-[#062E25] pr-4">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#062E25]/40 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 border-t border-[#062E25]/5 pt-3">
                        <p className="text-sm text-[#062E25]/70">{item.a}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#062E25]/60">
                {t('ticketCount', { count: inquiries.length })}
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#062E25] text-white hover:bg-[#062E25]/90">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('newTicket')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t('newTicketTitle')}</DialogTitle>
                  </DialogHeader>
                  {sent ? (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <Send className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="font-medium text-[#062E25]">{t('ticketSent')}</p>
                      <p className="text-sm text-[#062E25]/60 mt-1">{t('ticketSentDesc')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>{t('categoryLabel')}</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {t(`category_${cat.value}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('subject')}</Label>
                        <Input
                          className="mt-1"
                          placeholder={t('subjectPlaceholder')}
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>{t('messageLabel')}</Label>
                        <Textarea
                          className="mt-1"
                          placeholder={t('messagePlaceholder')}
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          rows={5}
                        />
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={sending || !subject.trim() || !message.trim()}
                        className="bg-[#062E25] text-white hover:bg-[#062E25]/90 w-full"
                      >
                        {sending ? t('sending') : t('submitTicket')}
                        {!sending && <Send className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {inquiries.length === 0 ? (
              <Card className="border-[#062E25]/10 border-dashed">
                <CardContent className="p-12 text-center">
                  <Ticket className="h-10 w-10 text-[#062E25]/20 mx-auto mb-3" />
                  <p className="font-medium text-[#062E25]/70">{t('noTickets')}</p>
                  <p className="text-sm text-[#062E25]/50 mt-1">{t('noTicketsDesc')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {inquiries.map(inq => (
                  <Card key={inq.id} className="border-[#062E25]/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#062E25]/5 flex items-center justify-center shrink-0 mt-0.5">
                            <MessageSquare className="h-4 w-4 text-[#062E25]/50" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#062E25] truncate">
                              {inq.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={cn(
                                'inline-flex items-center text-xs px-2 py-0.5 rounded-full',
                                inq.status === 'OPEN' && 'bg-amber-100 text-amber-800',
                                inq.status === 'IN_PROGRESS' && 'bg-blue-100 text-blue-800',
                                inq.status === 'RESOLVED' && 'bg-green-100 text-green-800',
                                inq.status === 'CLOSED' && 'bg-gray-100 text-gray-600',
                              )}>
                                {t(`status_${inq.status}`)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-[#062E25]/40">
                                <Clock className="h-3 w-3" />
                                {formatDate(inq.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
