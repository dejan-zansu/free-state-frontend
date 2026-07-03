import { getTranslations } from 'next-intl/server'
import { ProjectWorkspace } from '@/components/workspace/ProjectWorkspace'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.workspace' })
  return { title: t('metaTitle') }
}

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProjectWorkspace projectId={id} />
}
