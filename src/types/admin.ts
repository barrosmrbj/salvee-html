import type { InstitutionStatus } from './institution'

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
  city?: string
  state?: string
  createdAt: string
  updatedAt: string
}
