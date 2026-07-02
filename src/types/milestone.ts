export type MilestoneStage =
  | 'CONSULTATION'
  | 'ON_SITE_VISIT'
  | 'FINAL_OFFER'
  | 'INSTALLATION'

export type MilestoneStatus = 'PENDING' | 'ACTIVE' | 'DONE'

export interface Milestone {
  stage: MilestoneStage
  status: MilestoneStatus
  scheduledAt: string | null
  completedAt: string | null
  note: string | null
}
