import type { AbstractIntlMessages } from 'next-intl'

import { adminAreaMessages } from '@/lib/roof-renovation-messages'

export function pvServiceAdminMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  const result = adminAreaMessages(messages)
  const admin = messages.admin as AbstractIntlMessages
  return {
    ...result,
    admin: {
      ...(result.admin as AbstractIntlMessages),
      pvService: admin.pvService,
    },
  }
}
