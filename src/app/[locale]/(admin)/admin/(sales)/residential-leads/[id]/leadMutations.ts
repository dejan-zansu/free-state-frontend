'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { salesLeadService } from '@/services/sales-lead.service'
import type { Milestone } from '@/types/milestone'
import type {
  SalesLeadActivity,
  SalesLeadDetail,
  SalesLeadUpdateInput,
} from '@/types/sales-lead'

import { leadKey } from './leadUtils'

export function useLeadCache(leadId: string) {
  const queryClient = useQueryClient()

  const refreshList = () =>
    queryClient.invalidateQueries({ queryKey: ['sales-leads'] })

  const setDetail = (detail: SalesLeadDetail) => {
    queryClient.setQueryData(leadKey(leadId), detail)
    refreshList()
  }

  const addActivity = (activity: SalesLeadActivity) => {
    queryClient.setQueryData<SalesLeadDetail>(leadKey(leadId), current => {
      if (!current) return current
      if (current.activities.some(item => item.id === activity.id)) {
        return current
      }
      return { ...current, activities: [activity, ...current.activities] }
    })
    refreshList()
  }

  const setMilestone = (milestone: Milestone) => {
    queryClient.setQueryData<SalesLeadDetail>(leadKey(leadId), current => {
      if (!current) return current
      return {
        ...current,
        milestones: current.milestones.map(item =>
          item.stage === milestone.stage ? milestone : item
        ),
      }
    })
    queryClient.invalidateQueries({ queryKey: leadKey(leadId) })
    refreshList()
  }

  return { setDetail, addActivity, setMilestone }
}

export function useLeadUpdate(leadId: string) {
  const { setDetail } = useLeadCache(leadId)

  return useMutation({
    mutationFn: (input: SalesLeadUpdateInput) =>
      salesLeadService.update(leadId, input),
    onSuccess: setDetail,
  })
}
