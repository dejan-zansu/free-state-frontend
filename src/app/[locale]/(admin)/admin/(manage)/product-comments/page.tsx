'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft, ChevronRight, Star, Trash2, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminQuery } from '@/hooks/use-admin-query'
import { cn } from '@/lib/utils'
import { adminService } from '@/services/admin.service'
import type { AdminProductComment, ProductCommentStatus } from '@/types/admin'

const STATUSES: ProductCommentStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

export default function AdminProductCommentsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.productComments')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const { data, isLoading, page, totalPages, total, setPage, filters, setFilter } = useAdminQuery<AdminProductComment>(
    'product-comments',
    adminService.listProductComments.bind(adminService),
    { initialFilters: { status: 'PENDING' } }
  )

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'product-comments'] })
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductCommentStatus }) => adminService.updateProductComment(id, status),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => adminService.deleteProductComment(id),
    onSuccess: invalidate,
  })

  const dateFormatter = new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium', timeStyle: 'short' })
  const active = filters.status

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
      <p className="mb-6 mt-1 text-base text-[#062E25]/70">{t('subtitle')}</p>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#062E25]/70">{t('status')}:</span>
            {[undefined, ...STATUSES].map((s) => (
              <button
                key={s ?? 'all'}
                type="button"
                onClick={() => setFilter('status', s)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm font-medium transition',
                  active === s ? 'border-[#062E25] bg-[#062E25] text-white' : 'border-[#062E25]/15 text-[#062E25] hover:border-[#062E25]/40'
                )}
              >
                {s ? t(s) : t('all')}
              </button>
            ))}
          </div>

          {isLoading ? (
            <AdminPageLoader />
          ) : data.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#062E25]/60">{t('empty')}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('product')}</TableHead>
                    <TableHead>{t('author')}</TableHead>
                    <TableHead>{t('comment')}</TableHead>
                    <TableHead>{t('rating')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.productName}</TableCell>
                      <TableCell className="text-sm">
                        <p>{c.authorName}</p>
                        {c.authorEmail && <p className="text-[#062E25]/60">{c.authorEmail}</p>}
                      </TableCell>
                      <TableCell className="max-w-md whitespace-pre-line text-sm">{c.body}</TableCell>
                      <TableCell className="text-sm">
                        {c.rating != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 fill-[#b7fe1a] text-[#b7fe1a]" aria-hidden />
                            {c.rating}/5
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{dateFormatter.format(new Date(c.createdAt))}</TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {c.status !== 'APPROVED' && (
                            <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: c.id, status: 'APPROVED' })} disabled={setStatus.isPending}>
                              <Check className="mr-1 h-4 w-4" /> {t('approve')}
                            </Button>
                          )}
                          {c.status !== 'REJECTED' && (
                            <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: c.id, status: 'REJECTED' })} disabled={setStatus.isPending}>
                              <X className="mr-1 h-4 w-4" /> {t('reject')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (window.confirm(t('confirmDelete'))) remove.mutate(c.id)
                            }}
                            disabled={remove.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t('delete')}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between text-sm text-[#062E25]/70">
                <span>{tc('page', { page, totalPages: Math.max(1, totalPages) })} ({total})</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span>
                    {page} / {Math.max(1, totalPages)}
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
