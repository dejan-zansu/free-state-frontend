'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ChangeEvent } from 'react'
import { toast } from 'sonner'

import { assigneeName, leadErrorKey } from '@/lib/outbound-lead-work'
import { adminOutreachService } from '@/services/admin-outreach.service'
import { useUser } from '@/stores/auth.store'
import type { OutboundAssignee } from '@/types/admin-outreach'
import type {
  LeadWorkSnapshot,
  OutboundLeadAssignee,
  OutboundLeadListItem,
  OutboundLeadListResponse,
} from '@/types/outreach/kpi'

import { LEAD_LIST_QUERY_KEY } from './lead-list-model'

const UNASSIGNED_VALUE = ''

interface AssignVariables {
  assignedToId: string | null
  name: string | null
}

type RowPatch = (item: OutboundLeadListItem) => OutboundLeadListItem

function optimisticAssignee(
  variables: AssignVariables
): OutboundLeadAssignee | null {
  if (!variables.assignedToId) return null
  return {
    id: variables.assignedToId,
    firstName: variables.name ?? '',
    lastName: '',
  }
}

function useAssignLead(prospectId: string) {
  const t = useTranslations('admin.outreach.work')
  const queryClient = useQueryClient()

  const patchRows = (patch: RowPatch) => {
    queryClient.setQueriesData<OutboundLeadListResponse>(
      { queryKey: LEAD_LIST_QUERY_KEY },
      data =>
        data && {
          ...data,
          items: data.items.map(item =>
            item.prospect?.id === prospectId ? patch(item) : item
          ),
        }
    )
  }

  return useMutation({
    mutationFn: ({ assignedToId }: AssignVariables) =>
      adminOutreachService.updateWork(prospectId, { assignedToId }),
    onMutate: async (variables: AssignVariables) => {
      await queryClient.cancelQueries({ queryKey: LEAD_LIST_QUERY_KEY })
      const previous = queryClient.getQueriesData<OutboundLeadListResponse>({
        queryKey: LEAD_LIST_QUERY_KEY,
      })
      const assignedTo = optimisticAssignee(variables)
      patchRows(item => ({ ...item, assignedTo }))
      return { previous }
    },
    onError: (error: unknown, _variables, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      toast.error(t(leadErrorKey(error)))
    },
    onSuccess: (snapshot: LeadWorkSnapshot, variables) => {
      patchRows(item => ({
        ...item,
        work: snapshot.work,
        owner: snapshot.owner,
        assignedTo: snapshot.assignedTo,
        commercialLead: snapshot.crmLead ?? item.commercialLead,
      }))
      if (variables.assignedToId) {
        toast.success(
          t('toast.assigned', {
            name: assigneeName(snapshot.assignedTo) ?? variables.name ?? '',
          })
        )
      } else {
        toast.success(t('toast.unassigned'))
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEAD_LIST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'outreach', 'prospect', prospectId],
      })
    },
  })
}

function AssignSelect({
  lead,
  prospectId,
  assignees,
}: {
  lead: OutboundLeadListItem
  prospectId: string
  assignees: OutboundAssignee[] | undefined
}) {
  const t = useTranslations('admin.outreach.leads')
  const user = useUser()
  const mutation = useAssignLead(prospectId)
  const current = lead.assignedTo
  const company = lead.prospect?.companyName ?? ''

  const listed = current
    ? (assignees ?? []).some(person => person.id === current.id)
    : true
  const currentName = assigneeName(current)

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const person = assignees?.find(item => item.id === value)
    mutation.mutate({
      assignedToId: value === UNASSIGNED_VALUE ? null : value,
      name: person?.name ?? null,
    })
  }

  return (
    <div className="relative w-full min-w-0">
      <select
        value={current?.id ?? UNASSIGNED_VALUE}
        onChange={handleChange}
        disabled={!assignees || mutation.isPending}
        aria-label={t('assignAria', { company })}
        className="h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-lg border border-[#062E25]/20 bg-white pl-3 pr-8 text-base text-[#062E25] outline-none hover:bg-[#F5F7EE] focus-visible:ring-2 focus-visible:ring-[#062E25] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value={UNASSIGNED_VALUE}>{t('unassigned')}</option>
        {!listed && current ? (
          <option value={current.id}>{currentName}</option>
        ) : null}
        {(assignees ?? []).map(person => (
          <option key={person.id} value={person.id}>
            {person.id === user?.id
              ? t('assigneeSelf', { name: person.name })
              : person.name}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#062E25]/60"
      />
    </div>
  )
}

export function LeadAssignControl({
  lead,
  assignees,
}: {
  lead: OutboundLeadListItem
  assignees: OutboundAssignee[] | undefined
}) {
  const t = useTranslations('admin.outreach.leads')

  if (!lead.prospect || lead.work.readOnly) {
    return (
      <span className="font-medium text-[#062E25]">
        {assigneeName(lead.assignedTo) ?? t('unassigned')}
      </span>
    )
  }

  return (
    <AssignSelect
      lead={lead}
      prospectId={lead.prospect.id}
      assignees={assignees}
    />
  )
}
