import type { UserLite } from '@/types/admin'
import type { UserRole } from '@/types/auth'

export type WorkspaceLevel = 'VIEWER' | 'CONTRIBUTOR' | 'MANAGER'
export type WorkspaceStatus = 'ACTIVE' | 'ARCHIVED'

export interface WorkspaceMember {
  id: string
  userId: string
  level: WorkspaceLevel
  addedAt: string
  user: UserLite & { email: string }
}

export interface WorkspaceListItem {
  id: string
  number: string
  name: string
  description: string | null
  siteAddress: string | null
  status: WorkspaceStatus
  archivedAt: string | null
  residentialProjectId: string | null
  commercialLeadId: string | null
  createdAt: string
  updatedAt: string
  members: WorkspaceMember[]
  _count: { members: number }
  activities: { createdAt: string; type: string }[]
}

export interface WorkspaceDetail extends Omit<WorkspaceListItem, 'activities'> {
  myLevel: WorkspaceLevel
  createdBy: UserLite | null
  residentialProject: {
    id: string
    propertyAddress: string
    postalCode: string | null
    administrativeArea: string | null
    customer: { user: { firstName: string; lastName: string } }
  } | null
  commercialLead: { id: string; reference: string; companyName: string } | null
}

export interface WorkspaceTeamUser extends UserLite {
  email: string
  role: UserRole
}

export interface WorkspaceActivity {
  id: string
  folderId: string | null
  type: string
  payload: Record<string, unknown>
  createdAt: string
  actor: UserLite | null
}

export interface WorkspaceCreateInput {
  name: string
  description?: string | null
  siteAddress?: string | null
  template: 'standard' | 'empty'
  residentialProjectId?: string | null
  commercialLeadId?: string | null
}

export interface WorkspaceFolder {
  id: string
  workspaceId: string
  parentId: string | null
  name: string
  isRestricted: boolean
  createdById: string | null
  createdAt: string
  deletedAt: string | null
  _count?: { files: number; children: number }
}

export interface WorkspaceFile {
  id: string
  workspaceId: string
  folderId: string | null
  name: string
  mimeType: string
  sizeBytes: number
  status: 'UPLOADING' | 'READY'
  hasThumbnail: boolean
  uploadedById: string | null
  uploadedBy: UserLite | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface BrowseResult {
  myLevel: WorkspaceLevel
  folder: {
    id: string
    name: string
    isRestricted: boolean
    parentId: string | null
    access: UserLite[]
  } | null
  breadcrumb: { id: string; name: string; isRestricted: boolean }[]
  folders: WorkspaceFolder[]
  files: WorkspaceFile[]
}

export type InitiateResult =
  | { fileId: string; name: string; mode: 'single'; url: string }
  | {
      fileId: string
      name: string
      mode: 'multipart'
      uploadId: string
      partSize: number
      parts: { partNumber: number; url: string }[]
    }

export interface SearchHit {
  kind: 'folder' | 'file'
  item: WorkspaceFolder | WorkspaceFile
  path: { id: string; name: string }[]
}

export interface TrashResult {
  folders: WorkspaceFolder[]
  files: WorkspaceFile[]
}
