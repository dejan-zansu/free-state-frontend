import type { AdminBlogPost } from '@/types/admin'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface PaginatedBlogResponse {
  success: boolean
  data: AdminBlogPost[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

class BlogService {
  async listPublished(page = 1, limit = 12): Promise<PaginatedBlogResponse> {
    const response = await fetch(
      `${API_URL}/api/blog/public?page=${page}&limit=${limit}`,
      { next: { revalidate: 60 } }
    )
    return response.json()
  }

  async getBySlug(slug: string): Promise<AdminBlogPost | null> {
    const response = await fetch(
      `${API_URL}/api/blog/public/${slug}`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return null
    const data = await response.json()
    return data.data
  }
}

export const blogService = new BlogService()
