'use client'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
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
import type { AdminReference, ReferenceCategory } from '@/types/admin'

const CATEGORIES: ReferenceCategory[] = [
  'INDUSTRIEDACH',
  'GEWERBE',
  'OEFFENTLICHE_GEBAEUDE',
  'LANDWIRTSCHAFT',
  'WOHNGEBAEUDE',
  'FREIFLAECHE',
]

function getTitle(reference: AdminReference) {
  const de = reference.translations.find((tr) => tr.language === 'de')
  return de?.title || reference.translations[0]?.title || '-'
}

export default function AdminReferencesListPage() {
  const locale = useLocale()
  const t = useTranslations('admin.references')
  const tc = useTranslations('admin.common')
  const tr = useTranslations('referencePage')
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
  } = useAdminQuery<AdminReference>('references', adminService.listReferences.bind(adminService))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button asChild className="bg-[#062E25] hover:bg-[#062E25]/90 text-white">
          <Link href={`/${locale}/admin/references/new`}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newReference')}
          </Link>
        </Button>
      </div>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder={t('searchPlaceholder')}
              className="max-w-xs"
              onChange={e => setSearch(e.target.value)}
            />
            <Select
              value={filters.status || '__all__'}
              onValueChange={v => setFilter('status', v === '__all__' ? undefined : v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allStatuses')}</SelectItem>
                <SelectItem value="DRAFT">{t('draft')}</SelectItem>
                <SelectItem value="PUBLISHED">{t('published')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category || '__all__'}
              onValueChange={v => setFilter('category', v === '__all__' ? undefined : v)}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allCategories')}</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {tr(`categories.${category}`)}
                  </SelectItem>
                ))}
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
                    <TableHead>{t('referenceTitle')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('languages')}</TableHead>
                    <TableHead>{t('updated')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(reference => (
                    <TableRow key={reference.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-11 shrink-0 rounded-md overflow-hidden bg-[#062E25]/5">
                            {reference.coverImageUrl && (
                              <Image
                                src={reference.coverImageUrl}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                                unoptimized
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{getTitle(reference)}</p>
                            <p className="text-sm text-[#062E25]/75">/{reference.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]">
                        {tr(`categories.${reference.category}`)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={reference.status} />
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]">
                        {reference.translations.map(tl => tl.language.toUpperCase()).join(', ')}
                      </TableCell>
                      <TableCell className="text-[#062E25] text-sm">
                        {new Date(reference.updatedAt).toLocaleDateString('de-CH')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/references/${reference.id}`}>
                            {t('edit')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-[#062E25]/75">
                        {t('empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/75">
                  {t('total', { count: total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/75">
                    {tc('page', { page, totalPages })}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
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
