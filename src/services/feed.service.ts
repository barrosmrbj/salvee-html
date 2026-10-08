import { request } from './api'
import type { Post, PostPayload } from '@/types'

export const feedService = {
  /** institutionId: só as publicações dessa instituição (mural do perfil) */
  async listPosts(page = 1, institutionId?: string): Promise<Post[]> {
    const qs = new URLSearchParams({ page: String(page) })
    if (institutionId) qs.set('institutionId', institutionId)
    return request<Post[]>(`/feed?${qs}`)
  },

  async getPostById(id: string): Promise<Post> {
    return request<Post>(`/feed/${id}`)
  },

  async createPost(payload: PostPayload): Promise<Post> {
    return request<Post>('/feed', { method: 'POST', body: JSON.stringify(payload) })
  },

  async updatePost(id: string, payload: PostPayload): Promise<Post> {
    return request<Post>(`/feed/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },

  async deletePost(id: string): Promise<void> {
    await request<void>(`/feed/${id}`, { method: 'DELETE' })
  },
}
