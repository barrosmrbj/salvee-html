export type InstitutionStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision'

export interface Institution {
  id: string
  name: string
  category: string
  subcategory?: string
  description: string
  logoUrl?: string
  photos: string[]
  verified: boolean
  status: InstitutionStatus
  address?: Address
  cnpj?: string
  phone?: string
  email?: string
  mission?: string
  foundedYear?: number
  history?: string
  /** o usuário segue esta instituição */
  following?: boolean
  followersCount?: number
}

export interface Address {
  street: string
  number: string
  city: string
  state: string
  zipCode: string
  lat?: number
  lng?: number
}

export interface InstitutionRegisterPayload {
  step: number
  data: Record<string, unknown>
  institutionId?: string
}
