'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { adminCommercialLeadService } from '@/services/admin-commercial-lead.service'
import type { CommercialLeadDetail } from '@/types/commercial-lead'

import IdentityColumn from './IdentityColumn'
import ControlsColumn from './ControlsColumn'
import ActivityTab from './ActivityTab'
import NotesTab from './NotesTab'
import AttachmentsTab from './AttachmentsTab'
import SnapshotTab from './SnapshotTab'

type TabKey = 'activity' | 'notes' | 'attachments' | 'snapshot'

export default function CommercialLeadDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const t = useTranslations('admin.commercialLeads.detail')

  const [lead, setLead] = useState<CommercialLeadDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('activity')

  const refresh = async () => {
    const l = await adminCommercialLeadService.get(params.id)
    setLead(l)
  }

  useEffect(() => {
    setIsLoading(true)
    refresh().finally(() => setIsLoading(false))
  }, [params.id])

  if (isLoading || !lead) return <AdminPageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="w-4 h-4" />{t('back')}
        </Button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-sm text-[#062E25]/50">{lead.reference}</p>
          <h1 className="text-2xl font-bold text-[#062E25]">{lead.companyName}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-6">
        <IdentityColumn lead={lead} onUpdated={refresh} />
        <div>
          <div className="flex gap-2 border-b border-[#062E25]/10 mb-4">
            {(['activity','notes','attachments','snapshot'] as TabKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  tab === k ? 'border-[#062E25] text-[#062E25]' : 'border-transparent text-[#062E25]/60 hover:text-[#062E25]'
                }`}
              >
                {t(`tab_${k}`)}
              </button>
            ))}
          </div>
          {tab === 'activity' && <ActivityTab activities={lead.activities} />}
          {tab === 'notes' && <NotesTab leadId={lead.id} notes={lead.notes} onChange={refresh} />}
          {tab === 'attachments' && <AttachmentsTab lead={lead} onChange={refresh} />}
          {tab === 'snapshot' && <SnapshotTab lead={lead} />}
        </div>
        <ControlsColumn lead={lead} onUpdated={refresh} />
      </div>
    </div>
  )
}
