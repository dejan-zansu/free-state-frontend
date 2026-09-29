// Request and response types of the mailbox pool endpoints (/mailboxes/*),
// matching backend src/controllers/outbound-mailboxes.controller.ts and
// src/services/outbound/mailbox-pool.service.ts. Shared enum unions live in
// ./owner-first.

import type {
  OutboundMailboxProvider,
  OutboundMailboxStatus,
} from './owner-first'

export type MailboxQueue = {
  firstTouch: number
  followUp: number
  reply: number
  heldForHuman: number
}

export type MailboxOverview = {
  id: string
  address: string
  domain: string
  displayName: string
  signatureName: string
  signatureTitle: string | null
  provider: OutboundMailboxProvider
  credentialRef: string
  status: OutboundMailboxStatus
  isLegacyHostpoint: boolean
  warmupStartedAt: string | null
  warmupStartPerDay: number
  warmupStepPerWeek: number
  maxPerDay: number
  minSpacingSec: number
  pausedAt: string | null
  pauseReason: string | null
  lastSentAt: string | null
  // null for the legacy Hostpoint box, whose SMTP lives in the laptop env
  configured: boolean | null
  // null for the legacy box, whose cap is OUTBOUND_DAILY_CAP
  dailyLimit: number | null
  sentToday: number
  sent7d: number
  hardBounces7d: number
  bounceRate7d: number
  queued: MailboxQueue
  threads: number
}

export type MailboxListResponse = {
  poolEnabled: boolean
  sendWindow: string
  bouncePausePct: number
  mailboxes: MailboxOverview[]
}

export type CreateMailboxRequest = {
  address: string
  displayName: string
  signatureName: string
  signatureTitle?: string | null
  provider: OutboundMailboxProvider
  credentialRef: string
  status?: 'SETUP' | 'WARMING' | 'ACTIVE'
  warmupStartPerDay?: number
  warmupStepPerWeek?: number
  maxPerDay?: number
  minSpacingSec?: number
  isLegacyHostpoint?: boolean
}

export type UpdateMailboxRequest = Partial<{
  displayName: string
  signatureName: string
  signatureTitle: string | null
  provider: OutboundMailboxProvider
  credentialRef: string
  status: 'SETUP' | 'WARMING' | 'ACTIVE' | 'RETIRED'
  warmupStartedAt: string | null
  warmupStartPerDay: number
  warmupStepPerWeek: number
  maxPerDay: number
  minSpacingSec: number
}>

export type PauseMailboxRequest = {
  reason?: string
  moveDrafts?: boolean
}

export type PauseMailboxResponse = {
  paused: boolean
  moved: number
  stayed: number
  mailbox: MailboxOverview
}

export type MailboxDailyStat = {
  day: string
  sent: number
  hardBounces: number
  softBounces: number
  complaints: number
  optOuts: number
  humanReplies: number
}

export type MailboxStatsResponse = {
  mailbox: MailboxOverview
  days: MailboxDailyStat[]
  ramp: Array<{ week: number; limit: number }>
  consecutiveTransportErrors: number
}
