import { request } from './api'
import type { Post } from '@/types'

export const feedService = {
  async listPosts(page = 1): Promise<Post[]> {
    return request<Post[]>(`/feed?page=${page}`)
  },

  async getPostById(id: string): Promise<Post> {
    return request<Post>(`/posts/${id}`)
  },
}
