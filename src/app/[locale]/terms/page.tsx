import { redirect } from 'next/navigation'

const TermsPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  redirect(`/${locale}/agb`)
}

export default TermsPage
