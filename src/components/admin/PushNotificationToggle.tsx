'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { isIos, isPushSupported, isStandalone, urlBase64ToUint8Array } from '@/lib/push'
import { pushService } from '@/services/push.service'

type Status = 'checking' | 'unsupported' | 'needs-install' | 'disabled' | 'denied' | 'off' | 'on'

export function PushNotificationToggle() {
  const t = useTranslations('admin.notifications')
  const [status, setStatus] = useState<Status>('checking')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState('')

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus(isIos() && !isStandalone() ? 'needs-install' : 'unsupported')
      return
    }

    try {
      const config = await pushService.getConfig()
      setPublicKey(config.publicKey)
      if (!config.enabled) {
        setStatus('disabled')
        return
      }
    } catch {
      setStatus('disabled')
      return
    }

    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }

    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    const existing = await registration?.pushManager.getSubscription()
    setStatus(existing ? 'on' : 'off')
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const enable = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'off')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })

      await pushService.subscribe(subscription)
      setStatus('on')
      setMessage(t('enabled'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('failed'))
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        await pushService.unsubscribe(subscription.endpoint)
        await subscription.unsubscribe()
      }
      setStatus('off')
      setMessage(t('disabled'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('failed'))
    } finally {
      setBusy(false)
    }
  }

  const test = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const delivered = await pushService.sendTest()
      setMessage(t('testSent', { count: delivered }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t('title')}>
          {status === 'on' ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {status === 'needs-install' && (
          <Alert>
            <AlertDescription>{t('iosInstall')}</AlertDescription>
          </Alert>
        )}
        {status === 'unsupported' && (
          <Alert>
            <AlertDescription>{t('unsupported')}</AlertDescription>
          </Alert>
        )}
        {status === 'disabled' && (
          <Alert>
            <AlertDescription>{t('serverDisabled')}</AlertDescription>
          </Alert>
        )}
        {status === 'denied' && (
          <Alert>
            <AlertDescription>{t('denied')}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          {status === 'off' && (
            <Button onClick={enable} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('enable')}
            </Button>
          )}
          {status === 'on' && (
            <>
              <Button variant="outline" onClick={test} disabled={busy}>
                {t('test')}
              </Button>
              <Button variant="outline" onClick={disable} disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('disable')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
