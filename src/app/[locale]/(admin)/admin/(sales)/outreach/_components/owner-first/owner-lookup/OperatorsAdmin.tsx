'use client'

// ADMIN: one operator row per real person with their own Terravis user (the
// SIX AGB: "Benutzer sind natürliche Personen", never extra users to raise
// the cap). The row holds the Terravis user label only, never a password,
// and the daily targets per canton. Terravis targets are capped at 10 by the
// server, portal targets by the canton's published cap.

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ownerLookupService } from '@/services/outreach/owner-lookup.service'
import type {
  OperatorsResponse,
  OwnerLookupOperatorRow,
} from '@/types/outreach/owner-lookup'

import { apiErrorCode } from './format'

const CANTONS = ['ZH', 'SH', 'TG', 'SG', 'AG']
// The design's recommended start: 20 lookups a day for two weeks, then 45
// with SG at 5 (CHF 12 per extract).
const START_TARGETS: Record<string, number> = {
  ZH: 5,
  SH: 4,
  TG: 4,
  SG: 2,
  AG: 5,
}

function TargetInputs(props: {
  idPrefix: string
  values: Record<string, number>
  cantons: string[]
  max: (canton: string) => number
  onChange: (next: Record<string, number>) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.cantons.map(canton => (
        <div key={canton} className="w-20">
          <Label htmlFor={`${props.idPrefix}-${canton}`}>{canton}</Label>
          <Input
            id={`${props.idPrefix}-${canton}`}
            type="number"
            min={0}
            max={props.max(canton)}
            className="mt-1 text-base"
            value={props.values[canton] ?? 0}
            onChange={event =>
              props.onChange({
                ...props.values,
                [canton]: Math.max(0, Number(event.target.value) || 0),
              })
            }
          />
        </div>
      ))}
    </div>
  )
}

function OperatorRow(props: {
  row: OwnerLookupOperatorRow
  meta: OperatorsResponse
  onSaved: () => void
}) {
  const t = useTranslations('admin.outreach.ownerLookup.operators')
  const [label, setLabel] = useState(props.row.terravisUserLabel)
  const [daily, setDaily] = useState(props.row.dailyTargets)
  const [portal, setPortal] = useState(props.row.portalTargets)
  const portalCantons = CANTONS.filter(
    canton => props.meta.portalCaps[canton] != null
  )
  const save = useMutation({
    mutationFn: (active?: boolean) =>
      ownerLookupService.updateOperator(props.row.id, {
        terravisUserLabel: label,
        dailyTargets: daily,
        portalTargets: portal,
        ...(active !== undefined ? { active } : {}),
      }),
    onSuccess: () => {
      toast.success(t('saved'))
      props.onSaved()
    },
    onError: () => toast.error(t('saveFailed')),
  })
  const total = Object.values(daily).reduce(
    (sum, n) => sum + Math.min(n, props.meta.terravisCap),
    0
  )
  return (
    <div className="border-b border-[#062E25]/10 py-3 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold">
          {props.row.user.firstName} {props.row.user.lastName}
        </span>
        <span className="text-[#062E25]/60">{props.row.user.email}</span>
        <div className="flex items-center gap-2">
          <Switch
            id={`active-${props.row.id}`}
            checked={props.row.active}
            onCheckedChange={checked => save.mutate(checked)}
          />
          <Label htmlFor={`active-${props.row.id}`}>{t('active')}</Label>
        </div>
      </div>
      <div className="max-w-xs">
        <Label htmlFor={`label-${props.row.id}`}>{t('label')}</Label>
        <Input
          id={`label-${props.row.id}`}
          className="mt-1 text-base"
          value={label}
          onChange={event => setLabel(event.target.value)}
        />
      </div>
      <p className="font-medium">{t('terravisTargets', { total })}</p>
      <TargetInputs
        idPrefix={`daily-${props.row.id}`}
        values={daily}
        cantons={CANTONS}
        max={() => props.meta.terravisCap}
        onChange={setDaily}
      />
      {portalCantons.length > 0 && (
        <>
          <p className="font-medium">{t('portalTargets')}</p>
          <TargetInputs
            idPrefix={`portal-${props.row.id}`}
            values={portal}
            cantons={portalCantons}
            max={canton => props.meta.portalCaps[canton] ?? 0}
            onChange={setPortal}
          />
        </>
      )}
      <Button
        size="sm"
        disabled={save.isPending}
        onClick={() => save.mutate(undefined)}
      >
        {t('save')}
      </Button>
    </div>
  )
}

export function OperatorsAdmin() {
  const t = useTranslations('admin.outreach.ownerLookup.operators')
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', 'outreach', 'owner-lookup', 'operators'],
    queryFn: () => ownerLookupService.listOperators(),
  })
  const [userId, setUserId] = useState('')
  const [label, setLabel] = useState('')
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin', 'outreach', 'owner-lookup'],
    })
  const create = useMutation({
    mutationFn: () =>
      ownerLookupService.createOperator({
        userId,
        terravisUserLabel: label,
        dailyTargets: START_TARGETS,
      }),
    onSuccess: () => {
      setUserId('')
      setLabel('')
      toast.success(t('created'))
      invalidate()
    },
    onError: error =>
      toast.error(
        apiErrorCode(error) === 'OPERATOR_EXISTS'
          ? t('exists')
          : t('saveFailed')
      ),
  })

  if (query.isLoading) return <AdminPageLoader />
  if (!query.data) return <p className="text-red-700">{t('loadFailed')}</p>
  const meta = query.data
  const free = meta.eligibleUsers.filter(
    user => !meta.operators.some(row => row.userId === user.id)
  )

  return (
    <div className="space-y-4">
      <p className="text-[#062E25]/75">{t('hint')}</p>
      {meta.operators.length === 0 && (
        <p className="text-[#062E25]/60">{t('none')}</p>
      )}
      {meta.operators.map(row => (
        <OperatorRow
          key={`${row.id}-${row.updatedAt}`}
          row={row}
          meta={meta}
          onSaved={invalidate}
        />
      ))}
      <div className="flex flex-wrap items-end gap-3 pt-2">
        <div>
          <Label htmlFor="operator-user">{t('user')}</Label>
          <select
            id="operator-user"
            className="mt-1 block h-10 rounded border border-[#062E25]/20 bg-white px-2"
            value={userId}
            onChange={event => setUserId(event.target.value)}
          >
            <option value="">{t('chooseUser')}</option>
            {free.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="operator-label">{t('label')}</Label>
          <Input
            id="operator-label"
            className="mt-1 text-base"
            value={label}
            onChange={event => setLabel(event.target.value)}
          />
        </div>
        <Button
          disabled={!userId || !label.trim() || create.isPending}
          onClick={() => create.mutate()}
        >
          {t('create')}
        </Button>
      </div>
    </div>
  )
}
