import { request } from './api'
import type { GameBalance, Reward, RedemptionResult } from '@/types'

export const gamificationService = {
  async getBalance(): Promise<GameBalance> {
    return request<GameBalance>('/gamification/balance')
  },

  async listRewards(): Promise<Reward[]> {
    return request<Reward[]>('/gamification/rewards')
  },

  async redeemReward(rewardId: string): Promise<RedemptionResult> {
    return request<RedemptionResult>(`/gamification/rewards/${rewardId}/redeem`, {
      method: 'POST',
    })
  },
}
