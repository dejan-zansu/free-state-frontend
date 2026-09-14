'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, ImageOff, Loader2, Plus, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type {
  MarketingCompetitorAdRow,
  MarketingCompetitorAds,
  MarketingCompetitorDiffs,
  MarketingCompetitors,
} from '@/types/admin-marketing'

const EMPTY_AD_FORM = {
  headline: '',
  bodyText: '',
  screenshotUrl: '',
  landingUrl: '',
  firstSeenAt: '',
  isActive: true,
  euReach: '',
  notes: '',
}

function AdCard({ ad }: { ad: MarketingCompetitorAdRow }) {
  const t = useTranslations('admin.marketing.competitors')

  return (
    <Card className="border-[#062E25]/10 overflow-hidden">
      <div className="aspect-square bg-[#062E25]/5">
        {ad.screenshotUrl ? (
          <img src={ad.screenshotUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <ImageOff className="h-6 w-6 text-[#062E25]/20" />
            <span className="text-sm text-[#062E25]/75">{t('noScreenshot')}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge status={ad.isActive ? 'ACTIVE' : 'INACTIVE'} />
          {ad.euReach !== null && (
            <Badge variant="secondary" className="font-medium border-0 bg-gray-100 text-gray-700">
              {t('euReach', { count: ad.euReach.toLocaleString('de-CH') })}
            </Badge>
          )}
          <span className="text-sm text-[#062E25]/75 ml-auto tabular-nums">
            {new Date(ad.firstSeenAt).toLocaleDateString('de-CH')}
            {' – '}
            {new Date(ad.lastSeenAt).toLocaleDateString('de-CH')}
          </span>
        </div>
        {ad.headline && <p className="font-medium text-[#062E25] mb-2">{ad.headline}</p>}
        {ad.bodyText && (
          <p className="text-sm text-[#062E25]/80 whitespace-pre-wrap max-h-32 overflow-y-auto mb-2">
            {ad.bodyText}
          </p>
        )}
        {ad.landingUrl && (
          <a
            href={ad.landingUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#062E25]/75 hover:text-[#062E25] hover:underline mb-2"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ad.landingUrl}</span>
          </a>
        )}
        {ad.notes && <p className="text-sm text-[#062E25]">{ad.notes}</p>}
      </CardContent>
    </Card>
  )
}

export default function AdminMarketingCompetitorDetailPage() {
  const params = useParams()
  const competitorId = params.id as string
  const t = useTranslations('admin.marketing.competitors')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState('ads')
  const [logOpen, setLogOpen] = useState(false)
  const [adForm, setAdForm] = useState(EMPTY_AD_FORM)
  const [uploading, setUploading] = useState(false)

  const { data: competitors, isLoading } = useQuery<MarketingCompetitors>({
    queryKey: ['admin', 'marketing', 'competitors'],
    queryFn: () => adminMarketingService.getCompetitors(),
  })

  const { data: ads, isLoading: adsLoading } = useQuery<MarketingCompetitorAds>({
    queryKey: ['admin', 'marketing', 'competitors', competitorId, 'ads'],
    queryFn: () => adminMarketingService.getCompetitorAds(competitorId),
  })

  const { data: diffs, isLoading: diffsLoading } = useQuery<MarketingCompetitorDiffs>({
    queryKey: ['admin', 'marketing', 'competitors', competitorId, 'diffs'],
    queryFn: () => adminMarketingService.getCompetitorDiffs(competitorId),
  })

  const logMutation = useMutation({
    mutationFn: () =>
      adminMarketingService.createCompetitorAd(competitorId, {
        headline: adForm.headline.trim() || undefined,
        bodyText: adForm.bodyText.trim() || undefined,
        screenshotUrl: adForm.screenshotUrl || undefined,
        landingUrl: adForm.landingUrl.trim() || undefined,
        firstSeenAt: adForm.firstSeenAt
          ? new Date(adForm.firstSeenAt).toISOString()
          : undefined,
        isActive: adForm.isActive,
        euReach: adForm.euReach !== '' ? Number(adForm.euReach) : undefined,
        notes: adForm.notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'competitors'] })
      setLogOpen(false)
      setAdForm(EMPTY_AD_FORM)
    },
  })

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await adminService.uploadImage(file, 'competitor-ads')
      setAdForm((prev) => ({ ...prev, screenshotUrl: url }))
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  const competitor = competitors?.rows.find((row) => row.id === competitorId)

  if (!competitor) {
    return <p className="text-[#062E25]">{tc('notFound')}</p>
  }

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/${locale}/admin/marketing/competitors`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back')}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{competitor.name}</h1>
        <StatusBadge status={competitor.active ? 'ACTIVE' : 'INACTIVE'} />
        <div className="flex items-center gap-2 ml-auto">
          {competitor.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={competitor.website} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('website')}
              </a>
            </Button>
          )}
          {competitor.adLibraryUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={competitor.adLibraryUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('adLibrary')}
              </a>
            </Button>
          )}
        </div>
      </div>

      {(competitor.igHandle || competitor.notes) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6">
          {competitor.igHandle && (
            <span className="text-sm text-[#062E25]">{competitor.igHandle}</span>
          )}
          {competitor.notes && (
            <span className="text-sm text-[#062E25]">{competitor.notes}</span>
          )}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="ads">{t('adsTab')}</TabsTrigger>
          <TabsTrigger value="diffs">{t('diffsTab')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'ads' && (
        <div>
          <div className="flex items-center justify-end mb-4">
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              onClick={() => setLogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('logAd')}
            </Button>
          </div>
          {adsLoading ? (
            <AdminPageLoader className="h-64" />
          ) : !ads ? (
            <p className="text-[#062E25]">{tc('failedToLoad')}</p>
          ) : ads.rows.length === 0 ? (
            <Card className="border-[#062E25]/10">
              <CardContent className="p-6">
                <p className="text-center py-12 text-[#062E25]">{t('adsEmpty')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {ads.rows.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'diffs' && (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            {diffsLoading ? (
              <AdminPageLoader className="h-32" />
            ) : !diffs ? (
              <p className="text-[#062E25]">{tc('failedToLoad')}</p>
            ) : diffs.rows.length === 0 ? (
              <p className="text-center py-12 text-[#062E25]">{t('diffsEmpty')}</p>
            ) : (
              <div className="space-y-4">
                {diffs.rows.map((diff) => (
                  <div key={diff.id} className="flex items-start gap-3">
                    <span className="text-sm text-[#062E25]/75 w-24 shrink-0 tabular-nums">
                      {new Date(diff.changedAt).toLocaleDateString('de-CH')}
                    </span>
                    <div className="min-w-0">
                      <a
                        href={diff.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm font-medium text-[#062E25] hover:underline truncate"
                      >
                        {diff.url}
                      </a>
                      {diff.diffSummary && (
                        <p className="text-sm text-[#062E25]">{diff.diffSummary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={logOpen}
        onOpenChange={(open) => {
          setLogOpen(open)
          if (!open) setAdForm(EMPTY_AD_FORM)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('logAd')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>{t('adScreenshot')}</Label>
              {adForm.screenshotUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-[#062E25]/10">
                  <img
                    src={adForm.screenshotUrl}
                    alt=""
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAdForm((prev) => ({ ...prev, screenshotUrl: '' }))}
                    className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 border-2 border-dashed border-[#062E25]/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#062E25]/40 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#062E25]/40" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-[#062E25]/40" />
                      <span className="text-sm text-[#062E25]/75">{t('uploadScreenshot')}</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-headline">{t('adHeadline')}</Label>
              <Input
                id="ad-headline"
                value={adForm.headline}
                onChange={(e) => setAdForm((prev) => ({ ...prev, headline: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-body">{t('adBodyText')}</Label>
              <Textarea
                id="ad-body"
                rows={4}
                value={adForm.bodyText}
                onChange={(e) => setAdForm((prev) => ({ ...prev, bodyText: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-landing">{t('adLandingUrl')}</Label>
              <Input
                id="ad-landing"
                type="url"
                placeholder="https://"
                value={adForm.landingUrl}
                onChange={(e) => setAdForm((prev) => ({ ...prev, landingUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-first-seen">{t('adFirstSeenAt')}</Label>
              <Input
                id="ad-first-seen"
                type="date"
                value={adForm.firstSeenAt}
                onChange={(e) => setAdForm((prev) => ({ ...prev, firstSeenAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-eu-reach">{t('adEuReach')}</Label>
              <Input
                id="ad-eu-reach"
                type="number"
                min="0"
                value={adForm.euReach}
                onChange={(e) => setAdForm((prev) => ({ ...prev, euReach: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ad-active">{t('adIsActive')}</Label>
              <Switch
                id="ad-active"
                checked={adForm.isActive}
                onCheckedChange={(checked) =>
                  setAdForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-notes">{t('adNotes')}</Label>
              <Textarea
                id="ad-notes"
                rows={2}
                value={adForm.notes}
                onChange={(e) => setAdForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLogOpen(false)
                setAdForm(EMPTY_AD_FORM)
              }}
            >
              {t('formCancel')}
            </Button>
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              disabled={uploading || logMutation.isPending}
              onClick={() => logMutation.mutate()}
            >
              {t('formSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
