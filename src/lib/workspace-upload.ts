import axios from 'axios'

import { adminWorkspaceService } from '@/services/admin-workspace.service'
import { useUploadStore, type UploadItem } from '@/stores/upload.store'

const r2 = axios.create()
const CONCURRENT_FILES = 3
const CONCURRENT_PARTS = 3
const PART_RETRIES = 3

async function putWithRetry(
  url: string,
  body: Blob,
  contentType: string | undefined,
  signal: AbortSignal,
  onProgress: (loaded: number) => void
): Promise<string> {
  let lastError: unknown
  for (let attempt = 0; attempt < PART_RETRIES; attempt++) {
    try {
      const response = await r2.put(url, body, {
        signal,
        headers: contentType ? { 'Content-Type': contentType } : undefined,
        onUploadProgress: e => onProgress(e.loaded),
      })
      return String(response.headers['etag'] ?? '').replace(/"/g, '')
    } catch (err) {
      if (signal.aborted) throw err
      lastError = err
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

async function runOne(item: UploadItem): Promise<void> {
  const store = useUploadStore.getState()
  const controller = new AbortController()
  store.update(item.id, {
    status: 'uploading',
    controller,
    progress: 0,
    error: null,
  })
  let fileId: string | null = null
  try {
    const init = await adminWorkspaceService.initiateUpload(item.workspaceId, {
      name: item.file.name,
      sizeBytes: item.file.size,
      mimeType: item.file.type || 'application/octet-stream',
      folderId: item.folderId,
    })
    fileId = init.fileId
    store.update(item.id, { fileId })
    const total = item.file.size || 1

    if (init.mode === 'single') {
      await putWithRetry(
        init.url,
        item.file,
        item.file.type || undefined,
        controller.signal,
        loaded =>
          store.update(item.id, {
            progress: Math.min(99, Math.round((loaded / total) * 100)),
          })
      )
      await adminWorkspaceService.completeUpload(item.workspaceId, fileId, [])
    } else {
      const loadedByPart = new Map<number, number>()
      const report = () => {
        const loaded = [...loadedByPart.values()].reduce((a, b) => a + b, 0)
        store.update(item.id, {
          progress: Math.min(99, Math.round((loaded / total) * 100)),
        })
      }
      const etags: { partNumber: number; etag: string }[] = []
      const queue = [...init.parts]
      const worker = async () => {
        while (queue.length > 0) {
          const part = queue.shift()!
          const start = (part.partNumber - 1) * init.partSize
          const chunk = item.file.slice(
            start,
            Math.min(start + init.partSize, item.file.size)
          )
          const etag = await putWithRetry(
            part.url,
            chunk,
            undefined,
            controller.signal,
            loaded => {
              loadedByPart.set(part.partNumber, loaded)
              report()
            }
          )
          etags.push({ partNumber: part.partNumber, etag })
        }
      }
      await Promise.all(Array.from({ length: CONCURRENT_PARTS }, worker))
      await adminWorkspaceService.completeUpload(
        item.workspaceId,
        fileId,
        etags
      )
    }
    store.update(item.id, { status: 'done', progress: 100, controller: null })
  } catch (err) {
    if (controller.signal.aborted) {
      if (fileId)
        await adminWorkspaceService
          .cancelUpload(item.workspaceId, fileId)
          .catch(() => undefined)
      store.update(item.id, { status: 'cancelled', controller: null })
      return
    }
    const code = (
      err as { response?: { data?: { error?: { code?: string } } } }
    )?.response?.data?.error?.code
    if (fileId && code !== 'UPLOAD_INCOMPLETE')
      await adminWorkspaceService
        .cancelUpload(item.workspaceId, fileId)
        .catch(() => undefined)
    store.update(item.id, {
      status: 'error',
      error: code ?? 'UPLOAD_FAILED',
      controller: null,
    })
  }
}

let running = 0

export function pumpUploads(
  onFileDone: (workspaceId: string, folderId: string | null) => void
): void {
  const tick = () => {
    while (running < CONCURRENT_FILES) {
      const next = useUploadStore
        .getState()
        .items.find(i => i.status === 'queued')
      if (!next) return
      running++
      useUploadStore.getState().update(next.id, { status: 'uploading' })
      void runOne(next).finally(() => {
        running--
        const finished = useUploadStore
          .getState()
          .items.find(i => i.id === next.id)
        if (finished?.status === 'done')
          onFileDone(finished.workspaceId, finished.folderId)
        tick()
      })
    }
  }
  tick()
}

export function retryUpload(id: string): void {
  useUploadStore
    .getState()
    .update(id, { status: 'queued', progress: 0, error: null, fileId: null })
}
