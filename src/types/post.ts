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
  /** o usuário curtiu */
  liked?: boolean
  likeCount?: number
  commentCount?: number
}

export interface PostComment {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatarUrl: string | null
  content: string
  createdAt: string
  /** autor do comentário, instituição dona do post ou admin/gestor */
  canDelete: boolean
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
  /** motivo da reprovação ou o que corrigir (needs_revision) */
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

/** GET /institutions/mine/:id — dados para o responsável corrigir o cadastro */
export interface MyInstitutionForEdit {
  id: string
  status: MyInstitution['status']
  rejectionReason: string | null
  data: Record<string, string | number | null>
}
