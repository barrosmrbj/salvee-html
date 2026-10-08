export type PostType = 'common' | 'campaign' | 'event'

export interface Post {
  id: string
  institutionId: string
  institutionName: string
  institutionLogoUrl?: string
  institutionVerified: boolean
  type: PostType
  title?: string | null
  content: string
  imageUrl?: string
  images?: string[]
  createdAt: string
  // campaign fields
  campaignGoal?: number
  campaignCurrent?: number
  campaignDeadline?: string | null
  // event fields
  eventDate?: string
  eventLocation?: string
  eventInstructions?: string | null
  /** o usuário confirmou presença (evento) */
  registered?: boolean
  /** o usuário é responsável pela instituição: pode editar/excluir */
  canEdit?: boolean
}

/** corpo de POST/PATCH /feed (a edição ignora institutionId e type) */
export interface PostPayload {
  institutionId?: string
  type?: PostType
  title?: string
  content: string
  images: string[]
  campaignGoal?: number
  campaignDeadline?: string
  eventDate?: string
  eventLocation?: string
  eventInstructions?: string
}

/** instituição pela qual o usuário é responsável (GET /institutions/mine) */
export interface MyInstitution {
  id: string
  name: string
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  logoUrl: string | null
}
