export type PostType = 'common' | 'campaign' | 'event'

export interface Post {
  id: string
  institutionId: string
  institutionName: string
  institutionLogoUrl?: string
  institutionVerified: boolean
  type: PostType
  content: string
  imageUrl?: string
  createdAt: string
  // campaign fields
  campaignGoal?: number
  campaignCurrent?: number
  // event fields
  eventDate?: string
  eventLocation?: string
}
