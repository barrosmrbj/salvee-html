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
  partnerLogoUrl?: string | null
  rewardType?: string
  minLevel?: number
  /** AAAA-MM-DD: último dia para resgatar e usar */
  validUntil?: string | null
  canRedeem?: boolean
  /** por que não dá para resgatar agora (nível, saldo, resgates desligados) */
  reason?: string | null
}

/** recompensa resgatada pelo usuário ("Minhas recompensas") */
export interface MyReward {
  id: string
  rewardId: string
  /** vai no QR Code; uso único */
  code: string
  status: 'available' | 'used' | 'expired'
  title: string
  description: string
  partnerName: string
  partnerLogoUrl: string | null
  rewardType: string
  costPaid: number
  expiresAt: string | null
  usedAt: string | null
  redeemedAt: string
}

/** regra de pontos vigente (configurada pelo admin) */
export interface GameRules {
  pointsEnabled: boolean
  reaisPerXp: number
  reaisPerSalve: number
  promo: { label: string; xpMultiplier: number; salvesMultiplier: number; endsAt: string | null } | null
  rewardsEnabled: boolean
}

/** RedemptionResult antigo: o resgate agora devolve a MyReward com o código */
export type RedemptionResult = MyReward

export interface CalendarEvent {
  id: string
  institutionId: string
  institutionName: string
  title: string
  date: string
  location: string
  registered: boolean
  category?: string | null
  imageUrl?: string | null
}
