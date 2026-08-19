import type { AdminReference } from '@/types/admin'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface PaginatedReferenceResponse {
  success: boolean
  data: AdminReference[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

class ReferenceService {
  async listPublished(page = 1, limit = 12, category?: string): Promise<PaginatedReferenceResponse> {
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : ''
    const response = await fetch(
      `${API_URL}/api/references/public?page=${page}&limit=${limit}${categoryParam}`,
      { next: { revalidate: 60 } }
    )
    return response.json()
  }

  async getBySlug(slug: string): Promise<AdminReference | null> {
    const response = await fetch(
      `${API_URL}/api/references/public/${slug}`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return null
    const data = await response.json()
    return data.data
  }

  async getRelated(slug: string, limit = 3): Promise<AdminReference[]> {
    const response = await fetch(
      `${API_URL}/api/references/public/${slug}/related?limit=${limit}`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return []
    const data = await response.json()
    return data.data
  }
}

export const referenceService = new ReferenceService()
