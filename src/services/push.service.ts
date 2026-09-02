import api from '@/lib/api'

export interface PushConfig {
  publicKey: string
  enabled: boolean
}

export const pushService = {
  async getConfig(): Promise<PushConfig> {
    const { data } = await api.get('/admin/push/public-key')
    return data.data
  },

  async subscribe(subscription: PushSubscription): Promise<void> {
    const json = subscription.toJSON()
    await api.post('/admin/push/subscribe', {
      endpoint: json.endpoint,
      keys: json.keys,
    })
  },

  async unsubscribe(endpoint: string): Promise<void> {
    await api.post('/admin/push/unsubscribe', { endpoint })
  },

  async sendTest(): Promise<number> {
    const { data } = await api.post('/admin/push/test')
    return data.data.delivered as number
  },
}
