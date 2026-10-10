import { request } from './api'
import type { Post, PostComment, PostPayload } from '@/types'

export const feedService = {
  /** institutionId: só as publicações dessa instituição (mural do perfil); following: só de quem o usuário segue */
  async listPosts(page = 1, institutionId?: string, following = false): Promise<Post[]> {
    const qs = new URLSearchParams({ page: String(page) })
    if (institutionId) qs.set('institutionId', institutionId)
    if (following) qs.set('seguindo', '1')
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

  async likePost(id: string): Promise<{ liked: boolean; likeCount: number }> {
    return request(`/feed/${id}/like`, { method: 'POST' })
  },

  async unlikePost(id: string): Promise<{ liked: boolean; likeCount: number }> {
    return request(`/feed/${id}/like`, { method: 'DELETE' })
  },

  async listComments(postId: string): Promise<PostComment[]> {
    return request<PostComment[]>(`/feed/${postId}/comments`)
  },

  async addComment(postId: string, content: string): Promise<PostComment> {
    return request<PostComment>(`/feed/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })
  },

  async deleteComment(commentId: string): Promise<void> {
    await request<void>(`/feed/comments/${commentId}`, { method: 'DELETE' })
  },
}
