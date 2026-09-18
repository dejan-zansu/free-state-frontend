import api from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type ProductEquipmentType =
  | 'SOLAR_PANEL'
  | 'INVERTER'
  | 'BATTERY'
  | 'ENERGY_MANAGEMENT_SYSTEM'
  | 'EV_CHARGER'

export interface PublicProduct {
  id: string
  equipmentType: ProductEquipmentType
  manufacturerCode: string
  manufacturerName: string
  modelNumber: string
  name: string
  nameEn: string
  description: string | null
  imageUrl: string | null
  modelUrl: string | null
  modelPosterUrl: string | null
  galleryUrls: string[]
  packages: { code: string; name: string; solarModels: string[] }[]
  commentCount: number
  references: { slug: string; title: string; coverImageUrl: string | null; location: string | null }[]
}

export interface ProductComment {
  id: string
  authorName: string
  body: string
  rating: number | null
  language: string
  createdAt: string
}

export interface CreateProductCommentPayload {
  equipmentType: ProductEquipmentType
  equipmentId: string
  authorName: string
  authorEmail?: string
  body: string
  rating?: number | null
  language: string
  website?: string
}

class ProductService {
  /** Server side: the catalogue for the Produkte page, revalidated every five minutes. */
  async getCatalog(language: string): Promise<PublicProduct[]> {
    const response = await fetch(`${API_URL}/api/equipment/products?lang=${encodeURIComponent(language)}`, {
      next: { revalidate: 300 },
    })
    if (!response.ok) return []
    const json = (await response.json()) as { success: boolean; data: PublicProduct[] }
    return json.data ?? []
  }

  async getComments(equipmentType: ProductEquipmentType, equipmentId: string): Promise<ProductComment[]> {
    const response = await api.get<{ success: boolean; data: ProductComment[] }>('/product-comments', {
      params: { equipmentType, equipmentId },
    })
    return response.data.data
  }

  async createComment(payload: CreateProductCommentPayload): Promise<void> {
    await api.post('/product-comments', payload)
  }
}

export const productService = new ProductService()
