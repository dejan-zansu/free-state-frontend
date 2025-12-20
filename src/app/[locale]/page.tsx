import fs from 'fs'
import { notFound } from 'next/navigation'
import path from 'path'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'de' },
    { locale: 'fr' },
    { locale: 'it' },
    { locale: 'es' },
    { locale: 'sr' },
  ]
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const localesDir = path.join(process.cwd(), 'src', 'locales')
  const messagesPath = path.join(localesDir, `${locale}.json`)
  let messages = {}
  try {
    messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'))
  } catch (e) {
    console.error(e)
    notFound()
  }

  // In server components you can't use hooks from next-intl; instead
  // for demonstration we render simple content and let client components
  // use useTranslations(). Keep this page minimal.

  return (
    <div className='container mx-auto px-4 py-12'>
      <h1 className='text-4xl font-bold'>
        {(messages as { title: string }).title ?? 'Free State AG'}
      </h1>
    </div>
  )
}
