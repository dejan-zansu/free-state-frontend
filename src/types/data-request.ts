export type DataRequestStatus =
  | 'OPEN'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'ACCEPTED'
  | 'CANCELLED'

export type DataRequestItemType = 'PHOTO' | 'DOCUMENT' | 'TEXT' | 'CONFIRMATION'

export interface DataRequestItem {
  id: string
  type: DataRequestItemType
  label: string
  description: string | null
  position: number
  required: boolean
  minCount: number | null
  maxCount: number | null
  fileUrls: string[] | null
  textValue: string | null
  confirmed: boolean | null
  respondedAt: string | null
}

export interface DataRequestListItem {
  id: string
  title: string
  description: string | null
  status: DataRequestStatus
  dueDate: string | null
  submittedAt: string | null
  createdAt: string
  reviewNote: string | null
}

export interface DataRequest extends DataRequestListItem {
  language: string
  reviewedAt: string | null
  items: DataRequestItem[]
}

export interface AdminDataRequestDetail extends DataRequest {
  contract: {
    id: string
    contractNumber: string
    customer: {
      id: string
      user: { firstName: string; lastName: string; email: string }
    }
  }
}

export interface NewDataRequestItemInput {
  type: DataRequestItemType
  label: string
  description?: string
  position: number
  required?: boolean
  minCount?: number
  maxCount?: number
}

export interface NewDataRequestInput {
  title: string
  description?: string
  dueDate?: string
  items: NewDataRequestItemInput[]
}
