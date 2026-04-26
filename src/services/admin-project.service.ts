import api from '@/lib/api'

export type SubsidyStatusValue =
  | 'NOT_APPLICABLE'
  | 'NOT_STARTED'
  | 'DOCUMENTS_PENDING'
  | 'SUBMITTED_TO_CANTON'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID_OUT'

export interface UpdateSubsidyInput {
  subsidyStatus?: SubsidyStatusValue
  subsidyAppliedAt?: string | null
  subsidyApprovedAt?: string | null
  subsidyPaidAmount?: number | null
  subsidyReferenceNumber?: string | null
  subsidyNotes?: string | null
}

export const adminProjectService = {
  async updateSubsidy(projectId: string, input: UpdateSubsidyInput) {
    const response = await api.patch<{ success: boolean; data: unknown; message?: string }>(
      `/admin/projects/${projectId}/subsidy`,
      input,
    )
    return response.data?.data ?? response.data
  },
}
