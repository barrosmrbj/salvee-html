export type PaymentMethod = 'pix' | 'paypal' | 'google_pay' | 'apple_pay' | 'card'

// pending: aguardando confirmação do pagamento (sem pontos) · confirmed: XP/Salves creditados
export type DonationStatus = 'pending' | 'confirmed' | 'cancelled'

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
  status?: DonationStatus
  createdAt: string
}

export interface DonationInitPayload {
  institutionId: string
  amount: number
  message?: string
  paymentMethod: PaymentMethod
  anonymous: boolean
  /** doação pelo botão Doar de uma campanha */
  postId?: string
}

export interface DonationResult {
  donationId: string
  xpEarned: number
  salvesEarned: number
  status?: DonationStatus
  pixCode?: string
}
