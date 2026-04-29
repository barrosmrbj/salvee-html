import { request } from './api'
import type { Donation, DonationInitPayload, DonationResult } from '@/types'

export const donationService = {
  async initiate(payload: DonationInitPayload): Promise<DonationResult> {
    return request<DonationResult>('/donations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async confirm(donationId: string): Promise<Donation> {
    return request<Donation>(`/donations/${donationId}/confirm`, {
      method: 'POST',
    })
  },

  async getHistory(): Promise<Donation[]> {
    return request<Donation[]>('/donations/history')
  },
}
