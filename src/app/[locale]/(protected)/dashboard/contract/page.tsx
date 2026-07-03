'use client'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileSignature,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import PortalSignDialog from '@/components/dashboard/PortalSignDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import { contractService } from '@/services/contract.service'
import {
  customerPortalService,
  type ContractSummary,
  type ProjectSummary,
} from '@/services/customer-portal.service'

const MODEL_LABEL: Record<string, string> = {
  'solar-free': 'SolarFree',
  'solar-direct': 'SolarDirect',
  'solar-abo': 'SolarAbo',
}

const modelLabel = (model: string | null): string =>
  (model && MODEL_LABEL[model]) || 'Solar'

export default function ContractPage() {
  const t = useTranslations('dashboard.contract')
  const tSigning = useTranslations('dashboard.signing')
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [signingEnabled, setSigningEnabled] = useState(true)
  const [dialogContractId, setDialogContractId] = useState<string | null>(null)
  const [pollingContractId, setPollingContractId] = useState<string | null>(null)
  const [signError, setSignError] = useState<{ id: string; message: string } | null>(
    null,
  )

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
      .then(config => setSigningEnabled(config.enabled))
      .catch(() => setSigningEnabled(true))
  }, [])

  useEffect(() => {
    if (!pollingContractId) return
    let cancelled = false

    const interval = setInterval(async () => {
      try {
        const result = await contractService.checkSignatureStatus(
          pollingContractId,
        )
        if (cancelled) return

        if (result.status === 'COMPLETED') {
          setPollingContractId(null)
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
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>
        <Card className="border-[#062E25]/10">
          <CardContent className="p-8 text-center">
            <FileSignature className="h-12 w-12 text-[#062E25]/20 mx-auto mb-4" />
            <p className="text-[#062E25]/60 mb-2">{t('noContracts')}</p>
            <p className="text-sm text-[#062E25]/40">
              {t('noContractsHelp')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projectAddress = new Map(projects.map(p => [p.id, p.address]))

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

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>

      <div className="space-y-10">
        {groups.map(group => {
          const address =
            projectAddress.get(group.projectId) ?? group.contracts[0].address
          const label = modelLabel(group.contracts[0].solarModel)

          return (
            <div key={group.projectId}>
              <h2 className="text-base font-semibold text-[#062E25] mb-4">
                {t('projectHeading', { address: `${address} · ${label}` })}
              </h2>

              <div className="space-y-6">
                {group.contracts.map(contract => {
                  const badge =
                    STATUS_BADGE[contract.signatureStatus] ||
                    STATUS_BADGE.PENDING
                  const BadgeIcon = badge.icon

                  const signEligible =
                    contract.signatureStatus === 'PENDING' &&
                    !contract.customerSignedAt &&
                    contract.status !== 'CANCELLED'
                  const isPolling = pollingContractId === contract.id

                  return (
                    <Card key={contract.id} className="border-[#062E25]/10">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h2 className="text-lg font-semibold text-[#062E25] break-all">
                                {contract.contractNumber}
                              </h2>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${badge.color}`}
                              >
                                <BadgeIcon className="h-3 w-3" />
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-sm text-[#062E25]/60">
                              {contract.address}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6">
                          <div>
                            <p className="text-[#062E25]/60">{t('type')}</p>
                            <p className="font-medium text-[#062E25]">
                              {contract.contractType}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#062E25]/60">{t('created')}</p>
                            <p className="font-medium text-[#062E25]">
                              {new Date(contract.createdAt).toLocaleDateString(
                                'de-CH'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#062E25]/60">
                              {t('validUntil')}
                            </p>
                            <p className="font-medium text-[#062E25]">
                              {contract.validUntil
                                ? new Date(
                                    contract.validUntil
                                  ).toLocaleDateString('de-CH')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#062E25]/60">
                              {t('signedDate')}
                            </p>
                            <p className="font-medium text-[#062E25]">
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
                              style={{ borderColor: '#062E25', color: '#062E25' }}
                              onClick={() =>
                                window.open(
                                  `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/${contract.id}/pdf`,
                                  '_blank'
                                )
                              }
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('downloadContract')}
                            </Button>
                          )}
                          {contract.signedPdfUrl && (
                            <Button
                              size="sm"
                              className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
                              onClick={() =>
                                window.open(
                                  `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/${contract.id}/pdf?signed=true`,
                                  '_blank'
                                )
                              }
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('downloadSigned')}
                            </Button>
                          )}

                          {signEligible && !isPolling && signingEnabled && (
                            <Button
                              size="sm"
                              className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
                              onClick={() => {
                                setSignError(null)
                                setDialogContractId(contract.id)
                              }}
                            >
                              <FileSignature className="h-4 w-4 mr-2" />
                              {tSigning('signNow')}
                            </Button>
                          )}

                          {signEligible && !isPolling && !signingEnabled && (
                            <Button
                              size="sm"
                              disabled
                              className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
                            >
                              <FileSignature className="h-4 w-4 mr-2" />
                              {tSigning('signingUnavailable')}
                            </Button>
                          )}

                          {signEligible && isPolling && (
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-2 text-sm text-[#062E25]/70">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {tSigning('awaitingSignature')}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ borderColor: '#062E25', color: '#062E25' }}
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
