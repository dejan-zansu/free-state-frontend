import api from '@/lib/api'
import type {
  InternalTaskAttachment,
  InternalTaskComment,
  InternalTaskDetail,
  InternalTaskListItem,
  InternalTaskListQuery,
  InternalTaskCreateInput,
  InternalTaskSummary,
  InternalTaskUpdateInput,
  PaginatedResponse,
  UserLite,
} from '@/types/admin'

class AdminTaskService {
  async list(query: InternalTaskListQuery = {}): Promise<PaginatedResponse<InternalTaskListItem>> {
    const { status, ...rest } = query
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined || value === null || value === '') continue
      params.append(key, String(value))
    }
    for (const s of status ?? []) params.append('status', s)
    const response = await api.get<PaginatedResponse<InternalTaskListItem>>('/admin/tasks', { params })
    return response.data
  }

  async summary(): Promise<InternalTaskSummary> {
    const response = await api.get<{ success: boolean; data: InternalTaskSummary }>('/admin/tasks/summary')
    return response.data.data
  }

  async team(): Promise<UserLite[]> {
    const response = await api.get<{ success: boolean; data: UserLite[] }>('/admin/tasks/team')
    return response.data.data
  }

  async getById(id: string): Promise<InternalTaskDetail> {
    const response = await api.get<{ success: boolean; data: InternalTaskDetail }>(`/admin/tasks/${id}`)
    return response.data.data
  }

  async create(input: InternalTaskCreateInput): Promise<InternalTaskDetail> {
    const response = await api.post<{ success: boolean; data: InternalTaskDetail }>('/admin/tasks', input)
    return response.data.data
  }

  async update(id: string, input: InternalTaskUpdateInput): Promise<InternalTaskDetail> {
    const response = await api.patch<{ success: boolean; data: InternalTaskDetail }>(`/admin/tasks/${id}`, input)
    return response.data.data
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/admin/tasks/${id}`)
  }

  async addComment(taskId: string, body: string): Promise<InternalTaskComment> {
    const response = await api.post<{ success: boolean; data: InternalTaskComment }>(
      `/admin/tasks/${taskId}/comments`,
      { body },
    )
    return response.data.data
  }

  async updateComment(taskId: string, commentId: string, body: string): Promise<InternalTaskComment> {
    const response = await api.patch<{ success: boolean; data: InternalTaskComment }>(
      `/admin/tasks/${taskId}/comments/${commentId}`,
      { body },
    )
    return response.data.data
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    await api.delete(`/admin/tasks/${taskId}/comments/${commentId}`)
  }

  async uploadAttachment(taskId: string, file: File): Promise<InternalTaskAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<{ success: boolean; data: InternalTaskAttachment }>(
      `/admin/tasks/${taskId}/attachments`,
      formData,
    )
    return response.data.data
  }

  async downloadAttachment(
    taskId: string,
    attachmentId: string,
    fallbackFileName = 'attachment',
  ): Promise<{ blob: Blob; fileName: string }> {
    const response = await api.get(`/admin/tasks/${taskId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
      timeout: 60000,
    })

    const blob: Blob = response.data

    const contentDisposition = response.headers['content-disposition']
    let fileName = fallbackFileName
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match) fileName = match[1]
    }

    return { blob, fileName }
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    await api.delete(`/admin/tasks/${taskId}/attachments/${attachmentId}`)
  }
}

export const adminTaskService = new AdminTaskService()
