import { test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import deMessages from '../../../../../../../../../messages/de.json'
import AdminPackageDetailPage from '../page'

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'pkg-1', locale: 'de' }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/admin/ImageUpload', () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
}))

const getPackage = vi.fn()
const getPackageItems = vi.fn()

vi.mock('@/services/admin-equipment.service', () => ({
  adminEquipmentService: {
    getPackage: (...args: unknown[]) => getPackage(...args),
    getPackageItems: (...args: unknown[]) => getPackageItems(...args),
  },
}))

const packageData = {
  id: 'pkg-1',
  code: 'HOME',
  pricePerKwp: 1200,
  currency: 'CHF',
  contractTermYears: 35,
  displayOrder: 0,
  isActive: true,
  supportedSolarModels: ['SOLAR_FREE'],
  translations: [{ language: 'de', name: 'Home Paket', description: 'Beschreibung' }],
}

const itemsData = [
  {
    equipmentType: 'SOLAR_PANEL',
    equipmentId: 'sp-1',
    equipmentName: 'Panel X',
    quantity: 10,
    isOptional: false,
    displayOrder: 0,
    notes: '',
  },
]

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })
}

function renderPage(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider
        locale="de"
        messages={deMessages as unknown as AbstractIntlMessages}
        onError={() => {}}
      >
        <AdminPackageDetailPage />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  getPackage.mockReset().mockResolvedValue(packageData)
  getPackageItems.mockReset().mockResolvedValue(itemsData)
})

test('populates form when data is fetched on mount', async () => {
  renderPage(makeQueryClient())

  await waitFor(() => {
    expect(screen.getByPlaceholderText('e.g. HOME')).toHaveValue('HOME')
  })
  expect(screen.getByPlaceholderText('e.g. 1200')).toHaveValue(1200)
})

test('populates form when mounted with fresh cached data (browser back)', async () => {
  const queryClient = makeQueryClient()
  queryClient.setQueryData(['admin', 'packages', 'detail', 'pkg-1'], {
    data: packageData,
    itemsData,
  })

  renderPage(queryClient)

  await waitFor(() => {
    expect(screen.getByPlaceholderText('e.g. HOME')).toHaveValue('HOME')
  })
  expect(screen.getByPlaceholderText('e.g. 1200')).toHaveValue(1200)
})
