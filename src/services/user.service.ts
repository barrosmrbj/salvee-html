import { request } from './api'
import type { User } from '@/types'

export const userService = {
  async getProfile(): Promise<User> {
    return request<User>('/users/me')
  },

  /** avatarUrl: link de POST /upload (/uploads/...) ou null para remover a foto */
  async updateProfile(data: Partial<Pick<User, 'name' | 'phone' | 'accountType'>> & { avatarUrl?: string | null }): Promise<User> {
    return request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}
