import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/admin'
import type {
  BrowseResult,
  InitiateResult,
  SearchHit,
  TrashResult,
  WorkspaceActivity,
  WorkspaceCreateInput,
  WorkspaceDetail,
  WorkspaceFile,
  WorkspaceFolder,
  WorkspaceLevel,
  WorkspaceListItem,
  WorkspaceMember,
  WorkspaceTeamUser,
} from '@/types/workspace'

type Envelope<T> = { success: boolean; data: T }

class AdminWorkspaceService {
  async list(
    query: Record<string, string | number | undefined> = {}
  ): Promise<PaginatedResponse<WorkspaceListItem>> {
    const response = await api.get<PaginatedResponse<WorkspaceListItem>>(
      '/admin/workspaces',
      { params: query }
    )
    return response.data
  }

  async get(id: string): Promise<WorkspaceDetail> {
    const response = await api.get<Envelope<WorkspaceDetail>>(
      `/admin/workspaces/${id}`
    )
    return response.data.data
  }

  async create(input: WorkspaceCreateInput): Promise<WorkspaceListItem> {
    const response = await api.post<Envelope<WorkspaceListItem>>(
      '/admin/workspaces',
      input
    )
    return response.data.data
  }

  async update(
    id: string,
    input: Partial<WorkspaceCreateInput>
  ): Promise<WorkspaceListItem> {
    const response = await api.patch<Envelope<WorkspaceListItem>>(
      `/admin/workspaces/${id}`,
      input
    )
    return response.data.data
  }

  async archive(id: string): Promise<void> {
    await api.post(`/admin/workspaces/${id}/archive`)
  }

  async restore(id: string): Promise<void> {
    await api.post(`/admin/workspaces/${id}/restore`)
  }

  async team(id: string): Promise<WorkspaceTeamUser[]> {
    const response = await api.get<Envelope<WorkspaceTeamUser[]>>(
      `/admin/workspaces/${id}/team`
    )
    return response.data.data
  }

  async addMember(
    id: string,
    userId: string,
    level: WorkspaceLevel
  ): Promise<WorkspaceMember> {
    const response = await api.post<Envelope<WorkspaceMember>>(
      `/admin/workspaces/${id}/members`,
      { userId, level }
    )
    return response.data.data
  }

  async updateMember(
    id: string,
    userId: string,
    level: WorkspaceLevel
  ): Promise<WorkspaceMember> {
    const response = await api.patch<Envelope<WorkspaceMember>>(
      `/admin/workspaces/${id}/members/${userId}`,
      { level }
    )
    return response.data.data
  }

  async removeMember(id: string, userId: string): Promise<void> {
    await api.delete(`/admin/workspaces/${id}/members/${userId}`)
  }

  async activity(
    id: string,
    cursor?: string
  ): Promise<{ items: WorkspaceActivity[]; nextCursor: string | null }> {
    const response = await api.get<
      Envelope<{ items: WorkspaceActivity[]; nextCursor: string | null }>
    >(`/admin/workspaces/${id}/activity`, { params: cursor ? { cursor } : {} })
    return response.data.data
  }

  async browse(id: string, folderId: string | null): Promise<BrowseResult> {
    const path = folderId
      ? `/admin/workspaces/${id}/folders/${folderId}`
      : `/admin/workspaces/${id}/folders`
    const response = await api.get<Envelope<BrowseResult>>(path)
    return response.data.data
  }

  async createFolder(
    id: string,
    parentId: string | null,
    name: string
  ): Promise<WorkspaceFolder> {
    const response = await api.post<Envelope<WorkspaceFolder>>(
      `/admin/workspaces/${id}/folders`,
      { parentId, name }
    )
    return response.data.data
  }

  async renameFolder(
    id: string,
    folderId: string,
    name: string
  ): Promise<WorkspaceFolder> {
    const response = await api.patch<Envelope<WorkspaceFolder>>(
      `/admin/workspaces/${id}/folders/${folderId}`,
      { name }
    )
    return response.data.data
  }

  async moveFolder(
    id: string,
    folderId: string,
    parentId: string | null
  ): Promise<WorkspaceFolder> {
    const response = await api.patch<Envelope<WorkspaceFolder>>(
      `/admin/workspaces/${id}/folders/${folderId}`,
      { parentId }
    )
    return response.data.data
  }

  async restrictFolder(
    id: string,
    folderId: string,
    isRestricted: boolean,
    userIds: string[]
  ): Promise<void> {
    await api.post(`/admin/workspaces/${id}/folders/${folderId}/restrict`, {
      isRestricted,
      userIds,
    })
  }

  async trashFolder(id: string, folderId: string): Promise<void> {
    await api.post(`/admin/workspaces/${id}/folders/${folderId}/trash`)
  }

  async restoreFolder(id: string, folderId: string): Promise<void> {
    await api.post(`/admin/workspaces/${id}/folders/${folderId}/restore`)
  }

  async initiateUpload(
    id: string,
    input: {
      name: string
      sizeBytes: number
      mimeType: string
      folderId: string | null
    }
  ): Promise<InitiateResult> {
    const response = await api.post<Envelope<InitiateResult>>(
      `/admin/workspaces/${id}/files/initiate`,
      input
    )
    return response.data.data
  }

  async completeUpload(
    id: string,
    fileId: string,
    parts: { partNumber: number; etag: string }[]
  ): Promise<WorkspaceFile> {
    const response = await api.post<Envelope<WorkspaceFile>>(
      `/admin/workspaces/${id}/files/${fileId}/complete`,
      { parts }
    )
    return response.data.data
  }

  async cancelUpload(id: string, fileId: string): Promise<void> {
    await api.post(`/admin/workspaces/${id}/files/${fileId}/cancel`)
  }

  async renameFile(
    id: string,
    fileId: string,
    name: string
  ): Promise<WorkspaceFile> {
    const response = await api.patch<Envelope<WorkspaceFile>>(
      `/admin/workspaces/${id}/files/${fileId}`,
      { name }
    )
    return response.data.data
  }

  async moveFile(
    id: string,
    fileId: string,
    folderId: string | null
  ): Promise<WorkspaceFile> {
    const response = await api.patch<Envelope<WorkspaceFile>>(
      `/admin/workspaces/${id}/files/${fileId}`,
      { folderId }
    )
    return response.data.data
  }

  async trashFile(id: string, fileId: string): Promise<void> {
    await api.post(`/admin/workspaces/${id}/files/${fileId}/trash`)
  }

  async restoreFile(id: string, fileId: string): Promise<void> {
    await api.post(`/admin/workspaces/${id}/files/${fileId}/restore`)
  }

  async deleteFile(id: string, fileId: string): Promise<void> {
    await api.delete(`/admin/workspaces/${id}/files/${fileId}`)
  }

  async downloadUrl(
    id: string,
    fileId: string,
    inline = false
  ): Promise<string> {
    const response = await api.get<Envelope<{ url: string }>>(
      `/admin/workspaces/${id}/files/${fileId}/download`,
      { params: inline ? { inline: 1 } : {} }
    )
    return response.data.data.url
  }

  async thumbnailUrl(id: string, fileId: string): Promise<string> {
    const response = await api.get<Envelope<{ url: string }>>(
      `/admin/workspaces/${id}/files/${fileId}/thumbnail`
    )
    return response.data.data.url
  }

  async bulkDownload(
    id: string,
    fileIds: string[],
    folderIds: string[]
  ): Promise<Blob> {
    const response = await api.post(
      `/admin/workspaces/${id}/download`,
      { fileIds, folderIds },
      { responseType: 'blob', timeout: 10 * 60 * 1000 }
    )
    return response.data as Blob
  }

  async search(id: string, q: string): Promise<SearchHit[]> {
    const response = await api.get<Envelope<SearchHit[]>>(
      `/admin/workspaces/${id}/search`,
      { params: { q } }
    )
    return response.data.data
  }

  async trash(id: string): Promise<TrashResult> {
    const response = await api.get<Envelope<TrashResult>>(
      `/admin/workspaces/${id}/trash`
    )
    return response.data.data
  }
}

export const adminWorkspaceService = new AdminWorkspaceService()
