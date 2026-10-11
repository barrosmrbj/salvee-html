import { request } from './api'
import type { GameBalance, GameRules, MyReward, Reward } from '@/types'

export const gamificationService = {
  async getBalance(): Promise<GameBalance> {
    return request<GameBalance>('/gamification/balance')
  },

  /** regra de pontos vigente (pontuação ligada, R$ por XP/Salve, promoção) */
  async getRules(): Promise<GameRules> {
    return request<GameRules>('/gamification/rules')
  },

  async listRewards(): Promise<Reward[]> {
    return request<Reward[]>('/gamification/rewards')
  },

  /** desconta os Salves e devolve a recompensa com o código do QR */
  async redeemReward(rewardId: string): Promise<MyReward> {
    return request<MyReward>(`/gamification/rewards/${rewardId}/redeem`, { method: 'POST' })
  },

  async listMyRewards(): Promise<MyReward[]> {
    return request<MyReward[]>('/gamification/my-rewards')
  },
}

/** XP e Salves estimados para uma doação (mesma conta do servidor, server/settings.js) */
export function estimatePoints(amount: number, rules: GameRules | null): { xp: number; salves: number } {
  if (!rules) return { xp: Math.floor(amount / 2), salves: Math.floor(amount / 4) }
  if (!rules.pointsEnabled) return { xp: 0, salves: 0 }
  const xpMul = rules.promo?.xpMultiplier ?? 1
  const slvMul = rules.promo?.salvesMultiplier ?? 1
  return {
    xp: Math.floor((amount / Math.max(0.01, rules.reaisPerXp)) * xpMul),
    salves: Math.floor((amount / Math.max(0.01, rules.reaisPerSalve)) * slvMul),
  }
}
