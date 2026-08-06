'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { fmtChf, fmtNumber } from '@/components/admin/calculation/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminQuery } from '@/hooks/use-admin-query'
import { adminService } from '@/services/admin.service'
import type { AdminProject } from '@/types/admin'

const CHANNEL_STYLES: Record<string, string> = {
  google_ads: 'bg-amber-100 text-amber-900',
  meta_ads: 'bg-blue-100 text-blue-900',
  paid_other: 'bg-purple-100 text-purple-900',
  organic_search: 'bg-emerald-100 text-emerald-900',
  ai_assistant: 'bg-teal-100 text-teal-900',
  social: 'bg-pink-100 text-pink-900',
  referral: 'bg-slate-100 text-slate-900',
  direct: 'bg-[#062E25]/10 text-[#062E25]',
}

export default function AdminProjectsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.projects')
  const tc = useTranslations('admin.common')
  const {
    data,
    isLoading,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
    setFilter,
    filters,
  } = useAdminQuery<AdminProject>(
    'projects',
    adminService.listProjects.bind(adminService),
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <p className="text-base text-[#062E25]/60 mb-6">{t('intro')}</p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder={t('searchPlaceholder')}
              className="max-w-xs"
              onChange={e => setSearch(e.target.value)}
            />
            <Select
              value={filters.stage || '__all__'}
              onValueChange={v =>
                setFilter('stage', v === '__all__' ? undefined : v)
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t('allStages')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allStages')}</SelectItem>
                <SelectItem value="no_offer">{t('stageNoOffer')}</SelectItem>
                <SelectItem value="offer_sent">{t('stageOfferSent')}</SelectItem>
                <SelectItem value="contracted">
                  {t('stageContracted')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.solarModel || '__all__'}
              onValueChange={v =>
                setFilter('solarModel', v === '__all__' ? undefined : v)
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('allModels')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allModels')}</SelectItem>
                <SelectItem value="solar-free">SolarFree</SelectItem>
                <SelectItem value="solar-abo">SolarAbo</SelectItem>
                <SelectItem value="solar-direct">SolarDirect</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.calculatorType || '__all__'}
              onValueChange={v =>
                setFilter('calculatorType', v === '__all__' ? undefined : v)
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allTypes')}</SelectItem>
                <SelectItem value="RESIDENTIAL">{t('residential')}</SelectItem>
                <SelectItem value="COMMERCIAL">{t('commercial')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <AdminPageLoader />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('customer')}</TableHead>
                    <TableHead>{t('property')}</TableHead>
                    <TableHead>{t('system')}</TableHead>
                    <TableHead>{t('savings')}</TableHead>
                    <TableHead>{t('channel')}</TableHead>
                    <TableHead>{t('offer')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(project => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {project.customer.user.firstName}{' '}
                            {project.customer.user.lastName}
                          </p>
                          <p className="text-sm text-[#062E25]/50">
                            {project.customer.user.email}
                          </p>
                          {!project.isPropertyOwner && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              {t('notOwner')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60 max-w-48 truncate">
                        {project.propertyAddress}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {project.solarCalculation?.totalSystemCapacityKw != null
                          ? `${fmtNumber(project.solarCalculation.totalSystemCapacityKw, 1)} kWp`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {fmtChf(project.solarCalculation?.annualSavingsChf)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            CHANNEL_STYLES[project.attribution.channel] ??
                            CHANNEL_STYLES.direct
                          }`}
                        >
                          {t(`channels.${project.attribution.channel}`)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {project.lead ? (
                          <StatusBadge status={project.lead.status} />
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                            {t('noOffer')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#062E25]/60 text-sm">
                        {new Date(project.createdAt).toLocaleDateString('de-CH')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/projects/${project.id}`}>
                            {t('view')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-[#062E25]/40"
                      >
                        {t('noProjects')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/60">
                  {t('totalProjects', { count: total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/60">
                    {tc('page', { page, totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
