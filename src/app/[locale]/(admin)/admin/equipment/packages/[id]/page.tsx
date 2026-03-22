'use client'

import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { adminEquipmentService } from '@/services/admin-equipment.service'

const EQUIPMENT_TYPES = [
  { value: 'SOLAR_PANEL', label: 'Solar Panel' },
  { value: 'INVERTER', label: 'Inverter' },
  { value: 'BATTERY', label: 'Battery' },
  { value: 'MOUNTING_SYSTEM', label: 'Mounting System' },
  { value: 'ENERGY_MANAGEMENT_SYSTEM', label: 'Energy Management System' },
  { value: 'HEAT_PUMP', label: 'Heat Pump' },
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
]

interface PackageItemRow {
  equipmentType: string
  equipmentId: string
  equipmentName: string
  quantity: number
  isOptional: boolean
  displayOrder: number
  notes: string
}

interface EquipmentOption {
  id: string
  label: string
}

export default function AdminPackageDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.equipment.packageDetail')
  const tc = useTranslations('admin.equipment.columns')
  const paramId = params.id as string
  const isNew = paramId === 'new'

  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [savingItems, setSavingItems] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [minCapacityKwp, setMinCapacityKwp] = useState('')
  const [maxCapacityKwp, setMaxCapacityKwp] = useState('')
  const [contractTermYears, setContractTermYears] = useState('35')
  const [pricePerKwp, setPricePerKwp] = useState('')
  const [currency, setCurrency] = useState('CHF')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [highlightedFeature, setHighlightedFeature] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [translations, setTranslations] = useState<
    Record<string, Record<string, any>>
  >({})
  const [formPopulated, setFormPopulated] = useState(false)

  const [items, setItems] = useState<PackageItemRow[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<
    Record<string, EquipmentOption[]>
  >({})

  const { isLoading: loading } = useQuery({
    queryKey: ['admin', 'packages', 'detail', paramId],
    queryFn: async () => {
      const [data, itemsData] = await Promise.all([
        adminEquipmentService.getPackage(paramId),
        adminEquipmentService.getPackageItems(paramId),
      ])
      if (!formPopulated) {
        setCode((data as any).code || '')
        setMinCapacityKwp((data as any).minCapacityKwp?.toString() || '')
        setMaxCapacityKwp((data as any).maxCapacityKwp?.toString() || '')
        setContractTermYears((data as any).contractTermYears?.toString() || '35')
        setPricePerKwp((data as any).pricePerKwp?.toString() || '')
        setCurrency((data as any).currency || 'CHF')
        setDisplayOrder((data as any).displayOrder?.toString() || '0')
        setIsActive((data as any).isActive ?? true)
        setHighlightedFeature((data as any).highlightedFeature || '')
        setImageUrl((data as any).imageUrl || '')
        if ((data as any).translations && Array.isArray((data as any).translations)) {
          const transMap: Record<string, Record<string, any>> = {}
          ;((data as any).translations as any[]).forEach((t: any) => {
            transMap[t.language] = t
          })
          setTranslations(transMap)
        }
        setFormPopulated(true)
      }
      setItems(
        (itemsData as any[]).map((item: any) => ({
          equipmentType: item.equipmentType,
          equipmentId: item.equipmentId,
          equipmentName: item.equipmentName || item.equipmentId,
          quantity: item.quantity,
          isOptional: item.isOptional,
          displayOrder: item.displayOrder,
          notes: item.notes || '',
        }))
      )
      return { data, itemsData }
    },
    enabled: !isNew,
  })

  const setTranslationField = (lang: string, field: string, value: any) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: { ...prev[lang], language: lang, [field]: value },
    }))
  }

  const buildPayload = () => {
    const transArray = Object.values(translations).filter(
      t => t.language && (t.name || t.description)
    )
    return {
      code,
      minCapacityKwp: minCapacityKwp ? parseFloat(minCapacityKwp) : null,
      maxCapacityKwp: maxCapacityKwp ? parseFloat(maxCapacityKwp) : null,
      contractTermYears: parseInt(contractTermYears) || 35,
      pricePerKwp: pricePerKwp ? parseFloat(pricePerKwp) : null,
      currency,
      displayOrder: parseInt(displayOrder) || 0,
      isActive,
      highlightedFeature: highlightedFeature || null,
      imageUrl: imageUrl || null,
      translations: transArray,
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      if (isNew) {
        const result: any =
          await adminEquipmentService.createPackage(buildPayload())
        queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] })
        setMessage(t('packageCreated'))
        router.push(`/${locale}/admin/equipment/packages/${result.id}`)
      } else {
        await adminEquipmentService.updatePackage(paramId, buildPayload())
        queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] })
        setMessage(t('packageUpdated'))
      }
    } catch (err: any) {
      setMessage(
        err?.response?.data?.error?.message || t('packageUpdateFailed')
      )
    } finally {
      setSaving(false)
    }
  }

  const loadEquipmentOptions = async (type: string) => {
    if (equipmentOptions[type]) return
    try {
      const fetchers: Record<string, () => Promise<any>> = {
        SOLAR_PANEL: () =>
          adminEquipmentService.listSolarPanels({ limit: 100 }),
        INVERTER: () => adminEquipmentService.listInverters({ limit: 100 }),
        BATTERY: () => adminEquipmentService.listBatteries({ limit: 100 }),
        MOUNTING_SYSTEM: () =>
          adminEquipmentService.listMountingSystems({ limit: 100 }),
        ENERGY_MANAGEMENT_SYSTEM: () =>
          adminEquipmentService.listEms({ limit: 100 }),
        HEAT_PUMP: () => adminEquipmentService.listHeatPumps({ limit: 100 }),
      }
      const fetcher = fetchers[type]
      if (!fetcher) return
      const result: any = await fetcher()
      const opts = ((result as any)?.data || []).map((item: any) => ({
        id: item.id,
        label: item.modelNumber || item.code || item.id,
      }))
      setEquipmentOptions(prev => ({ ...prev, [type]: opts }))
    } catch {
      setEquipmentOptions(prev => ({ ...prev, [type]: [] }))
    }
  }

  const handleSaveItems = async () => {
    setSavingItems(true)
    setMessage(null)
    try {
      await adminEquipmentService.updatePackageItems(
        paramId,
        items.map((item, i) => ({
          equipmentType: item.equipmentType,
          equipmentId: item.equipmentId,
          quantity: item.quantity,
          isOptional: item.isOptional,
          displayOrder: i,
          notes: item.notes || null,
        }))
      )
      setMessage(t('itemsSaved'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'packages', 'detail', paramId] })
    } catch (err) {
      setMessage(t('itemsSaveFailed'))
    } finally {
      setSavingItems(false)
    }
  }

  const addRow = () => {
    setItems([
      ...items,
      {
        equipmentType: 'SOLAR_PANEL',
        equipmentId: '',
        equipmentName: '',
        quantity: 1,
        isOptional: false,
        displayOrder: items.length,
        notes: '',
      },
    ])
  }

  const removeRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateRow = (
    index: number,
    field: keyof PackageItemRow,
    value: any
  ) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  if (loading) {
    return <AdminPageLoader className="h-64" />
  }

  const PREVIEW_SIZES = [5, 10, 15, 20]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {isNew ? t('newPackage') : code}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label
              htmlFor="isActive"
              className="font-normal cursor-pointer text-sm"
            >
              {isActive ? t('active') : t('inactive')}
            </Label>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isNew ? t('create') : t('save')}
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-4 text-sm p-3 rounded-md bg-muted">{message}</div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('packageDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>Image</Label>
              <ImageUpload value={imageUrl || null} onChange={(url) => setImageUrl(url || '')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="code">{tc('code')} *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. HOME"
                />
              </div>
              <div>
                <Label htmlFor="pricePerKwp">{t('pricePerKwp')}</Label>
                <Input
                  id="pricePerKwp"
                  type="number"
                  step="0.01"
                  value={pricePerKwp}
                  onChange={e => setPricePerKwp(e.target.value)}
                  placeholder="e.g. 1200"
                />
              </div>
              <div>
                <Label htmlFor="currency">{t('currency')}</Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="minKwp">{t('minCapacity')}</Label>
                <Input
                  id="minKwp"
                  type="number"
                  step="0.1"
                  value={minCapacityKwp}
                  onChange={e => setMinCapacityKwp(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxKwp">{t('maxCapacity')}</Label>
                <Input
                  id="maxKwp"
                  type="number"
                  step="0.1"
                  value={maxCapacityKwp}
                  onChange={e => setMaxCapacityKwp(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contractTermYears">{t('contractTerm')}</Label>
                <Input
                  id="contractTermYears"
                  type="number"
                  value={contractTermYears}
                  onChange={e => setContractTermYears(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="displayOrder">{t('displayOrder')}</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="highlightedFeature">
                  {t('highlightedFeature')}
                </Label>
                <Input
                  id="highlightedFeature"
                  value={highlightedFeature}
                  onChange={e => setHighlightedFeature(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('translations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {LANGUAGES.map(lang => (
                <div key={lang.code} className="border rounded-lg p-4">
                  <p className="font-medium text-sm mb-3">
                    {lang.label} ({lang.code})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{tc('name')} *</Label>
                      <Input
                        value={translations[lang.code]?.name ?? ''}
                        onChange={e =>
                          setTranslationField(lang.code, 'name', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>{t('highlightedFeature')}</Label>
                      <Input
                        value={
                          translations[lang.code]?.highlightedFeature ?? ''
                        }
                        onChange={e =>
                          setTranslationField(
                            lang.code,
                            'highlightedFeature',
                            e.target.value || null
                          )
                        }
                      />
                    </div>
                    <div className="col-span-full">
                      <Label>{t('description')} *</Label>
                      <Textarea
                        value={translations[lang.code]?.description ?? ''}
                        onChange={e =>
                          setTranslationField(
                            lang.code,
                            'description',
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>
                    <div className="col-span-full">
                      <Label>{t('features')}</Label>
                      <div className="mt-1 space-y-2">
                        {(Array.isArray(translations[lang.code]?.features)
                          ? translations[lang.code].features
                          : []
                        ).map((feature: string, fi: number) => (
                          <div key={fi} className="flex items-center gap-2">
                            <Input
                              value={feature}
                              onChange={e => {
                                const updated = [...(translations[lang.code]?.features || [])]
                                updated[fi] = e.target.value
                                setTranslationField(lang.code, 'features', updated)
                              }}
                              placeholder={`${t('feature')} ${fi + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = (translations[lang.code]?.features || []).filter((_: string, i: number) => i !== fi)
                                setTranslationField(lang.code, 'features', updated)
                              }}
                              className="text-destructive hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const current = Array.isArray(translations[lang.code]?.features)
                              ? translations[lang.code].features
                              : []
                            setTranslationField(lang.code, 'features', [...current, ''])
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> {t('addFeature')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!isNew && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('equipmentComposition')}</CardTitle>
                  <Button size="sm" variant="outline" onClick={addRow}>
                    <Plus className="mr-1 h-4 w-4" /> {t('addItem')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('noItems')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                      <div className="col-span-4">{tc('type')}</div>
                      <div className="col-span-4">{tc('name')}</div>
                      <div className="col-span-2">{t('optional')}</div>
                      <div className="col-span-2">{t('actions')}</div>
                    </div>
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-4">
                          <Select
                            value={item.equipmentType}
                            onValueChange={v => {
                              updateRow(index, 'equipmentType', v)
                              updateRow(index, 'equipmentId', '')
                              loadEquipmentOptions(v)
                            }}
                            onOpenChange={() => loadEquipmentOptions(item.equipmentType)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EQUIPMENT_TYPES.map(et => (
                                <SelectItem key={et.value} value={et.value}>
                                  {et.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-4">
                          <Select
                            value={item.equipmentId || '__none__'}
                            onValueChange={v => updateRow(index, 'equipmentId', v === '__none__' ? '' : v)}
                            onOpenChange={() => loadEquipmentOptions(item.equipmentType)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectEquipment')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">{t('selectEquipment')}</SelectItem>
                              {item.equipmentId && !equipmentOptions[item.equipmentType]?.some(opt => opt.id === item.equipmentId) && (
                                <SelectItem value={item.equipmentId}>
                                  {item.equipmentName}
                                </SelectItem>
                              )}
                              {(equipmentOptions[item.equipmentType] || []).map(opt => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <Checkbox
                            checked={item.isOptional}
                            onCheckedChange={checked =>
                              updateRow(index, 'isOptional', !!checked)
                            }
                          />
                          <span className="text-xs">{t('optional')}</span>
                        </div>
                        <div className="col-span-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  className="mt-4"
                  onClick={handleSaveItems}
                  disabled={savingItems}
                >
                  {savingItems && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {t('saveEquipment')}
                </Button>
              </CardContent>
            </Card>

            {pricePerKwp && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('pricingPreview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">
                            {t('systemSize')}
                          </th>
                          <th className="text-right py-2 px-3 font-medium">
                            {t('gross')} ({currency})
                          </th>
                          <th className="text-right py-2 px-3 font-medium">
                            {t('subsidy')} ({currency})
                          </th>
                          <th className="text-right py-2 px-3 font-medium">
                            {t('net')} ({currency})
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {PREVIEW_SIZES.map(size => {
                          const gross = parseFloat(pricePerKwp) * size
                          const subsidy = size * 400
                          const net = gross - subsidy
                          return (
                            <tr key={size} className="border-b last:border-0">
                              <td className="py-2 px-3">{size} kWp</td>
                              <td className="py-2 px-3 text-right">
                                {Math.round(gross).toLocaleString('de-CH')}
                              </td>
                              <td className="py-2 px-3 text-right text-green-700">
                                -{Math.round(subsidy).toLocaleString('de-CH')}
                              </td>
                              <td className="py-2 px-3 text-right font-medium">
                                {Math.round(net).toLocaleString('de-CH')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
