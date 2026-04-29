export type PaymentMethod = 'pix' | 'paypal' | 'google_pay' | 'apple_pay' | 'card'

export interface Donation {
  id: string
  institutionId: string
  institutionName: string
  amount: number
  message?: string
  paymentMethod: PaymentMethod
  anonymous: boolean
  xpEarned: number
  salvesEarned: number
  createdAt: string
}

export interface DonationInitPayload {
  institutionId: string
  amount: number
  message?: string
  paymentMethod: PaymentMethod
  anonymous: boolean
}

export interface DonationResult {
  donationId: string
  xpEarned: number
  salvesEarned: number
  pixCode?: string
}
