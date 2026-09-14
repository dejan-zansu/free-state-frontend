import { create } from 'zustand'

export type UploadStatus =
  | 'queued'
  | 'uploading'
  | 'done'
  | 'error'
  | 'cancelled'

export interface UploadItem {
  id: string
  file: File
  workspaceId: string
  folderId: string | null
  status: UploadStatus
  progress: number
  fileId: string | null
  error: string | null
  controller: AbortController | null
}

interface UploadState {
  items: UploadItem[]
  enqueue: (
    files: File[],
    workspaceId: string,
    folderId: string | null
  ) => string[]
  update: (id: string, patch: Partial<UploadItem>) => void
  cancel: (id: string) => void
  clearFinished: () => void
}

export const useUploadStore = create<UploadState>()((set, get) => ({
  items: [],
  enqueue: (files, workspaceId, folderId) => {
    const created = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      workspaceId,
      folderId,
      status: 'queued' as const,
      progress: 0,
      fileId: null,
      error: null,
      controller: null,
    }))
    set({ items: [...get().items, ...created] })
    return created.map(c => c.id)
  },
  update: (id, patch) =>
    set({
      items: get().items.map(i => (i.id === id ? { ...i, ...patch } : i)),
    }),
  cancel: id => {
    const item = get().items.find(i => i.id === id)
    item?.controller?.abort()
    get().update(id, { status: 'cancelled' })
  },
  clearFinished: () =>
    set({
      items: get().items.filter(
        i => i.status === 'queued' || i.status === 'uploading'
      ),
    }),
}))
