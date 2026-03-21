'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { BlogPostForm } from '@/components/admin/BlogPostForm'
import { adminService } from '@/services/admin.service'
import type { AdminBlogPost } from '@/types/admin'

export default function AdminBlogEditPage() {
  const params = useParams()

  const { data: post, isLoading } = useQuery<AdminBlogPost>({
    queryKey: ['admin', 'blog', params.id],
    queryFn: () => adminService.getBlogPostById(params.id as string),
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!post) {
    return <p className="text-[#062E25]/60">Post not found.</p>
  }

  return <BlogPostForm post={post} />
}
