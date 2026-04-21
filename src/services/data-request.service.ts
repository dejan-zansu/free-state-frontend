import api from '@/lib/api'
import type {
  AdminDataRequestDetail,
  DataRequest,
  DataRequestListItem,
  NewDataRequestInput,
} from '@/types/data-request'

type Envelope<T> = { success: boolean; data: T }

class DataRequestService {
  async adminCreate(contractId: string, input: NewDataRequestInput): Promise<DataRequest> {
    const res = await api.post<Envelope<DataRequest>>(
      `/admin/contracts/${contractId}/data-requests`,
      input
    )
    return res.data.data
  }

  async adminListForContract(contractId: string): Promise<DataRequest[]> {
    const res = await api.get<Envelope<DataRequest[]>>(
      `/admin/contracts/${contractId}/data-requests`
    )
    return res.data.data
  }

  async adminGet(id: string): Promise<AdminDataRequestDetail> {
    const res = await api.get<Envelope<AdminDataRequestDetail>>(`/admin/data-requests/${id}`)
    return res.data.data
  }

  async adminAccept(id: string): Promise<DataRequest> {
    const res = await api.post<Envelope<DataRequest>>(`/admin/data-requests/${id}/accept`)
    return res.data.data
  }

  async adminRequestChanges(id: string, note: string): Promise<DataRequest> {
    const res = await api.post<Envelope<DataRequest>>(
      `/admin/data-requests/${id}/request-changes`,
      { note }
    )
    return res.data.data
  }

  async adminCancel(id: string): Promise<DataRequest> {
    const res = await api.post<Envelope<DataRequest>>(`/admin/data-requests/${id}/cancel`)
    return res.data.data
  }

  async customerList(): Promise<DataRequestListItem[]> {
    const res = await api.get<Envelope<DataRequestListItem[]>>('/me/data-requests')
    return res.data.data
  }

  async customerGet(id: string): Promise<DataRequest> {
    const res = await api.get<Envelope<DataRequest>>(`/me/data-requests/${id}`)
    return res.data.data
  }

  async customerUpsertItem(
    requestId: string,
    itemId: string,
    body: { fileUrls?: string[]; textValue?: string; confirmed?: boolean }
  ): Promise<void> {
    await api.patch(`/me/data-requests/${requestId}/items/${itemId}`, body)
  }

  async customerSubmit(id: string): Promise<DataRequest> {
    const res = await api.post<Envelope<DataRequest>>(`/me/data-requests/${id}/submit`)
    return res.data.data
  }

  async customerUpload(requestId: string, itemId: string, file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<Envelope<{ url: string }>>(
      `/me/data-requests/${requestId}/items/${itemId}/upload`,
      form
    )
    return res.data.data.url
  }
}

export const dataRequestService = new DataRequestService()
