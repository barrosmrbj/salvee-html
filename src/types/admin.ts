import type { InstitutionStatus } from './institution'
import type { DonationStatus, PaymentMethod } from './donation'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  xp: number
  salves: number
  level: number
  createdAt: string
}

export interface AdminInstitution {
  id: string
  name: string
  status: InstitutionStatus
  category: string
  verified: boolean
  responsibleUserId: string | null
  responsibleUserName: string | null
  responsibleUserEmail: string | null
  rejectionReason: string | null
  documentsUrl: string | null
  city?: string
  state?: string
  createdAt: string
  updatedAt: string
}

export interface AdminDonation {
  id: string
  status: DonationStatus
  amount: number
  paymentMethod: PaymentMethod
  message: string | null
  anonymous: boolean
  xpEarned: number
  salvesEarned: number
  userId: string
  userName: string | null
  userEmail: string | null
  institutionId: string
  institutionName: string
  createdAt: string
  confirmedAt: string | null
}

/** banner "Promoções & metas" do topo da busca */
export interface AdminPromotion {
  id: string
  title: string
  subtitle: string
  imageUrl: string | null
  linkType: 'none' | 'campaign' | 'institution'
  linkId: string | null
  startsAt: string | null
  endsAt: string | null
  active: boolean
  sortOrder: number
  createdAt: string
}

export type PromotionPayload = Partial<Omit<AdminPromotion, 'id' | 'createdAt'>>
