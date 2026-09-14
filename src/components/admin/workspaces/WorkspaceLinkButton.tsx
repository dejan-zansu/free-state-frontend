'use client'

import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { CreateWorkspaceDialog } from '@/components/admin/workspaces/CreateWorkspaceDialog'
import { Button } from '@/components/ui/button'
import { useHasCapability } from '@/lib/capabilities'

interface WorkspaceLinkButtonProps {
  workspace: { id: string; number: string } | null
  link: {
    residentialProjectId?: string
    commercialLeadId?: string
    name: string
    siteAddress?: string
  }
}

export function WorkspaceLinkButton({
  workspace,
  link,
}: WorkspaceLinkButtonProps) {
  const locale = useLocale()
  const t = useTranslations('admin.workspaces')
  const canCreate = useHasCapability('projects.create')
  const [dialogOpen, setDialogOpen] = useState(false)

  if (workspace) {
    return (
      <Button
        asChild
        variant="outline"
        className="border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5"
      >
        <Link href={`/${locale}/admin/workspaces/${workspace.id}`}>
          <FolderOpen className="mr-2 h-4 w-4" />
          {t('link.open')}
        </Link>
      </Button>
    )
  }

  if (!canCreate) return null

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5"
      >
        <FolderOpen className="mr-2 h-4 w-4" />
        {t('link.create')}
      </Button>
      <CreateWorkspaceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={link}
      />
    </>
  )
}
