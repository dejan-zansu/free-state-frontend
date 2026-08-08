'use client'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileSignature,
  Loader2,
  XCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import PortalSignDialog from '@/components/dashboard/PortalSignDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import { modelLabelKey } from '@/lib/model-label'
import { contractService } from '@/services/contract.service'
import {
  customerPortalService,
  type ContractSummary,
  type ProjectSummary,
} from '@/services/customer-portal.service'

const POLL_MAX_ATTEMPTS = 120

export default function ContractPage() {
  const t = useTranslations('dashboard.contract')
  const tSigning = useTranslations('dashboard.signing')
  const tModel = useTranslations('dashboard.project')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const projectIdFilter = searchParams.get('projectId')
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [signingConfig, setSigningConfig] = useState<{
    enabled: boolean
    aboContractsEnabled: boolean
  }>({ enabled: true, aboContractsEnabled: false })
  const [dialogContractId, setDialogContractId] = useState<string | null>(null)
  const [pollingContractId, setPollingContractId] = useState<string | null>(null)
  const [signError, setSignError] = useState<{ id: string; message: string } | null>(
    null,
  )
  const [pollTimedOut, setPollTimedOut] = useState<string | null>(null)

  const STATUS_BADGE: Record<
    string,
    { label: string; color: string; icon: typeof CheckCircle2 }
  > = {
    PENDING: {
      label: t('pending'),
      color: 'bg-amber-100 text-amber-700',
      icon: Clock,
    },
    SIGNED: {
      label: t('signed'),
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle2,
    },
    FAILED: {
      label: t('failed'),
      color: 'bg-red-100 text-red-700',
      icon: AlertCircle,
    },
    EXPIRED: {
      label: t('expired'),
      color: 'bg-gray-100 text-gray-600',
      icon: AlertCircle,
    },
  }

  const loadData = useCallback(async () => {
    const [contractsData, projectsData] = await Promise.all([
      customerPortalService.getContracts(),
      customerPortalService.getProjects(),
    ])
    setContracts(contractsData)
    setProjects(projectsData)
  }, [])

  useEffect(() => {
    loadData()
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [loadData])

  useEffect(() => {
    contractService
      .getSigningConfig()
      .then(setSigningConfig)
      .catch(() => setSigningConfig({ enabled: true, aboContractsEnabled: false }))
  }, [])

  useEffect(() => {
    if (!pollingContractId) return
    let cancelled = false
    let attempts = 0

    const interval = setInterval(async () => {
      attempts += 1
      if (attempts >= POLL_MAX_ATTEMPTS) {
        clearInterval(interval)
        setPollTimedOut(pollingContractId)
        return
      }
      try {
        const result = await contractService.checkSignatureStatus(
          pollingContractId,
        )
        if (cancelled) return

        if (result.status === 'COMPLETED') {
          setPollingContractId(null)
          setPollTimedOut(null)
          await loadData()
        } else if (result.status === 'EXPIRED') {
          setSignError({
            id: pollingContractId,
            message: tSigning('signatureExpired'),
          })
          setPollingContractId(null)
        }
      } catch {
        return
      }
    }, 5000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pollingContractId, loadData, tSigning])

  if (loading) {
    return <PageLoader />
  }

  if (contracts.length === 0) {
    return (
      <div className="max-w-5xl" data-hj-suppress data-cs-mask>
        <h1 className="text-2xl font-bold text-pine mb-8">{t('title')}</h1>
        <Card className="border-pine/10">
          <CardContent className="p-8 text-center">
            <FileSignature className="h-12 w-12 text-pine/20 mx-auto mb-4" />
            <p className="text-pine mb-2">{t('noContracts')}</p>
            <p className="text-sm text-pine/75">
              {t('noContractsHelp')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projectAddress = new Map(projects.map(p => [p.id, p.address]))
  const projectOwnership = new Map(projects.map(p => [p.id, p.isPropertyOwner]))

  const groups: { projectId: string; contracts: ContractSummary[] }[] = []
  const groupIndex = new Map<string, number>()
  for (const contract of contracts) {
    const existing = groupIndex.get(contract.projectId)
    if (existing === undefined) {
      groupIndex.set(contract.projectId, groups.length)
      groups.push({ projectId: contract.projectId, contracts: [contract] })
    } else {
      groups[existing].contracts.push(contract)
    }
  }

  const filteredGroups = projectIdFilter
    ? groups.filter(group => group.projectId === projectIdFilter)
    : groups
  const showingFiltered = projectIdFilter !== null && filteredGroups.length > 0
  const visibleGroups = showingFiltered ? filteredGroups : groups

  return (
    <div className="max-w-5xl" data-hj-suppress data-cs-mask>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-pine">{t('title')}</h1>
        {showingFiltered && (
          <button
            type="button"
            onClick={() => router.replace(pathname)}
            className="text-sm font-medium text-pine underline underline-offset-4 hover:text-pine/75"
          >
            {t('showAll')}
          </button>
        )}
      </div>

      <div className="space-y-10">
        {visibleGroups.map(group => {
          const address =
            projectAddress.get(group.projectId) ?? group.contracts[0].address
          const label = tModel(
            `models.${modelLabelKey(group.contracts[0].solarModel)}`,
          )

          return (
            <div key={group.projectId}>
              <h2 className="text-base font-semibold text-pine mb-4">
                {t('projectHeading', { address: `${address} · ${label}` })}
              </h2>

              <div className="space-y-6">
                {group.contracts.map(contract => {
                  const badge =
                    contract.status === 'CANCELLED'
                      ? {
                          label: t('status.cancelled'),
                          color: 'bg-gray-100 text-gray-600',
                          icon: XCircle,
                        }
                      : STATUS_BADGE[contract.signatureStatus] ||
                        STATUS_BADGE.PENDING
                  const BadgeIcon = badge.icon

                  const aboBlocked =
                    contract.solarModel === 'solar-abo' &&
                    !signingConfig.aboContractsEnabled
                  const notOwner =
                    projectOwnership.get(contract.projectId) === false
                  const signEligible =
                    contract.signatureStatus === 'PENDING' &&
                    !contract.customerSignedAt &&
                    contract.status !== 'CANCELLED' &&
                    !aboBlocked &&
                    !notOwner
                  const isPolling = pollingContractId === contract.id

                  return (
                    <Card key={contract.id} className="border-pine/10">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h2 className="text-lg font-semibold text-pine break-all">
                                {contract.contractNumber}
                              </h2>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${badge.color}`}
                              >
                                <BadgeIcon className="h-3 w-3" />
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-sm text-pine">
                              {contract.address}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6">
                          <div>
                            <p className="text-pine">{t('type')}</p>
                            <p className="font-medium text-pine">
                              {contract.contractType}
                            </p>
                          </div>
                          <div>
                            <p className="text-pine">{t('created')}</p>
                            <p className="font-medium text-pine">
                              {new Date(contract.createdAt).toLocaleDateString(
                                'de-CH'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-pine">
                              {t('validUntil')}
                            </p>
                            <p className="font-medium text-pine">
                              {contract.validUntil
                                ? new Date(
                                    contract.validUntil
                                  ).toLocaleDateString('de-CH')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-pine">
                              {t('signedDate')}
                            </p>
                            <p className="font-medium text-pine">
                              {contract.customerSignedAt
                                ? new Date(
                                    contract.customerSignedAt
                                  ).toLocaleDateString('de-CH')
                                : t('notYet')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {contract.unsignedPdfUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-pine text-pine hover:bg-pine/5"
                              onClick={() =>
                                contractService.downloadPdf(contract.id, false)
                              }
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('downloadContract')}
                            </Button>
                          )}
                          {contract.signedPdfUrl && (
                            <Button
                              size="sm"
                              className="bg-pine text-white hover:bg-pine/90"
                              onClick={() =>
                                contractService.downloadPdf(contract.id, true)
                              }
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('downloadSigned')}
                            </Button>
                          )}

                          {signEligible && !isPolling && signingConfig.enabled && (
                            <Button
                              size="sm"
                              className="bg-pine text-white hover:bg-pine/90"
                              onClick={() => {
                                setSignError(null)
                                setPollTimedOut(null)
                                setDialogContractId(contract.id)
                              }}
                            >
                              <FileSignature className="h-4 w-4 mr-2" />
                              {tSigning('signNow')}
                            </Button>
                          )}

                          {signEligible && !isPolling && !signingConfig.enabled && (
                            <Button
                              size="sm"
                              disabled
                              className="bg-pine text-white hover:bg-pine/90"
                            >
                              <FileSignature className="h-4 w-4 mr-2" />
                              {tSigning('signingUnavailable')}
                            </Button>
                          )}

                          {signEligible && isPolling && (
                            <div className="flex flex-wrap items-center gap-3">
                              {pollTimedOut === contract.id ? (
                                <span className="text-sm text-pine">
                                  {tSigning('checkBackLater')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 text-sm text-pine">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  {tSigning('awaitingSignature')}
                                </span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-pine text-pine hover:bg-pine/5"
                                onClick={async () => {
                                  const url =
                                    await contractService.getSigningUrl(
                                      contract.id
                                    )
                                  window.open(url, '_blank')
                                }}
                              >
                                {tSigning('reopenSigning')}
                              </Button>
                            </div>
                          )}
                        </div>

                        {signError?.id === contract.id && (
                          <p className="text-sm text-red-600 mt-3">
                            {signError.message}
                          </p>
                        )}

                        {signEligible && (
                          <PortalSignDialog
                            contractId={contract.id}
                            open={dialogContractId === contract.id}
                            onOpenChange={open =>
                              setDialogContractId(open ? contract.id : null)
                            }
                            onSigningStarted={() => {
                              setSignError(null)
                              setPollTimedOut(null)
                              setPollingContractId(contract.id)
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
