import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solar Calculator - Free State AG',
  description: 'Calculate your solar potential and get instant quotes for solar panel installation',
}

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

