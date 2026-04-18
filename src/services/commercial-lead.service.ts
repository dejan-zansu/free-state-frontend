import api from '@/lib/api'
import type {
  CreateCommercialLeadResponse,
  CommercialAttachmentType,
  CommercialLeadAttachment,
} from '@/types/commercial-lead'

class CommercialLeadService {
  async create(payload: unknown): Promise<CreateCommercialLeadResponse> {
    const res = await api.post<{ success: true; data: CreateCommercialLeadResponse }>(
      '/commercial-leads', payload,
    )
    return res.data.data
  }

  async uploadAttachment(
    leadId: string,
    token: string,
    type: CommercialAttachmentType,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<CommercialLeadAttachment> {
    const form = new FormData()
    form.append('type', type)
    form.append('file', file)
    const res = await api.post<{ success: true; data: CommercialLeadAttachment }>(
      `/commercial-leads/${leadId}/attachments?token=${encodeURIComponent(token)}`,
      form,
      {
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        },
      },
    )
    return res.data.data
  }
}

export const commercialLeadService = new CommercialLeadService()
