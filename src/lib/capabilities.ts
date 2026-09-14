import { useAuthStore } from '@/stores/auth.store'
import type { Capability } from '@/types/auth'

export function useCapabilities(): Capability[] {
  const capabilities = useAuthStore(state => state.user?.capabilities)
  return capabilities ?? []
}

export function useHasCapability(capability: Capability): boolean {
  const capabilities = useAuthStore(state => state.user?.capabilities)
  return capabilities?.includes(capability) ?? false
}
