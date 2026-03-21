'use client'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
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
import type { AdminBlogPost } from '@/types/admin'

function getTitle(post: AdminBlogPost) {
  const sr = post.translations.find((t) => t.language === 'sr')
  return sr?.title || post.translations[0]?.title || '-'
}

export default function AdminBlogListPage() {
  const locale = useLocale()
  const t = useTranslations('admin.blog')
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
  } = useAdminQuery<AdminBlogPost>('blog', adminService.listBlogPosts.bind(adminService))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button asChild className="bg-[#062E25] hover:bg-[#062E25]/90 text-white">
          <Link href={`/${locale}/admin/blog/new`}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newPost')}
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
          </div>

          {isLoading ? (
            <AdminPageLoader />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('postTitle')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('author')}</TableHead>
                    <TableHead>{t('languages')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(post => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getTitle(post)}</p>
                          <p className="text-sm text-[#062E25]/50">/{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={post.status} />
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60">
                        {post.author.firstName} {post.author.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60">
                        {post.translations.map(t => t.language.toUpperCase()).join(', ')}
                      </TableCell>
                      <TableCell className="text-[#062E25]/60 text-sm">
                        {new Date(post.createdAt).toLocaleDateString('de-CH')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/blog/${post.id}`}>
                            {t('edit')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-[#062E25]/40">
                        {t('noPosts')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/60">
                  {t('totalPosts', { count: total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/60">
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
