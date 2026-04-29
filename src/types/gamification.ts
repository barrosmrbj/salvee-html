export interface GameBalance {
  xp: number
  salves: number
  level: number
  xpToNextLevel: number
  levelName: string
}

export interface Reward {
  id: string
  title: string
  description: string
  cost: number
  partnerName: string
  partnerLogoUrl?: string
  expiresAt?: string
}

export interface RedemptionResult {
  qrCode: string
  expiresAt: string
}

export interface CalendarEvent {
  id: string
  institutionId: string
  institutionName: string
  title: string
  date: string
  location: string
  registered: boolean
}
